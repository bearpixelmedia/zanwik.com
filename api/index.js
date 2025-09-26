// Simple API handler for Vercel serverless functions
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check endpoint
  if (req.url === '/api/health' && (req.method === 'GET' || req.method === 'HEAD')) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    if (req.method === 'GET') {
      res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    } else {
      res.end();
    }
    return;
  }

  // Test endpoint
  if (req.url === '/api/test' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ message: 'API is working!' });
    return;
  }

  // Dashboard route - serve the React app
  if (req.url === '/dashboard' && (req.method === 'GET' || req.method === 'HEAD')) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Zanwik Dashboard</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <h1>Zanwik Dashboard</h1>
          <p>Dashboard is loading...</p>
          <script>
            // Redirect to the React app
            window.location.href = '/dashboard/';
          </script>
        </body>
      </html>
    `);
    return;
  }

  // Admin route - serve the React app
  if (req.url === '/admin' && (req.method === 'GET' || req.method === 'HEAD')) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Zanwik Admin</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <h1>Zanwik Admin</h1>
          <p>Admin panel is loading...</p>
          <script>
            // Redirect to the React app
            window.location.href = '/admin/';
          </script>
        </body>
      </html>
    `);
    return;
  }

  // Blog route - serve the React app
  if (req.url === '/blog' && (req.method === 'GET' || req.method === 'HEAD')) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Zanwik Blog</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <h1>Zanwik Blog</h1>
          <p>Blog is loading...</p>
          <script>
            // Redirect to the React app
            window.location.href = '/blog/';
          </script>
        </body>
      </html>
    `);
    return;
  }

  // Login route - serve the React app
  if (req.url === '/bpm-login' && (req.method === 'GET' || req.method === 'HEAD')) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Zanwik Login</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <h1>Zanwik Login</h1>
          <p>Login page is loading...</p>
          <script>
            // Redirect to the React app
            window.location.href = '/bpm-login/';
          </script>
        </body>
      </html>
    `);
    return;
  }

  // Sitemap route
  if (req.url === '/sitemap.xml' && (req.method === 'GET' || req.method === 'HEAD')) {
    const generateSitemap = () => {
      const baseUrl = 'https://www.zanwik.com';
      const currentDate = new Date().toISOString().split('T')[0];
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/apis</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog/api-integration-guide-2024</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog/top-10-apis-startup</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog/api-security-best-practices</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;
      return sitemap;
    };

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(generateSitemap());
    return;
  }

  // Robots.txt route
  if (req.url === '/robots.txt' && (req.method === 'GET' || req.method === 'HEAD')) {
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://www.zanwik.com/sitemap.xml`;

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(robotsTxt);
    return;
  }

  // Catch all for API routes
  if (req.url.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({ error: 'API endpoint not found' });
    return;
  }

  // Default response
  res.status(404).json({ error: 'Not found' });
};
