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

    const [cols] = await connection.execute("DESCRIBE elections");
    console.log("Elections table columns:");
    cols.forEach(c => console.log(`- ${c.Field}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

check();
