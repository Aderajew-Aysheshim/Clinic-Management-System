const bcrypt = require('bcryptjs');
const pool = require('../database/db');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role, fullname, email, phone FROM users ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const { username, password, role, fullname, email, phone } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }
  const validRoles = ['admin', 'doctor', 'receptionist', 'pharmacist', 'patient'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password, role, fullname, email, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, role, fullname, email, phone',
      [username, hashedPassword, role, fullname || '', email || null, phone || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const { role, fullname, email, phone } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET role = $1, fullname = $2, email = $3, phone = $4 WHERE id = $5 RETURNING id, username, role, fullname, email, phone',
      [role, fullname, email, phone, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
