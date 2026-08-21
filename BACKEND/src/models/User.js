const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['buyer', 'farmer', 'marketeer', 'transporter', 'admin'],
    default: 'buyer' 
  },
  location: {
    province: String,
    district: String,
    town: String,
    address: String
  },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 5, min: 0, max: 5 },
  completedTransactions: { type: Number, default: 0 },
  profilePhoto: String,
  bio: String
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
