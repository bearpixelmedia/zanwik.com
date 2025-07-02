const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Redis = require('redis');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const storeRoutes = require('./routes/stores');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const analyticsRoutes = require('./routes/analytics');
const automationRoutes = require('./routes/automation');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');

// Import middleware
const { authenticateToken } = require('./middleware/auth');

// Import automation services
const automationService = require('./services/automationService');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Redis connection
const redis = Redis.createClient({
  url: process.env.REDIS_URL
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Connected to Redis'));

redis.connect().catch(console.error);

// Make Redis available globally
global.redis = redis;

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their room for real-time updates
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
  });

  // Join store room for store-specific updates
  socket.on('join-store', (storeId) => {
    socket.join(`store-${storeId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available globally
global.io = io;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: redis.isReady ? 'connected' : 'disconnected'
    }
  });
});

// Store preview endpoint
app.get('/api/store/:storeId/preview', async (req, res) => {
  try {
    const { storeId } = req.params;
    const Store = require('./models/Store');
    const Product = require('./models/Product');
    
    const store = await Store.findById(storeId).populate('theme');
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    const products = await Product.find({ store: storeId, isActive: true })
      .limit(20)
      .sort({ createdAt: -1 });
    
    res.json({
      store,
      products,
      preview: true
    });
  } catch (error) {
    console.error('Store preview error:', error);
    res.status(500).json({ message: 'Error loading store preview' });
  }
});

// Webhook endpoints
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Automation cron jobs
if (process.env.AUTOMATION_ENABLED === 'true') {
  // Price update job - runs every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await automationService.updatePrices();
      console.log('Price update job completed');
    } catch (error) {
      console.error('Price update job failed:', error);
    }
  });

  // Inventory sync job - runs every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      await automationService.syncInventory();
      console.log('Inventory sync job completed');
    } catch (error) {
      console.error('Inventory sync job failed:', error);
    }
  });

  // Order processing job - runs every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await automationService.processOrders();
      console.log('Order processing job completed');
    } catch (error) {
      console.error('Order processing job failed:', error);
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`Socket.io enabled for real-time updates`);
  console.log(`Automation enabled: ${process.env.AUTOMATION_ENABLED}`);
});

module.exports = app; 