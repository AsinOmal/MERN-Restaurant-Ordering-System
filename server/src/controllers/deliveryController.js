const Delivery = require('../models/Delivery');
const { getIO } = require('../config/socket');

exports.getDeliveries = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'driver') query.driver = req.user.id;

    const deliveries = await Delivery.find(query)
      .populate('order')
      .populate('driver', 'name phone');

    res.status(200).json({ success: true, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('order')
      .populate('driver', 'name phone');

    res.status(200).json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create(req.body);
    res.status(201).json({ success: true, data: delivery });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    delivery.status = req.body.status;
    await delivery.save();

    const io = getIO();
    io.to(`order:${delivery.order}`).emit('delivery:status_update', {
      deliveryId: delivery._id,
      status: delivery.status,
    });

    res.status(200).json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    delivery.currentLocation = {
      lat: req.body.lat,
      lng: req.body.lng,
      updatedAt: new Date(),
    };
    await delivery.save();

    const io = getIO();
    io.to(`order:${delivery.order}`).emit('delivery:location_update', {
      deliveryId: delivery._id,
      location: delivery.currentLocation,
    });

    res.status(200).json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
