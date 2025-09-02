const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Load API data
const apisData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/apis.json'), 'utf8'));

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

// Test API endpoint (mock response for now)
router.post('/test/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { endpoint, method = 'GET', params = {}, headers = {} } = req.body;

    const api = apisData.apis.find(api => api.id === id);
    if (!api) {
      return res.status(404).json({
        success: false,
        error: 'API not found'
      });
    }

    // For now, return a mock response
    // In production, this would make actual API calls
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*'
      },
      data: {
        message: 'Mock API response',
        endpoint: endpoint,
        method: method,
        params: params,
        api: {
          name: api.name,
          baseUrl: api.baseUrl
        },
        note: 'This is a mock response. In production, this would make actual API calls.'
      }
    };

    res.json({
      success: true,
      data: mockResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test API endpoint'
    });
  }
});

module.exports = router;
