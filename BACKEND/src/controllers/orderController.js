const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { calculateOrderTotals } = require('../services/commissionService');
const { processPayment } = require('../services/paymentService');

const checkout = async (req, res) => {
  try {
    const { deliveryMethod = 'pickup', deliveryAddress, items } = req.body;
    // items can be from cart or direct purchase
    
    const orders = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.title}` });
      }

      const totals = calculateOrderTotals(product.price, item.quantity, deliveryMethod === 'delivery' ? 50 : 0);

      const order = await Order.create({
        buyer: req.user._id,
        seller: product.seller,
        product: product._id,
        quantity: item.quantity,
        productPrice: product.price,
        ...totals,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : null,
        paymentMethod: 'mobile_money', // default
        status: 'pending'
      });

      const transaction = await Transaction.create({
        order: order._id,
        product: product._id,
        buyer: req.user._id,
        seller: product.seller,
        amount: totals.subtotal,
        platformFee: totals.platformFee,
        sellerReceives: totals.sellerReceives,
        status: 'pending'
      });

      orders.push({ order, transaction });
    }

    // Clear cart
    await Cart.updateOne({ user: req.user._id }, { items: [] });

    res.status(201).json({ 
      orders: orders.map(o => ({ order: o.order, transaction: o.transaction })),
      message: 'Orders created. Proceed to payment.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { productId, quantity, deliveryMethod = 'pickup', deliveryAddress } = req.body;
    const product = await Product.findById(productId).populate('seller');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.quantity < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    const totals = calculateOrderTotals(product.price, quantity, deliveryMethod === 'delivery' ? 50 : 0);

    const order = await Order.create({
      buyer: req.user._id,
      seller: product.seller._id,
      product: productId,
      quantity,
      productPrice: product.price,
      ...totals,
      deliveryMethod,
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : null,
      status: 'pending'
    });

    const transaction = await Transaction.create({
      order: order._id,
      product: productId,
      buyer: req.user._id,
      seller: product.seller._id,
      amount: totals.subtotal,
      platformFee: totals.platformFee,
      sellerReceives: totals.sellerReceives,
      status: 'pending'
    });

    res.status(201).json({ order, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const { role = 'buyer' } = req.query;
    const filter = role === 'seller' ? { seller: req.user._id } : { buyer: req.user._id };
    
    const orders = await Order.find(filter)
      .populate('buyer', 'name phone')
      .populate('seller', 'name phone')
      .populate('product', 'title price images')
      .sort({ createdAt: -1 });
    
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name phone email')
      .populate('seller', 'name phone email rating')
      .populate('product', 'title price images unit');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.buyer._id.equals(req.user._id) && !order.seller._id.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const transaction = await Transaction.findOne({ order: order._id });
    res.json({ order, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.seller.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    await order.save();
    
    res.json({ order, message: `Order status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { orderId, paymentRef } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const transaction = await Transaction.findOne({ order: orderId });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    // Mock payment verification
    transaction.paymentRef = paymentRef;
    transaction.status = 'confirmed';
    await transaction.save();

    order.status = 'paid';
    // Reduce product quantity
    await Product.findByIdAndUpdate(
      order.product,
      { $inc: { quantity: -order.quantity } }
    );
    await order.save();

    res.json({ order, transaction, message: 'Payment confirmed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkout,
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  confirmPayment
};
