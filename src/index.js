const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const Redis = require('ioredis');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const analyticsRoutes = require('./routes/analytics');
const infrastructureRoutes = require('./routes/infrastructure');
const deploymentRoutes = require('./routes/deployment');
const monitoringRoutes = require('./routes/monitoring');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');

// Import middleware
const auth = require('./middleware/auth');

// Import services
const ProjectService = require('./services/ProjectService');
const MonitoringService = require('./services/MonitoringService');
const DeploymentService = require('./services/DeploymentService');
const AnalyticsService = require('./services/AnalyticsService');

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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/umbrella_dashboard', {
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
let projectService, monitoringService, deploymentService, analyticsService;

const initializeServices = async () => {
  try {
    // Initialize project service
    projectService = new ProjectService(io, redis);
    await projectService.initialize();
    
    // Initialize monitoring service
    monitoringService = new MonitoringService(io, redis);
    await monitoringService.initialize();
    
    // Initialize deployment service
    deploymentService = new DeploymentService(io, redis);
    await deploymentService.initialize();
    
    // Initialize analytics service
    analyticsService = new AnalyticsService(io, redis);
    await analyticsService.initialize();
    
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
  
  // Join project room
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    logger.info(`Client joined project room for ${projectId}`);
  });
  
  // Handle project commands
  socket.on('deploy-project', async (data) => {
    try {
      const result = await deploymentService.deployProject(data);
      socket.emit('deployment-started', result);
    } catch (error) {
      socket.emit('deployment-error', { error: error.message });
    }
  });
  
  socket.on('restart-project', async (data) => {
    try {
      const result = await deploymentService.restartProject(data);
      socket.emit('restart-completed', result);
    } catch (error) {
      socket.emit('restart-error', { error: error.message });
    }
  });
  
  socket.on('get-project-logs', async (data) => {
    try {
      const logs = await projectService.getProjectLogs(data.projectId);
      socket.emit('project-logs', logs);
    } catch (error) {
      socket.emit('logs-error', { error: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Make services available to routes
app.set('io', io);
app.set('redis', redis);
app.set('projectService', projectService);
app.set('monitoringService', monitoringService);
app.set('deploymentService', deploymentService);
app.set('analyticsService', analyticsService);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', auth, projectRoutes);
app.use('/api/analytics', auth, analyticsRoutes);
app.use('/api/infrastructure', auth, infrastructureRoutes);
app.use('/api/deployment', auth, deploymentRoutes);
app.use('/api/monitoring', auth, monitoringRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/payments', auth, paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      mongodb: mongoose.connection.readyState === 1,
      redis: redis.status === 'ready',
      projectService: projectService ? projectService.isRunning() : false,
      monitoringService: monitoringService ? monitoringService.isRunning() : false
    }
  });
});

// Dashboard overview endpoint
app.get('/api/dashboard/overview', auth, async (req, res) => {
  try {
    const overview = await analyticsService.getDashboardOverview(req.user.id);
    res.json(overview);
  } catch (error) {
    logger.error('Dashboard overview error:', error);
    res.status(500).json({ message: 'Failed to get dashboard overview' });
  }
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
    logger.info(`Umbrella Dashboard running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // Stop services
  if (projectService) {
    await projectService.shutdown();
  }
  
  if (monitoringService) {
    await monitoringService.shutdown();
  }
  
  if (deploymentService) {
    await deploymentService.shutdown();
  }
  
  if (analyticsService) {
    await analyticsService.shutdown();
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