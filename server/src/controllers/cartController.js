const Cart = require('../models/Cart');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('restaurant', 'name')
      .populate('items.menuItem');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    } else {
      // Clean up orphaned items (where menuItem no longer exists)
      const originalLength = cart.items.length;
      cart.items = cart.items.filter(item => item.menuItem !== null);
      
      if (cart.items.length < originalLength) {
        await cart.save();
        console.log(`[Cart] Cleaned up ${originalLength - cart.items.length} orphaned items`);
      }
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { menuItem, quantity, restaurant } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        restaurant,
        items: [{ menuItem, quantity }],
      });
    } else {
      // Check if menu item already exists in cart
      const itemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItem);

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ menuItem, quantity });
      }
      cart.restaurant = restaurant;
      await cart.save();
    }

    await cart.populate('items.menuItem');

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error('[Cart] Error in addToCart:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    item.quantity = req.body.quantity;
    await cart.save();

    await cart.populate('items.menuItem');
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error('[Cart] Error updating item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Remove using subdocument _id
    cart.items.pull(req.params.itemId);
    await cart.save();

    await cart.populate('items.menuItem');
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error('[Cart] Error removing item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
