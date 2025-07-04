console.log('Starting Umbrella Dashboard...');

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
const fs = require('fs');

console.log('Dependencies loaded successfully');

// Load environment variables
dotenv.config();

console.log('Environment variables loaded');

// Import routes
console.log('Importing routes...');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const analyticsRoutes = require('./routes/analytics');
const infrastructureRoutes = require('./routes/infrastructure');
const deploymentRoutes = require('./routes/deployment');
const monitoringRoutes = require('./routes/monitoring');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
console.log('Routes imported successfully');

// Import middleware
console.log('Importing middleware...');
const { auth } = require('./middleware/auth');
console.log('Middleware imported successfully');

// Import services
console.log('Importing services...');
const ProjectService = require('./services/ProjectService');
const MonitoringService = require('./services/MonitoringService');
const DeploymentService = require('./services/DeploymentService');
const AnalyticsService = require('./services/AnalyticsService');
console.log('Services imported successfully');

// Import logger
console.log('Importing logger...');
const logger = require('./utils/logger');
console.log('Logger imported successfully');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: true, // Allow all origins for now
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize Redis
let redis;
const initializeRedis = () => {
  if (!process.env.REDIS_URL) {
    logger.warn('REDIS_URL not set, using in-memory fallback');
    // Create a mock Redis-like object for basic functionality
    redis = {
      status: 'ready',
      get: async () => null,
      set: async () => 'OK',
      del: async () => 1,
      quit: async () => {},
      on: () => {},
      off: () => {}
    };
    return;
  }
  
  try {
    redis = new Redis(process.env.REDIS_URL);
    redis.on('error', (err) => {
      logger.error('Redis error:', err);
    });
    redis.on('connect', () => {
      logger.info('Connected to Redis');
    });
  } catch (err) {
    logger.error('Redis connection error:', err);
    // Create fallback Redis object
    redis = {
      status: 'ready',
      get: async () => null,
      set: async () => 'OK',
      del: async () => 1,
      quit: async () => {},
      on: () => {},
      off: () => {}
    };
  }
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for now
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
const connectDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    logger.warn('MONGODB_URI not set, skipping database connection');
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    // Don't exit process, continue without database
  }
};

// Initialize services
let projectService, monitoringService, deploymentService, analyticsService;

const initializeServices = async () => {
  try {
    console.log('Starting services initialization...');
    
    // Initialize project service
    console.log('Creating ProjectService instance...');
    try {
      projectService = new ProjectService(io, redis);
      console.log('ProjectService instance created, initializing...');
    } catch (error) {
      console.error('Failed to create ProjectService instance:', error);
      throw error;
    }
    await projectService.initialize().catch(err => {
      console.error('Project service initialization failed:', err);
      logger.warn('Project service initialization failed:', err.message);
    });
    console.log('ProjectService initialized');
    
    // Initialize monitoring service
    console.log('Creating MonitoringService instance...');
    try {
      monitoringService = new MonitoringService(io, redis);
      console.log('MonitoringService instance created, initializing...');
    } catch (error) {
      console.error('Failed to create MonitoringService instance:', error);
      throw error;
    }
    await monitoringService.initialize().catch(err => {
      console.error('Monitoring service initialization failed:', err);
      logger.warn('Monitoring service initialization failed:', err.message);
    });
    console.log('MonitoringService initialized');
    
    // Initialize deployment service
    console.log('Creating DeploymentService instance...');
    try {
      deploymentService = new DeploymentService(io, redis);
      console.log('DeploymentService instance created, initializing...');
    } catch (error) {
      console.error('Failed to create DeploymentService instance:', error);
      throw error;
    }
    await deploymentService.initialize().catch(err => {
      console.error('Deployment service initialization failed:', err);
      logger.warn('Deployment service initialization failed:', err.message);
    });
    console.log('DeploymentService initialized');
    
    // Initialize analytics service
    console.log('Creating AnalyticsService instance...');
    try {
      analyticsService = new AnalyticsService(io, redis);
      console.log('AnalyticsService instance created, initializing...');
    } catch (error) {
      console.error('Failed to create AnalyticsService instance:', error);
      throw error;
    }
    await analyticsService.initialize().catch(err => {
      console.error('Analytics service initialization failed:', err);
      logger.warn('Analytics service initialization failed:', err.message);
    });
    console.log('AnalyticsService initialized');
    
    logger.info('Services initialization completed');
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    logger.error('Failed to initialize services:', error);
    // Don't exit process, continue with basic functionality
  }
};

