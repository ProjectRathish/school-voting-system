const db = require('./config/db');
async function test() {
  const [rows] = await db.query(`SHOW CREATE TABLE classes`);
  console.log(rows[0]['Create Table']);
  process.exit(0);
}
test();
