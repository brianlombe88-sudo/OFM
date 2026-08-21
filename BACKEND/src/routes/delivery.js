const express = require('express');
const router = express.Router();
const {
  getAvailableJobs,
  acceptJob,
  getMyDeliveries,
  updateDeliveryStatus,
  completeDelivery
} = require('../controllers/deliveryController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', getAvailableJobs);
router.get('/my', auth, authorize(['transporter']), getMyDeliveries);
router.post('/accept', auth, authorize(['transporter']), acceptJob);
router.put('/status', auth, authorize(['transporter', 'admin']), updateDeliveryStatus);
router.post('/complete', auth, authorize(['transporter']), completeDelivery);

module.exports = router;
