#!/usr/bin/env node

const cron = require('node-cron');
const InfiniteAPIManager = require('./infinite-api-manager');

console.log('🤖 Continuous API Discovery System Starting...\n');

class ContinuousAPIDiscovery {
  constructor() {
    this.manager = new InfiniteAPIManager();
    this.isRunning = false;
    this.stats = {
      totalRuns: 0,
      totalAPIs: 0,
      lastRun: null,
      errors: 0,
      startTime: new Date()
    };
  }
  
  // Run discovery cycle
  async runDiscoveryCycle() {
    if (this.isRunning) {
      console.log('⏭️  Discovery already running, skipping...');
      return;
    }
    
    this.isRunning = true;
    const startTime = new Date();
    
    try {
      console.log(`\n🚀 Starting discovery cycle at ${startTime.toISOString()}`);
      
      // Load and run discovery
      this.manager.loadAPIsData();
      await this.manager.discoverAPIs();
      this.manager.saveAPIsData();
      this.manager.printStats();
      
      // Update stats
      this.stats.totalRuns++;
      this.stats.totalAPIs = this.manager.stats.totalAPIs;
      this.stats.lastRun = startTime.toISOString();
      
      console.log('\n✅ Discovery cycle completed successfully!');
      console.log(`📊 Cycle Stats: ${this.manager.stats.newAPIs} new, ${this.manager.stats.updatedAPIs} updated`);
      
    } catch (error) {
      console.error('❌ Error in discovery cycle:', error.message);
      this.stats.errors++;
    } finally {
      this.isRunning = false;
    }
  }
  
  // Start continuous discovery
  startContinuousDiscovery() {
    console.log('🤖 Starting continuous API discovery...');
    
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
    
    console.log('✅ Continuous discovery scheduled:');
    console.log('  - Every 6 hours');
    console.log('  - Daily at 2 AM');
    console.log('  - Weekly on Sunday at 3 AM');
    console.log('\n🔄 Discovery system is now running continuously!');
  }
  
  // Get current stats
  getStats() {
    const uptime = Date.now() - this.stats.startTime.getTime();
    return {
      ...this.stats,
      isRunning: this.isRunning,
      uptime: Math.round(uptime / 1000 / 60), // minutes
      uptimeHours: Math.round(uptime / 1000 / 60 / 60) // hours
    };
  }
  
  // Stop continuous discovery
  stop() {
    console.log('🛑 Stopping continuous discovery...');
    cron.getTasks().forEach(task => task.destroy());
    console.log('✅ Continuous discovery stopped');
  }
}

// CLI interface
if (require.main === module) {
  const continuousDiscovery = new ContinuousAPIDiscovery();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      continuousDiscovery.startContinuousDiscovery();
      // Keep the process running
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down continuous discovery...');
        continuousDiscovery.stop();
        process.exit(0);
      });
      break;
      
    case 'run':
      continuousDiscovery.runDiscoveryCycle().then(() => {
        console.log('✅ Discovery cycle completed');
        process.exit(0);
      });
      break;
      
    case 'stats':
      console.log('📊 Discovery Stats:', continuousDiscovery.getStats());
      break;
      
    case 'stop':
      continuousDiscovery.stop();
      break;
      
    default:
      console.log('🤖 Continuous API Discovery System');
      console.log('\nUsage:');
      console.log('  node continuous-api-discovery.js start  - Start continuous discovery');
      console.log('  node continuous-api-discovery.js run    - Run single discovery cycle');
      console.log('  node continuous-api-discovery.js stats  - Show current stats');
      console.log('  node continuous-api-discovery.js stop   - Stop continuous discovery');
      break;
  }
}

module.exports = ContinuousAPIDiscovery;
