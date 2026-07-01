/**
 * migrate_production.js
 * ---------------------
 * Runs ALL pending schema migrations against the production (Hostinger) database.
 * Safe to re-run: every ALTER TABLE is checked before executing (idempotent).
 *
 * Usage:
 *   node scripts/migrate_production.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production') });

const mysql = require('mysql2/promise');

async function getConnection() {
  return mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     process.env.DB_PORT || 3306,
  });
}

async function hasColumn(conn, table, column) {
  const [rows] = await conn.execute(
    `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].cnt > 0;
}

async function hasTable(conn, table) {
  const [rows] = await conn.execute(
    `SELECT COUNT(*) as cnt FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return rows[0].cnt > 0;
}

function log(msg)  { console.log(`  OK  ${msg}`); }
function skip(msg) { console.log(`  --  ${msg} (already exists, skipped)`); }
function section(title) { console.log(`\n[${title}]`); }

async function migrate_subscriptions(conn) {
  section('subscription_plans table');
  if (!await hasTable(conn, 'subscription_plans')) {
    await conn.execute(`
      CREATE TABLE subscription_plans (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        name            VARCHAR(100) NOT NULL,
        max_voters      INT NOT NULL DEFAULT 500,
        max_elections   INT NOT NULL DEFAULT 1,
        max_booths      INT NOT NULL DEFAULT 5,
        max_machines    INT NOT NULL DEFAULT 10,
        max_officers    INT NOT NULL DEFAULT 5,
        price           DECIMAL(10,2) NOT NULL DEFAULT 0,
        duration_months INT NOT NULL DEFAULT 12,
        description     TEXT,
        is_active       TINYINT(1) DEFAULT 1,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    log('Created subscription_plans table');
  } else {
    skip('subscription_plans');
  }
}

async function migrate_plan_limits(conn) {
  section('subscription_plans columns');
  const planCols = [
    ['max_booths',      'INT NOT NULL DEFAULT 5'],
    ['max_machines',    'INT NOT NULL DEFAULT 10'],
    ['max_officers',    'INT NOT NULL DEFAULT 5'],
    ['duration_months', 'INT NOT NULL DEFAULT 12'],
  ];
  for (const [col, def] of planCols) {
    if (!await hasColumn(conn, 'subscription_plans', col)) {
      await conn.execute(`ALTER TABLE subscription_plans ADD COLUMN ${col} ${def}`);
      log(`subscription_plans.${col} added`);
    } else {
      skip(`subscription_plans.${col}`);
    }
  }

  section('schools columns');
  const schoolCols = [
    ['custom_max_voters',    'INT DEFAULT NULL'],
    ['custom_max_elections', 'INT DEFAULT NULL'],
    ['custom_max_booths',    'INT DEFAULT NULL'],
    ['custom_max_machines',  'INT DEFAULT NULL'],
    ['custom_max_officers',  'INT DEFAULT NULL'],
    ['subscription_expiry',  'DATETIME DEFAULT NULL'],
  ];
  for (const [col, def] of schoolCols) {
    if (!await hasColumn(conn, 'schools', col)) {
      await conn.execute(`ALTER TABLE schools ADD COLUMN ${col} ${def}`);
      log(`schools.${col} added`);
    } else {
      skip(`schools.${col}`);
    }
  }

  section('Plan default values');
  await conn.execute(`UPDATE subscription_plans SET max_booths=2,  max_machines=2,  max_officers=2  WHERE name='Free'     AND max_booths=5`);
  await conn.execute(`UPDATE subscription_plans SET max_booths=5,  max_machines=10, max_officers=5  WHERE name='Standard' AND max_booths=5`);
  await conn.execute(`UPDATE subscription_plans SET max_booths=10, max_machines=20, max_officers=10 WHERE name='Premium'  AND max_booths=5`);
  log('Default plan values applied');
}

async function migrate_audit(conn) {
  section('audit_logs table');
  if (!await hasTable(conn, 'audit_logs')) {
    await conn.execute(`
      CREATE TABLE audit_logs (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        school_id  INT,
        user_id    INT,
        username   VARCHAR(100),
        action     VARCHAR(100) NOT NULL,
        entity     VARCHAR(100),
        entity_id  INT,
        details    TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_school (school_id),
        INDEX idx_user   (user_id),
        INDEX idx_action (action)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    log('Created audit_logs table');
  } else {
    skip('audit_logs');
  }
}

async function migrate_infrastructure(conn) {
  section('polling_booths table');
  if (!await hasTable(conn, 'polling_booths')) {
    await conn.execute(`
      CREATE TABLE polling_booths (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        school_id    INT NOT NULL,
        booth_number INT NOT NULL,
        location     VARCHAR(255),
        capacity     INT DEFAULT 100,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_booth (school_id, booth_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    log('Created polling_booths table');
  } else {
    skip('polling_booths');
  }

  section('voting_machines table');
  if (!await hasTable(conn, 'voting_machines')) {
    await conn.execute(`
      CREATE TABLE voting_machines (
        id                 INT AUTO_INCREMENT PRIMARY KEY,
        school_id          INT NOT NULL,
        booth_id           INT,
        machine_name       VARCHAR(100),
        machine_code       VARCHAR(50) UNIQUE,
        status             ENUM('FREE','IN_USE') DEFAULT 'FREE',
        device_fingerprint VARCHAR(255) DEFAULT NULL,
        created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    log('Created voting_machines table');
  } else {
    skip('voting_machines');
  }
}

async function run() {
  console.log('');
  console.log('=========================================');
  console.log('  Production Migration - School Voting  ');
  console.log('=========================================');
  console.log(`  Host : ${process.env.DB_HOST}`);
  console.log(`  DB   : ${process.env.DB_NAME}`);
  console.log('=========================================');

  const conn = await getConnection();
  try {
    await migrate_subscriptions(conn);
    await migrate_plan_limits(conn);
    await migrate_audit(conn);
    await migrate_infrastructure(conn);
    console.log('\nAll migrations completed successfully!\n');
  } catch (err) {
    console.error('\nMigration failed:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

run();
