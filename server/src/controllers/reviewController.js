const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');

exports.getReviews = async (req, res) => {
  try {
    const { restaurant } = req.query;
    let query = {};
    if (restaurant) query.restaurant = restaurant;

    const reviews = await Review.find(query).populate('user', 'name');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const review = await Review.create(req.body);

    // Update restaurant rating
    const reviews = await Review.find({ restaurant: req.body.restaurant });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Restaurant.findByIdAndUpdate(req.body.restaurant, {
      rating: avgRating,
      totalReviews: reviews.length,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await review.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
