const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const Redis = require('ioredis');
const winston = require('winston');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const tradingRoutes = require('./routes/trading');
const portfolioRoutes = require('./routes/portfolio');
const analyticsRoutes = require('./routes/analytics');
const strategiesRoutes = require('./routes/strategies');
const userRoutes = require('./routes/users');

// Import middleware
const auth = require('./middleware/auth');

// Import trading engine
const TradingEngine = require('./services/TradingEngine');
const MarketDataService = require('./services/MarketDataService');
const NotificationService = require('./services/NotificationService');

// Import logger
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3001",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto_bot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Connected to MongoDB');
})
.catch(err => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

// Initialize services
let tradingEngine, marketDataService, notificationService;

const initializeServices = async () => {
  try {
    // Initialize market data service
    marketDataService = new MarketDataService(io, redis);
    await marketDataService.initialize();
    
    // Initialize notification service
    notificationService = new NotificationService();
    
    // Initialize trading engine
    tradingEngine = new TradingEngine(marketDataService, notificationService, redis);
    await tradingEngine.initialize();
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info('New client connected:', socket.id);
  
  // Join user to their personal room
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined their room`);
  });
  
  // Join trading room
  socket.on('join-trading', (symbol) => {
    socket.join(`trading-${symbol}`);
    logger.info(`Client joined trading room for ${symbol}`);
  });
  
  // Handle trading commands
  socket.on('start-trading', async (data) => {
    try {
      const result = await tradingEngine.startTrading(data);
      socket.emit('trading-started', result);
    } catch (error) {
      socket.emit('trading-error', { error: error.message });
    }
  });
  
  socket.on('stop-trading', async (data) => {
    try {
      const result = await tradingEngine.stopTrading(data);
      socket.emit('trading-stopped', result);
    } catch (error) {
      socket.emit('trading-error', { error: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Make services available to routes
app.set('io', io);
app.set('redis', redis);
app.set('tradingEngine', tradingEngine);
app.set('marketDataService', marketDataService);
app.set('notificationService', notificationService);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trading', auth, tradingRoutes);
app.use('/api/portfolio', auth, portfolioRoutes);
app.use('/api/analytics', auth, analyticsRoutes);
app.use('/api/strategies', auth, strategiesRoutes);
app.use('/api/users', auth, userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      mongodb: mongoose.connection.readyState === 1,
      redis: redis.status === 'ready',
      tradingEngine: tradingEngine ? tradingEngine.isRunning() : false
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Express error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

// Start server after services are initialized
const startServer = async () => {
  await initializeServices();
  
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // Stop trading engine
  if (tradingEngine) {
    await tradingEngine.shutdown();
  }
  
  // Stop market data service
  if (marketDataService) {
    await marketDataService.shutdown();
  }
  
  // Close database connections
  await mongoose.connection.close();
  await redis.quit();
  
  // Close server
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app; 