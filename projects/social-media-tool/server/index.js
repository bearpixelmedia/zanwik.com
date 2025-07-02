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
const accountRoutes = require('./routes/accounts');
const postRoutes = require('./routes/posts');
const analyticsRoutes = require('./routes/analytics');
const automationRoutes = require('./routes/automation');
const teamRoutes = require('./routes/teams');
const mediaRoutes = require('./routes/media');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');

// Import middleware
const { authenticateToken } = require('./middleware/auth');

// Import automation services
const automationService = require('./services/automationService');
const socialMediaService = require('./services/socialMediaService');

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

  // Join team room for team updates
  socket.on('join-team', (teamId) => {
    socket.join(`team-${teamId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available globally
global.io = io;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/media', mediaRoutes);
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

// Social media OAuth endpoints
app.get('/api/auth/facebook', async (req, res) => {
  try {
    const { code } = req.query;
    const result = await socialMediaService.connectFacebook(code);
    res.json(result);
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    res.status(500).json({ message: 'Failed to connect Facebook account' });
  }
});

app.get('/api/auth/twitter', async (req, res) => {
  try {
    const { oauth_token, oauth_verifier } = req.query;
    const result = await socialMediaService.connectTwitter(oauth_token, oauth_verifier);
    res.json(result);
  } catch (error) {
    console.error('Twitter OAuth error:', error);
    res.status(500).json({ message: 'Failed to connect Twitter account' });
  }
});

app.get('/api/auth/instagram', async (req, res) => {
  try {
    const { code } = req.query;
    const result = await socialMediaService.connectInstagram(code);
    res.json(result);
  } catch (error) {
    console.error('Instagram OAuth error:', error);
    res.status(500).json({ message: 'Failed to connect Instagram account' });
  }
});

app.get('/api/auth/linkedin', async (req, res) => {
  try {
    const { code } = req.query;
    const result = await socialMediaService.connectLinkedIn(code);
    res.json(result);
  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    res.status(500).json({ message: 'Failed to connect LinkedIn account' });
  }
});

// Webhook endpoints for social media platforms
app.post('/api/webhooks/facebook', async (req, res) => {
  try {
    const { object, entry } = req.body;
    
    if (object === 'page') {
      for (const pageEntry of entry) {
        for (const messagingEvent of pageEntry.messaging) {
          await automationService.handleFacebookWebhook(messagingEvent);
        }
      }
    }
    
    res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('Facebook webhook error:', error);
    res.status(500).send('Error');
  }
});

app.post('/api/webhooks/twitter', async (req, res) => {
  try {
    const { tweet_create_events, direct_message_events } = req.body;
    
    if (tweet_create_events) {
      for (const tweet of tweet_create_events) {
        await automationService.handleTwitterWebhook(tweet);
      }
    }
    
    if (direct_message_events) {
      for (const dm of direct_message_events) {
        await automationService.handleTwitterDM(dm);
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Twitter webhook error:', error);
    res.status(500).send('Error');
  }
});

// Automation cron jobs
if (process.env.AUTOMATION_ENABLED === 'true') {
  // Post scheduling job - runs every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await automationService.processScheduledPosts();
      console.log('Scheduled posts job completed');
    } catch (error) {
      console.error('Scheduled posts job failed:', error);
    }
  });

  // Analytics update job - runs every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await automationService.updateAnalytics();
      console.log('Analytics update job completed');
    } catch (error) {
      console.error('Analytics update job failed:', error);
    }
  });

  // Engagement automation job - runs every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      await automationService.processEngagementAutomation();
      console.log('Engagement automation job completed');
    } catch (error) {
      console.error('Engagement automation job failed:', error);
    }
  });

  // Content recycling job - runs daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      await automationService.recycleEvergreenContent();
      console.log('Content recycling job completed');
    } catch (error) {
      console.error('Content recycling job failed:', error);
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