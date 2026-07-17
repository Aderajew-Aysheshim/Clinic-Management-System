const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

router.get('/today', auth, authorize('doctor', 'receptionist'), appointmentController.getToday);
router.get('/', auth, authorize('admin', 'doctor', 'receptionist', 'pharmacist', 'patient'), appointmentController.getAll);
router.post('/', auth, authorize('admin', 'receptionist', 'patient'), appointmentController.create);
router.put('/:id', auth, authorize('admin', 'doctor', 'receptionist'), appointmentController.update);
router.delete('/:id', auth, authorize('admin', 'receptionist'), appointmentController.remove);

module.exports = router;
