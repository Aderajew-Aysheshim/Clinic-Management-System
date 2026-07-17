const pool = require('../database/db');

exports.getAll = async (req, res) => {
  const { role, id } = req.user;
  try {
    let query;
    let params = [];

    if (role === 'patient') {
      const patientResult = await pool.query('SELECT id FROM patients WHERE user_id = $1', [id]);
      if (patientResult.rows.length === 0) {
        return res.json([]);
      }
      const patientId = patientResult.rows[0].id;
      query = `SELECT pr.*, p.fullname as patient_name, u.fullname as doctor_name
               FROM prescriptions pr
               JOIN patients p ON pr.patient_id = p.id
               LEFT JOIN users u ON pr.doctor_id = u.id
               WHERE pr.patient_id = $1
               ORDER BY pr.prescribed_date DESC`;
      params = [patientId];
    } else if (role === 'doctor') {
      query = `SELECT pr.*, p.fullname as patient_name, u.fullname as doctor_name
               FROM prescriptions pr
               JOIN patients p ON pr.patient_id = p.id
               LEFT JOIN users u ON pr.doctor_id = u.id
               WHERE pr.doctor_id = $1
               ORDER BY pr.prescribed_date DESC`;
      params = [id];
    } else {
      query = `SELECT pr.*, p.fullname as patient_name, u.fullname as doctor_name
               FROM prescriptions pr
               JOIN patients p ON pr.patient_id = p.id
               LEFT JOIN users u ON pr.doctor_id = u.id
               ORDER BY pr.prescribed_date DESC`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const { patient_id, medication, dosage, frequency, duration, notes } = req.body;
  if (!patient_id || !medication || !dosage || !frequency) {
    return res.status(400).json({ error: 'patient_id, medication, dosage, and frequency are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, frequency, duration, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [patient_id, req.user.id, medication, dosage, frequency, duration || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  try {
    const result = await pool.query(
      'UPDATE prescriptions SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getByPatient = async (req, res) => {
  const { role, id } = req.user;
  const patientId = req.params.id;
  try {
    if (role === 'patient') {
      const patientResult = await pool.query(
        'SELECT id FROM patients WHERE user_id = $1',
        [id]
      );
      if (patientResult.rows.length === 0 || patientResult.rows[0].id !== parseInt(patientId)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    const result = await pool.query(
      `SELECT pr.*, p.fullname as patient_name, u.fullname as doctor_name
       FROM prescriptions pr
       JOIN patients p ON pr.patient_id = p.id
       LEFT JOIN users u ON pr.doctor_id = u.id
       WHERE pr.patient_id = $1
       ORDER BY pr.prescribed_date DESC`,
      [patientId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
