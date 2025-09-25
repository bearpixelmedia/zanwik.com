#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('🚀 Infinite API Manager Starting...\n');

class InfiniteAPIManager {
  constructor() {
    this.apisPath = path.join(__dirname, '..', 'src', 'data', 'apis.json');
    this.apisData = null;
    this.stats = {
      totalAPIs: 0,
      newAPIs: 0,
      updatedAPIs: 0,
      errors: 0
    };
  }
  
  // Load existing APIs data
  loadAPIsData() {
    try {
      if (fs.existsSync(this.apisPath)) {
        const content = fs.readFileSync(this.apisPath, 'utf8');
        this.apisData = JSON.parse(content);
        
        // Convert apis object to array if needed
        if (this.apisData.apis && typeof this.apisData.apis === 'object' && !Array.isArray(this.apisData.apis)) {
          this.apisData.apis = Object.values(this.apisData.apis);
        } else if (!this.apisData.apis) {
          this.apisData.apis = [];
        }
        
        this.stats.totalAPIs = this.apisData.apis.length;
        console.log(`📦 Loaded ${this.stats.totalAPIs} existing APIs`);
      } else {
        console.log('❌ No APIs file found');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error loading APIs:', error.message);
      process.exit(1);
    }
  }
  
  // Add new API to the collection
  addAPI(apiData) {
    if (!this.apisData.apis) {
      this.apisData.apis = [];
    }
    
    // Check if API already exists
    const existingIndex = this.apisData.apis.findIndex(api => 
      api.name.toLowerCase() === apiData.name.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // Update existing API
      this.apisData.apis[existingIndex] = {
        ...this.apisData.apis[existingIndex],
        ...apiData,
        lastUpdated: new Date().toISOString()
      };
      this.stats.updatedAPIs++;
      console.log(`🔄 Updated: ${apiData.name}`);
    } else {
      // Add new API
      this.apisData.apis.push({
        ...apiData,
        id: this.generateId(apiData.name),
        added: new Date().toISOString(),
        lastChecked: new Date().toISOString()
      });
      this.stats.newAPIs++;
      console.log(`✅ Added: ${apiData.name} (${apiData.category})`);
    }
  }
  
  // Generate unique ID
  generateId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Discover APIs from multiple sources
  async discoverAPIs() {
    console.log('🔍 Starting API discovery...\n');
    
    // Discover from PublicAPIs.dev
    await this.discoverFromPublicAPIs();
    
    // Discover from GitHub
    await this.discoverFromGitHub();
    
    // Add some popular APIs manually
    await this.addPopularAPIs();
    
    console.log('\n📊 Discovery completed!');
  }
  
  // Discover from PublicAPIs.dev
  async discoverFromPublicAPIs() {
    console.log('🔍 Discovering from PublicAPIs.dev...');
    
    try {
      const response = await axios.get('https://api.publicapis.dev/entries', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Zanwik-API-Manager/1.0'
        }
      });
      
      const apis = response.data.entries || [];
      console.log(`📦 Found ${apis.length} APIs from PublicAPIs.dev`);
      
      for (const api of apis.slice(0, 50)) { // Limit to first 50 for testing
        const apiData = {
          name: api.API || 'Unknown API',
          description: api.Description || 'No description available',
          url: api.Link || '',
          category: this.categorizeAPI(api.API, api.Description),
          auth: api.Auth || 'none',
          https: api.HTTPS || true,
          cors: api.Cors || 'unknown',
          source: 'publicapis'
        };
        
        this.addAPI(apiData);
      }
      
    } catch (error) {
      console.error('❌ Error discovering from PublicAPIs.dev:', error.message);
      this.stats.errors++;
    }
  }
  
  // Discover from GitHub
  async discoverFromGitHub() {
    console.log('🔍 Discovering from GitHub...');
    
    const queries = [
      'api documentation',
      'rest api',
      'graphql api',
      'webhook api',
      'public api'
    ];
    
    for (const query of queries) {
      try {
        const response = await axios.get('https://api.github.com/search/repositories', {
          params: {
            q: `${query} language:javascript OR language:python`,
            sort: 'stars',
            order: 'desc',
            per_page: 20
          },
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Zanwik-API-Manager/1.0'
          },
          timeout: 10000
        });
        
        const repos = response.data.items || [];
        console.log(`📦 Found ${repos.length} repositories for query: "${query}"`);
        
        for (const repo of repos) {
          const apiData = {
            name: repo.name,
            description: repo.description || 'No description available',
            url: repo.html_url,
            category: this.categorizeAPI(repo.name, repo.description),
            auth: 'none',
            https: true,
            cors: 'unknown',
            source: 'github',
            stars: repo.stargazers_count,
            language: repo.language
          };
          
          this.addAPI(apiData);
        }
        
        // Wait between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error searching GitHub for "${query}":`, error.message);
        this.stats.errors++;
      }
    }
  }
  
  // Add popular APIs manually
  async addPopularAPIs() {
    console.log('🔍 Adding popular APIs...');
    
    const popularAPIs = [
      {
        name: 'OpenAI API',
        description: 'Artificial Intelligence API for text generation, image creation, and more',
        url: 'https://platform.openai.com/docs/api-reference',
        category: 'AI/ML',
        auth: 'api-key',
        https: true,
        cors: 'yes',
        source: 'manual'
      },
      {
        name: 'Stripe API',
        description: 'Payment processing API for online businesses',
        url: 'https://stripe.com/docs/api',
        category: 'Finance',
        auth: 'api-key',
        https: true,
        cors: 'yes',
        source: 'manual'
      },
      {
        name: 'Twilio API',
        description: 'Communication API for SMS, voice, and video',
        url: 'https://www.twilio.com/docs/api',
        category: 'Communication',
        auth: 'api-key',
        https: true,
        cors: 'yes',
        source: 'manual'
      },
      {
        name: 'SendGrid API',
        description: 'Email delivery API for transactional and marketing emails',
        url: 'https://docs.sendgrid.com/api-reference',
        category: 'Communication',
        auth: 'api-key',
        https: true,
        cors: 'yes',
        source: 'manual'
      },
      {
        name: 'AWS API',
        description: 'Amazon Web Services API for cloud computing',
        url: 'https://docs.aws.amazon.com/api/',
        category: 'Development',
        auth: 'api-key',
        https: true,
        cors: 'yes',
        source: 'manual'
      }
    ];
    
    for (const api of popularAPIs) {
      this.addAPI(api);
    }
  }
  
  // Categorize API
  categorizeAPI(name, description) {
    const text = `${name} ${description}`.toLowerCase();
    
    const categories = {
      'AI/ML': ['ai', 'machine learning', 'neural', 'deep learning', 'nlp', 'computer vision'],
      'Business': ['business', 'crm', 'sales', 'marketing', 'customer', 'lead'],
      'Communication': ['email', 'sms', 'chat', 'message', 'notification', 'voice'],
      'Data': ['data', 'database', 'storage', 'analytics', 'metrics', 'stats'],
      'Development': ['developer', 'code', 'git', 'deploy', 'build', 'ci/cd'],
      'Finance': ['payment', 'billing', 'invoice', 'tax', 'currency', 'banking'],
      'Health': ['health', 'medical', 'fitness', 'wellness', 'doctor', 'hospital'],
      'Location': ['location', 'map', 'geocoding', 'address', 'coordinates', 'gps'],
      'Music': ['music', 'audio', 'song', 'artist', 'album', 'playlist'],
      'News': ['news', 'article', 'blog', 'rss', 'feed', 'headline'],
      'Security': ['security', 'auth', 'encryption', 'password', 'token', 'oauth'],
      'Social': ['social', 'facebook', 'twitter', 'instagram', 'linkedin', 'social media'],
      'Sports': ['sport', 'football', 'basketball', 'soccer', 'baseball', 'tennis'],
      'Travel': ['travel', 'hotel', 'booking', 'trip', 'vacation', 'tourism'],
      'Weather': ['weather', 'forecast', 'temperature', 'climate', 'rain', 'sunny'],
      'Web': ['web', 'http', 'api', 'rest', 'graphql', 'endpoint']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    
    return 'Web';
  }
  
  // Save updated APIs data
  saveAPIsData() {
    try {
      // Update total count
      this.stats.totalAPIs = this.apisData.apis ? this.apisData.apis.length : 0;
      
      // Update category counts
      if (this.apisData.categories) {
        for (const category of Object.values(this.apisData.categories)) {
          category.count = this.apisData.apis.filter(api => 
            api.category.toLowerCase() === category.name.toLowerCase()
          ).length;
        }
      }
      
      fs.writeFileSync(this.apisPath, JSON.stringify(this.apisData, null, 2));
      console.log(`\n💾 Saved ${this.stats.totalAPIs} total APIs to apis.json`);
    } catch (error) {
      console.error('❌ Error saving APIs:', error.message);
    }
  }
  
  // Print statistics
  printStats() {
    console.log('\n📊 Infinite API Manager Statistics:');
    console.log(`📦 Total APIs: ${this.stats.totalAPIs}`);
    console.log(`🆕 New APIs: ${this.stats.newAPIs}`);
    console.log(`🔄 Updated APIs: ${this.stats.updatedAPIs}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    
    // Show category breakdown
    if (this.apisData.apis) {
      const categoryCounts = {};
      this.apisData.apis.forEach(api => {
        categoryCounts[api.category] = (categoryCounts[api.category] || 0) + 1;
      });
      
      console.log('\n📈 Category Breakdown:');
      Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
          console.log(`  ${category}: ${count} APIs`);
        });
    }
  }
  
  // Run the infinite API manager
  async run() {
    this.loadAPIsData();
    await this.discoverAPIs();
    this.saveAPIsData();
    this.printStats();
  }
}

// CLI interface
if (require.main === module) {
  const manager = new InfiniteAPIManager();
  manager.run().catch(console.error);
}

module.exports = InfiniteAPIManager;
