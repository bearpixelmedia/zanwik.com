#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🚀 Infinite API Discovery System Starting...\n');

// API Discovery Sources
const DISCOVERY_SOURCES = {
  // GitHub Repositories
  github: {
    name: 'GitHub API Repositories',
    searchQueries: [
      'api documentation',
      'rest api',
      'graphql api',
      'webhook api',
      'public api',
      'open api',
      'swagger api',
      'developer api',
      'api endpoint',
      'api service'
    ],
    baseUrl: 'https://api.github.com/search/repositories',
    rateLimit: 30 // requests per minute
  },
  
  // ProgrammableWeb API Directory
  programmableweb: {
    name: 'ProgrammableWeb API Directory',
    baseUrl: 'https://www.programmableweb.com/api',
    rateLimit: 60
  },
  
  // RapidAPI Hub
  rapidapi: {
    name: 'RapidAPI Hub',
    baseUrl: 'https://rapidapi.com/hub',
    rateLimit: 100
  },
  
  // API List
  apilist: {
    name: 'API List',
    baseUrl: 'https://api.apilist.fun',
    rateLimit: 100
  },
  
  // Public APIs
  publicapis: {
    name: 'PublicAPIs.dev',
    baseUrl: 'https://api.publicapis.dev/entries',
    rateLimit: 100
  },
  
  // Free Public APIs
  freepublicapis: {
    name: 'FreePublicAPIs.com',
    baseUrl: 'https://www.freepublicapis.com/api/apis',
    rateLimit: 100
  },
  
  // API Directory
  apidirectory: {
    name: 'API Directory',
    baseUrl: 'https://api.apidirectory.com',
    rateLimit: 100
  },
  
  // OpenAPI Directory
  openapi: {
    name: 'OpenAPI Directory',
    baseUrl: 'https://api.openapi.com',
    rateLimit: 100
  }
};

// Categories for API classification
const API_CATEGORIES = [
  'Business', 'Communication', 'Data', 'Development', 'Finance',
  'Food', 'Games', 'Health', 'Location', 'Music', 'News',
  'Open Data', 'Science', 'Security', 'Social', 'Sports',
  'Transportation', 'Travel', 'Weather', 'Web', 'AI/ML',
  'Blockchain', 'IoT', 'Analytics', 'E-commerce', 'Education',
  'Entertainment', 'Government', 'Media', 'Productivity', 'Real Estate'
];

// Rate limiting helper
class RateLimiter {
  constructor(requestsPerMinute) {
    this.requestsPerMinute = requestsPerMinute;
    this.requests = [];
  }
  
