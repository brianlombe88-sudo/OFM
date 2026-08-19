const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmmarket')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

// ==================== MODELS ====================

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
    town: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

// ==================== PRODUCT, ORDER, TRANSACTION MODELS ====================

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  price: { type: Number, required: true },
  unit: String,
  quantity: { type: Number, default: 0 },
  location: {
    province: String,
    district: String,
    town: String
  },
  images: [String],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isSoldOut: { type: Boolean, default: false }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending','paid','shipped','completed','cancelled'], default: 'pending' }
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);

const TransactionSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  amount: Number,
  platformFee: Number,
  sellerReceives: Number,
  status: { type: String, enum: ['pending','confirmed','failed'], default: 'pending' }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', TransactionSchema);

// ==================== MIDDLEWARE ====================

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ==================== ROUTES ====================

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🌾 FarmMarket API is running' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, location } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    
    const user = await User.create({ name, email, phone, password, role, location });
    
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    if (!user.isActive) return res.status(401).json({ message: 'Account deactivated' });
    
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '30d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
app.get('/api/auth/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// -------------------- PRODUCTS --------------------

// Create product
app.post('/api/products', auth, async (req, res) => {
  try {
    const { title, description, category, price, unit, quantity, location, images } = req.body;
    const product = await Product.create({
      title, description, category, price, unit, quantity, location, images, seller: req.user._id
    });
    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List/search products
app.get('/api/products', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, province, district, sellerType, page = 1, limit = 20 } = req.query;
    const filter = { isSoldOut: false };

    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (minPrice) filter.price = Object.assign(filter.price || {}, { $gte: Number(minPrice) });
    if (maxPrice) filter.price = Object.assign(filter.price || {}, { $lte: Number(maxPrice) });
    if (province) filter['location.province'] = province;
    if (district) filter['location.district'] = district;

    // sellerType filtering requires lookup; keep simple: find users by role then filter
    let sellerIds;
    if (sellerType) {
      const sellers = await User.find({ role: sellerType }).select('_id');
      sellerIds = sellers.map(s => s._id);
      filter.seller = { $in: sellerIds };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const query = Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('seller', 'name role location');
    const products = await query.exec();
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by id
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name role location');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product
app.put('/api/products/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!product.seller.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    Object.assign(product, req.body);
    await product.save();
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!product.seller.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    await product.remove();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -------------------- ORDERS & TRANSACTIONS --------------------

// Create order (simple flow: record order and transaction with commission)
app.post('/api/orders', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;
    const product = await Product.findById(productId).populate('seller');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.isSoldOut || product.quantity < qty) return res.status(400).json({ message: 'Insufficient quantity' });

    const totalAmount = product.price * qty;
    const platformFee = Math.round(totalAmount * 0.01); // 1% platform fee
    const sellerReceives = totalAmount; // business rule: seller gets full product price, platform charges extra from buyer

    // create order
    const order = await Order.create({
      buyer: req.user._id,
      seller: product.seller._id,
      product: product._id,
      quantity: qty,
      totalAmount,
      status: 'pending'
    });

    // record transaction
    const transaction = await Transaction.create({
      order: order._id,
      product: product._id,
      amount: totalAmount,
      platformFee,
      sellerReceives,
      status: 'pending'
    });

    // decrement quantity
    product.quantity -= qty;
    if (product.quantity <= 0) product.isSoldOut = true;
    await product.save();

    res.status(201).json({ order, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -------------------- PAYMENT WEBHOOK (stub) --------------------
// A simple webhook endpoint to receive payment confirmations from the payment gateway.
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId) return res.status(400).json({ message: 'Missing orderId' });

    const transaction = await Transaction.findOne({ order: orderId });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (status === 'confirmed') {
      transaction.status = 'confirmed';
      await transaction.save();

      const order = await Order.findById(orderId);
      if (order) {
        order.status = 'paid';
        await order.save();
      }
    } else if (status === 'failed') {
      transaction.status = 'failed';
      await transaction.save();
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -------------------- ADMIN --------------------
app.get('/api/admin/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/products', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const products = await Product.find().populate('seller', 'name email');
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
