#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Quick Start: Social Media Automation Setup\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# Social Media Automation
BUFFER_ACCESS_TOKEN=your_buffer_token_here
LINKEDIN_ACCESS_TOKEN=your_linkedin_token_here
TWITTER_BEARER_TOKEN=your_twitter_token_here
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here

# Analytics
GOOGLE_ANALYTICS_ID=G-Y1DM6G1JR1
GOOGLE_TAG_MANAGER_ID=your_gtm_id_here

# Content Management
CANVA_API_KEY=your_canva_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_key_here
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created!');
} else {
  console.log('✅ .env file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios dotenv', { stdio: 'inherit' });
    console.log('✅ Dependencies installed!');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
  }
} else {
  console.log('✅ Dependencies already installed');
}

// Test automation script
console.log('\n🧪 Testing automation script...');
try {
  const automationPath = path.join(__dirname, '..', 'automation', 'automation.js');
  if (fs.existsSync(automationPath)) {
    const { execSync } = require('child_process');
    execSync(`node ${automationPath}`, { stdio: 'inherit' });
    console.log('✅ Automation script working!');
  } else {
    console.log('❌ Automation script not found');
  }
} catch (error) {
  console.log('⚠️  Automation script test failed (this is normal if API keys are not set)');
}

// Display next steps
console.log('\n📋 Next Steps:');
console.log('1. Set up your API keys in the .env file');
console.log('2. Test individual platforms:');
console.log('   - node automation/post-linkedin.js');
console.log('   - node automation/post-twitter.js');
console.log('   - node automation/post-reddit.js');
console.log('3. Test all platforms: node automation/master-automation.js test');
console.log('4. Start daily posting: node automation/master-automation.js post monday');

console.log('\n🎯 API Keys Setup:');
console.log('📱 LinkedIn: https://developer.linkedin.com/');
console.log('🐦 Twitter: https://developer.twitter.com/');
console.log('🔴 Reddit: https://www.reddit.com/prefs/apps');

console.log('\n📚 Documentation:');
console.log('📖 API Keys Setup: API_KEYS_SETUP.md');
console.log('📖 Complete Setup: COMPLETE_SETUP_GUIDE.md');
console.log('📖 Platform Content: ADDITIONAL_PLATFORM_CONTENT.md');

console.log('\n🚀 Ready to automate your content marketing!');
