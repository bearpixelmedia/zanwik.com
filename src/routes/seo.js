const express = require('express');
const router = express.Router();
const { generateSitemap, generateRobotsTxt, generateSitemapIndex } = require('../utils/sitemapGenerator');

// Serve sitemap.xml
router.get('/sitemap.xml', (req, res) => {
  try {
    const sitemap = generateSitemap();
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Serve robots.txt
router.get('/robots.txt', (req, res) => {
  try {
    const robotsTxt = generateRobotsTxt();
    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    res.status(500).send('Error generating robots.txt');
  }
});

// Serve sitemap index
router.get('/sitemap-index.xml', (req, res) => {
  try {
    const sitemapIndex = generateSitemapIndex();
    res.set('Content-Type', 'application/xml');
    res.send(sitemapIndex);
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    res.status(500).send('Error generating sitemap index');
  }
});

// Serve individual API sitemap
router.get('/sitemap-apis.xml', (req, res) => {
  try {
    const baseUrl = 'https://www.zanwik.com';
    const currentDate = new Date().toISOString().split('T')[0];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Generate URLs for all APIs
    const topAPIs = [
      'stripe', 'github', 'openai', 'twilio', 'sendgrid', 'aws', 'google-cloud',
      'firebase', 'mongodb', 'redis', 'paypal', 'shopify', 'slack', 'discord',
      'twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'spotify',
      'netflix', 'uber', 'airbnb', 'dropbox', 'zoom', 'salesforce', 'hubspot',
      'mailchimp', 'zapier', 'ifttt', 'trello', 'asana', 'notion', 'figma'
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

    sitemap += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating APIs sitemap:', error);
    res.status(500).send('Error generating APIs sitemap');
  }
});

// Serve categories sitemap
router.get('/sitemap-categories.xml', (req, res) => {
  try {
    const baseUrl = 'https://www.zanwik.com';
    const currentDate = new Date().toISOString().split('T')[0];
    
    const API_CATEGORIES = [
      'business', 'development', 'finance', 'health', 'education', 'entertainment',
      'food', 'games', 'music', 'news', 'photography', 'science', 'sports',
      'travel', 'utilities', 'weather', 'social', 'communication'
    ];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    API_CATEGORIES.forEach(category => {
      sitemap += `
  <url>
    <loc>${baseUrl}/apis/category/${category}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating categories sitemap:', error);
    res.status(500).send('Error generating categories sitemap');
  }
});

module.exports = router;