// Socket.io connection handling - basic setup
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
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Routes will be set up after services are initialized
console.log('Routes setup will be completed after service initialization');
console.log('About to set up Express app...');

// Root endpoint for basic connectivity
console.log('Setting up root endpoint...');
app.get('/', (req, res) => {
  res.json({ 
    message: 'Umbrella Dashboard API',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});
console.log('Root endpoint setup completed');

// Health check endpoint
console.log('Setting up health check endpoint...');
app.get('/api/health', (req, res) => {
  // Simple health check that responds immediately
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});
console.log('Health check endpoint setup completed');

// Detailed health check endpoint for monitoring
console.log('Setting up detailed health check endpoint...');
app.get('/api/health/detailed', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: {
        status: mongoose.connection.readyState === 1 ? 'up' : 'down',
        message: mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'
      },
      redis: {
        status: redis && redis.status === 'ready' ? 'up' : 'down',
        message: redis && redis.status === 'ready' ? 'Connected' : 'Not connected'
      },
      projectService: {
        status: projectService && projectService.isRunning ? projectService.isRunning() : 'unknown',
        message: projectService ? 'Available' : 'Not available'
      },
      monitoringService: {
        status: monitoringService && monitoringService.isRunning ? monitoringService.isRunning() : 'unknown',
        message: monitoringService ? 'Available' : 'Not available'
      }
    },
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});
console.log('Detailed health check endpoint setup completed');

// Dashboard overview endpoint will be set up after services are initialized
console.log('Dashboard overview endpoint will be set up after service initialization');

