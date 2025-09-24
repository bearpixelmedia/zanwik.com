/**
 * API Health Monitoring Service
 * Monitors API status, response times, and availability
 */

const https = require('https');
const http = require('http');

class APIHealthService {
  constructor() {
    this.healthData = new Map();
    this.monitoringInterval = null;
    this.isMonitoring = false;
  }

  /**
   * Check health of a single API
   * @param {Object} api - API object with baseUrl and other properties
   * @returns {Promise<Object>} Health status object
   */
  async checkApiHealth(api) {
    const startTime = Date.now();
    const healthId = api.id || api.name;
    
    try {
      // Skip if no baseUrl
      if (!api.baseUrl || api.baseUrl === '') {
        return {
          id: healthId,
          status: 'unknown',
          responseTime: 0,
          lastChecked: new Date().toISOString(),
          error: 'No base URL provided'
        };
      }

      // Make health check request
      const response = await this.makeHealthRequest(api.baseUrl);
      const responseTime = Date.now() - startTime;
      
      const healthStatus = {
        id: healthId,
        status: response.status < 400 ? 'up' : 'down',
        responseTime: responseTime,
        statusCode: response.status,
        lastChecked: new Date().toISOString(),
        error: null
      };

      // Store health data
      this.healthData.set(healthId, healthStatus);
      
      return healthStatus;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const healthStatus = {
        id: healthId,
        status: 'down',
        responseTime: responseTime,
        lastChecked: new Date().toISOString(),
        error: error.message
      };

      this.healthData.set(healthId, healthStatus);
      return healthStatus;
    }
  }

  /**
   * Make HTTP/HTTPS request for health check
   * @param {string} url - URL to check
   * @returns {Promise<Object>} Response object
   */
  makeHealthRequest(url) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https://');
      const client = isHttps ? https : http;
      
      // Add timeout
      const timeout = 10000; // 10 seconds
      
      const req = client.get(url, {
        timeout: timeout,
        headers: {
          'User-Agent': 'Zanwik-Health-Check/1.0',
          'Accept': 'application/json, text/plain, */*'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  /**
   * Check health of multiple APIs
   * @param {Array} apis - Array of API objects
   * @returns {Promise<Array>} Array of health status objects
   */
  async checkMultipleApis(apis) {
    console.log(`🔍 Checking health of ${apis.length} APIs...`);
    
    const healthChecks = apis.map(api => this.checkApiHealth(api));
    const results = await Promise.allSettled(healthChecks);
    
    const healthStatuses = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          id: apis[index].id || apis[index].name,
          status: 'error',
          responseTime: 0,
          lastChecked: new Date().toISOString(),
          error: result.reason.message
        };
      }
    });

    return healthStatuses;
  }

  /**
   * Get health status for an API
   * @param {string} apiId - API ID
   * @returns {Object|null} Health status or null if not found
   */
  getApiHealth(apiId) {
    return this.healthData.get(apiId) || null;
  }

  /**
   * Get all health data
   * @returns {Object} All health data
   */
  getAllHealthData() {
    const healthData = {};
    this.healthData.forEach((value, key) => {
      healthData[key] = value;
    });
    return healthData;
  }

  /**
   * Get health statistics
   * @returns {Object} Health statistics
   */
  getHealthStats() {
    const allData = Array.from(this.healthData.values());
    const total = allData.length;
    const up = allData.filter(h => h.status === 'up').length;
    const down = allData.filter(h => h.status === 'down').length;
    const unknown = allData.filter(h => h.status === 'unknown').length;
    const error = allData.filter(h => h.status === 'error').length;
    
    const avgResponseTime = allData
      .filter(h => h.responseTime > 0)
      .reduce((sum, h) => sum + h.responseTime, 0) / 
      allData.filter(h => h.responseTime > 0).length || 0;

    return {
      total,
      up,
      down,
      unknown,
      error,
      uptime: total > 0 ? ((up / total) * 100).toFixed(2) : 0,
      avgResponseTime: Math.round(avgResponseTime)
    };
  }

  /**
   * Start continuous monitoring
   * @param {Array} apis - APIs to monitor
   * @param {number} interval - Monitoring interval in minutes
   */
  startMonitoring(apis, interval = 5) {
    if (this.isMonitoring) {
      console.log('⚠️  Monitoring already started');
      return;
    }

    console.log(`🚀 Starting API health monitoring (${interval} minute intervals)`);
    this.isMonitoring = true;

    // Initial check
    this.checkMultipleApis(apis);

    // Set up interval
    this.monitoringInterval = setInterval(() => {
      this.checkMultipleApis(apis);
    }, interval * 60 * 1000);
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 API health monitoring stopped');
  }

  /**
   * Get APIs by health status
   * @param {string} status - Health status (up, down, unknown, error)
   * @returns {Array} APIs with specified status
   */
  getApisByStatus(status) {
    return Array.from(this.healthData.values())
      .filter(health => health.status === status);
  }

  /**
   * Get slow APIs (response time > threshold)
   * @param {number} threshold - Response time threshold in ms
   * @returns {Array} Slow APIs
   */
  getSlowApis(threshold = 2000) {
    return Array.from(this.healthData.values())
      .filter(health => health.responseTime > threshold);
  }
}

// Create singleton instance
const apiHealthService = new APIHealthService();

module.exports = apiHealthService;
