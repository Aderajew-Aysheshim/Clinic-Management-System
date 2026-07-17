const bcrypt = require('bcryptjs');
const pool = require('../db');

async function seed() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await pool.query(
      `INSERT INTO users (username, password, role, fullname, email, phone) VALUES
        ('admin', $1, 'admin', 'System Admin', 'admin@clinic.com', '+1234567890'),
        ('dr.smith', $1, 'doctor', 'Dr. John Smith', 'smith@clinic.com', '+1234567891'),
        ('reception', $1, 'receptionist', 'Sarah Reception', 'sarah@clinic.com', '+1234567892'),
        ('pharmacy', $1, 'pharmacist', 'Mike Pharmacist', 'mike@clinic.com', '+1234567893'),
        ('patient1', $1, 'patient', 'Ahmed Patient', 'ahmed@patient.com', '+1234567894')
      ON CONFLICT (username) DO UPDATE SET role = EXCLUDED.role, fullname = EXCLUDED.fullname`,
      [hashedPassword]
    );

    console.log('Users seeded successfully');
  } catch (err) {
    console.error('Seeding error:', err.message);
  }
}

module.exports = seed;
