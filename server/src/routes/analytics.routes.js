const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getRevenue,
  getPopularItems,
  getOrderTrends
} = require('../controllers/analyticsController');

// All routes require authentication and 'owner' role
router.use(protect);
router.use(authorize('owner'));

router.get('/revenue', getRevenue);
router.get('/popular-items', getPopularItems);
router.get('/order-trends', getOrderTrends);

module.exports = router;
