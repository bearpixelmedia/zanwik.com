#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🏥 API Health Monitor Starting...\n');

class APIHealthMonitor {
  constructor() {
    this.apisPath = path.join(__dirname, '..', 'src', 'data', 'apis.json');
    this.healthPath = path.join(__dirname, '..', 'src', 'data', 'api-health.json');
    this.apis = [];
    this.healthData = {};
    this.stats = {
      total: 0,
      healthy: 0,
      unhealthy: 0,
      unknown: 0,
      errors: 0
    };
  }
  
  // Load APIs
  loadAPIs() {
    try {
      if (fs.existsSync(this.apisPath)) {
        const content = fs.readFileSync(this.apisPath, 'utf8');
        this.apis = JSON.parse(content);
        console.log(`📦 Loaded ${this.apis.length} APIs for health monitoring`);
      } else {
        console.log('❌ No APIs file found');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error loading APIs:', error.message);
      process.exit(1);
    }
  }
  
  // Load existing health data
  loadHealthData() {
    try {
      if (fs.existsSync(this.healthPath)) {
        const content = fs.readFileSync(this.healthPath, 'utf8');
        this.healthData = JSON.parse(content);
        console.log(`📊 Loaded existing health data for ${Object.keys(this.healthData).length} APIs`);
      }
    } catch (error) {
      console.log('⚠️  No existing health data found, starting fresh');
    }
  }
  
  // Check API health
  async checkAPIHealth(api) {
    const startTime = Date.now();
    const healthRecord = {
      id: api.id,
      name: api.name,
      url: api.url,
      lastChecked: new Date().toISOString(),
      status: 'unknown',
      responseTime: 0,
      statusCode: null,
      error: null,
      uptime: 0,
      checks: []
    };
    
    try {
      // Test basic connectivity
      const response = await axios.get(api.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Zanwik-API-Health-Monitor/1.0'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      healthRecord.status = 'healthy';
      healthRecord.responseTime = responseTime;
      healthRecord.statusCode = response.status;
      healthRecord.uptime = this.calculateUptime(api.id, true);
      
      console.log(`✅ ${api.name}: ${responseTime}ms (${response.status})`);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      healthRecord.status = 'unhealthy';
      healthRecord.responseTime = responseTime;
      healthRecord.statusCode = error.response?.status || null;
      healthRecord.error = error.message;
      healthRecord.uptime = this.calculateUptime(api.id, false);
      
      console.log(`❌ ${api.name}: ${error.message}`);
    }
    
    // Test API endpoints if available
    if (api.examples && api.examples.length > 0) {
      for (const example of api.examples.slice(0, 2)) { // Test first 2 examples
        try {
          const exampleResponse = await axios({
            method: example.method,
            url: example.endpoint,
            headers: example.headers || {},
            timeout: 5000
          });
          
          healthRecord.checks.push({
            endpoint: example.endpoint,
            method: example.method,
            status: 'success',
            responseTime: Date.now() - startTime,
            statusCode: exampleResponse.status
          });
          
        } catch (error) {
          healthRecord.checks.push({
            endpoint: example.endpoint,
            method: example.method,
            status: 'failed',
            error: error.message
          });
        }
      }
    }
    
    return healthRecord;
  }
  
  // Calculate uptime percentage
  calculateUptime(apiId, isHealthy) {
    const existingHealth = this.healthData[apiId];
    if (!existingHealth) {
      return isHealthy ? 100 : 0;
    }
    
    const totalChecks = (existingHealth.totalChecks || 0) + 1;
    const healthyChecks = (existingHealth.healthyChecks || 0) + (isHealthy ? 1 : 0);
    
    return Math.round((healthyChecks / totalChecks) * 100);
  }
  
  // Monitor all APIs
  async monitorAllAPIs() {
    console.log('🏥 Starting health monitoring...\n');
    
    const batchSize = 10; // Process in batches to avoid overwhelming servers
    const batches = [];
    
    for (let i = 0; i < this.apis.length; i += batchSize) {
      batches.push(this.apis.slice(i, i + batchSize));
    }
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\n📦 Processing batch ${i + 1}/${batches.length} (${batch.length} APIs)`);
      
      const promises = batch.map(api => this.checkAPIHealth(api));
      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const healthRecord = result.value;
          this.healthData[healthRecord.id] = healthRecord;
          
          // Update stats
          this.stats.total++;
          if (healthRecord.status === 'healthy') {
            this.stats.healthy++;
          } else if (healthRecord.status === 'unhealthy') {
            this.stats.unhealthy++;
          } else {
            this.stats.unknown++;
          }
        } else {
          console.error(`❌ Error checking ${batch[index].name}:`, result.reason);
          this.stats.errors++;
        }
      });
      
      // Wait between batches to be respectful
      if (i < batches.length - 1) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  // Save health data
  saveHealthData() {
    try {
      fs.writeFileSync(this.healthPath, JSON.stringify(this.healthData, null, 2));
      console.log(`\n💾 Saved health data for ${Object.keys(this.healthData).length} APIs`);
    } catch (error) {
      console.error('❌ Error saving health data:', error.message);
    }
  }
  
  // Generate health report
  generateHealthReport() {
    console.log('\n📊 Health Monitoring Report:');
    console.log(`📦 Total APIs: ${this.stats.total}`);
    console.log(`✅ Healthy: ${this.stats.healthy}`);
    console.log(`❌ Unhealthy: ${this.stats.unhealthy}`);
    console.log(`❓ Unknown: ${this.stats.unknown}`);
    console.log(`⚠️  Errors: ${this.stats.errors}`);
    
    const healthPercentage = this.stats.total > 0 ? 
      Math.round((this.stats.healthy / this.stats.total) * 100) : 0;
    console.log(`📈 Overall Health: ${healthPercentage}%`);
    
    // Show top performing APIs
    const healthyAPIs = Object.values(this.healthData)
      .filter(api => api.status === 'healthy')
      .sort((a, b) => b.uptime - a.uptime)
      .slice(0, 5);
    
    if (healthyAPIs.length > 0) {
      console.log('\n🏆 Top Performing APIs:');
      healthyAPIs.forEach((api, index) => {
        console.log(`  ${index + 1}. ${api.name} - ${api.uptime}% uptime`);
      });
    }
    
    // Show problematic APIs
    const unhealthyAPIs = Object.values(this.healthData)
      .filter(api => api.status === 'unhealthy')
      .sort((a, b) => a.uptime - b.uptime)
      .slice(0, 5);
    
    if (unhealthyAPIs.length > 0) {
      console.log('\n⚠️  APIs Needing Attention:');
      unhealthyAPIs.forEach((api, index) => {
        console.log(`  ${index + 1}. ${api.name} - ${api.uptime}% uptime (${api.error})`);
      });
    }
  }
  
  // Run health monitoring
  async run() {
    this.loadAPIs();
    this.loadHealthData();
    await this.monitorAllAPIs();
    this.saveHealthData();
    this.generateHealthReport();
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new APIHealthMonitor();
  monitor.run().catch(console.error);
}

module.exports = APIHealthMonitor;
