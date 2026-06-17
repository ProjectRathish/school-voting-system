const db = require('./config/db');

async function checkDB() {
  try {
    const [schools] = await db.execute("SELECT id, name, code, location FROM schools ORDER BY id DESC LIMIT 5");
    console.log("\n=== Schools ===");
    schools.forEach(s => console.log(`  ID:${s.id} Code:"${s.code}" Name:"${s.name}"`) );

    const [users] = await db.execute("SELECT id, school_id, username, role FROM users ORDER BY id DESC LIMIT 10");
    console.log("\n=== Users ===");
    users.forEach(u => console.log(`  ID:${u.id} school_id:${u.school_id} username:"${u.username}" role:${u.role}`));

    process.exit(0);
  } catch (err) {
    console.error("DB Check error:", err.message);
    process.exit(1);
  }
}
checkDB();
