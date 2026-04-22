const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/protect.middleware');
const {
  getRevenue,
  getPopularItems,
  getOrderTrends
} = require('../controllers/analyticsController');

router.use(protect);
router.use(authorize('owner', 'admin'));

router.get('/revenue', getRevenue);
router.get('/popular-items', getPopularItems);
router.get('/order-trends', getOrderTrends);

module.exports = router;
