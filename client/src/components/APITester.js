import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const APITester = () => {
  const [testConfig, setTestConfig] = useState({
    method: 'GET',
    url: '',
    headers: {},
    body: '',
    params: {}
  });
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Load test history
  const loadHistory = async () => {
    try {
      const response = await fetch('/api/health/test/history');
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error('Error loading test history:', error);
    }
  };

  // Run API test
  const runTest = async () => {
    if (!testConfig.url) {
      alert('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/health/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testConfig)
      });
      
      const data = await response.json();
      if (data.success) {
        setTestResult(data.data);
        loadHistory(); // Refresh history
      } else {
        alert('Test failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error running test:', error);
      alert('Test failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Test with authentication
  const testWithAuth = async (authType, authValue) => {
    if (!testConfig.url) {
      alert('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/health/test/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...testConfig,
          authType,
          authValue
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setTestResult(data.data);
        loadHistory();
      } else {
        alert('Test failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error running auth test:', error);
      alert('Test failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Test multiple methods
  const testMultipleMethods = async () => {
    if (!testConfig.url) {
      alert('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/health/test/methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testConfig)
      });
      
      const data = await response.json();
      if (data.success) {
        setTestResult(data.data);
        loadHistory();
      } else {
        alert('Test failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error running multiple methods test:', error);
      alert('Test failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (body) => {
    if (!body) return 'No response body';
    
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">API Tester</h2>
        <p className="text-gray-600">Test APIs with different methods and parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Configuration */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Test Configuration</h3>
          
          <div className="space-y-4">
            {/* Method */}
            <div>
              <label className="block text-sm font-medium mb-1">HTTP Method</label>
              <select
                value={testConfig.method}
                onChange={(e) => setTestConfig({...testConfig, method: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="url"
                value={testConfig.url}
                onChange={(e) => setTestConfig({...testConfig, url: e.target.value})}
                placeholder="https://api.example.com/endpoint"
                className="w-full p-2 border rounded-md"
              />
            </div>

            {/* Headers */}
            <div>
              <label className="block text-sm font-medium mb-1">Headers (JSON)</label>
              <textarea
                value={JSON.stringify(testConfig.headers, null, 2)}
                onChange={(e) => {
                  try {
                    setTestConfig({...testConfig, headers: JSON.parse(e.target.value)});
                  } catch {
                    // Invalid JSON, keep as is
                  }
                }}
                placeholder='{"Content-Type": "application/json"}'
                className="w-full p-2 border rounded-md h-20"
              />
            </div>

            {/* Body */}
            {['POST', 'PUT', 'PATCH'].includes(testConfig.method) && (
              <div>
                <label className="block text-sm font-medium mb-1">Request Body</label>
                <textarea
                  value={testConfig.body}
                  onChange={(e) => setTestConfig({...testConfig, body: e.target.value})}
                  placeholder='{"key": "value"}'
                  className="w-full p-2 border rounded-md h-32"
                />
              </div>
            )}

            {/* Query Parameters */}
            <div>
              <label className="block text-sm font-medium mb-1">Query Parameters (JSON)</label>
              <textarea
                value={JSON.stringify(testConfig.params, null, 2)}
                onChange={(e) => {
                  try {
                    setTestConfig({...testConfig, params: JSON.parse(e.target.value)});
                  } catch {
                    // Invalid JSON, keep as is
                  }
                }}
                placeholder='{"param1": "value1"}'
                className="w-full p-2 border rounded-md h-20"
              />
            </div>

            {/* Test Buttons */}
            <div className="flex space-x-2">
              <Button onClick={runTest} disabled={loading}>
                {loading ? 'Testing...' : 'Test API'}
              </Button>
              <Button onClick={testMultipleMethods} disabled={loading} variant="outline">
                Test All Methods
              </Button>
            </div>

            {/* Auth Test Buttons */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Test with Authentication</h4>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    const token = prompt('Enter Bearer token:');
                    if (token) testWithAuth('bearer', token);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Bearer Token
                </Button>
                <Button
                  onClick={() => {
                    const key = prompt('Enter API key:');
                    if (key) testWithAuth('api-key', key);
                  }}
                  variant="outline"
                  size="sm"
                >
                  API Key
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Test Results */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          
          {testResult ? (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center space-x-2">
                <span className={`font-medium ${getStatusColor(testResult.status)}`}>
                  {testResult.status.toUpperCase()}
                </span>
                {testResult.statusCode && (
                  <span className="text-sm text-gray-600">
                    {testResult.statusCode}
                  </span>
                )}
                <span className="text-sm text-gray-600">
                  {testResult.responseTime}ms
                </span>
              </div>

              {/* Response Body */}
              <div>
                <label className="block text-sm font-medium mb-1">Response Body</label>
                <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto max-h-64">
                  {formatResponse(testResult.responseBody)}
                </pre>
              </div>

              {/* Error */}
              {testResult.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="text-sm text-red-800">{testResult.error}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Run a test to see results
            </div>
          )}
        </Card>
      </div>

      {/* Test History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Test History</h3>
          <Button onClick={loadHistory} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-auto">
          {history.slice(0, 10).map((test, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-mono">{test.method}</span>
                <span className="text-sm text-gray-600 truncate max-w-xs">{test.url}</span>
                <span className={`text-xs ${getStatusColor(test.status)}`}>
                  {test.status}
                </span>
                <span className="text-xs text-gray-500">{test.responseTime}ms</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(test.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default APITester;
