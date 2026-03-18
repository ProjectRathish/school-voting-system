const db = require('./config/db');
const bcrypt = require('bcrypt');

async function run() {
  try {
    const password = 'pass123';
    const hash = await bcrypt.hash(password, 10);
    console.log(`Setting password "pass123" (hash: ${hash}) for admin...`);
    
    await db.execute('UPDATE users SET password_hash = ? WHERE username = ?', [hash, 'admin']);
    console.log('Update successful!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating password:', err);
    process.exit(1);
  }
}

run();
