const mysql = require('mysql2/promise');

async function updateSchema() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_voting_system'
    });

    console.log("Modifying elections table status ENUM...");
    
    await connection.query("ALTER TABLE elections MODIFY COLUMN status ENUM('DRAFT','CONFIGURING','READY','ACTIVE','PAUSED','CLOSED') DEFAULT 'DRAFT'");
    console.log("Added PAUSED to election status ENUM.");

    console.log("Adding logo column to schools table...");
    try {
      await connection.query("ALTER TABLE schools ADD COLUMN logo VARCHAR(255) DEFAULT NULL");
      console.log("Added logo column to schools table.");
    } catch (e) {
      if (e.code === 'ER_DUP_COLUMN_NAME') {
        console.log("Logo column already exists.");
      } else {
        throw e;
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateSchema();

