import React from 'react';
import { Link } from 'react-router-dom';
import StructuredData from '../../components/StructuredData';

const APISecurityBestPractices = () => {
  const postData = {
    title: "API Security Best Practices: Protect Your Data",
    slug: "api-security-best-practices",
    date: "2024-01-15",
    readTime: "10 min read",
    category: "Security",
    author: "Zanwik Team"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data for Article */}
      <StructuredData 
        type="article" 
        data={{
          title: postData.title,
          description: "Essential API security practices to protect your data and users. Learn authentication, authorization, encryption, and monitoring best practices.",
          datePublished: postData.date,
          dateModified: postData.date,
          image: "https://www.zanwik.com/zanwik-icon.svg"
        }}
      />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="mb-6">
            <Link to="/blog" className="text-blue-600 hover:text-blue-800">
              ← Back to Blog
            </Link>
          </nav>
          
          <div className="mb-6">
            <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {postData.category}
            </span>
            <span className="text-gray-500 text-sm ml-3">{postData.readTime}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {postData.title}
          </h1>
          
          <div className="flex items-center text-gray-600">
            <span>By {postData.author}</span>
            <span className="mx-2">•</span>
            <span>{postData.date}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            API security is not optional—it's essential. With APIs being the backbone of modern applications, 
            a single security breach can compromise your entire system. This guide covers the essential 
            security practices every developer should implement.
          </p>

          <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
            <p className="text-red-800">
              <strong>⚠️ Critical:</strong> API security breaches can result in data theft, service disruption, 
              and significant financial losses. Don't wait until it's too late—implement these practices now.
            </p>
          </div>

          <h2>Table of Contents</h2>
          <ul>
            <li><a href="#authentication">Authentication</a></li>
            <li><a href="#authorization">Authorization</a></li>
            <li><a href="#encryption">Encryption</a></li>
            <li><a href="#input-validation">Input Validation</a></li>
            <li><a href="#rate-limiting">Rate Limiting</a></li>
            <li><a href="#monitoring">Monitoring & Logging</a></li>
            <li><a href="#error-handling">Secure Error Handling</a></li>
            <li><a href="#cors">CORS Configuration</a></li>
            <li><a href="#testing">Security Testing</a></li>
            <li><a href="#incident-response">Incident Response</a></li>
          </ul>

          <h2 id="authentication">Authentication</h2>
          <p>
            Authentication verifies who the user is. Here are the most secure methods:
          </p>

          <h3>1. OAuth 2.0 with PKCE</h3>
          <p>OAuth 2.0 with Proof Key for Code Exchange (PKCE) is the gold standard for API authentication:</p>
          
          <pre><code>{`// OAuth 2.0 with PKCE implementation
const crypto = require('crypto');

// Generate code verifier and challenge
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

// Authorization URL
const authUrl = 'https://api.example.com/oauth/authorize?' +
  'client_id=' + clientId + '&' +
  'redirect_uri=' + redirectUri + '&' +
  'response_type=code&' +
  'code_challenge=' + codeChallenge + '&' +
  'code_challenge_method=S256&' +
  'scope=read write';

// Exchange code for token
const tokenResponse = await fetch('https://api.example.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code: authorizationCode,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier
  })
});`}</code></pre>

          <h3>2. JWT Tokens</h3>
          <p>JSON Web Tokens are self-contained and stateless:</p>
          
          <pre><code>{`// JWT token validation
const jwt = require('jsonwebtoken');

// Verify token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Generate token
function generateToken(user) {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '1h',
      issuer: 'your-app',
      audience: 'your-api'
    }
  );
}`}</code></pre>

          <h3>3. API Keys</h3>
          <p>For server-to-server communication, use API keys with proper storage:</p>
          
          <pre><code>{`// Secure API key handling
const crypto = require('crypto');

// Generate API key
function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Hash API key for storage
function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// Verify API key
async function verifyApiKey(apiKey) {
  const hashedKey = hashApiKey(apiKey);
  const storedKey = await db.apiKeys.findOne({ keyHash: hashedKey });
  return storedKey && storedKey.isActive;
}`}</code></pre>

          <h2 id="authorization">Authorization</h2>
          <p>Authorization determines what authenticated users can do. Implement role-based access control (RBAC):</p>

          <pre><code>{`// Role-based authorization middleware
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Usage
app.get('/api/admin/users', 
  verifyToken, 
  requireRole(['admin', 'super_admin']), 
  getUsers
);

// Resource-based authorization
function canAccessResource(user, resource) {
  // User owns the resource
  if (resource.userId === user.id) return true;
  
  // User has admin role
  if (user.role === 'admin') return true;
  
  // User has specific permission
  if (user.permissions?.includes('read:' + resource.type + '')) return true;
  
  return false;
}`}</code></pre>

          <h2 id="encryption">Encryption</h2>
          <p>Always encrypt sensitive data in transit and at rest:</p>

          <h3>1. HTTPS/TLS</h3>
          <pre><code>{`// Force HTTPS in production
const helmet = require('helmet');

app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Redirect HTTP to HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect('https://' + req.header('host') + '' + req.url + '');
    } else {
      next();
    }
  });
}`}</code></pre>

          <h3>2. Data Encryption</h3>
          <pre><code>{`// Encrypt sensitive data
const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
const key = crypto.randomBytes(32);

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decrypt(encryptedData) {
  const decipher = crypto.createDecipher(algorithm, key);
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}`}</code></pre>

          <h2 id="input-validation">Input Validation</h2>
          <p>Never trust user input. Always validate and sanitize:</p>

          <pre><code>{`// Input validation with Joi
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  age: Joi.number().integer().min(13).max(120),
  role: Joi.string().valid('user', 'admin', 'moderator')
});

// Validation middleware
function validateInput(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    
    req.validatedData = value;
    next();
  };
}

// Usage
app.post('/api/users', 
  validateInput(userSchema), 
  createUser
);

// SQL injection prevention
const { Pool } = require('pg');
const pool = new Pool();

// Use parameterized queries
async function getUserById(id) {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

// XSS prevention
const validator = require('validator');

function sanitizeInput(input) {
  if (typeof input === 'string') {
    return validator.escape(input);
  }
  return input;
}`}</code></pre>

          <h2 id="rate-limiting">Rate Limiting</h2>
          <p>Protect your API from abuse with rate limiting:</p>

          <pre><code>{`// Rate limiting with express-rate-limit
const rateLimit = require('express-rate-limit');

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// Custom rate limiting by user
const userRateLimit = new Map();

function checkUserRateLimit(userId, maxRequests = 1000, windowMs = 60000) {
  const now = Date.now();
  const userLimits = userRateLimit.get(userId) || { count: 0, resetTime: now + windowMs };
  
  if (now > userLimits.resetTime) {
    userLimits.count = 0;
    userLimits.resetTime = now + windowMs;
  }
  
  if (userLimits.count >= maxRequests) {
    return false;
  }
  
  userLimits.count++;
  userRateLimit.set(userId, userLimits);
  return true;
}`}</code></pre>

          <h2 id="monitoring">Monitoring & Logging</h2>
          <p>Monitor your API for suspicious activity and security incidents:</p>

          <pre><code>{`// Security logging middleware
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.Console()
  ]
});

function securityLogger(req, res, next) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log security events
    if (res.statusCode === 401 || res.statusCode === 403) {
      logger.warn('Security event', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      });
    }
    
    // Log suspicious patterns
    if (duration > 5000) { // Slow requests
      logger.warn('Slow request detected', {
        ip: req.ip,
        url: req.url,
        duration,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  next();
}

// Anomaly detection
function detectAnomalies(req) {
  const ip = req.ip;
  const userAgent = req.get('User-Agent');
  
  // Check for bot patterns
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /java/i
  ];
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    logger.warn('Bot detected', { ip, userAgent });
  }
  
  // Check for suspicious headers
  if (!req.get('Accept') || !req.get('Accept-Language')) {
    logger.warn('Suspicious request headers', { ip, userAgent });
  }
}`}</code></pre>

          <h2 id="error-handling">Secure Error Handling</h2>
          <p>Don't leak sensitive information in error messages:</p>

          <pre><code>{`// Secure error handling
class APIError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handling middleware
function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('API Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new APIError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new APIError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new APIError(message, 400);
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: isDevelopment ? error.message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack })
  });
}

// Usage
app.use(errorHandler);`}</code></pre>

          <h2 id="cors">CORS Configuration</h2>
          <p>Configure CORS properly to prevent unauthorized cross-origin requests:</p>

          <pre><code>{`// CORS configuration
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://yourdomain.com',
      'https://www.yourdomain.com',
      'https://app.yourdomain.com'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});`}</code></pre>

          <h2 id="testing">Security Testing</h2>
          <p>Regularly test your API for security vulnerabilities:</p>

          <pre><code>{`// Security testing with Jest
describe('API Security Tests', () => {
  test('should reject requests without authentication', async () => {
    const response = await request(app)
      .get('/api/protected')
      .expect(401);
    
    expect(response.body.error).toBe('Authentication required');
  });

  test('should reject invalid JWT tokens', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  test('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/api/users')
      .send({ name: maliciousInput })
      .expect(400);
  });

  test('should enforce rate limiting', async () => {
    const promises = Array(101).fill().map(() => 
      request(app).get('/api/public')
    );
    
    const responses = await Promise.all(promises);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});

// Automated security scanning
const { exec } = require('child_process');

function runSecurityScan() {
  return new Promise((resolve, reject) => {
    exec('npm audit --audit-level moderate', (error, stdout, stderr) => {
      if (error) {
        console.error('Security vulnerabilities found:', stdout);
        reject(error);
      } else {
        console.log('Security scan passed');
        resolve(stdout);
      }
    });
  });
}`}</code></pre>

          <h2 id="incident-response">Incident Response</h2>
          <p>Have a plan for when security incidents occur:</p>

          <pre><code>{`// Incident response system
class SecurityIncident {
  constructor(type, severity, details) {
    this.type = type;
    this.severity = severity; // low, medium, high, critical
    this.details = details;
    this.timestamp = new Date();
    this.status = 'open';
  }

  async handle() {
    logger.critical('Security incident detected', {
      type: this.type,
      severity: this.severity,
      details: this.details,
      timestamp: this.timestamp
    });

    switch (this.severity) {
      case 'critical':
        await this.handleCriticalIncident();
        break;
      case 'high':
        await this.handleHighIncident();
        break;
      default:
        await this.handleStandardIncident();
    }
  }

  async handleCriticalIncident() {
    // Immediate actions for critical incidents
    await this.notifySecurityTeam();
    await this.blockSuspiciousIPs();
    await this.rotateSecrets();
  }

  async handleHighIncident() {
    // Actions for high severity incidents
    await this.notifySecurityTeam();
    await this.increaseMonitoring();
  }

  async handleStandardIncident() {
    // Standard incident handling
    await this.logIncident();
    await this.monitorForPatterns();
  }
}

// Usage
const incident = new SecurityIncident(
  'brute_force_attack',
  'high',
  { ip: '192.168.1.100', attempts: 50 }
);

await incident.handle();`}</code></pre>

          <h2>Security Checklist</h2>
          <p>Use this checklist to ensure your API is secure:</p>

          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">API Security Checklist</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>HTTPS enforced in production</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Strong authentication implemented</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Role-based authorization in place</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Input validation on all endpoints</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Rate limiting configured</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>CORS properly configured</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Security headers set</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Error handling doesn't leak information</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Logging and monitoring active</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Regular security testing performed</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Incident response plan ready</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Dependencies regularly updated</span>
              </li>
            </ul>
          </div>

          <h2>Conclusion</h2>
          <p>
            API security is an ongoing process, not a one-time setup. Stay vigilant, keep your 
            dependencies updated, and regularly test your security measures. Remember: it's not 
            just about protecting your data—it's about protecting your users and maintaining their trust.
          </p>

          <p>
            For more API resources and security tools, visit our 
            <Link to="/apis" className="text-blue-600 hover:text-blue-800">API Directory</Link> 
            and explore our security-focused API recommendations.
          </p>
        </article>

        {/* Author Bio */}
        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">About the Author</h3>
          <p className="text-gray-600">
            The Zanwik team consists of experienced developers and entrepreneurs who are passionate 
            about helping others succeed with API integration and business automation.
          </p>
        </div>

        {/* Related Posts */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold mb-2">
                <Link to="/blog/api-integration-guide-2024" className="hover:text-blue-600">
                  How to Integrate APIs in 2024
                </Link>
              </h4>
              <p className="text-gray-600 text-sm">Complete developer guide to API integration with best practices and code examples.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold mb-2">
                <Link to="/blog/top-10-apis-startup-should-know" className="hover:text-blue-600">
                  Top 10 APIs Every Startup Should Know
                </Link>
              </h4>
              <p className="text-sm text-gray-600">Discover the essential APIs that can accelerate your startup's growth.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APISecurityBestPractices;
