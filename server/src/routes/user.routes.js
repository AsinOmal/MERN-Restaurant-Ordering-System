const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUserRole, deleteUser } = require('../controllers/userController');
const { verifyAsgardeoToken, authorizeRoles } = require('../middleware/asgardeo.middleware');

router.use(verifyAsgardeoToken);

router.get('/', authorizeRoles('admin'), getUsers);
router.get('/:id', authorizeRoles('admin'), getUser);
router.put('/:id/role', authorizeRoles('admin'), updateUserRole);
router.delete('/:id', authorizeRoles('admin'), deleteUser);

module.exports = router;
