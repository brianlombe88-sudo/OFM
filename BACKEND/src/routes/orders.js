const express = require('express');
const router = express.Router();
const {
  checkout,
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  confirmPayment
} = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

router.post('/checkout', auth, checkout);
router.post('/', auth, createOrder);
router.get('/', auth, getOrders);
router.get('/:id', auth, getOrder);
router.put('/:id/status', auth, updateOrderStatus);
router.post('/payment/confirm', auth, confirmPayment);

module.exports = router;
