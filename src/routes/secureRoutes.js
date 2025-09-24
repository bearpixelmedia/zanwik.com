const express = require('express');
const router = express.Router();
const botProtection = require('../middleware/botProtection');

// Apply bot protection to all secure routes
router.use(botProtection);

// Hidden login route - only accessible via direct URL
router.get('/bpm-login', (req, res) => {
  // Additional security: Check referrer and origin
  const referrer = req.get('Referer');
  const origin = req.get('Origin');
  
  // Block if coming from external sites
  if (referrer && !referrer.includes(req.hostname)) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Direct access only'
    });
  }
  
  // Serve the login page
  res.sendFile('hidden-login.html', { 
    root: 'client/build',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
});

// Dashboard route - requires authentication
router.get('/dashboard', (req, res) => {
  // Check for authentication token
  const authToken = req.get('Authorization') || req.cookies.authToken;
  
  if (!authToken) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  
  // Serve the dashboard
  res.sendFile('index.html', { 
    root: 'client/build',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
});

// API endpoint to check dashboard access
router.get('/api/dashboard/status', (req, res) => {
  // This endpoint is protected by bot protection middleware
  res.json({
    status: 'secure',
    message: 'Dashboard access verified',
    timestamp: new Date().toISOString()
  });
});

// Block common bot paths
router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

router.get('/sitemap.xml', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Block admin/common paths
const blockedPaths = [
  '/admin', '/wp-admin', '/administrator', '/login', '/signin',
  '/dashboard', '/panel', '/control', '/manage', '/backend'
];

blockedPaths.forEach(path => {
  router.get(path, (req, res) => {
    res.status(404).json({ 
      error: 'Not found',
      message: 'The requested resource was not found'
    });
  });
});

module.exports = router;
