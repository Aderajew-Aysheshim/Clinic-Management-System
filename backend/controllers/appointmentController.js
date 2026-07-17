const pool = require('../database/db');

exports.getAll = async (req, res) => {
  const { role, id } = req.user;
  try {
    let query;
    let params = [];

    if (role === 'doctor') {
      query = `SELECT a.*, p.fullname as patient_name
               FROM appointments a
               JOIN patients p ON a.patient_id = p.id
               WHERE a.doctor_id = $1
               ORDER BY a.appointment_date DESC, a.id DESC`;
      params = [id];
    } else if (role === 'patient') {
      query = `SELECT a.*, p.fullname as patient_name
               FROM appointments a
               JOIN patients p ON a.patient_id = p.id
               WHERE p.user_id = $1
               ORDER BY a.appointment_date DESC, a.id DESC`;
      params = [id];
    } else {
      query = `SELECT a.*, p.fullname as patient_name
               FROM appointments a
               JOIN patients p ON a.patient_id = p.id
               ORDER BY a.appointment_date DESC, a.id DESC`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const { patient_id, appointment_date, reason, doctor_id } = req.body;
  if (!patient_id || !appointment_date || !reason) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO appointments (patient_id, appointment_date, reason, doctor_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [patient_id, appointment_date, reason, doctor_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const { status, doctor_id } = req.body;
  try {
    let query;
    let params;
    if (doctor_id) {
      query = 'UPDATE appointments SET status = $1, doctor_id = $2 WHERE id = $3 RETURNING *';
      params = [status, doctor_id, req.params.id];
    } else {
      query = 'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *';
      params = [status, req.params.id];
    }
    const result = await pool.query(query, params);
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

exports.getToday = async (req, res) => {
  const { role, id } = req.user;
  const today = new Date().toISOString().split('T')[0];
  try {
    let query;
    let params = [today];

    if (role === 'doctor') {
      query = `SELECT a.*, p.fullname as patient_name
               FROM appointments a
               JOIN patients p ON a.patient_id = p.id
               WHERE a.appointment_date = $1 AND a.doctor_id = $2
               ORDER BY a.id DESC`;
      params.push(id);
    } else {
      query = `SELECT a.*, p.fullname as patient_name
               FROM appointments a
               JOIN patients p ON a.patient_id = p.id
               WHERE a.appointment_date = $1
               ORDER BY a.id DESC`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
