const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: 0,
  },
  category: {
    type: String,
    enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side', 'Special'],
    required: true,
  },
  images: [{
    type: String,
  }],
  available: {
    type: Boolean,
    default: true,
  },
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
  dietary: [{
    type: String,
    enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher'],
  }],
  preparationTime: {
    type: Number, // in minutes
    default: 15,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
