import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const EntrepreneurLanding = () => {
  const [stats, setStats] = useState({
    totalApis: 0,
    categories: 0,
    projects: 0,
    revenue: 0
  });
  const [featuredApis, setFeaturedApis] = useState([]);
  const [successStories, setSuccessStories] = useState([]);

  // Load stats
  const loadStats = async () => {
    try {
      const [apisResponse, projectsResponse] = await Promise.all([
        fetch('/api/apis'),
        fetch('/api/business-projects/dashboard/overview')
      ]);
      
      const apisData = await apisResponse.json();
      const projectsData = await projectsResponse.json();
      
      if (apisData.success && projectsData.success) {
        setStats({
          totalApis: apisData.data.totalApis || 0,
          categories: Object.keys(apisData.data.categories || {}).length,
          projects: projectsData.data.overview.totalProjects || 0,
          revenue: projectsData.data.overview.totalRevenue || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load featured APIs
  const loadFeaturedApis = async () => {
    try {
      const response = await fetch('/api/apis');
      const data = await response.json();
      
      if (data.success) {
        const apis = Object.values(data.data.apis || {});
        setFeaturedApis(apis.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading featured APIs:', error);
    }
  };

  // Load success stories
  const loadSuccessStories = async () => {
    try {
      const response = await fetch('/api/business-projects');
      const data = await response.json();
      
      if (data.success) {
        const projects = data.data.filter(p => p.status === 'live' && p.revenue.current > 0);
        setSuccessStories(projects.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading success stories:', error);
    }
  };

  useEffect(() => {
    loadStats();
    loadFeaturedApis();
    loadSuccessStories();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            The API Directory for
            <span className="text-blue-600"> Entrepreneurs</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover, integrate, and monetize APIs to build profitable online businesses. 
            Track your projects, monitor API health, and scale your revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-3">
              Start Building
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3">
              Browse APIs
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.totalApis.toLocaleString()}</div>
              <div className="text-gray-600">APIs Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{stats.categories}</div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{stats.projects}</div>
              <div className="text-gray-600">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{formatCurrency(stats.revenue)}</div>
              <div className="text-gray-600">Revenue Generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Build API-Powered Businesses
            </h2>
            <p className="text-xl text-gray-600">
              From discovery to deployment, we provide the tools entrepreneurs need to succeed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-3">API Discovery</h3>
              <p className="text-gray-600">
                Find the perfect APIs for your business with advanced search, filtering, and health monitoring.
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-3">Project Management</h3>
              <p className="text-gray-600">
                Track your business projects, monitor API usage, and measure revenue growth in real-time.
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3">API Testing</h3>
              <p className="text-gray-600">
                Test APIs before integration with built-in testing tools and authentication support.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured APIs Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular APIs for Entrepreneurs
            </h2>
            <p className="text-xl text-gray-600">
              Start building with these high-quality APIs trusted by successful businesses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredApis.map((api) => (
              <Card key={api.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold">{api.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {api.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{api.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{api.authentication}</span>
                  <span>{api.https ? 'HTTPS' : 'HTTP'}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              See how entrepreneurs are building profitable businesses with our APIs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((project, index) => (
              <Card key={project.id} className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatCurrency(project.revenue.current)}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">Revenue Generated</div>
                  <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <span>{project.apis.length} APIs</span>
                    <span>•</span>
                    <span className="capitalize">{project.status}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Build Your API-Powered Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of entrepreneurs who are already building profitable businesses with our APIs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Zanwik</h3>
              <p className="text-gray-400">
                The API Directory for Entrepreneurs. Build, scale, and monetize your online business.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">APIs</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Browse APIs</li>
                <li>API Health</li>
                <li>Testing Tools</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Business</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Project Management</li>
                <li>Revenue Tracking</li>
                <li>Analytics</li>
                <li>Success Stories</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Community</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Zanwik. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EntrepreneurLanding;
