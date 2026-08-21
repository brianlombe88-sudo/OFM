const express = require('express');
const router = express.Router();
const {
  createReview,
  getProductReviews,
  getUserReviews
} = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createReview);
router.get('/product/:productId', getProductReviews);
router.get('/user/:userId', getUserReviews);

module.exports = router;
