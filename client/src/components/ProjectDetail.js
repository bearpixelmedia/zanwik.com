import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const ProjectDetail = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddApi, setShowAddApi] = useState(false);
  const [availableApis, setAvailableApis] = useState([]);
  const [selectedApi, setSelectedApi] = useState('');

  // Load project data
  const loadProject = async () => {
    try {
      const response = await fetch(`/api/business-projects/${projectId}`);
      const data = await response.json();
      
      if (data.success) {
        setProject(data.data);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  // Load project analytics
  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/business-projects/${projectId}/analytics`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  // Load available APIs
  const loadAvailableApis = async () => {
    try {
      const response = await fetch('/api/apis');
      const data = await response.json();
      
      if (data.success) {
        setAvailableApis(data.data.apis || []);
      }
    } catch (error) {
      console.error('Error loading APIs:', error);
    }
  };

  // Add API to project
  const addApiToProject = async () => {
    if (!selectedApi) return;

    try {
      const api = availableApis.find(a => a.id === selectedApi);
      if (!api) return;

      const response = await fetch(`/api/business-projects/${projectId}/apis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(api)
      });
      
      const data = await response.json();
      if (data.success) {
        setShowAddApi(false);
        setSelectedApi('');
        loadProject();
        loadAnalytics();
      } else {
        alert('Failed to add API: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding API:', error);
      alert('Failed to add API: ' + error.message);
    }
  };

  // Update project status
  const updateStatus = async (newStatus) => {
    try {
      const response = await fetch(`/api/business-projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      if (data.success) {
        loadProject();
      } else {
        alert('Failed to update status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    }
  };

  // Update revenue
  const updateRevenue = async (amount, period = 'total') => {
    try {
      const response = await fetch(`/api/business-projects/${projectId}/revenue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, period })
      });
      
      const data = await response.json();
      if (data.success) {
        loadProject();
        loadAnalytics();
      } else {
        alert('Failed to update revenue: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating revenue:', error);
      alert('Failed to update revenue: ' + error.message);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadAnalytics();
      loadAvailableApis();
    }
  }, [projectId]);

  useEffect(() => {
    setLoading(false);
  }, [project]);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center p-8">
        <div className="text-lg text-gray-600">Project not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <p className="text-gray-600">{project.description}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <span className="text-sm text-gray-500">
              Created {formatDate(project.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <select
            value={project.status}
            onChange={(e) => updateStatus(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="planning">Planning</option>
            <option value="development">Development</option>
            <option value="testing">Testing</option>
            <option value="live">Live</option>
            <option value="paused">Paused</option>
          </select>
          <Button onClick={() => setShowAddApi(true)}>
            Add API
          </Button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(project.revenue.current)}</div>
          <div className="text-sm text-gray-600">Current Revenue</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(project.revenue.monthly)}</div>
          <div className="text-sm text-gray-600">Monthly Revenue</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(project.revenue.target)}</div>
          <div className="text-sm text-gray-600">Target Revenue</div>
        </Card>
      </div>

      {/* Revenue Progress */}
      {analytics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress to Target</span>
                <span>{analytics.revenue.progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(analytics.revenue.progress, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Update Current Revenue</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="flex-1 p-2 border rounded-md"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const amount = parseFloat(e.target.value);
                        if (!isNaN(amount)) {
                          updateRevenue(amount, 'total');
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <Button 
                    onClick={(e) => {
                      const amount = parseFloat(e.target.previousElementSibling.value);
                      if (!isNaN(amount)) {
                        updateRevenue(amount, 'total');
                        e.target.previousElementSibling.value = '';
                      }
                    }}
                  >
                    Update
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Update Monthly Revenue</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="flex-1 p-2 border rounded-md"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const amount = parseFloat(e.target.value);
                        if (!isNaN(amount)) {
                          updateRevenue(amount, 'monthly');
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <Button 
                    onClick={(e) => {
                      const amount = parseFloat(e.target.previousElementSibling.value);
                      if (!isNaN(amount)) {
                        updateRevenue(amount, 'monthly');
                        e.target.previousElementSibling.value = '';
                      }
                    }}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* APIs Used */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">APIs Used ({project.apis.length})</h3>
        <div className="space-y-3">
          {project.apis.map((api, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">{api.name}</div>
                <div className="text-sm text-gray-600">{api.category}</div>
                <div className="text-xs text-gray-500">
                  {api.usage.calls} calls • {formatCurrency(api.usage.cost)} cost
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Added {formatDate(api.addedAt)}
              </div>
            </div>
          ))}
          {project.apis.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No APIs added yet. Click "Add API" to get started.
            </div>
          )}
        </div>
      </Card>

      {/* Analytics */}
      {analytics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Project Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">{analytics.apis.total}</div>
              <div className="text-sm text-gray-600">Total APIs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{analytics.apis.calls}</div>
              <div className="text-sm text-gray-600">API Calls</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(analytics.apis.cost)}</div>
              <div className="text-sm text-gray-600">API Costs</div>
            </div>
          </div>
        </Card>
      )}

      {/* Add API Modal */}
      {showAddApi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add API to Project</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select API</label>
                <select
                  value={selectedApi}
                  onChange={(e) => setSelectedApi(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose an API...</option>
                  {availableApis.map((api) => (
                    <option key={api.id} value={api.id}>
                      {api.name} - {api.category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button onClick={addApiToProject} className="flex-1" disabled={!selectedApi}>
                Add API
              </Button>
              <Button 
                onClick={() => setShowAddApi(false)} 
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

export default ProjectDetail;
