const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

router.get('/patient/:id', auth, authorize('admin', 'doctor', 'pharmacist', 'patient'), prescriptionController.getByPatient);
router.get('/', auth, authorize('admin', 'doctor', 'pharmacist', 'patient'), prescriptionController.getAll);
router.post('/', auth, authorize('admin', 'doctor'), prescriptionController.create);
router.put('/:id', auth, authorize('admin', 'pharmacist'), prescriptionController.update);

module.exports = router;
