const db = require("./config/db");
async function check() {
  const [columns] = await db.execute("SHOW COLUMNS FROM elections");
  console.log(JSON.stringify(columns, null, 2));
  process.exit(0);
}
check();
