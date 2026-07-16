const pool = require('../database/db');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, p.fullname as patient_name 
       FROM appointments a 
       JOIN patients p ON a.patient_id = p.id 
       ORDER BY a.appointment_date DESC, a.id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const { patient_id, appointment_date, reason } = req.body;
  if (!patient_id || !appointment_date || !reason) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO appointments (patient_id, appointment_date, reason) VALUES ($1, $2, $3) RETURNING *',
      [patient_id, appointment_date, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
