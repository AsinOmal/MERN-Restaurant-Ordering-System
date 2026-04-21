const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { verifyAsgardeoToken, authorizeRoles } = require('../middleware/asgardeo.middleware');

router.route('/')
  .get(getMenuItems)
  .post(verifyAsgardeoToken, authorizeRoles('staff', 'owner', 'admin'), createMenuItem);

router.route('/:id')
  .get(getMenuItem)
  .put(verifyAsgardeoToken, authorizeRoles('staff', 'owner', 'admin'), updateMenuItem)
  .delete(verifyAsgardeoToken, authorizeRoles('staff', 'owner', 'admin'), deleteMenuItem);

module.exports = router;
