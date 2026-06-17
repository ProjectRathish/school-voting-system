const db = require('./config/db');

async function migrate() {
  try {
    console.log("Starting migration: Adding security columns to voting_machines...");
    
    await db.execute(`
      ALTER TABLE voting_machines 
      ADD COLUMN IF NOT EXISTS device_fingerprint VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `);
    
    console.log("Migration successful!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
