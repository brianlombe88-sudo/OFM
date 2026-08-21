const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  productPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'processing', 'ready', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  paymentMethod: String,
  deliveryMethod: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
  deliveryAddress: String,
  deliveryRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryRequest' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
