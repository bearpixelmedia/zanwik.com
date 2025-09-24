#!/usr/bin/env node

/**
 * Add Premium APIs Script
 * Manually adds high-quality APIs to scale Zanwik's directory
 */

const fs = require('fs');
const path = require('path');

// High-quality APIs to add
const PREMIUM_APIS = [
  // Development APIs
  {
    id: 'github-api',
    name: 'GitHub API',
    category: 'development',
    description: 'Access GitHub repositories, issues, pull requests, and more',
    baseUrl: 'https://api.github.com',
    authentication: 'OAuth',
    cors: true,
    https: true,
    features: ['REST', 'GraphQL', 'Webhooks'],
    documentation: 'https://docs.github.com/en/rest',
    rateLimit: '5000/hour'
  },
  {
    id: 'stripe-api',
    name: 'Stripe API',
    category: 'finance',
    description: 'Payment processing, subscriptions, and financial management',
    baseUrl: 'https://api.stripe.com',
    authentication: 'API Key',
    cors: true,
    https: true,
    features: ['Payments', 'Subscriptions', 'Webhooks'],
    documentation: 'https://stripe.com/docs/api',
    rateLimit: '100/second'
  },
  {
    id: 'openai-api',
    name: 'OpenAI API',
    category: 'ai',
    description: 'AI models for text generation, completion, and analysis',
    baseUrl: 'https://api.openai.com',
    authentication: 'API Key',
    cors: true,
    https: true,
    features: ['GPT-4', 'DALL-E', 'Whisper'],
    documentation: 'https://platform.openai.com/docs',
    rateLimit: '60/minute'
  },
  {
    id: 'twilio-api',
    name: 'Twilio API',
    category: 'communication',
    description: 'SMS, voice, video, and messaging services',
    baseUrl: 'https://api.twilio.com',
    authentication: 'API Key',
    cors: true,
    https: true,
    features: ['SMS', 'Voice', 'Video', 'WhatsApp'],
    documentation: 'https://www.twilio.com/docs',
    rateLimit: '1000/hour'
  },
  {
    id: 'sendgrid-api',
    name: 'SendGrid API',
    category: 'communication',
    description: 'Email delivery and marketing automation',
    baseUrl: 'https://api.sendgrid.com',
    authentication: 'API Key',
    cors: true,
    https: true,
    features: ['Email', 'Templates', 'Analytics'],
    documentation: 'https://docs.sendgrid.com',
    rateLimit: '600/minute'
  },
  {
    id: 'aws-api',
    name: 'AWS API',
    category: 'development',
    description: 'Amazon Web Services APIs for cloud computing',
    baseUrl: 'https://aws.amazon.com/api',
    authentication: 'AWS Signature',
    cors: true,
    https: true,
    features: ['EC2', 'S3', 'Lambda', 'DynamoDB'],
    documentation: 'https://docs.aws.amazon.com',
    rateLimit: 'Varies by service'
  },
  {
    id: 'google-cloud-api',
    name: 'Google Cloud API',
    category: 'development',
    description: 'Google Cloud Platform services and APIs',
    baseUrl: 'https://cloud.google.com/apis',
    authentication: 'OAuth2',
    cors: true,
    https: true,
    features: ['Compute', 'Storage', 'AI/ML', 'BigQuery'],
    documentation: 'https://cloud.google.com/docs',
    rateLimit: 'Varies by service'
  },
  {
    id: 'firebase-api',
    name: 'Firebase API',
    category: 'development',
    description: 'Backend-as-a-Service for mobile and web apps',
    baseUrl: 'https://firebase.google.com',
    authentication: 'API Key',
    cors: true,
    https: true,
    features: ['Realtime Database', 'Authentication', 'Hosting'],
    documentation: 'https://firebase.google.com/docs',
    rateLimit: '1000/minute'
  },
  {
    id: 'mongodb-api',
    name: 'MongoDB API',
    category: 'development',
    description: 'NoSQL database operations and data management',
    baseUrl: 'https://cloud.mongodb.com',
    authentication: 'API Key',
    cors: true,
    https: true,
    features: ['Atlas', 'Realm', 'Data API'],
    documentation: 'https://docs.atlas.mongodb.com',
    rateLimit: '1000/hour'
  },
  {
    id: 'redis-api',
    name: 'Redis API',
    category: 'development',
    description: 'In-memory data structure store and cache',
    baseUrl: 'https://redis.io',
    authentication: 'Password',
    cors: true,
    https: true,
    features: ['Caching', 'Pub/Sub', 'Streams'],
    documentation: 'https://redis.io/docs',
    rateLimit: '10000/second'
  }
];

