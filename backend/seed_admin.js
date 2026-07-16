const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function seed() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'cliniccare'
  });
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET password = $2',
    ['admin', hash]
  );
  const res = await pool.query('SELECT id, username FROM users');
  console.log('Users:', res.rows);
  await pool.end();
}

seed().catch(e => console.error(e));
