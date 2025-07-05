import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Activity,
  Eye,
  RefreshCw,
  Bell,
  Zap,
  Shield,
  Wifi,
  Database,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { monitoringAPI } from '../utils/api';

const Monitoring = () => {
  // TEMPORARY SIMPLE COMPONENT TO DEBUG REACT ERROR
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Monitoring (Debug)</h1>
        <p className="text-muted-foreground">Testing if this page causes the React error.</p>
      </div>
      <Card>
        <CardContent>
          <p>If you can see this, the Monitoring component is not causing the React error.</p>
        </CardContent>
      </Card>
    </div>
  );
};

/*
ORIGINAL MONITORING COMPONENT CODE (COMMENTED OUT FOR DEBUGGING)
const [selectedSeverity, setSelectedSeverity] = useState('all');
const [isRefreshing, setIsRefreshing] = useState(false);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [monitoringData, setMonitoringData] = useState({
  alerts: [],
  performanceMetrics: {},
  systemHealth: {}
});

useEffect(() => {
  fetchMonitoringData();
}, []);

const fetchMonitoringData = async () => {
  try {
    setLoading(true);
    setError(null);

    // Fetch alerts
    const alerts = await monitoringAPI.getAlerts(selectedSeverity);
    
    // Fetch performance metrics
    const performance = await monitoringAPI.getPerformanceMetrics();
    
    // Fetch system health
    const health = await monitoringAPI.getSystemHealth();

    setMonitoringData({
      alerts: alerts.alerts || [],
      performanceMetrics: performance.metrics || {},
      systemHealth: health.health || {}
    });
  } catch (err) {
    console.error('Failed to fetch monitoring data:', err);
    setError('Failed to load monitoring data');
    
    // Fallback to mock data
    setMonitoringData({
      alerts: [
        {
          id: 1,
          title: 'High CPU Usage',
          description: 'CPU usage exceeded 80% threshold',
          severity: 'warning',
          time: '2 minutes ago',
          service: 'Web Server',
          status: 'active'
        },
        {
          id: 2,
          title: 'Database Connection Slow',
          description: 'Database response time increased by 200%',
          severity: 'error',
          time: '5 minutes ago',
          service: 'Database',
          status: 'resolved'
        },
        {
          id: 3,
          title: 'Memory Usage Alert',
          description: 'Memory usage approaching 90%',
          severity: 'warning',
          time: '10 minutes ago',
          service: 'API Gateway',
          status: 'active'
        },
        {
          id: 4,
          title: 'CDN Performance Degraded',
          description: 'CDN response times increased',
          severity: 'info',
          time: '15 minutes ago',
          service: 'CDN',
          status: 'monitoring'
        }
      ],
      performanceMetrics: {
        responseTime: '245ms',
        errorRate: '0.2%',
        throughput: '1.2k req/s',
        uptime: '99.9%'
      },
      systemHealth: {
        overall: 'healthy',
        services: 4,
        issues: 1
      }
    });
  } finally {
    setLoading(false);
  }
};

const handleRefresh = async () => {
  setIsRefreshing(true);
  await fetchMonitoringData();
  setIsRefreshing(false);
};

const handleAcknowledgeAlert = async (alertId) => {
  try {
    await monitoringAPI.acknowledgeAlert(alertId);
    // Refresh data after acknowledging
    fetchMonitoringData();
  } catch (err) {
    console.error('Failed to acknowledge alert:', err);
    alert('Failed to acknowledge alert');
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'error': return 'text-red-500 bg-red-50 border-red-200';
    case 'warning': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    case 'info': return 'text-blue-500 bg-blue-50 border-blue-200';
    default: return 'text-gray-500 bg-gray-50 border-gray-200';
  }
};

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'info': return <Eye className="h-4 w-4 text-blue-500" />;
    default: return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const filteredAlerts = selectedSeverity === 'all' 
  ? monitoringData.alerts 
  : monitoringData.alerts.filter(alert => alert.severity === selectedSeverity);

const metrics = [
  { 
    name: 'Response Time', 
    value: monitoringData.performanceMetrics.responseTime || '245ms', 
    change: '+12ms', 
    trend: 'up' 
  },
  { 
    name: 'Error Rate', 
    value: monitoringData.performanceMetrics.errorRate || '0.2%', 
    change: '-0.1%', 
    trend: 'down' 
  },
  { 
    name: 'Throughput', 
    value: monitoringData.performanceMetrics.throughput || '1.2k req/s', 
    change: '+150', 
    trend: 'up' 
  },
  { 
    name: 'Uptime', 
    value: monitoringData.performanceMetrics.uptime || '99.9%', 
    change: '+0.1%', 
    trend: 'up' 
  }
];

if (loading) {
  return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading monitoring data...</p>
      </div>
    </div>
  );
}

return (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Monitoring</h1>
        <p className="text-muted-foreground">Real-time system monitoring and alert management.</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button>
          <Bell className="h-4 w-4 mr-2" />
          Manage Alerts
        </Button>
      </div>
    </div>

    {error && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {typeof error === 'string' ? error : JSON.stringify(error)}
      </div>
    )}

    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.name}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metric.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {metric.trend === 'up' ? (
                <Zap className="h-3 w-3 text-green-500" />
              ) : (
                <Shield className="h-3 w-3 text-blue-500" />
              )}
              <span className={metric.trend === 'up' ? 'text-green-500' : 'text-blue-500'}>
                {metric.change}
              </span>
              <span>from last hour</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* System Status */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Alerts */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent alerts and notifications</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={selectedSeverity === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('all')}
              >
                All
              </Button>
              <Button
                variant={selectedSeverity === 'error' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('error')}
              >
                Errors
              </Button>
              <Button
                variant={selectedSeverity === 'warning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('warning')}
              >
                Warnings
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length > 0 ? (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className={`flex items-start space-x-4 p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground">
                        {alert.title}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        Service: {alert.service}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        alert.status === 'active' ? 'bg-red-100 text-red-800' :
                        alert.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>
                  {alert.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No alerts found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Overall system status and health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Status</span>
              <span className={`text-sm font-medium ${
                monitoringData.systemHealth.overall === 'healthy' ? 'text-green-500' :
                monitoringData.systemHealth.overall === 'warning' ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {monitoringData.systemHealth.overall || 'healthy'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Services</span>
              <span className="text-sm font-medium">
                {monitoringData.systemHealth.services || 4}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Issues</span>
              <span className="text-sm font-medium text-red-500">
                {monitoringData.systemHealth.issues || 1}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Check</span>
              <span className="text-sm font-medium">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
*/

export default Monitoring; 