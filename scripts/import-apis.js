#!/usr/bin/env node

/**
 * API Import Script
 * Imports APIs from external sources to scale Zanwik's API directory
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const SOURCES = {
  github: {
    name: 'GitHub public-apis',
    url: 'https://raw.githubusercontent.com/public-apis/public-apis/master/README.md',
    description: 'GitHub repository with 1,000+ APIs'
  },
  publicapis: {
    name: 'PublicAPIs.dev',
    url: 'https://api.publicapis.dev/entries',
    description: 'Community-driven API directory with 1,400+ APIs'
  },
  freepublicapis: {
    name: 'FreePublicAPIs.com',
    url: 'https://www.freepublicapis.com/api/apis',
    description: 'Free APIs directory with 461 APIs'
  }
};

// Category mapping from external sources to Zanwik categories
const CATEGORY_MAPPING = {
  'animals': 'animals',
  'anime': 'entertainment',
  'anti-malware': 'security',
  'art-design': 'photography',
  'authentication': 'security',
  'authorization': 'security',
  'blockchain': 'cryptocurrency',
  'books': 'books',
  'business': 'business',
  'calendar': 'productivity',
  'cloud': 'development',
  'continuous-integration': 'development',
  'cryptocurrency': 'cryptocurrency',
  'currency-exchange': 'finance',
  'data-validation': 'development',
  'development': 'development',
  'dictionaries': 'language',
  'documents': 'productivity',
  'email': 'communication',
  'entertainment': 'entertainment',
  'environment': 'environment',
  'events': 'events',
  'finance': 'finance',
  'food-drink': 'food',
  'gaming': 'games-comics',
  'geocoding': 'geocoding',
  'government': 'government',
  'health': 'health',
  'jobs': 'jobs',
  'machine-learning': 'ai',
  'music': 'music',
  'news': 'news',
  'open-data': 'government',
  'patent': 'government',
  'personality': 'entertainment',
  'phone': 'communication',
  'photography': 'photography',
  'podcasts': 'entertainment',
  'programming': 'development',
  'science': 'science',
  'security': 'security',
  'shopping': 'ecommerce',
  'social': 'social',
  'sports': 'sports',
  'test-data': 'development',
  'text-analysis': 'ai',
  'tracking': 'analytics',
  'transportation': 'transportation',
  'url-shorteners': 'utilities',
  'vehicle': 'transportation',
  'video': 'video',
  'weather': 'weather'
};

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data); // Return raw data if not JSON
        }
      });
    }).on('error', reject);
  });
}

// Helper function to clean and normalize API data
function normalizeApiData(api, source) {
  const id = api.API?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 
             api.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 
             `api-${Date.now()}`;
  
  const category = CATEGORY_MAPPING[api.Category?.toLowerCase()] || 
                  CATEGORY_MAPPING[api.category?.toLowerCase()] || 
                  'development';
  
  return {
    id,
    name: api.API || api.name || 'Unknown API',
    category,
    categoryName: getCategoryName(category),
    description: api.Description || api.description || 'No description available',
    baseUrl: api.Link || api.url || api.baseUrl || '',
    authentication: api.Auth || api.auth || 'No',
    cors: api.CORS === 'Yes' || api.cors === true,
    https: api.HTTPS === 'Yes' || api.https === true,
    rateLimit: api.rateLimit || 'Unknown',
    features: {
      https: api.HTTPS === 'Yes' || api.https === true,
      cors: api.CORS === 'Yes' || api.cors === true,
      free: !api.Auth || api.Auth === 'No',
      rateLimit: api.rateLimit || '1000/hour'
    },
    source: source,
    importedAt: new Date().toISOString()
  };
}

// Get category name from category key
function getCategoryName(category) {
  const categoryNames = {
    'animals': 'Animals',
    'entertainment': 'Entertainment',
    'security': 'Security',
    'photography': 'Photography',
    'cryptocurrency': 'Cryptocurrency',
    'books': 'Books',
    'business': 'Business',
    'productivity': 'Productivity',
    'development': 'Development',
    'finance': 'Finance',
    'language': 'Language',
    'communication': 'Communication',
    'environment': 'Environment',
    'events': 'Events',
    'food': 'Food & Drink',
    'games-comics': 'Games & Comics',
    'geocoding': 'Geocoding',
    'government': 'Government',
    'health': 'Health',
    'jobs': 'Jobs',
    'ai': 'AI & Machine Learning',
    'music': 'Music',
    'news': 'News',
    'science': 'Science',
    'ecommerce': 'E-commerce',
    'social': 'Social',
    'sports': 'Sports & Fitness',
    'analytics': 'Analytics',
    'transportation': 'Transportation',
    'utilities': 'Utilities',
    'video': 'Video',
    'weather': 'Weather'
  };
  return categoryNames[category] || 'Development';
}

// Import from PublicAPIs.dev
async function importFromPublicAPIs() {
  console.log('🔄 Importing from PublicAPIs.dev...');
  try {
    const data = await makeRequest(SOURCES.publicapis.url);
    console.log('Raw data structure:', typeof data, Object.keys(data || {}));
    
    // Handle different response formats
    let apis = [];
    if (Array.isArray(data)) {
      apis = data;
    } else if (data && data.entries && Array.isArray(data.entries)) {
      apis = data.entries;
    } else if (data && data.data && Array.isArray(data.data)) {
      apis = data.data;
    } else {
      console.log('Unexpected data format:', data);
      return [];
    }
    
    console.log(`📊 Found ${apis.length} APIs from PublicAPIs.dev`);
    
    if (apis.length > 0) {
      console.log('Sample API:', apis[0]);
    }
    
    const normalizedApis = apis.map(api => normalizeApiData(api, 'publicapis'));
    return normalizedApis;
  } catch (error) {
    console.error('❌ Error importing from PublicAPIs.dev:', error.message);
    return [];
  }
}

// Import from GitHub public-apis (markdown parsing)
async function importFromGitHub() {
  console.log('🔄 Importing from GitHub public-apis...');
  try {
    const markdown = await makeRequest(SOURCES.github.url);
    
    // Simple markdown parsing for API tables
    const lines = markdown.split('\n');
    const apis = [];
    let inTable = false;
    let headers = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect table start
      if (line.startsWith('|') && line.includes('API') && line.includes('Description')) {
        inTable = true;
        headers = line.split('|').map(h => h.trim()).filter(h => h);
        continue;
      }
      
      // Detect table end
      if (inTable && (line.startsWith('**') || line === '')) {
        inTable = false;
        continue;
      }
      
      // Parse table rows
      if (inTable && line.startsWith('|') && line.includes('|')) {
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length >= 3) {
          const api = {
            API: cells[0],
            Description: cells[1],
            Auth: cells[2],
            HTTPS: cells[3],
            CORS: cells[4],
            Link: cells[5],
            Category: cells[6]
          };
          apis.push(normalizeApiData(api, 'github'));
        }
      }
    }
    
    console.log(`📊 Found ${apis.length} APIs from GitHub public-apis`);
    return apis;
  } catch (error) {
    console.error('❌ Error importing from GitHub:', error.message);
    return [];
  }
}

// Import from FreePublicAPIs.com
async function importFromFreePublicAPIs() {
  console.log('🔄 Importing from FreePublicAPIs.com...');
  try {
    // Note: This would need to be implemented based on their actual API
    // For now, we'll return an empty array as a placeholder
    console.log('⚠️  FreePublicAPIs.com import not implemented yet');
    return [];
  } catch (error) {
    console.error('❌ Error importing from FreePublicAPIs.com:', error.message);
    return [];
  }
}

// Deduplicate APIs based on name and baseUrl
function deduplicateApis(apis) {
  const seen = new Set();
  const unique = [];
  
  for (const api of apis) {
    const key = `${api.name}-${api.baseUrl}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(api);
    }
  }
  
  return unique;
}

// Update category counts
function updateCategoryCounts(apis) {
  const counts = {};
  apis.forEach(api => {
    counts[api.category] = (counts[api.category] || 0) + 1;
  });
  return counts;
}

// Main import function
async function importApis() {
  console.log('🚀 Starting API import process...\n');
  
  // Import from all sources
  const [publicApis, githubApis, freeApis] = await Promise.all([
    importFromPublicAPIs(),
    importFromGitHub(),
    importFromFreePublicAPIs()
  ]);
  
  // Combine all APIs
  const allApis = [...publicApis, ...githubApis, ...freeApis];
  console.log(`\n📊 Total APIs imported: ${allApis.length}`);
  
  // Deduplicate
  const uniqueApis = deduplicateApis(allApis);
  console.log(`📊 Unique APIs after deduplication: ${uniqueApis.length}`);
  
  // Update category counts
  const categoryCounts = updateCategoryCounts(uniqueApis);
  console.log('\n📊 Category breakdown:');
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} APIs`);
  });
  
  // Load existing data
  const existingDataPath = path.join(__dirname, '../src/data/apis.json');
  let existingData = { categories: {}, apis: {} };
  
  if (fs.existsSync(existingDataPath)) {
    try {
      existingData = JSON.parse(fs.readFileSync(existingDataPath, 'utf8'));
    } catch (error) {
      console.error('❌ Error loading existing data:', error.message);
    }
  }
  
  // Merge with existing data
  const mergedApis = { ...existingData.apis };
  uniqueApis.forEach(api => {
    mergedApis[api.id] = api;
  });
  
  // Update category counts in existing data
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
  
  // Save updated data
  const updatedData = {
    categories: updatedCategories,
    apis: mergedApis,
    lastUpdated: new Date().toISOString(),
    totalApis: Object.keys(mergedApis).length
  };
  
  fs.writeFileSync(existingDataPath, JSON.stringify(updatedData, null, 2));
  console.log(`\n✅ Successfully saved ${Object.keys(mergedApis).length} APIs to ${existingDataPath}`);
  
  return updatedData;
}

// Run the import if this script is executed directly
if (require.main === module) {
  importApis().catch(console.error);
}

module.exports = { importApis, importFromPublicAPIs, importFromGitHub, importFromFreePublicAPIs };
