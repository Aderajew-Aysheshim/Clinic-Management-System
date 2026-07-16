const pool = require('../database/db');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const { fullname, gender, age, phone, address } = req.body;
  if (!fullname || !gender || !age || !phone || !address) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO patients (fullname, gender, age, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [fullname, gender, age, phone, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const { fullname, gender, age, phone, address } = req.body;
  try {
    const result = await pool.query(
      'UPDATE patients SET fullname = $1, gender = $2, age = $3, phone = $4, address = $5 WHERE id = $6 RETURNING *',
      [fullname, gender, age, phone, address, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const patients = await pool.query('SELECT COUNT(*) FROM patients');
    const today = new Date().toISOString().split('T')[0];
    const appointments = await pool.query(
      'SELECT COUNT(*) FROM appointments WHERE appointment_date = $1',
      [today]
    );
    res.json({
      totalPatients: parseInt(patients.rows[0].count),
      todayAppointments: parseInt(appointments.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
