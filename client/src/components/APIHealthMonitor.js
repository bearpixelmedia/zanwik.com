import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const APIHealthMonitor = () => {
  const [healthData, setHealthData] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState(false);

  // Load health data
  const loadHealthData = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (data.success) {
        setHealthData(data.data.health);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Start monitoring
  const startMonitoring = async () => {
    try {
      const response = await fetch('/api/health/monitor/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ interval: 5 })
      });
      
      const data = await response.json();
      if (data.success) {
        setMonitoring(true);
        console.log('Monitoring started');
      }
    } catch (error) {
      console.error('Error starting monitoring:', error);
    }
  };

  // Stop monitoring
  const stopMonitoring = async () => {
    try {
      const response = await fetch('/api/health/monitor/stop', {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        setMonitoring(false);
        console.log('Monitoring stopped');
      }
    } catch (error) {
      console.error('Error stopping monitoring:', error);
    }
  };

  // Check specific API
  const checkApi = async (apiId) => {
    try {
      const response = await fetch(`/api/health/${apiId}/check`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh health data
        loadHealthData();
      }
    } catch (error) {
      console.error('Error checking API:', error);
    }
  };

  useEffect(() => {
    loadHealthData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadHealthData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'error': return 'text-red-600';
      case 'unknown': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'up': return '🟢';
      case 'down': return '🔴';
      case 'error': return '❌';
      case 'unknown': return '⚪';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading health data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Health Monitor</h2>
          <p className="text-gray-600">Monitor API status and performance</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={monitoring ? stopMonitoring : startMonitoring}
            variant={monitoring ? "destructive" : "default"}
          >
            {monitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button onClick={loadHealthData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.up || 0}</div>
          <div className="text-sm text-gray-600">APIs Up</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">{stats.down || 0}</div>
          <div className="text-sm text-gray-600">APIs Down</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.uptime || 0}%</div>
          <div className="text-sm text-gray-600">Uptime</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.avgResponseTime || 0}ms</div>
          <div className="text-sm text-gray-600">Avg Response Time</div>
        </Card>
      </div>

      {/* API Health List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">API Status</h3>
        <div className="space-y-2">
          {Object.entries(healthData).map(([apiId, health]) => (
            <div
              key={apiId}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getStatusIcon(health.status)}</span>
                <div>
                  <div className="font-medium">{apiId}</div>
                  <div className="text-sm text-gray-600">
                    {health.responseTime}ms • {health.statusCode || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getStatusColor(health.status)}`}>
                  {health.status.toUpperCase()}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => checkApi(apiId)}
                >
                  Check
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Error Details */}
      {Object.values(healthData).some(h => h.error) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-600">Errors</h3>
          <div className="space-y-2">
            {Object.entries(healthData)
              .filter(([_, health]) => health.error)
              .map(([apiId, health]) => (
                <div key={apiId} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-medium text-red-800">{apiId}</div>
                  <div className="text-sm text-red-600">{health.error}</div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default APIHealthMonitor;
