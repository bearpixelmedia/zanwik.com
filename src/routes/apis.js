const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Load API data with error handling
let apisData = { apis: [], categories: {} };

try {
  const dataPath = path.join(__dirname, '../data/apis.json');
  if (fs.existsSync(dataPath)) {
    const rawData = fs.readFileSync(dataPath, 'utf8');
    apisData = JSON.parse(rawData);
  }
} catch (error) {
  console.error('Error loading API data:', error);
  // Fallback to empty data structure
  apisData = { apis: [], categories: {} };
}

// Get all categories
router.get('/categories', (req, res) => {
  try {
    res.json({
      success: true,
      data: apisData.categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// Get all APIs with optional filtering
router.get('/', (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;
    let filteredApis = [...apisData.apis];

    // Filter by category
    if (category && category !== 'all') {
      filteredApis = filteredApis.filter(api => api.category === category);
    }

    // Search functionality
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredApis = filteredApis.filter(api => 
        api.name.toLowerCase().includes(searchTerm) ||
        api.description.toLowerCase().includes(searchTerm) ||
        api.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Pagination
    const total = filteredApis.length;
    const paginatedApis = filteredApis.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: {
        apis: paginatedApis,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch APIs'
    });
  }
});

// Get API by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const api = apisData.apis.find(api => api.id === id);

    if (!api) {
      return res.status(404).json({
        success: false,
        error: 'API not found'
      });
    }

    res.json({
      success: true,
      data: api
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch API'
    });
  }
});

// Get APIs by category
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Check if category exists
    if (!apisData.categories[category]) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const categoryApis = apisData.apis.filter(api => api.category === category);
    const total = categoryApis.length;
    const paginatedApis = categoryApis.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: {
        category: apisData.categories[category],
        apis: paginatedApis,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category APIs'
    });
  }
});

// Search APIs
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const searchTerm = query.toLowerCase();
    const searchResults = apisData.apis.filter(api => 
      api.name.toLowerCase().includes(searchTerm) ||
      api.description.toLowerCase().includes(searchTerm) ||
      api.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    const total = searchResults.length;
    const paginatedResults = searchResults.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: {
        query,
        apis: paginatedResults,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search APIs'
    });
  }
});

// Get featured APIs
router.get('/featured/list', (req, res) => {
  try {
    const featuredApis = apisData.apis
      .filter(api => api.rating >= 4.0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);

    res.json({
      success: true,
      data: featuredApis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured APIs'
    });
  }
});

// Get API statistics
router.get('/stats/overview', (req, res) => {
  try {
    const stats = {
      totalApis: apisData.apis.length,
      totalCategories: Object.keys(apisData.categories).length,
      totalReviews: apisData.apis.reduce((sum, api) => sum + api.reviews, 0),
      averageRating: apisData.apis.reduce((sum, api) => sum + api.rating, 0) / apisData.apis.length,
      freeApis: apisData.apis.filter(api => api.pricing.free).length,
      paidApis: apisData.apis.filter(api => api.pricing.paid).length,
      categoryBreakdown: Object.keys(apisData.categories).map(category => ({
        category,
        count: apisData.apis.filter(api => api.category === category).length
      }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch API statistics'
    });
  }
});

// Test specific API endpoint (real HTTP requests)
router.post('/test/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { endpoint, method = 'GET', params = {}, headers = {}, body = null } = req.body;

    const api = apisData.apis.find(api => api.id === id);
    if (!api) {
      return res.status(404).json({
        success: false,
        error: 'API not found'
      });
    }

    // Build full URL
    let fullUrl = api.baseUrl;
    if (endpoint) {
      fullUrl = fullUrl.endsWith('/') ? fullUrl + endpoint : fullUrl + '/' + endpoint;
    }

    // Add query parameters for GET requests
    if (method === 'GET' && params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }

    // Validate URL
    try {
      new URL(fullUrl);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid API URL format'
      });
    }

    // Make real HTTP request
    const startTime = Date.now();
    
    try {
      const config = {
        method: method.toLowerCase(),
        url: fullUrl,
        headers: {
          'User-Agent': 'Zanwik-API-Tester/1.0',
          'Accept': 'application/json',
          ...headers
        },
        timeout: 10000, // 10 second timeout
        validateStatus: () => true // Don't throw on any status code
      };

      // Add body for non-GET requests
      if (body && method !== 'GET') {
        if (typeof body === 'string') {
          try {
            config.data = JSON.parse(body);
            config.headers['Content-Type'] = 'application/json';
          } catch (e) {
            config.data = body;
            config.headers['Content-Type'] = 'text/plain';
          }
        } else {
          config.data = body;
        }
      }

      const response = await axios(config);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      res.json({
        success: true,
        data: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          api: {
            name: api.name,
            baseUrl: api.baseUrl,
            endpoint: endpoint
          },
          request: {
            method: method,
            url: fullUrl,
            headers: config.headers,
            params: params,
            body: body
          }
        }
      });
    } catch (axiosError) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      res.json({
        success: false,
        error: axiosError.message,
        data: {
          status: axiosError.response?.status || 'Error',
          statusText: axiosError.response?.statusText || 'Request Failed',
          headers: axiosError.response?.headers || {},
          data: axiosError.response?.data || null,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          api: {
            name: api.name,
            baseUrl: api.baseUrl,
            endpoint: endpoint
          },
          request: {
            method: method,
            url: fullUrl,
            headers: headers,
            params: params,
            body: body
          }
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test API endpoint',
      details: error.message
    });
  }
});

// Test any API endpoint (real HTTP requests)
router.post('/test', async (req, res) => {
  try {
    const { method = 'GET', url, headers = {}, body = null } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    // Make real HTTP request
    const startTime = Date.now();
    
    try {
      const config = {
        method: method.toLowerCase(),
        url: url,
        headers: {
          'User-Agent': 'Zanwik-API-Tester/1.0',
          'Accept': 'application/json',
          ...headers
        },
        timeout: 10000, // 10 second timeout
        validateStatus: () => true // Don't throw on any status code
      };

      // Add body for non-GET requests
      if (body && method !== 'GET') {
        if (typeof body === 'string') {
          try {
            config.data = JSON.parse(body);
            config.headers['Content-Type'] = 'application/json';
          } catch (e) {
            config.data = body;
            config.headers['Content-Type'] = 'text/plain';
          }
        } else {
          config.data = body;
        }
      }

      const response = await axios(config);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      res.json({
        success: true,
        data: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          request: {
            method: method,
            url: url,
            headers: config.headers,
            body: body
          }
        }
      });
    } catch (axiosError) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      res.json({
        success: false,
        error: axiosError.message,
        data: {
          status: axiosError.response?.status || 'Error',
          statusText: axiosError.response?.statusText || 'Request Failed',
          headers: axiosError.response?.headers || {},
          data: axiosError.response?.data || null,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          request: {
            method: method,
            url: url,
            headers: headers,
            body: body
          }
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test API endpoint',
      details: error.message
    });
  }
});

module.exports = router;
