import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RefreshCw, Bell, Activity, Zap, Shield, CheckCircle, AlertCircle, XCircle, Clock, Settings } from 'lucide-react';
import { monitoringAPI } from '../utils/api';

const Monitoring = () => {
  // Dynamic metrics state
  const [metrics, setMetrics] = useState([
    { name: 'Response Time', value: '245ms', change: '+12ms', trend: 'up' },
    { name: 'Error Rate', value: '0.2%', change: '-0.1%', trend: 'down' },
    { name: 'Throughput', value: '1.2k req/s', change: '+150', trend: 'up' },
    { name: 'Uptime', value: '99.9%', change: '+0.1%', trend: 'up' },
  ]);
  const [alerts, setAlerts] = useState([
    { id: 1, title: 'High CPU Usage', description: 'CPU usage exceeded 80% threshold', time: '2 minutes ago', service: 'Web Server', status: 'active', severity: 'warning' },
    { id: 2, title: 'Database Connection Slow', description: 'Database response time increased by 200%', time: '5 minutes ago', service: 'Database', status: 'resolved', severity: 'error' },
  ]);
  const [systemHealth, setSystemHealth] = useState({ 
    overall: 'healthy', 
    services: 4, 
    issues: 1,
    lastCheck: new Date().toLocaleTimeString(),
    services: [
      { name: 'Web Server', status: 'healthy', uptime: '99.9%', responseTime: '120ms' },
      { name: 'Database', status: 'warning', uptime: '99.5%', responseTime: '450ms' },
      { name: 'API Gateway', status: 'healthy', uptime: '99.8%', responseTime: '80ms' },
      { name: 'Cache Service', status: 'healthy', uptime: '99.7%', responseTime: '15ms' }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch performance metrics from API
        const performance = await monitoringAPI.getPerformanceMetrics();
        if (performance && performance.metrics) {
          setMetrics([
            { name: 'Response Time', value: performance.metrics.responseTime || 'N/A', change: '+12ms', trend: 'up' },
            { name: 'Error Rate', value: performance.metrics.errorRate || 'N/A', change: '-0.1%', trend: 'down' },
            { name: 'Throughput', value: performance.metrics.throughput || 'N/A', change: '+150', trend: 'up' },
            { name: 'Uptime', value: performance.metrics.uptime || 'N/A', change: '+0.1%', trend: 'up' },
          ]);
        }
        // Fetch alerts from API
        const alertsData = await monitoringAPI.getAlerts('all');
        if (alertsData && Array.isArray(alertsData.alerts)) {
          setAlerts(alertsData.alerts);
        }
        // Fetch system health from API
        const healthData = await monitoringAPI.getSystemHealth();
        if (healthData) {
          setSystemHealth({
            overall: healthData.overall || 'healthy',
            services: healthData.services || 4,
            issues: healthData.issues || 0,
            lastCheck: new Date().toLocaleTimeString(),
            services: healthData.services || [
              { name: 'Web Server', status: 'healthy', uptime: '99.9%', responseTime: '120ms' },
              { name: 'Database', status: 'warning', uptime: '99.5%', responseTime: '450ms' },
              { name: 'API Gateway', status: 'healthy', uptime: '99.8%', responseTime: '80ms' },
              { name: 'Cache Service', status: 'healthy', uptime: '99.7%', responseTime: '15ms' }
            ]
          });
        }
      } catch (err) {
        setError('Failed to load monitoring data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      window.location.reload();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Alert management functions
  const acknowledgeAlert = async (alertId) => {
    try {
      await monitoringAPI.acknowledgeAlert(alertId);
      // Update local state to reflect the change
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged' }
            : alert
        )
      );
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'error': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monitoring</h1>
          <p className="text-muted-foreground">Real-time system monitoring and alert management.</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Auto-refresh controls */}
          <div className="flex items-center space-x-2 mr-4">
            <Button 
              variant={autoRefresh ? "default" : "outline"} 
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-border rounded bg-background"
              >
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            )}
          </div>
          
          <Button variant="outline" disabled={loading} onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button disabled>
            <Settings className="h-4 w-4 mr-2" />
            Alert Settings
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.length > 0 ? alerts.map((alert) => (
                <div key={alert.id} className={`flex items-start space-x-4 p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
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
                        alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-800' :
                        alert.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                  {alert.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-xs"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Acknowledge
                    </Button>
                  )}
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No alerts found</p>
                </div>
              )}
            </div>
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
                  systemHealth.overall === 'healthy' ? 'text-green-500' :
                  systemHealth.overall === 'warning' ? 'text-yellow-500' :
                  systemHealth.overall === 'error' ? 'text-red-500' :
                  'text-gray-500'
                }`}>
                  {systemHealth.overall}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Services</span>
                <span className="text-sm font-medium text-blue-500">
                  {systemHealth.services?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Issues</span>
                <span className={`text-sm font-medium ${
                  systemHealth.issues > 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {systemHealth.issues}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Check</span>
                <span className="text-sm font-medium text-gray-500">
                  {systemHealth.lastCheck}
                </span>
              </div>
              
              {/* Service Breakdown */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Service Details</h4>
                <div className="space-y-3">
                  {systemHealth.services?.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(service.status)}
                        <span className="text-sm font-medium">{service.name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Uptime: {service.uptime}</span>
                        <span>Response: {service.responseTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Monitoring; 