const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seed() {
  try {
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET password = $2',
      ['admin', adminPassword]
    );
    console.log('Admin user seeded successfully');
  } catch (err) {
    console.error('Seeding error:', err.message);
  }
}

module.exports = seed;
