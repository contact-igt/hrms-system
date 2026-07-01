import { pool } from './database/client.js';

async function run() {
  try {
    await pool.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL, status = "ACTIVE" WHERE email = ?', ['admin@orbix.local']);
    console.log('Reset complete');
  } catch(e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
run();
