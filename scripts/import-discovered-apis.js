#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Importing Discovered APIs...\n');

// Load discovered APIs
const discoveredAPIsPath = path.join(__dirname, '..', 'src', 'data', 'discovered-apis.json');
const existingAPIsPath = path.join(__dirname, '..', 'src', 'data', 'apis.json');

let discoveredAPIs = [];
let existingAPIs = [];

// Load discovered APIs
if (fs.existsSync(discoveredAPIsPath)) {
  try {
    const content = fs.readFileSync(discoveredAPIsPath, 'utf8');
    discoveredAPIs = JSON.parse(content);
    console.log(`📦 Loaded ${discoveredAPIs.length} discovered APIs`);
  } catch (error) {
    console.error('❌ Error loading discovered APIs:', error.message);
    process.exit(1);
  }
} else {
  console.log('❌ No discovered APIs file found. Run infinite-api-discovery.js first.');
  process.exit(1);
}

// Load existing APIs
if (fs.existsSync(existingAPIsPath)) {
  try {
    const content = fs.readFileSync(existingAPIsPath, 'utf8');
    existingAPIs = JSON.parse(content);
    console.log(`📦 Loaded ${existingAPIs.length} existing APIs`);
  } catch (error) {
    console.error('❌ Error loading existing APIs:', error.message);
    process.exit(1);
  }
}

// Convert discovered API to standard format
function convertToStandardFormat(discoveredAPI) {
  // Handle undefined or null values
  if (!discoveredAPI || !discoveredAPI.name) {
    throw new Error('Invalid API data: missing name');
  }
  
  return {
    id: generateId(discoveredAPI.name),
    name: discoveredAPI.name,
    description: discoveredAPI.description || 'No description available',
    url: discoveredAPI.url || discoveredAPI.homepage || '',
    category: discoveredAPI.category || 'Web',
    auth: discoveredAPI.auth || 'none',
    https: discoveredAPI.https || true,
    cors: discoveredAPI.cors || 'unknown',
    status: 'active',
    popularity: calculatePopularity(discoveredAPI),
    documentation: discoveredAPI.url || '',
    examples: generateExamples(discoveredAPI),
    tags: generateTags(discoveredAPI),
    source: discoveredAPI.source || 'discovered',
    added: discoveredAPI.added || new Date().toISOString(),
    lastChecked: new Date().toISOString()
  };
}

// Generate unique ID
function generateId(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Calculate popularity score
function calculatePopularity(api) {
  let score = 0;
  
  // GitHub stars
  if (api.stars) {
    score += Math.min(api.stars / 100, 10);
  }
  
  // Forks
  if (api.forks) {
    score += Math.min(api.forks / 50, 5);
  }
  
  // HTTPS support
  if (api.https) {
    score += 2;
  }
  
  // CORS support
  if (api.cors === 'yes') {
    score += 1;
  }
  
  // Auth method
  if (api.auth && api.auth !== 'none') {
    score += 1;
  }
  
  return Math.min(Math.round(score), 10);
}

// Generate examples
function generateExamples(api) {
  const examples = [];
  
  // Basic GET example
  examples.push({
    method: 'GET',
    endpoint: `${api.url}/api/v1/example`,
    description: 'Basic API call example',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // Add auth example if needed
  if (api.auth && api.auth !== 'none') {
    examples.push({
      method: 'GET',
      endpoint: `${api.url}/api/v1/authenticated`,
      description: 'Authenticated API call',
      headers: {
        'Authorization': `Bearer YOUR_API_KEY`,
        'Content-Type': 'application/json'
      }
    });
  }
  
  return examples;
}

// Generate tags
function generateTags(api) {
  const tags = [api.category.toLowerCase()];
  
  if (api.language) {
    tags.push(api.language.toLowerCase());
  }
  
  if (api.https) {
    tags.push('https');
  }
  
  if (api.cors === 'yes') {
    tags.push('cors');
  }
  
  if (api.auth && api.auth !== 'none') {
    tags.push('auth');
  }
  
  // Add source tag
  tags.push(api.source);
  
  return [...new Set(tags)]; // Remove duplicates
}

// Check if API already exists
function apiExists(newAPI, existingAPIs) {
  return existingAPIs.some(existing => 
    existing.name.toLowerCase() === newAPI.name.toLowerCase() ||
    existing.id === newAPI.id
  );
}

// Import process
async function importDiscoveredAPIs() {
  console.log('🔄 Starting import process...\n');
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const discoveredAPI of discoveredAPIs) {
    try {
      const standardAPI = convertToStandardFormat(discoveredAPI);
      
      if (apiExists(standardAPI, existingAPIs)) {
        console.log(`⏭️  Skipped: ${standardAPI.name} (already exists)`);
        skipped++;
        continue;
      }
      
      existingAPIs.push(standardAPI);
      console.log(`✅ Imported: ${standardAPI.name} (${standardAPI.category})`);
      imported++;
      
    } catch (error) {
      console.error(`❌ Error importing ${discoveredAPI.name}:`, error.message);
      errors++;
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
  
  // Print summary
  console.log('\n📊 Import Summary:');
  console.log(`✅ Imported: ${imported}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📦 Total APIs: ${existingAPIs.length}`);
  
  // Clean up discovered APIs file
  try {
    fs.unlinkSync(discoveredAPIsPath);
    console.log('\n🧹 Cleaned up discovered-apis.json');
  } catch (error) {
    console.log('⚠️  Could not clean up discovered-apis.json');
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Review imported APIs in src/data/apis.json');
  console.log('2. Test API endpoints for validity');
  console.log('3. Update API health monitoring');
  console.log('4. Deploy updated API directory');
  
  return {
    imported,
    skipped,
    errors,
    total: existingAPIs.length
  };
}

// Run import
if (require.main === module) {
  importDiscoveredAPIs().catch(console.error);
}

module.exports = importDiscoveredAPIs;
