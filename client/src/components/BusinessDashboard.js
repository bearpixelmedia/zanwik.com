import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const BusinessDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    category: '',
    revenueTarget: 0,
    targetLaunch: ''
  });

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/business-projects/dashboard/overview');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Load projects
  const loadProjects = async () => {
    try {
      const response = await fetch('/api/business-projects');
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new project
  const createProject = async () => {
    try {
      const response = await fetch('/api/business-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProject)
      });
      
      const data = await response.json();
      if (data.success) {
        setShowCreateProject(false);
        setNewProject({ name: '', description: '', category: '', revenueTarget: 0, targetLaunch: '' });
        loadProjects();
        loadDashboardData();
      } else {
        alert('Failed to create project: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project: ' + error.message);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadProjects();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'text-green-600 bg-green-100';
      case 'development': return 'text-blue-600 bg-blue-100';
      case 'testing': return 'text-yellow-600 bg-yellow-100';
      case 'planning': return 'text-gray-600 bg-gray-100';
      case 'paused': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Dashboard</h2>
          <p className="text-gray-600">Manage your API-powered business projects</p>
        </div>
        <Button onClick={() => setShowCreateProject(true)}>
          Create New Project
        </Button>
      </div>

      {/* Overview Stats */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{dashboardData.overview.totalProjects}</div>
            <div className="text-sm text-gray-600">Total Projects</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{dashboardData.overview.activeProjects}</div>
            <div className="text-sm text-gray-600">Active Projects</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(dashboardData.overview.totalRevenue)}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(dashboardData.overview.monthlyRevenue)}</div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
          </Card>
        </div>
      )}

      {/* Projects by Status */}
      {dashboardData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Projects by Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(dashboardData.projectsByStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{status}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Projects */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
        <div className="space-y-4">
          {projects.slice(0, 5).map((project) => (
            <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm text-gray-600">{project.description}</div>
                  <div className="text-xs text-gray-500">
                    {project.apis.length} APIs • {formatCurrency(project.revenue.current)} revenue
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="My API Business"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full p-2 border rounded-md h-20"
                  placeholder="Describe your business project..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newProject.category}
                  onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select category</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="saas">SaaS</option>
                  <option value="mobile-app">Mobile App</option>
                  <option value="web-app">Web App</option>
                  <option value="api-service">API Service</option>
                  <option value="data-analytics">Data Analytics</option>
                  <option value="automation">Automation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Revenue Target ($)</label>
                <input
                  type="number"
                  value={newProject.revenueTarget}
                  onChange={(e) => setNewProject({...newProject, revenueTarget: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded-md"
                  placeholder="10000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Target Launch Date</label>
                <input
                  type="date"
                  value={newProject.targetLaunch}
                  onChange={(e) => setNewProject({...newProject, targetLaunch: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button onClick={createProject} className="flex-1">
                Create Project
              </Button>
              <Button 
                onClick={() => setShowCreateProject(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard;
