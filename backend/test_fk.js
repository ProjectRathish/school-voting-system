const db = require('./config/db');
async function test() {
  const [rows] = await db.query(`
    SELECT TABLE_NAME, CONSTRAINT_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_SCHEMA = 'school_voting_system' AND REFERENCED_TABLE_NAME = 'elections';
  `);
  console.log(rows);
  process.exit(0);
}
test();
