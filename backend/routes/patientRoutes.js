const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

router.get('/dashboard', auth, patientController.dashboard);
router.get('/history/:userId', auth, authorize('patient'), patientController.getHistory);
router.get('/', auth, authorize('admin', 'doctor', 'receptionist'), patientController.getAll);
router.get('/:id', auth, authorize('admin', 'doctor', 'receptionist', 'patient'), patientController.getById);
router.post('/', auth, authorize('admin', 'receptionist'), patientController.create);
router.put('/:id', auth, authorize('admin', 'doctor', 'receptionist'), patientController.update);
router.delete('/:id', auth, authorize('admin'), patientController.remove);

module.exports = router;
