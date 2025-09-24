/**
 * API Testing Service
 * Provides tools for testing APIs with different methods and parameters
 */

const https = require('https');
const http = require('http');
const querystring = require('querystring');

class APITestingService {
  constructor() {
    this.testHistory = new Map();
  }

  /**
   * Test an API endpoint
   * @param {Object} testConfig - Test configuration
   * @returns {Promise<Object>} Test result
   */
  async testApi(testConfig) {
    const {
      method = 'GET',
      url,
      headers = {},
      body = null,
      params = {},
      timeout = 10000
    } = testConfig;

    const startTime = Date.now();
    const testId = this.generateTestId();

    try {
      // Add query parameters to URL
      const urlWithParams = this.buildUrlWithParams(url, params);
      
      // Make request
      const response = await this.makeRequest({
        method,
        url: urlWithParams,
        headers,
        body,
        timeout
      });

      const responseTime = Date.now() - startTime;
      
      const testResult = {
        id: testId,
        method,
        url: urlWithParams,
        status: 'success',
        statusCode: response.statusCode,
        responseTime,
        responseHeaders: response.headers,
        responseBody: this.truncateResponse(response.body),
        timestamp: new Date().toISOString(),
        error: null
      };

      // Store test result
      this.testHistory.set(testId, testResult);
      
      return testResult;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      const testResult = {
        id: testId,
        method,
        url,
        status: 'error',
        statusCode: null,
        responseTime,
        responseHeaders: {},
        responseBody: null,
        timestamp: new Date().toISOString(),
        error: error.message
      };

      this.testHistory.set(testId, testResult);
      return testResult;
    }
  }

  /**
   * Build URL with query parameters
   * @param {string} url - Base URL
   * @param {Object} params - Query parameters
   * @returns {string} URL with parameters
   */
  buildUrlWithParams(url, params) {
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        urlObj.searchParams.set(key, value);
      }
    });

    return urlObj.toString();
  }

  /**
   * Make HTTP/HTTPS request
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response object
   */
  makeRequest(options) {
    return new Promise((resolve, reject) => {
      const { method, url, headers, body, timeout } = options;
      const isHttps = url.startsWith('https://');
      const client = isHttps ? https : http;

      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method,
        headers: {
          'User-Agent': 'Zanwik-API-Tester/1.0',
          'Accept': 'application/json, text/plain, */*',
          ...headers
        },
        timeout
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }

  /**
   * Test API with different HTTP methods
   * @param {string} url - API URL
   * @param {Object} options - Test options
   * @returns {Promise<Array>} Array of test results
   */
  async testMultipleMethods(url, options = {}) {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const results = [];

    for (const method of methods) {
      try {
        const result = await this.testApi({
          ...options,
          method,
          url
        });
        results.push(result);
      } catch (error) {
        results.push({
          method,
          url,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Test API with authentication
   * @param {string} url - API URL
   * @param {string} authType - Authentication type (bearer, basic, api-key)
   * @param {string} authValue - Authentication value
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Test result
   */
  async testWithAuth(url, authType, authValue, options = {}) {
    let headers = { ...options.headers };

    switch (authType) {
      case 'bearer':
        headers.Authorization = `Bearer ${authValue}`;
        break;
      case 'basic':
        headers.Authorization = `Basic ${Buffer.from(authValue).toString('base64')}`;
        break;
      case 'api-key':
        headers['X-API-Key'] = authValue;
        break;
      case 'api-key-header':
        headers[authValue.split(':')[0]] = authValue.split(':')[1];
        break;
    }

    return this.testApi({
      ...options,
      url,
      headers
    });
  }

  /**
   * Test API with different content types
   * @param {string} url - API URL
   * @param {Object} body - Request body
   * @param {Array} contentTypes - Array of content types to test
   * @returns {Promise<Array>} Array of test results
   */
  async testContentTypes(url, body, contentTypes = ['application/json', 'application/xml', 'text/plain']) {
    const results = [];

    for (const contentType of contentTypes) {
      try {
        const result = await this.testApi({
          method: 'POST',
          url,
          headers: {
            'Content-Type': contentType
          },
          body: this.formatBody(body, contentType)
        });
        results.push(result);
      } catch (error) {
        results.push({
          contentType,
          url,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Format body based on content type
   * @param {Object} body - Request body
   * @param {string} contentType - Content type
   * @returns {string} Formatted body
   */
  formatBody(body, contentType) {
    if (!body) return null;

    switch (contentType) {
      case 'application/json':
        return JSON.stringify(body);
      case 'application/x-www-form-urlencoded':
        return querystring.stringify(body);
      case 'application/xml':
        return this.objectToXml(body);
      default:
        return body.toString();
    }
  }

  /**
   * Convert object to XML (simple implementation)
   * @param {Object} obj - Object to convert
   * @returns {string} XML string
   */
  objectToXml(obj) {
    let xml = '<root>';
    Object.entries(obj).forEach(([key, value]) => {
      xml += `<${key}>${value}</${key}>`;
    });
    xml += '</root>';
    return xml;
  }

  /**
   * Get test history
   * @param {string} apiId - API ID (optional)
   * @returns {Array} Test history
   */
  getTestHistory(apiId = null) {
    const history = Array.from(this.testHistory.values());
    if (apiId) {
      return history.filter(test => test.url.includes(apiId));
    }
    return history;
  }

  /**
   * Get test statistics
   * @returns {Object} Test statistics
   */
  getTestStats() {
    const history = Array.from(this.testHistory.values());
    const total = history.length;
    const successful = history.filter(test => test.status === 'success').length;
    const failed = history.filter(test => test.status === 'error').length;
    
    const avgResponseTime = history
      .filter(test => test.responseTime > 0)
      .reduce((sum, test) => sum + test.responseTime, 0) / 
      history.filter(test => test.responseTime > 0).length || 0;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : 0,
      avgResponseTime: Math.round(avgResponseTime)
    };
  }

  /**
   * Generate unique test ID
   * @returns {string} Test ID
   */
  generateTestId() {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Truncate response body for storage
   * @param {string} body - Response body
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated body
   */
  truncateResponse(body, maxLength = 1000) {
    if (!body) return null;
    if (body.length <= maxLength) return body;
    return body.substring(0, maxLength) + '... (truncated)';
  }

  /**
   * Clear test history
   */
  clearHistory() {
    this.testHistory.clear();
  }
}

// Create singleton instance
const apiTestingService = new APITestingService();

module.exports = apiTestingService;
