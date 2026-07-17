const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

router.get('/patient/:id', auth, authorize('doctor', 'pharmacist', 'patient'), prescriptionController.getByPatient);
router.get('/', auth, authorize('pharmacist'), prescriptionController.getAll);
router.post('/', auth, authorize('doctor'), prescriptionController.create);
router.put('/:id', auth, authorize('pharmacist'), prescriptionController.update);

module.exports = router;
