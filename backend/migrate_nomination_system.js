const db = require("./config/db");

async function migrate() {
  try {
    console.log("Starting nomination system migration...");

    // 1. Add status to candidates table
    console.log("Updating candidates table...");
    await db.execute(`
      ALTER TABLE candidates 
      ADD COLUMN IF NOT EXISTS status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'APPROVED'
    `);

    // 2. Add nomination_open to elections table
    console.log("Updating elections table...");
    await db.execute(`
      ALTER TABLE elections 
      ADD COLUMN IF NOT EXISTS nomination_open TINYINT(1) DEFAULT 0
    `);

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
