const db = require("./config/db");

async function run() {
  try {
    console.log("Adding must_change_password column to users table...");
    // Check if column exists first
    const [cols] = await db.execute("SHOW COLUMNS FROM users LIKE 'must_change_password'");
    if (cols.length === 0) {
      await db.execute("ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) DEFAULT 0");
      console.log("Column added successfully.");
    } else {
      console.log("Column already exists.");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
