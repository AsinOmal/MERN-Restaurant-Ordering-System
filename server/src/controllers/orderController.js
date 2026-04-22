const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// @desc    Get orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    let query = {};

    // If not admin, only show user's orders or restaurant's orders
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'staff') {
      // Assume staff can see restaurant orders - would need restaurant ownership check
      if (req.query.restaurant) query.restaurant = req.query.restaurant;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name address')
      .sort('-orderedAt');

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name address phone')
      .populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization
    if (order.customer._id.toString() !== req.user.id && req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private (customer)
exports.createOrder = async (req, res) => {
  try {
    req.body.customer = req.user.id;

    // Fetch items from database to get secure prices
    const itemIds = req.body.items.map(item => item.menuItem);
    const menuItems = await MenuItem.find({ _id: { $in: itemIds } });

    if (menuItems.length !== itemIds.length) {
      return res.status(400).json({ success: false, message: 'One or more menu items not found' });
    }

    // Map secure prices to the items array and calculate subtotal
    let subtotal = 0;
    req.body.items = req.body.items.map(reqItem => {
      const dbItem = menuItems.find(m => m._id.toString() === reqItem.menuItem.toString());
      subtotal += (dbItem.price * reqItem.quantity);
      return {
        ...reqItem,
        price: dbItem.price,
        name: dbItem.name
      };
    });

    req.body.subtotal = subtotal;
    req.body.tax = subtotal * 0.1; // 10% tax
    req.body.deliveryFee = 5; // Fixed delivery fee
    req.body.totalAmount = subtotal + req.body.tax + req.body.deliveryFee;

    const order = await Order.create(req.body);

    // Populate order details
    await order.populate('customer', 'name email phone');
    await order.populate('restaurant', 'name');

    // Send real-time notification via WebSocket
    // Send real-time notification via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant:${order.restaurant._id}`).emit('order:new', {
        order,
        message: 'New order received!',
      });
      console.log(`[Socket] Emitted order:new to restaurant:${order.restaurant._id}`);
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (staff, admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer restaurant');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = req.body.status;
    await order.save();

    // Send real-time notification to customer
    // Send real-time notification to customer
    const io = req.app.get('io');
    if (io) {
      // Notify customer
      io.to(`user:${order.customer._id}`).emit('order:update', {
        orderId: order._id,
        status: order.status,
        message: `Your order is now ${order.status}`
      });
      // Notify restaurant (staff dashboard)
      io.to(`restaurant:${order.restaurant._id}`).emit('order:update', {
         orderId: order._id,
         status: order.status
      });
      console.log(`[Socket] Emitted order:update to user:${order.customer._id}`);
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only customer can cancel their own order, or admin
    if (order.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Can only cancel if pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
