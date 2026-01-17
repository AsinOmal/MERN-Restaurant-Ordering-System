const express = require('express');
const router = express.Router();
const { getDeliveries, getDelivery, createDelivery, updateDeliveryStatus, updateLocation } = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth.middleware');

router.route('/').get(protect, getDeliveries).post(protect, authorize('staff', 'admin'), createDelivery);
router.get('/:id', protect, getDelivery);
router.patch('/:id/status', protect, authorize('driver', 'staff', 'admin'), updateDeliveryStatus);
router.patch('/:id/location', protect, authorize('driver'), updateLocation);

module.exports = router;
