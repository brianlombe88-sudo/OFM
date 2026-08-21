const DeliveryRequest = require('../models/DeliveryRequest');
const Order = require('../models/Order');

const getAvailableJobs = async (req, res) => {
  try {
    const { status = 'requested', province, district, limit = 20, page = 1 } = req.query;
    const filter = { status };
    
    if (province) filter['pickup.location.province'] = province;
    if (district) filter['pickup.location.district'] = district;

    const skip = (Number(page) - 1) * Number(limit);
    const jobs = await DeliveryRequest.find(filter)
      .populate('order', 'buyer product quantity')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    res.json({ jobs, total: await DeliveryRequest.countDocuments(filter) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptJob = async (req, res) => {
  try {
    const { deliveryRequestId } = req.body;
    const job = await DeliveryRequest.findById(deliveryRequestId);
    
    if (!job) return res.status(404).json({ message: 'Delivery job not found' });
    if (job.status !== 'requested') return res.status(400).json({ message: 'Job already taken or completed' });

    job.transporter = req.user._id;
    job.status = 'accepted';
    await job.save();

    res.json({ job, message: 'Job accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyDeliveries = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const filter = { transporter: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const deliveries = await DeliveryRequest.find(filter)
      .populate('order', 'buyer seller product quantity totalAmount')
      .populate('transporter', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    res.json({ deliveries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryRequestId, status } = req.body;
    const job = await DeliveryRequest.findById(deliveryRequestId);
    
    if (!job) return res.status(404).json({ message: 'Delivery job not found' });
    if (!job.transporter.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    job.status = status;
    if (status === 'delivered') {
      job.actualFee = job.estimatedFee; // finalize fee
      // Update order status
      await Order.findByIdAndUpdate(job.order, { status: 'delivered' });
    }
    
    await job.save();
    res.json({ job, message: `Delivery status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeDelivery = async (req, res) => {
  try {
    const { deliveryRequestId } = req.body;
    const job = await DeliveryRequest.findById(deliveryRequestId);
    
    if (!job) return res.status(404).json({ message: 'Delivery job not found' });
    if (!job.transporter.equals(req.user._id)) return res.status(403).json({ message: 'Not authorized' });

    job.status = 'delivered';
    job.actualFee = job.estimatedFee;
    await job.save();

    // Update order status
    await Order.findByIdAndUpdate(job.order, { status: 'delivered' });

    res.json({ job, message: 'Delivery completed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAvailableJobs,
  acceptJob,
  getMyDeliveries,
  updateDeliveryStatus,
  completeDelivery
};
