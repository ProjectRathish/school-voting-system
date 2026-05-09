const db = require("./config/db");

async function migrate() {
  try {
    console.log("Starting migration: Making election_id nullable in sections and classes...");
    
    await db.execute("ALTER TABLE sections MODIFY COLUMN election_id INT NULL");
    console.log("Sections updated.");
    
    await db.execute("ALTER TABLE classes MODIFY COLUMN election_id INT NULL");
    console.log("Classes updated.");
    
    console.log("Migration successful!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
