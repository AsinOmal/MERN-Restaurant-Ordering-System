const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc    Get total revenue analytics
// @route   GET /api/analytics/revenue
exports.getRevenue = async (req, res) => {
  try {
    // Check if user is owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get owner's restaurants
    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map(r => r._id);

    // Aggregate daily revenue for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenue = await Order.aggregate([
      {
        $match: {
          restaurant: { $in: restaurantIds },
          status: { $ne: 'cancelled' },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate total revenue
    const totalRevenue = revenue.reduce((acc, curr) => acc + curr.total, 0);
    const totalOrders = revenue.reduce((acc, curr) => acc + curr.count, 0);

    res.status(200).json({
      success: true,
      data: {
        chartData: revenue,
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get popular items
// @route   GET /api/analytics/popular-items
exports.getPopularItems = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map(r => r._id);

    const popularItems = await Order.aggregate([
      {
        $match: {
          restaurant: { $in: restaurantIds },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          count: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Populate item details
    const populatedItems = await MenuItem.populate(popularItems, { path: '_id', select: 'name' });

    // Format for frontend
    const formattedData = populatedItems.map(item => ({
      name: item._id ? item._id.name : 'Unknown Item',
      count: item.count,
      revenue: item.revenue
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order status trends
// @route   GET /api/analytics/order-trends
exports.getOrderTrends = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map(r => r._id);

    const trends = await Order.aggregate([
      {
        $match: {
          restaurant: { $in: restaurantIds }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
