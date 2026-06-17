/**
 * Migration: Create audit_logs table
 * Run once: node backend/scripts/migrate_audit.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../config/db');

async function migrate() {
  try {
    console.log('Creating audit_logs table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        school_id    INT UNSIGNED,
        user_id      INT UNSIGNED,
        user_name    VARCHAR(255)  NOT NULL DEFAULT 'Unknown',
        role         VARCHAR(50)   NOT NULL,
        action       VARCHAR(100)  NOT NULL,
        entity_type  VARCHAR(100),
        entity_name  VARCHAR(255),
        details      JSON,
        created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_school_id   (school_id),
        INDEX idx_created_at  (created_at),
        INDEX idx_action      (action)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ audit_logs table created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
