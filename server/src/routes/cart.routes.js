const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/protect.middleware');

router.use(protect);

router.route('/').get(getCart).delete(clearCart);
router.route('/items').post(addToCart);
router.route('/items/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;
