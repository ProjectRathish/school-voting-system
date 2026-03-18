const db = require('./config/db');
async function check() {
  try {
    const [rows] = await db.execute("DESCRIBE schools");
    rows.forEach(r => console.log(r.Field));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
