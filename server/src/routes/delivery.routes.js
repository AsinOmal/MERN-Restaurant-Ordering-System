const express = require('express');
const router = express.Router();
const { getDeliveries, getDelivery, createDelivery, updateDeliveryStatus, updateLocation } = require('../controllers/deliveryController');
const { verifyAsgardeoToken, authorizeRoles } = require('../middleware/asgardeo.middleware');

router.use(verifyAsgardeoToken);

router.route('/').get(getDeliveries).post(authorizeRoles('staff', 'admin'), createDelivery);
router.get('/:id', getDelivery);
router.patch('/:id/status', authorizeRoles('driver', 'staff', 'admin'), updateDeliveryStatus);
router.patch('/:id/location', authorizeRoles('driver'), updateLocation);

module.exports = router;
