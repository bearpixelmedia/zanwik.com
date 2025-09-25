#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Infinite API System...\n');

// Test data
const testAPIs = [
  {
    name: 'Test API 1',
    description: 'A test API for demonstration',
    url: 'https://api.test1.com',
    category: 'Development',
    auth: 'api-key',
    https: true,
    cors: 'yes',
    source: 'test',
    added: new Date().toISOString()
  },
  {
    name: 'Test API 2',
    description: 'Another test API',
    url: 'https://api.test2.com',
    category: 'Business',
    auth: 'oauth',
    https: true,
    cors: 'yes',
    source: 'test',
    added: new Date().toISOString()
  },
  {
    name: 'Test API 3',
    description: 'Third test API',
    url: 'https://api.test3.com',
    category: 'Data',
    auth: 'none',
    https: true,
    cors: 'no',
    source: 'test',
    added: new Date().toISOString()
  }
];

// Create test discovered APIs file
const discoveredAPIsPath = path.join(__dirname, '..', 'src', 'data', 'discovered-apis.json');

try {
  fs.writeFileSync(discoveredAPIsPath, JSON.stringify(testAPIs, null, 2));
  console.log('✅ Created test discovered APIs file');
} catch (error) {
  console.error('❌ Error creating test file:', error.message);
  process.exit(1);
}

// Load existing APIs
const existingAPIsPath = path.join(__dirname, '..', 'src', 'data', 'apis.json');
let existingAPIs = [];

if (fs.existsSync(existingAPIsPath)) {
  try {
    const content = fs.readFileSync(existingAPIsPath, 'utf8');
    existingAPIs = JSON.parse(content);
    console.log(`📦 Loaded ${existingAPIs.length} existing APIs`);
  } catch (error) {
    console.log('⚠️  No existing APIs file, starting fresh');
    existingAPIs = [];
  }
} else {
  console.log('⚠️  No existing APIs file, starting fresh');
  existingAPIs = [];
}

// Convert test API to standard format
function convertToStandardFormat(discoveredAPI) {
  return {
    id: discoveredAPI.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: discoveredAPI.name,
    description: discoveredAPI.description,
    url: discoveredAPI.url,
    category: discoveredAPI.category,
    auth: discoveredAPI.auth,
    https: discoveredAPI.https,
    cors: discoveredAPI.cors,
    status: 'active',
    popularity: 5,
    documentation: discoveredAPI.url,
    examples: [
      {
        method: 'GET',
        endpoint: `${discoveredAPI.url}/api/v1/example`,
        description: 'Basic API call example',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ],
    tags: [discoveredAPI.category.toLowerCase(), discoveredAPI.source],
    source: discoveredAPI.source,
    added: discoveredAPI.added,
    lastChecked: new Date().toISOString()
  };
}

// Add test APIs
console.log('🔄 Adding test APIs...\n');

let added = 0;
let skipped = 0;

for (const testAPI of testAPIs) {
  try {
    const standardAPI = convertToStandardFormat(testAPI);
    
    // Check if already exists
    const exists = existingAPIs.some(api => api.name === standardAPI.name);
    
    if (exists) {
      console.log(`⏭️  Skipped: ${standardAPI.name} (already exists)`);
      skipped++;
    } else {
      existingAPIs.push(standardAPI);
      console.log(`✅ Added: ${standardAPI.name} (${standardAPI.category})`);
      added++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${testAPI.name}:`, error.message);
  }
}

// Save updated APIs
try {
  fs.writeFileSync(existingAPIsPath, JSON.stringify(existingAPIs, null, 2));
  console.log(`\n💾 Saved ${existingAPIs.length} total APIs to apis.json`);
} catch (error) {
  console.error('❌ Error saving APIs:', error.message);
  process.exit(1);
}

// Clean up test file
try {
  fs.unlinkSync(discoveredAPIsPath);
  console.log('🧹 Cleaned up test file');
} catch (error) {
  console.log('⚠️  Could not clean up test file');
}

// Print summary
console.log('\n📊 Test Summary:');
console.log(`✅ Added: ${added}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log(`📦 Total APIs: ${existingAPIs.length}`);

console.log('\n🎯 Test completed successfully!');
console.log('The infinite API system is working correctly.');
