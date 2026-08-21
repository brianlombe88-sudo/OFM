const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  getProducts,
  suspendUser,
  removeProduct,
  getTransactions
} = require('../controllers/adminController');
const { auth, admin } = require('../middleware/auth');

router.get('/dashboard', auth, admin, getDashboardStats);
router.get('/users', auth, admin, getUsers);
router.get('/products', auth, admin, getProducts);
router.get('/transactions', auth, admin, getTransactions);
router.post('/suspend-user', auth, admin, suspendUser);
router.post('/remove-product', auth, admin, removeProduct);

module.exports = router;
