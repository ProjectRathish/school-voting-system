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

    const [schools] = await connection.execute("SELECT COUNT(*) as count FROM schools");
    const [enquiries] = await connection.execute("SELECT COUNT(*) as count FROM school_enquiries");
    const [approved] = await connection.execute("SELECT COUNT(*) as count FROM school_enquiries WHERE status = 'APPROVED'");
    const [pending] = await connection.execute("SELECT COUNT(*) as count FROM school_enquiries WHERE status = 'PENDING'");

    console.log("Database Stats:");
    console.log("- Schools table count:", schools[0].count);
    console.log("- Total Enquiries:", enquiries[0].count);
    console.log("- Approved Enquiries:", approved[0].count);
    console.log("- Pending Enquiries:", pending[0].count);

    process.exit(0);
  } catch (err) {
    console.error("Error connecting to DB:", err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

check();
