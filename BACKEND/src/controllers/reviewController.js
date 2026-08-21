const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment, type = 'product' } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Only buyer can review after delivery
    if (!order.buyer.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only buyer can review' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only review delivered orders' });
    }

    // Check for duplicate review
    const existing = await Review.findOne({ order: orderId, reviewer: req.user._id, type });
    if (existing) return res.status(400).json({ message: 'Already reviewed' });

    const review = await Review.create({
      order: orderId,
      product: order.product,
      reviewer: req.user._id,
      reviewee: type === 'product' ? order.seller : order.seller, // could be seller or transporter
      rating: Math.min(5, Math.max(1, rating)),
      comment,
      type
    });

    // Update product rating
    if (type === 'product') {
      const allReviews = await Review.find({ product: order.product, type: 'product' });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Product.findByIdAndUpdate(order.product, {
        rating: avgRating,
        reviewCount: allReviews.length
      });
    }

    res.status(201).json({ review, message: 'Review created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId, limit = 20, page = 1 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const reviews = await Review.find({ product: productId, type: 'product' })
      .populate('reviewer', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Review.countDocuments({ product: productId, type: 'product' });
    res.json({ reviews, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const { userId, limit = 20, page = 1 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name profilePhoto')
      .populate('product', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Review.countDocuments({ reviewee: userId });
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;
    
    res.json({ reviews, total, avgRating, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews
};
