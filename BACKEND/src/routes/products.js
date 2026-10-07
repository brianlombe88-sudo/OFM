const express = require('express');
const router = express.Router();
const {
  createProduct,
  getMyProducts,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getCategories
} = require('../controllers/productController');
const { auth, authorize } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/mine', auth, authorize(['farmer', 'marketeer', 'admin']), getMyProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);

router.post('/', auth, authorize(['farmer', 'marketeer']), createProduct);
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);

module.exports = router;
