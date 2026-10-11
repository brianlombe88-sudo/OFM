const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const fallbackLocalMongoUri = 'mongodb://localhost:27017/farmmarket';

async function connectDatabase() {
  const configuredUri = process.env.MONGODB_URI;

  try {
    if (!configuredUri) throw new Error('MONGODB_URI is not configured');
    await mongoose.connect(configuredUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected');
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ MongoDB error:', error.message);
      process.exit(1);
    }

    console.warn('⚠️ Configured MongoDB is unavailable, trying local MongoDB:', error.message);

    try {
      await mongoose.connect(fallbackLocalMongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ Local MongoDB connected');
    } catch (localError) {
      console.warn('⚠️ Local MongoDB is unavailable, starting an in-memory database:', localError.message);

      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const memoryServer = await MongoMemoryServer.create();
        await mongoose.connect(memoryServer.getUri());
        console.log('✅ MongoDB connected using in-memory database');
      } catch (memoryError) {
        console.error('❌ MongoDB error:', memoryError.message);
        process.exit(1);
      }
    }
  }
}

// Middleware
app.use(cors());
// Product photos are compressed in the browser and stored with the product.
app.use(express.json({ limit: '3mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: '🌾 OFM API is running', version: '1.0.0' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/review', require('./routes/review'));
app.use('/api/admin', require('./routes/admin'));

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
