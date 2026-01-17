const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide restaurant name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
  },
  address: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
  },
  cuisineTypes: [{
    type: String,
    enum: ['Italian', 'Chinese', 'Indian', 'Japanese', 'Mexican', 'Thai', 'American', 'Mediterranean', 'Other'],
  }],
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    default: 'default-restaurant.jpg',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
