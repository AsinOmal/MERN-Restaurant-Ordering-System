const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot be more than 500 characters'],
  },
  foodQuality: {
    type: Number,
    min: 1,
    max: 5,
  },
  deliverySpeed: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate reviews for same user and restaurant
reviewSchema.index({ user: 1, restaurant: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
