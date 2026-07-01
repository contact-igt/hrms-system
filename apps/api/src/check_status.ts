import { pool } from './database/client.js';

async function run() {
  try {
    const [rows] = await pool.query('SELECT failed_login_attempts, locked_until, status FROM users WHERE email = ?', ['admin@orbix.local']);
    console.log('User status:', rows);
  } catch(e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
run();
