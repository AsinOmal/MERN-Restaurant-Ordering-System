const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
