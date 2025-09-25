import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const APITester = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const apiParam = searchParams.get('api');
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Test form state
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('{"Content-Type": "application/json"}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (apiParam) {
      loadApiData();
    }
  }, [apiParam]);

  const loadApiData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/apis');
      const data = await response.json();
      
      if (data.success && data.data.apis) {
        const foundApi = data.data.apis.find(api => 
          api.id === apiParam || 
          api.name?.toLowerCase().includes(apiParam?.toLowerCase())
        );
        
        if (foundApi) {
          setApi(foundApi);
          setUrl(foundApi.baseUrl || '');
        }
      }
    } catch (error) {
      console.error('Error loading API data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAPI = async () => {
    setIsTesting(true);
    setResponse(null);
    
    try {
      // Parse headers
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        parsedHeaders = { 'Content-Type': 'application/json' };
      }

      // Parse body
      let parsedBody = null;
      if (body.trim()) {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          parsedBody = body;
        }
      }

      // Make real API test request
      const testResponse = await fetch('/api/apis/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          url,
          headers: parsedHeaders,
          body: parsedBody
        })
      });

      const result = await testResponse.json();
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        error: error.message,
        data: {
          status: 'Error',
          statusText: 'Network Error',
          headers: {},
          data: null,
          responseTime: '0ms',
          timestamp: new Date().toISOString(),
          request: {
            method: method,
            url: url,
            headers: headers,
            body: body
          }
        }
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <button 
              onClick={() => navigate('/')}
              className="hover:text-primary"
            >
              Home
            </button>
            <span>›</span>
            <button 
              onClick={() => navigate('/apis/tools')}
              className="hover:text-primary"
            >
              API Tools
            </button>
            <span>›</span>
            <span className="text-foreground font-medium">API Tester</span>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl">
              <span className="text-white text-xl">🔧</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">API Tester</h1>
              <p className="text-muted-foreground">
                Test any API endpoint with our powerful testing interface. Send requests, view responses, and debug issues in real-time.
              </p>
              {api && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">Testing API: </span>
                  <span className="text-sm font-medium text-primary">{api.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Configuration */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Request Configuration</h3>
            
            <div className="space-y-4">
              {/* Method and URL */}
              <div className="flex space-x-2">
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Enter API endpoint URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
              </div>

              {/* Headers */}
              <div>
                <label className="block text-sm font-medium mb-2">Headers (JSON)</label>
                <textarea 
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  className="w-full h-32 px-3 py-2 border rounded-md font-mono text-sm"
                  placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium mb-2">Body (JSON)</label>
                <textarea 
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full h-32 px-3 py-2 border rounded-md font-mono text-sm"
                  placeholder='{"key": "value"}'
                />
              </div>

              {/* Send Button */}
              <Button 
                onClick={handleTestAPI}
                disabled={isTesting || !url.trim()}
                className="w-full"
              >
                {isTesting ? 'Testing...' : 'Send Request'}
              </Button>
            </div>
          </Card>

          {/* Response */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Response</h3>
            
            {response ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    response.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {response.data?.status || (response.success ? '200 OK' : 'Error')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {response.data?.responseTime || '0ms'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {response.data?.timestamp ? new Date(response.data.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                  </span>
                </div>
                
                {response.data?.headers && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Response Headers</label>
                    <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                      {JSON.stringify(response.data.headers, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2">Response Body</label>
                  <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto max-h-96">
                    {JSON.stringify(response.data?.data || response.error, null, 2)}
                  </pre>
                </div>

                {response.data?.request && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Request Details</label>
                    <pre className="bg-blue-50 p-3 rounded-md text-xs overflow-x-auto">
                      {JSON.stringify(response.data.request, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-4">📡</div>
                <p>Send a request to see the real API response here</p>
                <p className="text-sm mt-2">This will make actual HTTP requests to the specified endpoint</p>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex space-x-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/apis/tools')}
            >
              ← Back to Tools
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/apis')}
            >
              Browse APIs
            </Button>
            {api && (
              <Button 
                variant="outline"
                onClick={() => navigate(`/apis/${api.id}`)}
              >
                View API Details
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITester;
