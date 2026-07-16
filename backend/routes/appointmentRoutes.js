const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

router.get('/', auth, appointmentController.getAll);
router.post('/', auth, appointmentController.create);
router.put('/:id', auth, appointmentController.update);
router.delete('/:id', auth, appointmentController.remove);

module.exports = router;
