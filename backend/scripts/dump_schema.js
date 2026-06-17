const mysql = require('mysql2/promise');
const fs = require('fs');

async function getSchema() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_voting_system'
    });

    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    let schema = '';
    for (const table of tableNames) {
      const [createTable] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
      schema += createTable[0]['Create Table'] + ';\n\n';
    }

    fs.writeFileSync('schema_dump.sql', schema);
    console.log('Schema dumped to schema_dump.sql');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

getSchema();
