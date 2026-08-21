const mongoose = require('mongoose');

const DeliveryRequestSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  pickup: {
    location: String,
    address: String,
    latitude: Number,
    longitude: Number
  },
  dropoff: {
    location: String,
    address: String,
    latitude: Number,
    longitude: Number
  },
  transporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'pickedup', 'intransit', 'delivered', 'cancelled'],
    default: 'requested'
  },
  estimatedFee: Number,
  actualFee: Number
}, { timestamps: true });

module.exports = mongoose.model('DeliveryRequest', DeliveryRequestSchema);
