const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, patientController.dashboard);
router.get('/', auth, patientController.getAll);
router.get('/:id', auth, patientController.getById);
router.post('/', auth, patientController.create);
router.put('/:id', auth, patientController.update);
router.delete('/:id', auth, patientController.remove);

module.exports = router;
