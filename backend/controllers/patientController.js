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
    if (req.user.role === 'patient') {
      const patient = result.rows[0];
      if (patient.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const { fullname, gender, age, phone, address, user_id } = req.body;
  if (!fullname || !gender || !age || !phone || !address) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO patients (fullname, gender, age, phone, address, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [fullname, gender, age, phone, address, user_id || null]
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
  const { role, id } = req.user;
  try {
    const today = new Date().toISOString().split('T')[0];

    if (role === 'admin') {
      const [patients, totalAppointments, todayAppointments, pendingAppointments, totalUsers, totalPrescriptions] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM patients'),
        pool.query('SELECT COUNT(*) FROM appointments'),
        pool.query('SELECT COUNT(*) FROM appointments WHERE appointment_date::date = $1', [today]),
        pool.query("SELECT COUNT(*) FROM appointments WHERE status = 'Pending'"),
        pool.query('SELECT COUNT(*) FROM users'),
        pool.query('SELECT COUNT(*) FROM prescriptions'),
      ]);
      return res.json({
        totalPatients: parseInt(patients.rows[0].count),
        totalAppointments: parseInt(totalAppointments.rows[0].count),
        todayAppointments: parseInt(todayAppointments.rows[0].count),
        pendingAppointments: parseInt(pendingAppointments.rows[0].count),
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalPrescriptions: parseInt(totalPrescriptions.rows[0].count),
      });
    }

    if (role === 'doctor') {
      const [patients, todayAppointments, pendingPrescriptions, completedToday] = await Promise.all([
        pool.query(
          `SELECT COUNT(DISTINCT p.id) FROM patients p
           JOIN appointments a ON p.id = a.patient_id
           WHERE a.doctor_id = $1`,
          [id]
        ),
        pool.query(
          'SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND appointment_date::date = $2',
          [id, today]
        ),
        pool.query(
          "SELECT COUNT(*) FROM prescriptions WHERE doctor_id = $1 AND status = 'Active'",
          [id]
        ),
        pool.query(
          "SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND appointment_date::date = $2 AND status = 'Completed'",
          [id, today]
        ),
      ]);
      return res.json({
        myPatients: parseInt(patients.rows[0].count),
        todayAppointments: parseInt(todayAppointments.rows[0].count),
        pendingPrescriptions: parseInt(pendingPrescriptions.rows[0].count),
        completedToday: parseInt(completedToday.rows[0].count),
      });
    }

    if (role === 'receptionist') {
      const [todayAppointments, totalPatients, newBookingsToday, pendingAppointments] = await Promise.all([
        pool.query(
          'SELECT COUNT(*) FROM appointments WHERE appointment_date::date = $1',
          [today]
        ),
        pool.query('SELECT COUNT(*) FROM patients'),
        pool.query(
          'SELECT COUNT(*) FROM appointments WHERE created_at::date = $1',
          [today]
        ),
        pool.query(
          "SELECT COUNT(*) FROM appointments WHERE status = 'Pending'"
        ),
      ]);
      return res.json({
        todayAppointments: parseInt(todayAppointments.rows[0].count),
        totalPatients: parseInt(totalPatients.rows[0].count),
        newBookingsToday: parseInt(newBookingsToday.rows[0].count),
        pendingAppointments: parseInt(pendingAppointments.rows[0].count),
      });
    }

    if (role === 'pharmacist') {
      const [activePrescriptions, todayPrescriptions, pendingReview] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM prescriptions WHERE status = 'Active'"),
        pool.query("SELECT COUNT(*) FROM prescriptions WHERE prescribed_date::date = $1", [today]),
        pool.query("SELECT COUNT(*) FROM prescriptions WHERE status = 'Pending'"),
      ]);
      return res.json({
        activePrescriptions: parseInt(activePrescriptions.rows[0].count),
        todayPrescriptions: parseInt(todayPrescriptions.rows[0].count),
        pendingReview: parseInt(pendingReview.rows[0].count),
      });
    }

    if (role === 'patient') {
      const patientResult = await pool.query(
        'SELECT id FROM patients WHERE user_id = $1',
        [id]
      );
      if (patientResult.rows.length === 0) {
        return res.json({ upcomingAppointments: 0, myPrescriptions: 0, completedVisits: 0 });
      }
      const patientId = patientResult.rows[0].id;
      const [upcomingAppointments, myPrescriptions, completedVisits] = await Promise.all([
        pool.query(
          "SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND appointment_date::date >= $2 AND status != 'Cancelled'",
          [patientId, today]
        ),
        pool.query(
          "SELECT COUNT(*) FROM prescriptions WHERE patient_id = $1 AND status = 'Active'",
          [patientId]
        ),
        pool.query(
          "SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND status = 'Completed'",
          [patientId]
        ),
      ]);
      return res.json({
        upcomingAppointments: parseInt(upcomingAppointments.rows[0].count),
        myPrescriptions: parseInt(myPrescriptions.rows[0].count),
        completedVisits: parseInt(completedVisits.rows[0].count),
      });
    }

    res.json({ totalPatients: 0, todayAppointments: 0, totalUsers: 0 });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, p.fullname as patient_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       WHERE p.user_id = $1
       ORDER BY a.appointment_date DESC`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
