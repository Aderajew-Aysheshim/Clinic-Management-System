const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

router.get('/', auth, authorize('admin'), userController.getAll);
router.post('/', auth, authorize('admin'), userController.create);
router.put('/:id', auth, authorize('admin'), userController.update);
router.delete('/:id', auth, authorize('admin'), userController.remove);

module.exports = router;
