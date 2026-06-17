const db = require('./config/db');
async function test() {
  const [rows] = await db.query(`SHOW COLUMNS FROM posts`);
  console.log(rows);
  process.exit(0);
}
test();
