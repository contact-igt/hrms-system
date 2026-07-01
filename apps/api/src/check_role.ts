import { pool } from './database/client.js';

async function run() {
  try {
    const [rows] = await pool.query('SELECT r.name FROM users u JOIN platform_user_roles pur ON u.id = pur.user_id JOIN roles r ON pur.role_id = r.id WHERE u.email = ?', ['admin@orbix.local']);
    console.log('Roles:', rows);
  } catch(e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
run();
