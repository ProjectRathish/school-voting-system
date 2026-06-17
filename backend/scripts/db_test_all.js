const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mysql = require("mysql2/promise");

async function check() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log("Running Schools query...");
    const [schools] = await connection.execute("SELECT COUNT(*) as totalSchools FROM schools");
    console.log("Schools result:", schools);

    console.log("Running Enquiries query...");
    const [enquiries] = await connection.execute("SELECT COUNT(*) as pendingEnquiries FROM school_enquiries WHERE status = 'PENDING'");
    console.log("Enquiries result:", enquiries);

    console.log("Running Active Elections query...");
    const [active] = await connection.execute("SELECT COUNT(*) as activeElections FROM elections WHERE status = 'ACTIVE'");
    console.log("Active result:", active);

    console.log("Running Expiring Soon query...");
    const [expiring] = await connection.execute(
      "SELECT COUNT(*) as expiringSoon FROM elections WHERE status = 'ACTIVE' AND end_date <= DATE_ADD(NOW(), INTERVAL 7 DAY)"
    );
    console.log("Expiring result:", expiring);

    process.exit(0);
  } catch (err) {
    console.error("FAILED:", err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

check();
