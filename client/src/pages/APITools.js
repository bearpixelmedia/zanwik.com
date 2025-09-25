import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const APITools = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const apiParam = searchParams.get('api');
  const [selectedTool, setSelectedTool] = useState('tester');
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load API data if api parameter is provided
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
        }
      }
    } catch (error) {
      console.error('Error loading API data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    {
      id: 'tester',
      name: 'API Tester',
      icon: '🔧',
      description: 'Test any API endpoint with our powerful testing interface',
      features: [
        'Support for all HTTP methods',
        'Custom headers and authentication',
        'Request/response history',
        'JSON formatting and validation'
      ],
      action: 'Open API Tester'
    },
    {
      id: 'comparison',
      name: 'API Comparison',
      icon: '⚖️',
      description: 'Compare multiple APIs side-by-side to find the best solution',
      features: [
        'Feature comparison matrix',
        'Performance benchmarking',
        'Pricing analysis',
        'User reviews and ratings'
      ],
      action: 'Compare APIs'
    },
    {
      id: 'documentation',
      name: 'API Documentation',
      icon: '📚',
      description: 'Generate beautiful, interactive API documentation',
      features: [
        'OpenAPI 3.0 support',
        'Interactive examples',
        'Code generation',
        'Version management'
      ],
      action: 'Generate Docs'
    },
    {
      id: 'monitoring',
      name: 'API Monitoring',
      icon: '📊',
      description: 'Monitor your API endpoints for uptime and performance',
      features: [
        'Uptime monitoring',
        'Performance metrics',
        'Error tracking',
        'Custom alerts'
      ],
      action: 'Monitor APIs'
    }
  ];

  const handleToolAction = (toolId) => {
    setSelectedTool(toolId);
    
    // Navigate immediately to the tool
    switch (toolId) {
      case 'tester':
        navigate(`/tools/tester${apiParam ? `?api=${apiParam}` : ''}`);
        break;
      case 'comparison':
        // Show coming soon message for comparison tool
        alert('API Comparison tool is coming soon! This will allow you to compare multiple APIs side-by-side.');
        break;
      case 'documentation':
        // Show coming soon message for documentation tool
        alert('API Documentation generator is coming soon! This will help you create beautiful API docs.');
        break;
      case 'monitoring':
        // Show coming soon message for monitoring tool
        alert('API Monitoring tool is coming soon! This will help you monitor API uptime and performance.');
        break;
      default:
        console.log(`Opening ${toolId} tool`);
    }
  };

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
              <h1 className="text-3xl font-bold text-foreground">API Testing Tools</h1>
              <p className="text-muted-foreground">
                Test, debug, and optimize your API integrations with our comprehensive suite of developer tools.
              </p>
              {api && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">Working with: </span>
                  <span className="text-sm font-medium text-primary">{api.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Available Tools */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Available Tools</h2>
          <p className="text-muted-foreground mb-6">Choose the right tool for your API development needs</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <Card key={tool.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-4">{tool.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {tool.features.map((feature, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        ✓ {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => handleToolAction(tool.id)}
                    data-tool={tool.id}
                    className="w-full"
                    variant={selectedTool === tool.id ? "default" : "outline"}
                  >
                    {tool.action}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Start Guide */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Start Guide</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <h4 className="font-medium">Choose Your Tool</h4>
                <p className="text-sm text-muted-foreground">Select the API tool that best fits your needs from the cards above.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <h4 className="font-medium">Configure Your Request</h4>
                <p className="text-sm text-muted-foreground">Set up your API endpoint, headers, and request body as needed.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <h4 className="font-medium">Test & Analyze</h4>
                <p className="text-sm text-muted-foreground">Send your request and analyze the real response data.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation Help */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Navigation Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click any tool button to open that specific tool</li>
            <li>• Use the breadcrumb navigation to go back to previous pages</li>
            <li>• All tools support the current API context when available</li>
            <li>• Tool states are preserved as you navigate between them</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default APITools;
