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

    const [enquiries] = await connection.execute("SELECT id, school_name, status FROM school_enquiries WHERE status = 'APPROVED'");
    const [schools] = await connection.execute("SELECT name, email FROM schools");

    console.log("Approved Enquiries:");
    enquiries.forEach(e => console.log(`- ${e.school_name} (ID: ${e.id})`));
    
    console.log("\nSchools in Schools Table:");
    schools.forEach(s => console.log(`- ${s.name} (${s.email})`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

check();
