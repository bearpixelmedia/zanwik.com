import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const APISubmissionForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    baseUrl: '',
    authentication: 'No',
    cors: false,
    https: true,
    documentation: '',
    features: [],
    pricing: 'Free',
    rateLimit: 'Unknown'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'development',
    'finance',
    'ai',
    'communication',
    'games-comics',
    'social',
    'weather',
    'music',
    'health',
    'photography',
    'geocoding',
    'government',
    'transportation',
    'cryptocurrency',
    'video',
    'security',
    'sports',
    'ecommerce',
    'entertainment',
    'news',
    'education',
    'travel',
    'real-estate'
  ];

  const authenticationTypes = [
    'No',
    'API Key',
    'OAuth',
    'Basic Auth',
    'JWT',
    'Custom'
  ];

  const commonFeatures = [
    'REST API',
    'GraphQL',
    'Webhooks',
    'SDK Available',
    'Rate Limiting',
    'CORS Support',
    'HTTPS Only',
    'Free Tier',
    'Documentation',
    'Sandbox Environment'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/community/apis/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userId: 'current-user' // This would come from auth context
        })
      });

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          description: '',
          category: '',
          baseUrl: '',
          authentication: 'No',
          cors: false,
          https: true,
          documentation: '',
          features: [],
          pricing: 'Free',
          rateLimit: 'Unknown'
        });
      } else {
        alert('Failed to submit API: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting API:', error);
      alert('Failed to submit API: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-600 mb-4">API Submitted Successfully!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your contribution. Your API submission is now under review.
        </p>
        <Button onClick={() => setSubmitted(false)}>
          Submit Another API
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Submit a New API</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">API Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md"
              placeholder="e.g., GitHub API"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full p-2 border rounded-md"
              placeholder="Describe what this API does and its main features..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a category...</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* API Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">API Details</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Base URL *</label>
            <input
              type="url"
              name="baseUrl"
              value={formData.baseUrl}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md"
              placeholder="https://api.example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Documentation URL</label>
            <input
              type="url"
              name="documentation"
              value={formData.documentation}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              placeholder="https://docs.example.com"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Authentication</label>
              <select
                name="authentication"
                value={formData.authentication}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              >
                {authenticationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Pricing</label>
              <input
                type="text"
                name="pricing"
                value={formData.pricing}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                placeholder="e.g., Free, $10/month, Pay-per-use"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rate Limit</label>
              <input
                type="text"
                name="rateLimit"
                value={formData.rateLimit}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                placeholder="e.g., 1000/hour, 10/second"
              />
            </div>
          </div>
        </div>

        {/* Technical Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Technical Features</h3>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="https"
                checked={formData.https}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm">HTTPS Support</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                name="cors"
                checked={formData.cors}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm">CORS Support</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Features</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonFeatures.map(feature => (
                <label key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="mr-2"
                  />
                  <span className="text-sm">{feature}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormData({
              name: '',
              description: '',
              category: '',
              baseUrl: '',
              authentication: 'No',
              cors: false,
              https: true,
              documentation: '',
              features: [],
              pricing: 'Free',
              rateLimit: 'Unknown'
            })}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit API'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default APISubmissionForm;
