const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { verifyAsgardeoToken } = require('../middleware/asgardeo.middleware');

router.use(verifyAsgardeoToken);

router.route('/').get(getCart).delete(clearCart);
router.route('/items').post(addToCart);
router.route('/items/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;
