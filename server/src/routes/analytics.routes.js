const express = require('express');
const router = express.Router();
const { verifyAsgardeoToken, authorizeRoles } = require('../middleware/asgardeo.middleware');
const {
  getRevenue,
  getPopularItems,
  getOrderTrends
} = require('../controllers/analyticsController');

router.use(verifyAsgardeoToken);
router.use(authorizeRoles('owner'));

router.get('/revenue', getRevenue);
router.get('/popular-items', getPopularItems);
router.get('/order-trends', getOrderTrends);

module.exports = router;
