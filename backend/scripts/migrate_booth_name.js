/**
 * Migration: Add booth_name column to polling_booths table
 * Run with: node backend/scripts/migrate_booth_name.js
 */
const db = require('../config/db');

async function migrate() {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Checking polling_booths table...');
    const [cols] = await connection.execute('SHOW COLUMNS FROM polling_booths');
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('booth_name')) {
      await connection.execute(
        `ALTER TABLE polling_booths ADD COLUMN booth_name VARCHAR(100) DEFAULT NULL AFTER booth_number`
      );
      console.log('Added booth_name column to polling_booths');
    } else {
      console.log('booth_name column already exists');
    }

    await connection.commit();
    console.log('\nMigration complete!');
  } catch (err) {
    await connection.rollback();
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrate();
