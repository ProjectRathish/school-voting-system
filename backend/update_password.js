const db = require('./config/db');
async function run() {
  await db.execute('UPDATE users SET password_hash = ? WHERE username = ?', [
    '$2b$10$jTV2YvwaC/wS1.L7uAqc/O6/irndfyhY0gNjql99ed7XQK34EjFh.',
    'admin'
  ]);
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
