/**
 * API Health Routes
 * Routes for API health monitoring and testing
 */

const express = require('express');
const router = express.Router();
const apiHealthService = require('../services/apiHealthService');
const apiTestingService = require('../services/apiTestingService');
const fs = require('fs');
const path = require('path');

// Load API data
function loadApiData() {
  const dataPath = path.join(__dirname, '../data/apis.json');
  if (fs.existsSync(dataPath)) {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
  return { apis: {} };
}

// Get health status for all APIs
router.get('/health', async (req, res) => {
  try {
    const healthData = apiHealthService.getAllHealthData();
    const stats = apiHealthService.getHealthStats();
    
    res.json({
      success: true,
      data: {
        health: healthData,
        stats: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get health data'
    });
  }
});

// Get health status for specific API
router.get('/health/:apiId', async (req, res) => {
  try {
    const { apiId } = req.params;
    const healthData = apiHealthService.getApiHealth(apiId);
    
    if (!healthData) {
      return res.status(404).json({
        success: false,
        error: 'API health data not found'
      });
    }
    
    res.json({
      success: true,
      data: healthData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get API health data'
    });
  }
});

// Check health for specific API
router.post('/health/:apiId/check', async (req, res) => {
  try {
    const { apiId } = req.params;
    const apiData = loadApiData();
    const api = apiData.apis[apiId];
    
    if (!api) {
      return res.status(404).json({
        success: false,
        error: 'API not found'
      });
    }
    
    const healthStatus = await apiHealthService.checkApiHealth(api);
    
    res.json({
      success: true,
      data: healthStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check API health'
    });
  }
});

// Check health for multiple APIs
router.post('/health/check-multiple', async (req, res) => {
  try {
    const { apiIds } = req.body;
    const apiData = loadApiData();
    
    if (!apiIds || !Array.isArray(apiIds)) {
      return res.status(400).json({
        success: false,
        error: 'apiIds array is required'
      });
    }
    
    const apis = apiIds.map(id => apiData.apis[id]).filter(Boolean);
    const healthStatuses = await apiHealthService.checkMultipleApis(apis);
    
    res.json({
      success: true,
      data: healthStatuses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check multiple APIs health'
    });
  }
});

// Start monitoring
router.post('/health/monitor/start', async (req, res) => {
  try {
    const { interval = 5 } = req.body;
    const apiData = loadApiData();
    const apis = Object.values(apiData.apis);
    
    apiHealthService.startMonitoring(apis, interval);
    
    res.json({
      success: true,
      message: `Monitoring started with ${interval} minute intervals`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start monitoring'
    });
  }
});

// Stop monitoring
router.post('/health/monitor/stop', async (req, res) => {
  try {
    apiHealthService.stopMonitoring();
    
    res.json({
      success: true,
      message: 'Monitoring stopped'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to stop monitoring'
    });
  }
});

// Get APIs by health status
router.get('/health/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const apis = apiHealthService.getApisByStatus(status);
    
    res.json({
      success: true,
      data: apis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get APIs by status'
    });
  }
});

// Get slow APIs
router.get('/health/slow', async (req, res) => {
  try {
    const { threshold = 2000 } = req.query;
    const apis = apiHealthService.getSlowApis(parseInt(threshold));
    
    res.json({
      success: true,
      data: apis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get slow APIs'
    });
  }
});

// Test API endpoint
router.post('/test', async (req, res) => {
  try {
    const testConfig = req.body;
    
    if (!testConfig.url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }
    
    const testResult = await apiTestingService.testApi(testConfig);
    
    res.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test API'
    });
  }
});

// Test API with authentication
router.post('/test/auth', async (req, res) => {
  try {
    const { url, authType, authValue, ...options } = req.body;
    
    if (!url || !authType || !authValue) {
      return res.status(400).json({
        success: false,
        error: 'URL, authType, and authValue are required'
      });
    }
    
    const testResult = await apiTestingService.testWithAuth(url, authType, authValue, options);
    
    res.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test API with authentication'
    });
  }
});

// Test multiple HTTP methods
router.post('/test/methods', async (req, res) => {
  try {
    const { url, ...options } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }
    
    const testResults = await apiTestingService.testMultipleMethods(url, options);
    
    res.json({
      success: true,
      data: testResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test multiple methods'
    });
  }
});

// Get test history
router.get('/test/history', async (req, res) => {
  try {
    const { apiId } = req.query;
    const history = apiTestingService.getTestHistory(apiId);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get test history'
    });
  }
});

// Get test statistics
router.get('/test/stats', async (req, res) => {
  try {
    const stats = apiTestingService.getTestStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get test statistics'
    });
  }
});

// Clear test history
router.delete('/test/history', async (req, res) => {
  try {
    apiTestingService.clearHistory();
    
    res.json({
      success: true,
      message: 'Test history cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear test history'
    });
  }
});

module.exports = router;
