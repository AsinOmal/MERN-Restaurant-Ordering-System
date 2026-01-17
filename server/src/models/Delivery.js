const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['unassigned', 'assigned', 'picked-up', 'in-transit', 'delivered', 'failed'],
    default: 'unassigned',
  },
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date,
  },
  pickupLocation: {
    lat: Number,
    lng: Number,
    address: String,
  },
  dropoffLocation: {
    lat: Number,
    lng: Number,
    address: String,
  },
  estimatedTime: Date,
  actualPickupTime: Date,
  actualDeliveryTime: Date,
  distance: Number, // in kilometers
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Delivery', deliverySchema);
