const db = require('./config/db');
const bcrypt = require('bcrypt');

async function run() {
  try {
    const [users] = await db.execute("SELECT * FROM users WHERE role='SUPER_ADMIN'");
    if (users.length === 0) {
      console.log("No SUPER_ADMIN found.");
      process.exit(0);
    }
    const user = users[0];
    console.log(`Username: ${user.username}`);
    const hash = user.password_hash;
    
    const candidates = ['admin', 'password', 'pass123', 'superadmin', '123456', 'superadmin123', 'admin123'];
    for (const p of candidates) {
      if (await bcrypt.compare(p, hash)) {
        console.log(`Password is: ${p}`);
        process.exit(0);
      }
    }
    console.log("Password hash: " + hash);
    console.log("Password is not a common default. Resetting it to 'admin123'...");
    const newHash = await bcrypt.hash('admin123', 10);
    await db.execute("UPDATE users SET password_hash=? WHERE id=?", [newHash, user.id]);
    console.log("Password reset to 'admin123'.");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