// Load existing data
function loadExistingData() {
  const dataPath = path.join(__dirname, '../src/data/apis.json');
  if (fs.existsSync(dataPath)) {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
  return { categories: {}, apis: {} };
}

// Save updated data
function saveData(data) {
  const dataPath = path.join(__dirname, '../src/data/apis.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log(`✅ Saved ${Object.keys(data.apis).length} APIs to ${dataPath}`);
}

// Add premium APIs
function addPremiumApis() {
  console.log('🚀 Adding premium APIs...\n');
  
  const existingData = loadExistingData();
  const newApis = { ...existingData.apis };
  
  let added = 0;
  PREMIUM_APIS.forEach(api => {
    if (!newApis[api.id]) {
      newApis[api.id] = {
        ...api,
        importedAt: new Date().toISOString(),
        source: 'manual',
        stats: [
          { value: '4.8', label: 'Rating' },
          { value: '1000+', label: 'Users' },
          { value: '99.9%', label: 'Uptime' }
        ]
      };
      added++;
      console.log(`➕ Added: ${api.name}`);
    } else {
      console.log(`⚠️  Skipped: ${api.name} (already exists)`);
    }
  });
  
  // Update category counts
  const categoryCounts = {};
  Object.values(newApis).forEach(api => {
    categoryCounts[api.category] = (categoryCounts[api.category] || 0) + 1;
  });
  
  // Update categories
  const updatedCategories = { ...existingData.categories };
  Object.entries(categoryCounts).forEach(([category, count]) => {
    if (updatedCategories[category]) {
      updatedCategories[category].count = count;
    } else {
      updatedCategories[category] = {
        name: getCategoryName(category),
        description: `APIs for ${category}`,
        icon: '🔧',
        count: count,
        color: '#3b82f6'
      };
    }
  });
  
  const updatedData = {
    categories: updatedCategories,
    apis: newApis,
    lastUpdated: new Date().toISOString(),
    totalApis: Object.keys(newApis).length
  };
  
  saveData(updatedData);
  console.log(`\n📊 Added ${added} new APIs`);
  console.log(`📊 Total APIs: ${Object.keys(newApis).length}`);
  
  return updatedData;
}

// Get category name
function getCategoryName(category) {
  const names = {
    'development': 'Development',
    'finance': 'Finance',
    'ai': 'AI & Machine Learning',
    'communication': 'Communication',
    'games-comics': 'Games & Comics',
    'social': 'Social',
    'weather': 'Weather',
    'music': 'Music',
    'health': 'Health',
    'photography': 'Photography',
    'geocoding': 'Geocoding',
    'government': 'Government',
    'transportation': 'Transportation',
    'cryptocurrency': 'Cryptocurrency',
    'video': 'Video',
    'security': 'Security',
    'sports': 'Sports & Fitness',
    'ecommerce': 'E-commerce',
    'entertainment': 'Entertainment',
    'news': 'News',
    'education': 'Education',
    'travel': 'Travel',
    'real-estate': 'Real Estate'
  };
  return names[category] || 'Development';
}

// Run if called directly
if (require.main === module) {
  addPremiumApis();
}

module.exports = { addPremiumApis, PREMIUM_APIS };
