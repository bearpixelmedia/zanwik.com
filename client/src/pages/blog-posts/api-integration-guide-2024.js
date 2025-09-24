import React from 'react';
import { Link } from 'react-router-dom';
import StructuredData from '../../components/StructuredData';

const APIIntegrationGuide2024 = () => {
  const postData = {
    title: "How to Integrate APIs in 2024: Complete Developer Guide",
    slug: "api-integration-guide-2024",
    date: "2024-01-20",
    readTime: "12 min read",
    category: "Tutorial",
    author: "Zanwik Team"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data for Article */}
      <StructuredData 
        type="article" 
        data={{
          title: postData.title,
          description: "Learn how to integrate APIs in 2024 with our comprehensive developer guide. Includes authentication, error handling, testing, and best practices.",
          datePublished: postData.date,
          dateModified: postData.date,
          image: "https://www.zanwik.com/zanwik-icon.svg"
        }}
      />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="mb-6">
            <Link to="/blog" className="text-blue-600 hover:text-blue-800">
              ← Back to Blog
            </Link>
          </nav>
          
          <div className="mb-6">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {postData.category}
            </span>
            <span className="text-gray-500 text-sm ml-3">{postData.readTime}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {postData.title}
          </h1>
          
          <div className="flex items-center text-gray-600">
            <span>By {postData.author}</span>
            <span className="mx-2">•</span>
            <span>{postData.date}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            API integration is the backbone of modern applications. In 2024, with the rise of microservices, 
            cloud computing, and AI-powered tools, knowing how to properly integrate APIs has become more 
            crucial than ever. This comprehensive guide will walk you through everything you need to know.
          </p>

          <h2>Table of Contents</h2>
          <ul>
            <li><a href="#what-is-api-integration">What is API Integration?</a></li>
            <li><a href="#choosing-the-right-api">Choosing the Right API</a></li>
            <li><a href="#authentication-methods">Authentication Methods</a></li>
            <li><a href="#making-api-calls">Making API Calls</a></li>
            <li><a href="#error-handling">Error Handling</a></li>
            <li><a href="#testing-apis">Testing APIs</a></li>
            <li><a href="#best-practices">Best Practices</a></li>
            <li><a href="#common-pitfalls">Common Pitfalls to Avoid</a></li>
          </ul>

          <h2 id="what-is-api-integration">What is API Integration?</h2>
          <p>
            API integration is the process of connecting different software applications through their 
            Application Programming Interfaces (APIs) to share data and functionality. Think of APIs as 
            the "waiters" in a restaurant - they take your order (request) to the kitchen (server) and 
            bring back your food (response).
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
            <p className="text-blue-800">
              <strong>Pro Tip:</strong> APIs allow you to leverage existing services instead of building 
              everything from scratch, saving time and resources while focusing on your core business logic.
            </p>
          </div>

          <h2 id="choosing-the-right-api">Choosing the Right API</h2>
          <p>Before integrating any API, consider these factors:</p>

          <h3>1. Documentation Quality</h3>
          <p>Look for APIs with:</p>
          <ul>
            <li>Clear, comprehensive documentation</li>
            <li>Code examples in multiple languages</li>
            <li>Interactive API explorers</li>
            <li>Active community support</li>
          </ul>

          <h3>2. Reliability and Uptime</h3>
          <p>Check the API's:</p>
          <ul>
            <li>Historical uptime (aim for 99.9%+)</li>
            <li>Response time consistency</li>
            <li>Rate limiting policies</li>
            <li>Support for your expected traffic</li>
          </ul>

          <h3>3. Pricing and Limits</h3>
          <p>Evaluate:</p>
          <ul>
            <li>Free tier limitations</li>
            <li>Pricing structure for your scale</li>
            <li>Rate limits and quotas</li>
            <li>Hidden costs or overage fees</li>
          </ul>

          <h2 id="authentication-methods">Authentication Methods</h2>
          <p>Most APIs require authentication. Here are the common methods:</p>

          <h3>1. API Keys</h3>
          <p>Simple but less secure. Include in headers or query parameters:</p>
          <pre><code>{`// Using fetch with API key
const response = await fetch('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});`}</code></pre>

          <h3>2. OAuth 2.0</h3>
          <p>More secure, industry standard. Here's a basic implementation:</p>
          <pre><code>{`// OAuth 2.0 flow
const authUrl = 'https://api.example.com/oauth/authorize?' + 
  'client_id=YOUR_CLIENT_ID&' +
  'redirect_uri=YOUR_REDIRECT_URI&' +
  'response_type=code&' +
  'scope=read write';

// After user authorization, exchange code for token
const tokenResponse = await fetch('https://api.example.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'grant_type=authorization_code&code=' + code + '&client_id=' + clientId
});`}</code></pre>

          <h3>3. JWT Tokens</h3>
          <p>Self-contained tokens with expiration:</p>
          <pre><code>{`// Using JWT token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const response = await fetch('https://api.example.com/protected', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});`}</code></pre>

          <h2 id="making-api-calls">Making API Calls</h2>
          <p>Here's how to make robust API calls in different scenarios:</p>

          <h3>Basic GET Request</h3>
          <pre><code>{`async function fetchUserData(userId) {
  try {
    const response = await fetch('https://api.example.com/users/' + userId + '', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + '');
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}`}</code></pre>

          <h3>POST Request with Data</h3>
          <pre><code>{`async function createUser(userData) {
  try {
    const response = await fetch('https://api.example.com/users', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error('API Error: ' + errorData.message + '');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}`}</code></pre>

          <h2 id="error-handling">Error Handling</h2>
          <p>Proper error handling is crucial for production applications:</p>

          <pre><code>{`class APIError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.response = response;
  }
}

async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      let errorMessage = 'HTTP ' + response.status + ': ' + response.statusText + '';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If response isn't JSON, use status text
      }

      throw new APIError(errorMessage, response.status, response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network or other errors
    throw new APIError('Network error or request failed', 0, null);
  }
}`}</code></pre>

          <h2 id="testing-apis">Testing APIs</h2>
          <p>Always test your API integrations thoroughly:</p>

          <h3>Unit Testing</h3>
          <pre><code>{`// Using Jest for testing
describe('API Integration', () => {
  test('should fetch user data successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe' };
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser)
    });

    const result = await fetchUserData(1);
    expect(result).toEqual(mockUser);
  });

  test('should handle API errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404
    });

    await expect(fetchUserData(999)).rejects.toThrow('HTTP 404');
  });
});`}</code></pre>

          <h3>Integration Testing</h3>
          <pre><code>{`// Test with real API (use test environment)
describe('Real API Integration', () => {
  test('should work with actual API', async () => {
    const result = await fetchUserData(1);
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name');
  });
});`}</code></pre>

          <h2 id="best-practices">Best Practices</h2>

          <h3>1. Use HTTPS Always</h3>
          <p>Never make API calls over HTTP in production. Always use HTTPS to protect sensitive data.</p>

          <h3>2. Implement Rate Limiting</h3>
          <pre><code>{`class RateLimiter {
  constructor(requestsPerMinute) {
    this.requests = [];
    this.limit = requestsPerMinute;
  }

  async waitIfNeeded() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < 60000);
    
    if (this.requests.length >= this.limit) {
      const waitTime = 60000 - (now - this.requests[0]);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}`}</code></pre>

          <h3>3. Cache Responses When Appropriate</h3>
          <pre><code>{`const cache = new Map();

async function fetchWithCache(url, ttl = 300000) { // 5 minutes
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await apiCall(url);
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}`}</code></pre>

          <h3>4. Use Retry Logic</h3>
          <pre><code>{`async function apiCallWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall(url, options);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}`}</code></pre>

          <h2 id="common-pitfalls">Common Pitfalls to Avoid</h2>

          <h3>1. Not Handling Rate Limits</h3>
          <p>Always implement proper rate limiting to avoid getting blocked by the API provider.</p>

          <h3>2. Ignoring Error Responses</h3>
          <p>Don't just check if the response is ok - handle different error types appropriately.</p>

          <h3>3. Hardcoding API Keys</h3>
          <p>Use environment variables and never commit API keys to version control.</p>

          <h3>4. Not Testing Edge Cases</h3>
          <p>Test what happens when the API is down, returns unexpected data, or times out.</p>

          <h3>5. Forgetting About CORS</h3>
          <p>When making requests from browsers, ensure the API supports CORS or use a proxy.</p>

          <h2>Conclusion</h2>
          <p>
            API integration is a skill that improves with practice. Start with simple integrations, 
            follow these best practices, and gradually work your way up to more complex scenarios. 
            Remember to always prioritize security, error handling, and testing.
          </p>

          <p>
            For more API integration resources and a comprehensive directory of APIs, visit our 
            <Link to="/apis" className="text-blue-600 hover:text-blue-800">API Directory</Link>.
          </p>
        </article>

        {/* Author Bio */}
        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">About the Author</h3>
          <p className="text-gray-600">
            The Zanwik team consists of experienced developers and entrepreneurs who are passionate 
            about helping others succeed with API integration and business automation.
          </p>
        </div>

        {/* Related Posts */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold mb-2">
                <Link to="/blog/top-10-apis-startup-should-know" className="hover:text-blue-600">
                  Top 10 APIs Every Startup Should Know
                </Link>
              </h4>
              <p className="text-gray-600 text-sm">Discover the essential APIs that can accelerate your startup's growth.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold mb-2">
                <Link to="/blog/api-security-best-practices" className="hover:text-blue-600">
                  API Security Best Practices
                </Link>
              </h4>
              <p className="text-gray-600 text-sm">Essential security practices for API integration and data protection.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIIntegrationGuide2024;
