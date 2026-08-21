const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');

const getDashboardStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const sellers = await User.countDocuments({ role: { $in: ['farmer', 'marketeer'] } });
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    const transactions = await Transaction.find({ status: 'confirmed' });
    
    const totalRevenue = transactions.reduce((sum, t) => sum + t.platformFee, 0);
    const avgOrderValue = orders > 0 ? (transactions.reduce((sum, t) => sum + t.amount, 0) / orders).toFixed(2) : 0;

    res.json({
      stats: {
        totalUsers: users,
        totalSellers: sellers,
        totalProducts: products,
        totalOrders: orders,
        totalRevenue,
        avgOrderValue,
        confirmedTransactions: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { role, status = 'all', limit = 20, page = 1 } = req.query;
    const filter = {};
    
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await User.countDocuments(filter);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { category, status = 'all', limit = 20, page = 1 } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (status === 'active') filter.isSoldOut = false;
    if (status === 'sold_out') filter.isSoldOut = true;

    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(filter)
      .populate('seller', 'name email phone role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Product.countDocuments(filter);
    res.json({ products, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const suspendUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // TODO: Send notification to user about suspension
    res.json({ user, message: `User ${userId} suspended`, reason });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    const { productId, reason } = req.body;
    const product = await Product.findByIdAndDelete(productId);

    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // TODO: Notify seller about removal
    res.json({ product, message: `Product ${productId} removed`, reason });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const transactions = await Transaction.find(filter)
      .populate('order', 'buyer seller totalAmount')
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Transaction.countDocuments(filter);
    const totalFees = transactions.reduce((sum, t) => sum + t.platformFee, 0);
    
    res.json({ 
      transactions, 
      total, 
      pages: Math.ceil(total / limit),
      totalFeesCollected: totalFees
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getProducts,
  suspendUser,
  removeProduct,
  getTransactions
};
