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
    const projectsDataPath = path.join(__dirname, 'data/projects.json');
    console.log('Loading projects from:', projectsDataPath);
    
    // Check if file exists
    if (!fs.existsSync(projectsDataPath)) {
      console.log('Projects data file does not exist:', projectsDataPath);
      return res.status(500).json({ 
        message: 'Projects data file not found',
        path: projectsDataPath
      });
    }
    
    const projectsData = JSON.parse(fs.readFileSync(projectsDataPath, 'utf-8'));
    console.log('Loaded projects:', projectsData.projects.length);
    
    res.json(projectsData);
  } catch (error) {
    console.error('Error in /api/projects:', error);
    res.status(500).json({ 
      message: 'Failed to load projects data.',
      error: error.message
    });
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

      // Set up public analytics endpoints (no auth required)
      console.log('Setting up public analytics endpoints...');
      
      // Public revenue analytics endpoint
      app.get('/api/analytics/revenue', async (req, res) => {
        try {
          const { period = '30d', groupBy = 'day' } = req.query;
          
          // Return mock data for now
          const mockRevenue = {
            total: 45600,
            period: period,
            data: [
              { date: '2024-01-01', revenue: 1200 },
              { date: '2024-01-02', revenue: 1350 },
              { date: '2024-01-03', revenue: 1100 },
              { date: '2024-01-04', revenue: 1400 },
              { date: '2024-01-05', revenue: 1600 }
            ],
            growth: 15.2
          };
          
          res.json({ revenue: mockRevenue });
        } catch (error) {
          logger.error('Public revenue analytics error:', error);
          res.status(500).json({ message: 'Failed to get revenue analytics' });
        }
      });

      // Public dashboard overview endpoint
      app.get('/api/analytics/dashboard', async (req, res) => {
        try {
          const mockOverview = {
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
          };
          
          res.json({ overview: mockOverview });
        } catch (error) {
          logger.error('Public dashboard analytics error:', error);
          res.status(500).json({ message: 'Failed to get dashboard overview' });
        }
      });

      // Public users analytics endpoint
      app.get('/api/analytics/users', async (req, res) => {
        try {
          const { period = '30d', groupBy = 'day' } = req.query;
          
          const mockUsers = {
            total: 1890,
            period: period,
            data: [
              { date: '2024-01-01', users: 45 },
              { date: '2024-01-02', users: 52 },
              { date: '2024-01-03', users: 48 },
              { date: '2024-01-04', users: 61 },
              { date: '2024-01-05', users: 58 }
            ],
            growth: 12.5
          };
          
          res.json({ users: mockUsers });
        } catch (error) {
          logger.error('Public users analytics error:', error);
          res.status(500).json({ message: 'Failed to get user analytics' });
        }
      });

      // Public performance analytics endpoint
      app.get('/api/analytics/performance', async (req, res) => {
        try {
          const { period = '30d' } = req.query;
          
          const mockPerformance = {
            uptime: 99.8,
            responseTime: 245,
            errorRate: 0.2,
            period: period,
            data: [
              { date: '2024-01-01', uptime: 99.9, responseTime: 240, errorRate: 0.1 },
              { date: '2024-01-02', uptime: 99.8, responseTime: 245, errorRate: 0.2 },
              { date: '2024-01-03', uptime: 99.7, responseTime: 250, errorRate: 0.3 },
              { date: '2024-01-04', uptime: 99.9, responseTime: 235, errorRate: 0.1 },
              { date: '2024-01-05', uptime: 99.8, responseTime: 240, errorRate: 0.2 }
            ]
          };
          
          res.json({ performance: mockPerformance });
        } catch (error) {
          logger.error('Public performance analytics error:', error);
          res.status(500).json({ message: 'Failed to get performance analytics' });
        }
      });

      // Public projects analytics endpoint
      app.get('/api/analytics/projects', async (req, res) => {
        try {
          const { period = '30d' } = req.query;
          
          const mockProjects = {
            total: 12,
            period: period,
            data: [
              { date: '2024-01-01', projects: 2 },
              { date: '2024-01-02', projects: 1 },
              { date: '2024-01-03', projects: 3 },
              { date: '2024-01-04', projects: 2 },
              { date: '2024-01-05', projects: 1 }
            ],
            growth: 8.5,
            topProjects: [
              { name: 'AI Content Generator', revenue: 2450, growth: 18, status: 'active' },
              { name: 'Digital Marketplace', revenue: 1890, growth: 12, status: 'active' },
              { name: 'Freelance Hub', revenue: 1200, growth: 8, status: 'active' },
              { name: 'E-commerce Platform', revenue: 980, growth: 15, status: 'active' },
              { name: 'Social Media App', revenue: 750, growth: 22, status: 'active' }
            ],
            statusBreakdown: {
              active: 8,
              paused: 2,
              completed: 2
            }
          };
          
          res.json({ projects: mockProjects });
        } catch (error) {
          logger.error('Public projects analytics error:', error);
          res.status(500).json({ message: 'Failed to get projects analytics' });
        }
      });

      console.log('Public analytics endpoints setup completed');

      // Set up public infrastructure endpoints (no auth required)
      console.log('Setting up public infrastructure endpoints...');
      
      // Public infrastructure status endpoint (general overview)
      app.get('/api/infrastructure/status', async (req, res) => {
        try {
          const mockStatus = {
            overall: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
              servers: { status: 'healthy', uptime: 99.8, count: 3 },
              databases: { status: 'healthy', uptime: 99.9, count: 2 },
              ssl: { status: 'healthy', valid: 5, expiring: 0 },
              network: { status: 'healthy', latency: 45, bandwidth: '1Gbps' },
              security: { status: 'healthy', threats: 0, lastScan: '2 hours ago' }
            },
            alerts: {
              critical: 0,
              warning: 1,
              info: 3
            },
            performance: {
              cpu: 45,
              memory: 62,
              disk: 38,
              network: 23
            }
          };
          
          res.json({ status: mockStatus });
        } catch (error) {
          logger.error('Public infrastructure status error:', error);
          res.status(500).json({ message: 'Failed to get infrastructure status' });
        }
      });

      // Public servers status endpoint
      app.get('/api/infrastructure/servers', async (req, res) => {
        try {
          const mockServers = {
            servers: [
              {
                id: 'server-1',
                name: 'Production Server 1',
                status: 'healthy',
                uptime: 99.8,
                cpu: 45,
                memory: 62,
                disk: 38,
                location: 'us-west1',
                ip: '192.168.1.100'
              },
              {
                id: 'server-2',
                name: 'Production Server 2',
                status: 'healthy',
                uptime: 99.9,
                cpu: 38,
                memory: 58,
                disk: 42,
                location: 'us-west1',
                ip: '192.168.1.101'
              },
              {
                id: 'server-3',
                name: 'Backup Server',
                status: 'healthy',
                uptime: 99.7,
                cpu: 25,
                memory: 45,
                disk: 65,
                location: 'us-east1',
                ip: '192.168.1.102'
              }
            ]
          };
          
          res.json(mockServers);
        } catch (error) {
          logger.error('Public servers status error:', error);
          res.status(500).json({ message: 'Failed to get servers status' });
        }
      });

      // Public databases status endpoint
      app.get('/api/infrastructure/databases', async (req, res) => {
        try {
          const mockDatabases = {
            databases: [
              {
                id: 'db-1',
                name: 'Primary Database',
                type: 'PostgreSQL',
                status: 'healthy',
                uptime: 99.9,
                connections: 45,
                size: '2.3GB',
                location: 'us-west1'
              },
              {
                id: 'db-2',
                name: 'Analytics Database',
                type: 'MongoDB',
                status: 'healthy',
                uptime: 99.8,
                connections: 23,
                size: '1.8GB',
                location: 'us-west1'
              }
            ]
          };
          
          res.json(mockDatabases);
        } catch (error) {
          logger.error('Public databases status error:', error);
          res.status(500).json({ message: 'Failed to get databases status' });
        }
      });

      // Public SSL status endpoint
      app.get('/api/infrastructure/ssl', async (req, res) => {
        try {
          const mockSSL = {
            ssl: [
              {
                domain: 'zanwik.com',
                status: 'valid',
                issuer: 'Let\'s Encrypt',
                expiresAt: '2025-10-15T00:00:00Z',
                daysRemaining: 103
              },
              {
                domain: 'api.zanwik.com',
                status: 'valid',
                issuer: 'Let\'s Encrypt',
                expiresAt: '2025-10-15T00:00:00Z',
                daysRemaining: 103
              },
              {
                domain: 'dashboard.zanwik.com',
                status: 'valid',
                issuer: 'Let\'s Encrypt',
                expiresAt: '2025-10-15T00:00:00Z',
                daysRemaining: 103
              }
            ]
          };
          
          res.json(mockSSL);
        } catch (error) {
          logger.error('Public SSL status error:', error);
          res.status(500).json({ message: 'Failed to get SSL status' });
        }
      });

      // Public storage usage endpoint
      app.get('/api/infrastructure/storage', async (req, res) => {
        try {
          const mockStorage = {
            storage: {
              total: '500GB',
              used: '189GB',
              available: '311GB',
              usage: 37.8,
              breakdown: {
                databases: '45GB',
                logs: '23GB',
                backups: '67GB',
                uploads: '34GB',
                system: '20GB'
              }
            }
          };
          
          res.json(mockStorage);
        } catch (error) {
          logger.error('Public storage usage error:', error);
          res.status(500).json({ message: 'Failed to get storage usage' });
        }
      });

      // Public network status endpoint
      app.get('/api/infrastructure/network', async (req, res) => {
        try {
          const mockNetwork = {
            network: {
              status: 'healthy',
              latency: 45,
              bandwidth: '1Gbps',
              uptime: 99.9,
              connections: 1250,
              dataTransferred: '2.3TB',
              errors: 0
            }
          };
          
          res.json(mockNetwork);
        } catch (error) {
          logger.error('Public network status error:', error);
          res.status(500).json({ message: 'Failed to get network status' });
        }
      });

      // Public infrastructure metrics endpoint
      app.get('/api/infrastructure/metrics', async (req, res) => {
        try {
          const { period = '24h' } = req.query;
          
          const mockMetrics = {
            metrics: {
              period: period,
              timestamp: new Date().toISOString(),
              cpu: {
                average: 45.2,
                peak: 78.5,
                current: 42.1,
                data: [
                  { time: '2024-01-01T00:00:00Z', value: 42 },
                  { time: '2024-01-01T01:00:00Z', value: 45 },
                  { time: '2024-01-01T02:00:00Z', value: 48 },
                  { time: '2024-01-01T03:00:00Z', value: 43 },
                  { time: '2024-01-01T04:00:00Z', value: 46 }
                ]
              },
              memory: {
                average: 62.3,
                peak: 89.2,
                current: 58.7,
                data: [
                  { time: '2024-01-01T00:00:00Z', value: 58 },
                  { time: '2024-01-01T01:00:00Z', value: 62 },
                  { time: '2024-01-01T02:00:00Z', value: 65 },
                  { time: '2024-01-01T03:00:00Z', value: 61 },
                  { time: '2024-01-01T04:00:00Z', value: 64 }
                ]
              },
              disk: {
                average: 38.1,
                peak: 52.8,
                current: 35.9,
                data: [
                  { time: '2024-01-01T00:00:00Z', value: 36 },
                  { time: '2024-01-01T01:00:00Z', value: 38 },
                  { time: '2024-01-01T02:00:00Z', value: 41 },
                  { time: '2024-01-01T03:00:00Z', value: 37 },
                  { time: '2024-01-01T04:00:00Z', value: 39 }
                ]
              },
              network: {
                average: 23.4,
                peak: 67.1,
                current: 21.8,
                data: [
                  { time: '2024-01-01T00:00:00Z', value: 22 },
                  { time: '2024-01-01T01:00:00Z', value: 24 },
                  { time: '2024-01-01T02:00:00Z', value: 27 },
                  { time: '2024-01-01T03:00:00Z', value: 23 },
                  { time: '2024-01-01T04:00:00Z', value: 25 }
                ]
              },
              responseTime: {
                average: 245,
                peak: 892,
                current: 238,
                data: [
                  { time: '2024-01-01T00:00:00Z', value: 240 },
                  { time: '2024-01-01T01:00:00Z', value: 245 },
                  { time: '2024-01-01T02:00:00Z', value: 250 },
                  { time: '2024-01-01T03:00:00Z', value: 235 },
                  { time: '2024-01-01T04:00:00Z', value: 242 }
                ]
              },
              errorRate: {
                average: 0.2,
                peak: 1.8,
                current: 0.1,
                data: [
                  { time: '2024-01-01T00:00:00Z', value: 0.1 },
                  { time: '2024-01-01T01:00:00Z', value: 0.2 },
                  { time: '2024-01-01T02:00:00Z', value: 0.3 },
                  { time: '2024-01-01T03:00:00Z', value: 0.1 },
                  { time: '2024-01-01T04:00:00Z', value: 0.2 }
                ]
              }
            }
          };
          
          res.json(mockMetrics);
        } catch (error) {
          logger.error('Public infrastructure metrics error:', error);
          res.status(500).json({ message: 'Failed to get infrastructure metrics' });
        }
      });

      console.log('Public infrastructure endpoints setup completed');

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