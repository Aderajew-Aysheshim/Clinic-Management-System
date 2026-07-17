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
  ('admin', '$2b$10$r0p6N7PhMHLzcZMHzhcfneC/Enh/7W68R2GhB3OR.jru1qRvrbH6m', 'admin', 'System Admin', 'admin@clinic.com', '+251911000001'),
  ('dr.smith', '$2b$10$r0p6N7PhMHLzcZMHzhcfneC/Enh/7W68R2GhB3OR.jru1qRvrbH6m', 'doctor', 'Dr. John Smith', 'smith@clinic.com', '+251911000002'),
  ('reception', '$2b$10$r0p6N7PhMHLzcZMHzhcfneC/Enh/7W68R2GhB3OR.jru1qRvrbH6m', 'receptionist', 'Sarah Reception', 'sarah@clinic.com', '+251911000003'),
  ('pharmacy', '$2b$10$r0p6N7PhMHLzcZMHzhcfneC/Enh/7W68R2GhB3OR.jru1qRvrbH6m', 'pharmacist', 'Mike Pharmacist', 'mike@clinic.com', '+251911000004'),
  ('aderajew', '$2b$10$r0p6N7PhMHLzcZMHzhcfneC/Enh/7W68R2GhB3OR.jru1qRvrbH6m', 'patient', 'Aderajew Aysheshim', 'aderajew@patient.com', '+251911000005')
ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, fullname = EXCLUDED.fullname, email = EXCLUDED.email, phone = EXCLUDED.phone;