  async waitIfNeeded() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    
    if (this.requests.length >= this.requestsPerMinute) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = 60000 - (now - oldestRequest) + 1000; // Add 1 second buffer
      console.log(`⏳ Rate limit reached, waiting ${Math.ceil(waitTime/1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}

// API Discovery Engine
class InfiniteAPIDiscovery {
  constructor() {
    this.discoveredAPIs = new Set();
    this.rateLimiters = {};
    this.stats = {
      totalDiscovered: 0,
      newAPIs: 0,
      duplicates: 0,
      errors: 0,
      sources: {}
    };
    
    // Initialize rate limiters
    Object.keys(DISCOVERY_SOURCES).forEach(source => {
      this.rateLimiters[source] = new RateLimiter(DISCOVERY_SOURCES[source].rateLimit);
    });
  }
  
  // Discover APIs from GitHub
  async discoverFromGitHub() {
    console.log('🔍 Discovering APIs from GitHub...');
    const source = DISCOVERY_SOURCES.github;
    const rateLimiter = this.rateLimiters.github;
    
    for (const query of source.searchQueries) {
      try {
        await rateLimiter.waitIfNeeded();
        
        const response = await axios.get(source.baseUrl, {
          params: {
            q: `${query} language:javascript OR language:python OR language:go OR language:java`,
            sort: 'stars',
            order: 'desc',
            per_page: 100
          },
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Zanwik-API-Discovery/1.0'
          },
          timeout: 10000
        });
        
        const repos = response.data.items || [];
        console.log(`📦 Found ${repos.length} repositories for query: "${query}"`);
        
        for (const repo of repos) {
          await this.processGitHubRepository(repo);
        }
        
        this.stats.sources.github = (this.stats.sources.github || 0) + repos.length;
        
      } catch (error) {
        console.error(`❌ Error searching GitHub for "${query}":`, error.message);
        this.stats.errors++;
      }
    }
  }
  
  // Process GitHub repository for API information
  async processGitHubRepository(repo) {
    try {
      // Check if repository has API-related files
      const apiFiles = await this.findAPIFilesInRepo(repo);
      
      if (apiFiles.length > 0) {
        const apiData = {
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          homepage: repo.homepage,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updated: repo.updated_at,
          apiFiles: apiFiles,
          source: 'github',
          category: this.categorizeAPI(repo.name, repo.description)
        };
        
        await this.addAPI(apiData);
      }
    } catch (error) {
      console.error(`❌ Error processing repository ${repo.name}:`, error.message);
      this.stats.errors++;
    }
  }
  
  // Find API-related files in repository
  async findAPIFilesInRepo(repo) {
    const apiFiles = [];
    const apiFilePatterns = [
      'api.json', 'swagger.json', 'openapi.json', 'api.yaml', 'swagger.yaml',
      'openapi.yaml', 'api.yml', 'swagger.yml', 'openapi.yml',
      'README.md', 'API.md', 'docs/api.md', 'api-docs.md'
    ];
    
    try {
      const response = await axios.get(`https://api.github.com/repos/${repo.full_name}/contents`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Zanwik-API-Discovery/1.0'
        }
      });
      
      const files = response.data || [];
      
      for (const file of files) {
        if (apiFilePatterns.some(pattern => file.name.toLowerCase().includes(pattern))) {
          apiFiles.push({
            name: file.name,
            path: file.path,
            url: file.download_url,
            size: file.size
          });
        }
      }
    } catch (error) {
      // Repository might be private or have no API files
    }
    
    return apiFiles;
  }
  
  // Discover APIs from PublicAPIs.dev
  async discoverFromPublicAPIs() {
    console.log('🔍 Discovering APIs from PublicAPIs.dev...');
    const source = DISCOVERY_SOURCES.publicapis;
    const rateLimiter = this.rateLimiters.publicapis;
    
    try {
      await rateLimiter.waitIfNeeded();
      
      const response = await axios.get(source.baseUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Zanwik-API-Discovery/1.0'
        }
      });
      const apis = response.data.entries || response.data || [];
      
      console.log(`📦 Found ${apis.length} APIs from PublicAPIs.dev`);
      
      for (const api of apis) {
        const apiData = {
          name: api.API || api.name,
          description: api.Description || api.description,
          url: api.Link || api.url,
          category: api.Category || this.categorizeAPI(api.API || api.name, api.Description || api.description),
          auth: api.Auth || api.auth,
          https: api.HTTPS || api.https,
          cors: api.Cors || api.cors,
          source: 'publicapis',
          added: new Date().toISOString()
        };
        
        await this.addAPI(apiData);
      }
      
      this.stats.sources.publicapis = apis.length;
      
    } catch (error) {
      console.error('❌ Error discovering from PublicAPIs.dev:', error.message);
      this.stats.errors++;
    }
  }
  
  // Discover APIs from FreePublicAPIs.com
  async discoverFromFreePublicAPIs() {
    console.log('🔍 Discovering APIs from FreePublicAPIs.com...');
    const source = DISCOVERY_SOURCES.freepublicapis;
    const rateLimiter = this.rateLimiters.freepublicapis;
    
    try {
      await rateLimiter.waitIfNeeded();
      
      const response = await axios.get(source.baseUrl);
      const apis = response.data || [];
      
      console.log(`📦 Found ${apis.length} APIs from FreePublicAPIs.com`);
      
      for (const api of apis) {
        const apiData = {
          name: api.name,
          description: api.description,
          url: api.url,
          category: this.categorizeAPI(api.name, api.description),
          source: 'freepublicapis',
          added: new Date().toISOString()
        };
        
        await this.addAPI(apiData);
      }
      
      this.stats.sources.freepublicapis = apis.length;
      
    } catch (error) {
      console.error('❌ Error discovering from FreePublicAPIs.com:', error.message);
      this.stats.errors++;
    }
  }
  
  // Categorize API based on name and description
  categorizeAPI(name, description) {
    const text = `${name} ${description}`.toLowerCase();
    
    for (const category of API_CATEGORIES) {
      const categoryKeywords = this.getCategoryKeywords(category);
      if (categoryKeywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    
    return 'Web'; // Default category
  }
  
  // Get keywords for category classification
  getCategoryKeywords(category) {
    const keywords = {
      'Business': ['business', 'crm', 'sales', 'marketing', 'customer', 'lead'],
      'Communication': ['email', 'sms', 'chat', 'message', 'notification', 'voice'],
      'Data': ['data', 'database', 'storage', 'analytics', 'metrics', 'stats'],
      'Development': ['developer', 'code', 'git', 'deploy', 'build', 'ci/cd'],
      'Finance': ['payment', 'billing', 'invoice', 'tax', 'currency', 'banking'],
      'Food': ['food', 'recipe', 'restaurant', 'nutrition', 'cooking', 'meal'],
      'Games': ['game', 'gaming', 'score', 'leaderboard', 'player', 'tournament'],
      'Health': ['health', 'medical', 'fitness', 'wellness', 'doctor', 'hospital'],
      'Location': ['location', 'map', 'geocoding', 'address', 'coordinates', 'gps'],
      'Music': ['music', 'audio', 'song', 'artist', 'album', 'playlist'],
      'News': ['news', 'article', 'blog', 'rss', 'feed', 'headline'],
      'Open Data': ['open data', 'government', 'public', 'census', 'statistics'],
      'Science': ['science', 'research', 'study', 'experiment', 'lab', 'academic'],
      'Security': ['security', 'auth', 'encryption', 'password', 'token', 'oauth'],
      'Social': ['social', 'facebook', 'twitter', 'instagram', 'linkedin', 'social media'],
      'Sports': ['sport', 'football', 'basketball', 'soccer', 'baseball', 'tennis'],
      'Transportation': ['transport', 'uber', 'lyft', 'flight', 'train', 'bus'],
      'Travel': ['travel', 'hotel', 'booking', 'trip', 'vacation', 'tourism'],
      'Weather': ['weather', 'forecast', 'temperature', 'climate', 'rain', 'sunny'],
      'Web': ['web', 'http', 'api', 'rest', 'graphql', 'endpoint'],
      'AI/ML': ['ai', 'machine learning', 'neural', 'deep learning', 'nlp', 'computer vision'],
      'Blockchain': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'nft', 'defi'],
      'IoT': ['iot', 'internet of things', 'sensor', 'device', 'smart', 'connected'],
      'Analytics': ['analytics', 'tracking', 'metrics', 'dashboard', 'report', 'insights'],
      'E-commerce': ['ecommerce', 'shop', 'store', 'product', 'inventory', 'order'],
      'Education': ['education', 'learning', 'course', 'student', 'teacher', 'school'],
      'Entertainment': ['entertainment', 'movie', 'tv', 'streaming', 'video', 'content'],
      'Government': ['government', 'public', 'official', 'agency', 'federal', 'state'],
      'Media': ['media', 'image', 'video', 'photo', 'gif', 'multimedia'],
      'Productivity': ['productivity', 'task', 'todo', 'calendar', 'note', 'document'],
      'Real Estate': ['real estate', 'property', 'house', 'apartment', 'rent', 'sale']
    };
    
    return keywords[category] || [];
  }
  
  // Add API to collection
  async addAPI(apiData) {
    const apiKey = `${apiData.name}-${apiData.source}`.toLowerCase();
    
    if (this.discoveredAPIs.has(apiKey)) {
      this.stats.duplicates++;
      return;
    }
    
    this.discoveredAPIs.add(apiKey);
    this.stats.totalDiscovered++;
    this.stats.newAPIs++;
    
    // Save to file
    await this.saveAPIToFile(apiData);
    
    console.log(`✅ Added: ${apiData.name} (${apiData.category})`);
  }
  
  // Save API to file
  async saveAPIToFile(apiData) {
    const filePath = path.join(__dirname, '..', 'src', 'data', 'discovered-apis.json');
    
    let apis = [];
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        apis = JSON.parse(content);
      } catch (error) {
        console.error('❌ Error reading existing APIs file:', error.message);
      }
    }
    
    apis.push(apiData);
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(apis, null, 2));
    } catch (error) {
      console.error('❌ Error saving API to file:', error.message);
    }
  }
  
  // Run infinite discovery
  async runInfiniteDiscovery() {
    console.log('🚀 Starting Infinite API Discovery...\n');
    
    const startTime = Date.now();
    
    // Discover from all sources
    await this.discoverFromPublicAPIs();
    await this.discoverFromFreePublicAPIs();
    await this.discoverFromGitHub();
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    // Print statistics
    console.log('\n📊 Discovery Statistics:');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`🔍 Total Discovered: ${this.stats.totalDiscovered}`);
    console.log(`🆕 New APIs: ${this.stats.newAPIs}`);
    console.log(`🔄 Duplicates: ${this.stats.duplicates}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    
    console.log('\n📈 Sources:');
    Object.entries(this.stats.sources).forEach(([source, count]) => {
      console.log(`  ${source}: ${count} APIs`);
    });
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Review discovered APIs in src/data/discovered-apis.json');
    console.log('2. Run: node scripts/import-discovered-apis.js');
    console.log('3. Set up automated discovery with cron job');
    console.log('4. Monitor API health and update regularly');
    
    return this.stats;
  }
}

// Run the discovery
if (require.main === module) {
  const discovery = new InfiniteAPIDiscovery();
  discovery.runInfiniteDiscovery().catch(console.error);
}

module.exports = InfiniteAPIDiscovery;
