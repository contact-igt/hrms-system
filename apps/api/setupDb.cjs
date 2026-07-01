const mysql = require('mysql2/promise');

async function setupDb() {
  try {
    const conn = await mysql.createConnection('mysql://root@127.0.0.1:3306/');
    await conn.query('CREATE DATABASE IF NOT EXISTS hrms;');
    await conn.query("CREATE USER IF NOT EXISTS 'hrms_user'@'localhost' IDENTIFIED BY 'HrmsLocal@2026!';");
    await conn.query("CREATE USER IF NOT EXISTS 'hrms_user'@'127.0.0.1' IDENTIFIED BY 'HrmsLocal@2026!';");
    await conn.query("GRANT ALL PRIVILEGES ON hrms.* TO 'hrms_user'@'localhost';");
    await conn.query("GRANT ALL PRIVILEGES ON hrms.* TO 'hrms_user'@'127.0.0.1';");
    await conn.query('FLUSH PRIVILEGES;');
    console.log('Database and user created successfully!');
    process.exit(0);
  } catch(e) {
    console.error('Error setup:', e.message);
    process.exit(1);
  }
}

setupDb();
