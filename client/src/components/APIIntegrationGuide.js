import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const APIIntegrationGuide = () => {
  const [selectedStep, setSelectedStep] = useState(0);

  const steps = [
    {
      title: 'Choose Your APIs',
      description: 'Select the right APIs for your business needs',
      content: (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">How to Choose the Right APIs</h4>
          <ul className="space-y-2 text-gray-600">
            <li>• <strong>Identify your business needs:</strong> What functionality do you need?</li>
            <li>• <strong>Check API documentation:</strong> Is it well-documented and easy to use?</li>
            <li>• <strong>Review pricing:</strong> Does it fit your budget and scale with your growth?</li>
            <li>• <strong>Test reliability:</strong> Use our health monitoring to check uptime</li>
            <li>• <strong>Consider support:</strong> Does the API provider offer good support?</li>
          </ul>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Pro Tip:</strong> Start with free tiers to test APIs before committing to paid plans.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Set Up Authentication',
      description: 'Configure API keys and authentication',
      content: (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">API Authentication Types</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h5 className="font-semibold text-green-600">API Key</h5>
              <p className="text-sm text-gray-600 mt-1">
                Simple key-based authentication. Add your key to request headers.
              </p>
              <code className="text-xs bg-gray-100 p-2 rounded block mt-2">
                headers: {'{'} 'X-API-Key': 'your-key' {'}'}
              </code>
            </Card>
            <Card className="p-4">
              <h5 className="font-semibold text-blue-600">OAuth 2.0</h5>
              <p className="text-sm text-gray-600 mt-1">
                Secure token-based authentication. More complex but more secure.
              </p>
              <code className="text-xs bg-gray-100 p-2 rounded block mt-2">
                headers: {'{'} 'Authorization': 'Bearer token' {'}'}
              </code>
            </Card>
            <Card className="p-4">
              <h5 className="font-semibold text-purple-600">Basic Auth</h5>
              <p className="text-sm text-gray-600 mt-1">
                Username and password authentication. Simple but less secure.
              </p>
              <code className="text-xs bg-gray-100 p-2 rounded block mt-2">
                headers: {'{'} 'Authorization': 'Basic base64(username:password)' {'}'}
              </code>
            </Card>
            <Card className="p-4">
              <h5 className="font-semibold text-orange-600">JWT</h5>
              <p className="text-sm text-gray-600 mt-1">
                JSON Web Token authentication. Stateless and scalable.
              </p>
              <code className="text-xs bg-gray-100 p-2 rounded block mt-2">
                headers: {'{'} 'Authorization': 'Bearer jwt-token' {'}'}
              </code>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: 'Build Your Integration',
      description: 'Code your API integration',
      content: (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Integration Best Practices</h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold">1. Error Handling</h5>
              <p className="text-sm text-gray-600 mb-2">Always handle API errors gracefully:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`try {
  const response = await fetch(apiUrl, options);
  if (!response.ok) {
    throw new Error(\`API Error: \${response.status}\`);
  }
  const data = await response.json();
} catch (error) {
  console.error('API call failed:', error);
  // Handle error appropriately
}`}
              </pre>
            </div>
            <div>
              <h5 className="font-semibold">2. Rate Limiting</h5>
              <p className="text-sm text-gray-600 mb-2">Respect API rate limits:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// Implement rate limiting
const rateLimiter = {
  calls: 0,
  resetTime: Date.now() + 60000, // 1 minute
  maxCalls: 100,
  
  async makeCall() {
    if (this.calls >= this.maxCalls) {
      await this.waitForReset();
    }
    this.calls++;
    // Make API call
  }
};`}
              </pre>
            </div>
            <div>
              <h5 className="font-semibold">3. Caching</h5>
              <p className="text-sm text-gray-600 mb-2">Cache responses to reduce API calls:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`const cache = new Map();

async function getCachedData(key, fetchFunction) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetchFunction();
  cache.set(key, data);
  return data;
}`}
              </pre>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Test Your Integration',
      description: 'Test and validate your API integration',
      content: (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Testing Your API Integration</h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold">1. Use Our Testing Tools</h5>
              <p className="text-sm text-gray-600 mb-2">
                Test your APIs before integration using our built-in testing tools:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Test different HTTP methods (GET, POST, PUT, DELETE)</li>
                <li>• Test with different authentication methods</li>
                <li>• Test with various request parameters</li>
                <li>• Monitor response times and error rates</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold">2. Unit Testing</h5>
              <p className="text-sm text-gray-600 mb-2">Write unit tests for your API calls:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// Example Jest test
describe('API Integration', () => {
  test('should fetch user data', async () => {
    const userData = await fetchUserData('123');
    expect(userData).toHaveProperty('id');
    expect(userData).toHaveProperty('name');
  });
  
  test('should handle API errors', async () => {
    await expect(fetchUserData('invalid')).rejects.toThrow();
  });
});`}
              </pre>
            </div>
            <div>
              <h5 className="font-semibold">3. Integration Testing</h5>
              <p className="text-sm text-gray-600 mb-2">Test the complete flow:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Test end-to-end user workflows</li>
                <li>• Test error scenarios and edge cases</li>
                <li>• Test performance under load</li>
                <li>• Test with different data sets</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Deploy and Monitor',
      description: 'Deploy your integration and monitor performance',
      content: (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Deployment and Monitoring</h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold">1. Deployment Checklist</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Set up environment variables for API keys</li>
                <li>• Configure proper error logging</li>
                <li>• Set up monitoring and alerting</li>
                <li>• Test in staging environment first</li>
                <li>• Have a rollback plan ready</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold">2. Monitoring Setup</h5>
              <p className="text-sm text-gray-600 mb-2">Monitor these key metrics:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-3">
                  <h6 className="font-semibold text-green-600">Performance</h6>
                  <ul className="text-xs text-gray-600 mt-1">
                    <li>• Response times</li>
                    <li>• Throughput</li>
                    <li>• Error rates</li>
                  </ul>
                </Card>
                <Card className="p-3">
                  <h6 className="font-semibold text-blue-600">Business</h6>
                  <ul className="text-xs text-gray-600 mt-1">
                    <li>• API usage costs</li>
                    <li>• Revenue impact</li>
                    <li>• User satisfaction</li>
                  </ul>
                </Card>
              </div>
            </div>
            <div>
              <h5 className="font-semibold">3. Ongoing Maintenance</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Monitor API health and uptime</li>
                <li>• Update API keys regularly</li>
                <li>• Review and optimize API usage</li>
                <li>• Stay updated with API changes</li>
                <li>• Plan for API deprecations</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          API Integration Guide
        </h2>
        <p className="text-xl text-gray-600">
          Learn how to build profitable businesses with APIs
        </p>
      </div>

      {/* Step Navigation */}
      <div className="flex flex-wrap justify-center mb-8">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => setSelectedStep(index)}
            className={`px-4 py-2 m-1 rounded-lg text-sm font-medium transition-colors ${
              selectedStep === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {step.title}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {steps[selectedStep].title}
          </h3>
          <p className="text-gray-600">
            {steps[selectedStep].description}
          </p>
        </div>
        
        {steps[selectedStep].content}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={() => setSelectedStep(Math.max(0, selectedStep - 1))}
            disabled={selectedStep === 0}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={() => setSelectedStep(Math.min(steps.length - 1, selectedStep + 1))}
            disabled={selectedStep === steps.length - 1}
          >
            Next
          </Button>
        </div>
      </Card>

      {/* Additional Resources */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">API Documentation</h3>
          <p className="text-gray-600 text-sm mb-4">
            Comprehensive guides and examples for each API
          </p>
          <Button variant="outline" size="sm">
            View Docs
          </Button>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-4xl mb-4">🛠️</div>
          <h3 className="text-lg font-semibold mb-2">Testing Tools</h3>
          <p className="text-gray-600 text-sm mb-4">
            Test APIs before integration with our built-in tools
          </p>
          <Button variant="outline" size="sm">
            Start Testing
          </Button>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-semibold mb-2">Community Support</h3>
          <p className="text-gray-600 text-sm mb-4">
            Get help from other entrepreneurs and developers
          </p>
          <Button variant="outline" size="sm">
            Join Community
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default APIIntegrationGuide;
