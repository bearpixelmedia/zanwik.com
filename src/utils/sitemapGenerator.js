const fs = require('fs');
const path = require('path');

// API categories and data
const API_CATEGORIES = [
  'business', 'development', 'finance', 'health', 'education', 'entertainment',
  'food', 'games', 'music', 'news', 'photography', 'science', 'sports',
  'travel', 'utilities', 'weather', 'social', 'communication'
];

// Generate sitemap XML
const generateSitemap = () => {
  const baseUrl = 'https://www.zanwik.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

  // Homepage
  sitemap += `
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  // Main API directory page
  sitemap += `
  <url>
    <loc>${baseUrl}/apis</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

  // Category pages
  API_CATEGORIES.forEach(category => {
    sitemap += `
  <url>
    <loc>${baseUrl}/apis/category/${category}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  // Individual API pages (generate for top APIs)
  const topAPIs = [
    'stripe', 'github', 'openai', 'twilio', 'sendgrid', 'aws', 'google-cloud',
    'firebase', 'mongodb', 'redis', 'paypal', 'shopify', 'slack', 'discord',
    'twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'spotify'
  ];

  topAPIs.forEach(api => {
    sitemap += `
  <url>
    <loc>${baseUrl}/apis/${api}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // Static pages
  const staticPages = [
    { path: '/about', priority: '0.6', changefreq: 'monthly' },
    { path: '/contact', priority: '0.5', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.4', changefreq: 'yearly' },
    { path: '/terms', priority: '0.4', changefreq: 'yearly' },
    { path: '/help', priority: '0.6', changefreq: 'monthly' },
    { path: '/api-documentation', priority: '0.7', changefreq: 'weekly' },
    { path: '/developer-resources', priority: '0.7', changefreq: 'weekly' },
    { path: '/integration-guides', priority: '0.6', changefreq: 'monthly' }
  ];

  staticPages.forEach(page => {
    sitemap += `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  return sitemap;
};

// Generate robots.txt
const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /
Allow: /apis/
Allow: /apis/category/
Allow: /apis/*/$
Disallow: /bpm-login
Disallow: /dashboard
Disallow: /api/
Disallow: /admin/
Disallow: /wp-admin/
Disallow: /administrator/
Disallow: /login/
Disallow: /signin/
Disallow: /panel/
Disallow: /control/
Disallow: /manage/
Disallow: /backend/

# Sitemap
Sitemap: https://www.zanwik.com/sitemap.xml

# Crawl delay
Crawl-delay: 1`;
};

// Generate sitemap index (for large sites)
const generateSitemapIndex = () => {
  const baseUrl = 'https://www.zanwik.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-apis.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;
};

// Write sitemap files
const writeSitemapFiles = () => {
  try {
    // Main sitemap
    const sitemap = generateSitemap();
    fs.writeFileSync(path.join(__dirname, '../../client/public/sitemap.xml'), sitemap);
    
    // Robots.txt
    const robotsTxt = generateRobotsTxt();
    fs.writeFileSync(path.join(__dirname, '../../client/public/robots.txt'), robotsTxt);
    
    // Sitemap index
    const sitemapIndex = generateSitemapIndex();
    fs.writeFileSync(path.join(__dirname, '../../client/public/sitemap-index.xml'), sitemapIndex);
    
    console.log('✅ Sitemap files generated successfully');
    console.log('📁 Files created:');
    console.log('   - client/public/sitemap.xml');
    console.log('   - client/public/robots.txt');
    console.log('   - client/public/sitemap-index.xml');
    
  } catch (error) {
    console.error('❌ Error generating sitemap files:', error);
  }
};

module.exports = {
  generateSitemap,
  generateRobotsTxt,
  generateSitemapIndex,
  writeSitemapFiles
};
