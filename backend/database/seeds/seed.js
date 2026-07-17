const bcrypt = require('bcryptjs');
const pool = require('../db');

async function seed() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await pool.query(
      `INSERT INTO users (username, password, role, fullname, email, phone) VALUES
        ('admin', $1, 'admin', 'System Admin', 'admin@clinic.com', '+251911000001'),
        ('dr.smith', $1, 'doctor', 'Dr. John Smith', 'smith@clinic.com', '+251911000002'),
        ('reception', $1, 'receptionist', 'Sarah Reception', 'sarah@clinic.com', '+251911000003'),
        ('pharmacy', $1, 'pharmacist', 'Mike Pharmacist', 'mike@clinic.com', '+251911000004'),
        ('aderajew', $1, 'patient', 'Aderajew Aysheshim', 'aderajew@patient.com', '+251911000005')
      ON CONFLICT (username) DO UPDATE SET 
        password = EXCLUDED.password, 
        role = EXCLUDED.role, 
        fullname = EXCLUDED.fullname,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone`,
      [hashedPassword]
    );

    console.log('Users seeded successfully');
  } catch (err) {
    console.error('Seeding error:', err.message);
  }
}

module.exports = seed;
