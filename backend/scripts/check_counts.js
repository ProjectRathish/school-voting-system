const db = require('./config/db');

async function check() {
  try {
    const [[{count: booths}]] = await db.execute("SELECT COUNT(*) as count FROM polling_booths");
    const [[{count: machines}]] = await db.execute("SELECT COUNT(*) as count FROM voting_machines");
    console.log(`JSON_OUTPUT: {"booths": ${booths}, "machines": ${machines}}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
