const db = require("./config/db");

async function migrate() {
    try {
        console.log("Starting migration: adding is_blocked column...");
        
        await db.execute(`
            ALTER TABLE voters 
            ADD COLUMN is_blocked TINYINT(1) DEFAULT 0
        `);
        
        console.log("Migration successful!");
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log("Column is_blocked already exists.");
            process.exit(0);
        }
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
