#!/usr/bin/env node

const cron = require('node-cron');
const InfiniteAPIDiscovery = require('./infinite-api-discovery');
const importDiscoveredAPIs = require('./import-discovered-apis');

console.log('🤖 Automated API Discovery System Starting...\n');

class AutomatedAPIDiscovery {
  constructor() {
    this.discovery = new InfiniteAPIDiscovery();
    this.isRunning = false;
    this.stats = {
      totalRuns: 0,
      totalAPIs: 0,
      lastRun: null,
      errors: 0
    };
  }
  
  // Run discovery and import process
  async runDiscoveryCycle() {
    if (this.isRunning) {
      console.log('⏭️  Discovery already running, skipping...');
      return;
    }
    
    this.isRunning = true;
    const startTime = new Date();
    
    try {
      console.log(`\n🚀 Starting discovery cycle at ${startTime.toISOString()}`);
      
      // Run discovery
      const discoveryStats = await this.discovery.runInfiniteDiscovery();
      
      // Import discovered APIs
      const importStats = await importDiscoveredAPIs();
      
      // Update stats
      this.stats.totalRuns++;
      this.stats.totalAPIs = importStats.total;
      this.stats.lastRun = startTime.toISOString();
      
      console.log('\n✅ Discovery cycle completed successfully!');
      console.log(`📊 Cycle Stats: ${discoveryStats.totalDiscovered} discovered, ${importStats.imported} imported`);
      
    } catch (error) {
      console.error('❌ Error in discovery cycle:', error.message);
      this.stats.errors++;
    } finally {
      this.isRunning = false;
    }
  }
  
  // Start automated discovery
  startAutomatedDiscovery() {
    console.log('🤖 Starting automated API discovery...');
    
    // Run immediately
    this.runDiscoveryCycle();
    
    // Schedule every 6 hours
    cron.schedule('0 */6 * * *', () => {
      console.log('\n⏰ Scheduled discovery cycle starting...');
      this.runDiscoveryCycle();
    });
    
    // Schedule daily at 2 AM
    cron.schedule('0 2 * * *', () => {
      console.log('\n🌙 Daily discovery cycle starting...');
      this.runDiscoveryCycle();
    });
    
    // Schedule weekly on Sunday at 3 AM
    cron.schedule('0 3 * * 0', () => {
      console.log('\n📅 Weekly discovery cycle starting...');
      this.runDiscoveryCycle();
    });
    
    console.log('✅ Automated discovery scheduled:');
    console.log('  - Every 6 hours');
    console.log('  - Daily at 2 AM');
    console.log('  - Weekly on Sunday at 3 AM');
  }
  
  // Get current stats
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      uptime: process.uptime()
    };
  }
  
  // Stop automated discovery
  stop() {
    console.log('🛑 Stopping automated discovery...');
    cron.getTasks().forEach(task => task.destroy());
    console.log('✅ Automated discovery stopped');
  }
}

// CLI interface
if (require.main === module) {
  const automatedDiscovery = new AutomatedAPIDiscovery();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      automatedDiscovery.startAutomatedDiscovery();
      break;
      
    case 'run':
      automatedDiscovery.runDiscoveryCycle().then(() => {
        console.log('✅ Discovery cycle completed');
        process.exit(0);
      });
      break;
      
    case 'stats':
      console.log('📊 Discovery Stats:', automatedDiscovery.getStats());
      break;
      
    case 'stop':
      automatedDiscovery.stop();
      break;
      
    default:
      console.log('🤖 Automated API Discovery System');
      console.log('\nUsage:');
      console.log('  node automated-api-discovery.js start  - Start automated discovery');
      console.log('  node automated-api-discovery.js run    - Run single discovery cycle');
      console.log('  node automated-api-discovery.js stats  - Show current stats');
      console.log('  node automated-api-discovery.js stop   - Stop automated discovery');
      break;
  }
}

module.exports = AutomatedAPIDiscovery;
