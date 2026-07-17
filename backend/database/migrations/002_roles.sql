ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'patient';
ALTER TABLE users ADD COLUMN IF NOT EXISTS fullname VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

ALTER TABLE patients ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES users(id),
  medication VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'Active',
  prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

INSERT INTO users (username, password, role, fullname, email, phone) VALUES
  ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System Admin', 'admin@clinic.com', '+1234567890'),
  ('dr.smith', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', 'Dr. John Smith', 'smith@clinic.com', '+1234567891'),
  ('reception', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'receptionist', 'Sarah Reception', 'sarah@clinic.com', '+1234567892'),
  ('pharmacy', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pharmacist', 'Mike Pharmacist', 'mike@clinic.com', '+1234567893'),
  ('patient1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient', 'Ahmed Patient', 'ahmed@patient.com', '+1234567894')
ON CONFLICT (username) DO UPDATE SET role = EXCLUDED.role, fullname = EXCLUDED.fullname;
