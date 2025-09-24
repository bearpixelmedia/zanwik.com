const botProtection = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress;
  
  // Bot detection patterns
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'java',
    'php', 'go-http', 'node', 'axios', 'requests', 'urllib', 'mechanize',
    'selenium', 'phantom', 'headless', 'automated', 'test', 'postman',
    'insomnia', 'httpie', 'rest-client', 'apache-httpclient', 'okhttp'
  ];
  
  // Check if user agent contains bot patterns
  const isBot = botPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  );
  
  // Check for missing or suspicious headers
  const suspiciousHeaders = {
    'accept': req.get('Accept'),
    'accept-language': req.get('Accept-Language'),
    'accept-encoding': req.get('Accept-Encoding'),
    'connection': req.get('Connection'),
    'upgrade-insecure-requests': req.get('Upgrade-Insecure-Requests')
  };
  
  // Bots often have missing or generic headers
  const hasGenericHeaders = 
    !suspiciousHeaders['accept-language'] ||
    suspiciousHeaders['accept-language'].includes('*') ||
    !suspiciousHeaders['accept-encoding'] ||
    suspiciousHeaders['accept'].includes('*/*');
  
  // Check for rapid requests (rate limiting)
  const requestKey = `bot_check_${ip}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  const maxRequests = 10; // Max 10 requests per minute
  
  // Simple in-memory rate limiting (in production, use Redis)
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }
  
  const userRequests = global.rateLimitStore.get(requestKey) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    console.warn(`Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({ 
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
  }
  
  // Update rate limit store
  recentRequests.push(now);
  global.rateLimitStore.set(requestKey, recentRequests);
  
  // Block if bot detected
  if (isBot || hasGenericHeaders) {
    console.warn(`Bot access attempt blocked - IP: ${ip}, UA: ${userAgent}`);
    
    // Log the attempt
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: ip,
      userAgent: userAgent,
      path: req.path,
      method: req.method,
      headers: suspiciousHeaders,
      reason: isBot ? 'bot_pattern' : 'generic_headers'
    };
    
    // In production, log to a proper logging service
    console.log('Bot blocked:', JSON.stringify(logEntry, null, 2));
    
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Automated access is not allowed',
      code: 'BOT_DETECTED'
    });
  }
  
  // Additional security headers
  res.set({
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  });
  
  next();
};

module.exports = botProtection;
