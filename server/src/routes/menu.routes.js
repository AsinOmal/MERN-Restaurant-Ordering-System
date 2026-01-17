const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth.middleware');

router.route('/')
  .get(getMenuItems)
  .post(protect, authorize('staff', 'owner', 'admin'), createMenuItem);

router.route('/:id')
  .get(getMenuItem)
  .put(protect, authorize('staff', 'owner', 'admin'), updateMenuItem)
  .delete(protect, authorize('staff', 'owner', 'admin'), deleteMenuItem);

module.exports = router;
