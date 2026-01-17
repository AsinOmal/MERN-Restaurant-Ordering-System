const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

// Add restaurant to favorites
exports.addFavorite = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user._id;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Add to favorites if not already there
    const user = await User.findById(userId);
    if (!user.favorites.includes(restaurantId)) {
      user.favorites.push(restaurantId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: user.favorites
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove restaurant from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    user.favorites = user.favorites.filter(id => id.toString() !== restaurantId);
    await user.save();

    res.status(200).json({
      success: true,
      data: user.favorites
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's favorite restaurants
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: 'favorites',
      select: 'name cuisineTypes rating totalReviews image address'
    });

    res.status(200).json({
      success: true,
      data: user.favorites || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
