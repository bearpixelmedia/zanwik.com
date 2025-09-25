import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const APIDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const apiParam = searchParams.get('api');
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load API data
  const loadApiData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from local data first (since backend is not available in current deployment)
      const response = await fetch('/api/apis');
      const data = await response.json();
      
      if (data.success && data.data.apis) {
        // Find API by ID or name
        const foundApi = data.data.apis.find(api => 
          api.id === id || 
          api.id === apiParam || 
          api.name?.toLowerCase().includes(apiParam?.toLowerCase()) ||
          api.name?.toLowerCase().includes(id?.toLowerCase())
        );
        
        if (foundApi) {
          setApi(foundApi);
        } else {
          setError('API not found');
        }
      } else {
        setError('Failed to load API data');
      }
    } catch (err) {
      console.error('Error loading API data:', err);
      setError('Failed to load API information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApiData();
  }, [id, apiParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-4">
            <img src="/zanwik-icon.svg" alt="Zanwik" className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Loading API Details...</h1>
          <p className="text-muted-foreground">Please wait while we fetch the API information.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Failed to load API information</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={loadApiData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">API Not Found</h1>
          <p className="text-muted-foreground">The requested API could not be found.</p>
          <Button onClick={() => window.history.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl">
              <img src="/zanwik-icon.svg" alt="Zanwik" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{api.name}</h1>
              <p className="text-muted-foreground">{api.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* API Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">API Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Base URL</label>
                  <p className="text-foreground font-mono bg-muted p-2 rounded">{api.baseUrl || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-foreground">{api.category || 'Uncategorized'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Authentication</label>
                  <p className="text-foreground">{api.auth || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Documentation</label>
                  <p className="text-foreground">
                    {api.docs ? (
                      <a href={api.docs} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {api.docs}
                      </a>
                    ) : (
                      'Not available'
                    )}
                  </p>
                </div>
              </div>
            </Card>

            {/* Endpoints */}
            {api.endpoints && api.endpoints.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Available Endpoints</h2>
                <div className="space-y-3">
                  {api.endpoints.map((endpoint, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                          endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {endpoint.method || 'GET'}
                        </span>
                        <code className="text-sm font-mono">{endpoint.path || endpoint.url}</code>
                      </div>
                      {endpoint.description && (
                        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => window.open(api.docs, '_blank')}>
                  View Documentation
                </Button>
                <Button variant="outline" className="w-full">
                  Test API
                </Button>
                <Button variant="outline" className="w-full">
                  Add to Project
                </Button>
              </div>
            </Card>

            {/* API Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">API Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="text-foreground">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="text-foreground">120ms</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDetail;
