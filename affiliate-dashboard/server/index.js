const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Redis = require('redis');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const programRoutes = require('./routes/programs');
const affiliateRoutes = require('./routes/affiliates');
const commissionRoutes = require('./routes/commissions');
const materialRoutes = require('./routes/materials');
const analyticsRoutes = require('./routes/analytics');
const trackingRoutes = require('./routes/tracking');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');

// Import middleware
const { authenticateToken } = require('./middleware/auth');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
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

  // Join affiliate to program room
  socket.on('join-program', (programId) => {
    socket.join(`program-${programId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available globally
global.io = io;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/affiliates', affiliateRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tracking', trackingRoutes);
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

// Tracking pixel endpoint
app.get('/api/track/:affiliateId/:programId', async (req, res) => {
  try {
    const { affiliateId, programId } = req.params;
    const { ref, utm_source, utm_medium, utm_campaign } = req.query;
    
    // Create tracking pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    // Track click asynchronously
    const Click = require('./models/Click');
    const click = new Click({
      affiliate: affiliateId,
      program: programId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: ref || req.get('Referrer'),
      utmSource: utm_source,
      utmMedium: utm_medium,
      utmCampaign: utm_campaign,
      timestamp: new Date()
    });
    
    await click.save();
    
    // Emit real-time update
    io.to(`user-${affiliateId}`).emit('click-tracked', {
      programId,
      timestamp: new Date()
    });
    
    res.set('Content-Type', 'image/gif');
    res.send(pixel);
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).send('Error');
  }
});

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
});

module.exports = app; 