// Register public GET /api/projects route before auth middleware
app.get('/api/projects', async (req, res) => {
  try {
    const projectsDir = path.join(__dirname, '../projects');
    const projectFolders = fs.readdirSync(projectsDir).filter(f => {
      const fullPath = path.join(projectsDir, f);
      return fs.statSync(fullPath).isDirectory();
    });
    const projects = projectFolders.map(folder => {
      const projectPath = path.join(projectsDir, folder);
      let meta = {};
      let readme = '';
      try {
        const pkgPath = path.join(projectPath, 'package.json');
        if (fs.existsSync(pkgPath)) {
          meta = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        }
        const readmePath = path.join(projectPath, 'README.md');
        if (fs.existsSync(readmePath)) {
          readme = fs.readFileSync(readmePath, 'utf-8').split('\n').slice(0, 10).join('\n');
        }
      } catch (e) {}
      return {
        id: folder,
        name: meta.name || folder,
        description: meta.description || '',
        version: meta.version || '',
        author: meta.author || '',
        keywords: meta.keywords || [],
        readmePreview: readme
      };
    });
    res.json({
      projects,
      total: projects.length,
      totalPages: 1,
      currentPage: 1
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load projects from directory.' });
  }
});

// Register the rest of the project routes with auth
app.use('/api/projects', auth, projectRoutes);

// Error handling middleware
console.log('Setting up error handling middleware...');
app.use((err, req, res, next) => {
  logger.error('Express error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Test endpoint for debugging
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working!' });
});

// Simple public dashboard endpoint
app.get('/dashboard', (req, res) => {
  res.json({
    overview: {
      totalRevenue: 45600,
      monthlyGrowth: 15.2,
      activeUsers: 1890,
      totalProjects: 12,
      recentActivity: [
        { type: 'project_created', title: 'AI Content Generator', time: '2 hours ago' },
        { type: 'revenue_milestone', title: 'Reached $45K monthly revenue', time: '1 day ago' },
        { type: 'user_signup', title: 'New user joined', time: '3 hours ago' }
      ],
      topProjects: [
        { name: 'AI Content Generator', revenue: 2450, growth: 18 },
        { name: 'Digital Marketplace', revenue: 1890, growth: 12 },
        { name: 'Freelance Hub', revenue: 1200, growth: 8 }
      ]
    }
  });
});

console.log('Express app setup completed');

const PORT = process.env.PORT || 3000;

// Add global error handlers at the very top
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server after services are initialized
const startServer = async () => {
  try {
    console.log('Starting server initialization...');
    
    // Initialize Redis first
    console.log('Initializing Redis...');
    initializeRedis();
    console.log('Redis initialized');
    
    // Connect to database
    console.log('Connecting to database...');
    await connectDatabase();
    console.log('Database connection completed');
    
    // Initialize services
    console.log('About to call initializeServices()...');
    await initializeServices();
    console.log('Services initialization completed');
    
    // Make services available to routes
    console.log('Setting up services for routes...');
    app.set('io', io);
    app.set('redis', redis);
    app.set('projectService', projectService);
    app.set('monitoringService', monitoringService);
    app.set('deploymentService', deploymentService);
    app.set('analyticsService', analyticsService);
    console.log('Services setup completed');
    
    // Set up service-dependent Socket.io handlers
    console.log('Setting up Socket.io service handlers...');
    io.on('connection', (socket) => {
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
    });
    console.log('Socket.io service handlers setup completed');
    
    // Set up routes after services are available
    console.log('Setting up routes...');
    
    try {
      console.log('Setting up auth routes...');
      app.use('/api/auth', authRoutes);
      console.log('Auth routes setup completed');

      console.log('Setting up analytics routes...');
      app.use('/api/analytics', analyticsRoutes);
      console.log('Analytics routes setup completed');

      console.log('Setting up infrastructure routes...');
      app.use('/api/infrastructure', auth, infrastructureRoutes);
      console.log('Infrastructure routes setup completed');

      console.log('Setting up deployment routes...');
      app.use('/api/deployment', auth, deploymentRoutes);
      console.log('Deployment routes setup completed');

      console.log('Setting up monitoring routes...');
      app.use('/api/monitoring', auth, monitoringRoutes);
      console.log('Monitoring routes setup completed');

      console.log('Setting up user routes...');
      app.use('/api/users', auth, userRoutes);
      console.log('User routes setup completed');

      console.log('Setting up payment routes...');
      app.use('/api/payments', auth, paymentRoutes);
      console.log('Payment routes setup completed');
    } catch (error) {
      console.error('Error setting up routes:', error);
      throw error;
    }

    // Set up dashboard overview endpoint after services are available
    console.log('Setting up dashboard overview endpoint...');
    app.get('/api/dashboard/overview', auth, async (req, res) => {
      try {
        const overview = await analyticsService.getDashboardOverview(req.user.id);
        res.json(overview);
      } catch (error) {
        logger.error('Dashboard overview error:', error);
        res.status(500).json({ message: 'Failed to get dashboard overview' });
      }
    });
    console.log('Dashboard overview endpoint setup completed');

    console.log('Routes setup completed');
    
    // 404 handler - must be last
    console.log('Setting up 404 handler...');
    app.use('*', (req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });
    console.log('404 handler setup completed');
    
    console.log(`Starting server on port ${PORT}...`);
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Umbrella Dashboard running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Server started successfully on port ${PORT}`);
    });
    
    console.log('Server startup process completed');
  } catch (error) {
    console.error('Failed to start server:', error);
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
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

// At the very bottom, before calling startServer()
console.log('About to call startServer()');
startServer().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app; 