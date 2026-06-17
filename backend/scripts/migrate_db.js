const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_voting_system'
    });
    
    // Check if column exists, if not, add it
    const [cols] = await conn.execute("SHOW COLUMNS FROM users LIKE 'plain_password'");
    if (cols.length === 0) {
      await conn.execute('ALTER TABLE users ADD COLUMN plain_password VARCHAR(255) DEFAULT NULL');
      console.log('Column added');
    } else {
      console.log('Column already exists');
    }
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
