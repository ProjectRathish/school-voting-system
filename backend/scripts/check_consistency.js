const db = require('./config/db');
async function check() {
  try {
    const [matches] = await db.execute(`
      SELECT u.id as user_id, u.username, u.school_id, s.id as actual_school_id 
      FROM users u 
      LEFT JOIN schools s ON u.school_id = s.id 
      WHERE u.role = 'SCHOOL_ADMIN'
    `);
    console.log("CONSISTENCY CHECK:", JSON.stringify(matches, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
