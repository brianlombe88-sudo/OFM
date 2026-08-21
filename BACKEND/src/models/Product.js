const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  price: { type: Number, required: true },
  unit: { type: String, default: 'kg' }, // kg, bag, crate, piece, etc
  quantity: { type: Number, default: 0 },
  minQuantity: { type: Number, default: 1 },
  location: {
    province: String,
    district: String,
    town: String
  },
  images: [String],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isSoldOut: { type: Boolean, default: false },
  rating: { type: Number, default: 5, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
