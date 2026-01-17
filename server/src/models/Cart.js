const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  restaurant:{ type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    specialInstructions: String,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
cartSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Cart', cartSchema);
