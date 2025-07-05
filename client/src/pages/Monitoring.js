import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RefreshCw, Bell, Activity, Zap, Shield } from 'lucide-react';
import { monitoringAPI } from '../utils/api';

const Monitoring = () => {
  // Dynamic metrics state
  const [metrics, setMetrics] = useState([
    { name: 'Response Time', value: '245ms', change: '+12ms', trend: 'up' },
    { name: 'Error Rate', value: '0.2%', change: '-0.1%', trend: 'down' },
    { name: 'Throughput', value: '1.2k req/s', change: '+150', trend: 'up' },
    { name: 'Uptime', value: '99.9%', change: '+0.1%', trend: 'up' },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Alerts and system health remain static for now
  const alerts = [
    { id: 1, title: 'High CPU Usage', description: 'CPU usage exceeded 80% threshold', time: '2 minutes ago', service: 'Web Server', status: 'active', severity: 'warning' },
    { id: 2, title: 'Database Connection Slow', description: 'Database response time increased by 200%', time: '5 minutes ago', service: 'Database', status: 'resolved', severity: 'error' },
  ];
  const systemHealth = { overall: 'healthy', services: 4, issues: 1 };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch performance metrics from API
        const performance = await monitoringAPI.getPerformanceMetrics();
        // Example: performance.metrics = { responseTime, errorRate, throughput, uptime }
        if (performance && performance.metrics) {
          setMetrics([
            { name: 'Response Time', value: performance.metrics.responseTime || 'N/A', change: '+12ms', trend: 'up' },
            { name: 'Error Rate', value: performance.metrics.errorRate || 'N/A', change: '-0.1%', trend: 'down' },
            { name: 'Throughput', value: performance.metrics.throughput || 'N/A', change: '+150', trend: 'up' },
            { name: 'Uptime', value: performance.metrics.uptime || 'N/A', change: '+0.1%', trend: 'up' },
          ]);
        }
      } catch (err) {
        setError('Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monitoring</h1>
          <p className="text-muted-foreground">Real-time system monitoring and alert management.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" disabled={loading} onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button disabled>
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-4 p-4 rounded-lg border">
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
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {alert.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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
                <span className="text-sm font-medium text-green-500">
                  {systemHealth.overall}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Services</span>
                <span className="text-sm font-medium">
                  {systemHealth.services}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Issues</span>
                <span className="text-sm font-medium text-red-500">
                  {systemHealth.issues}
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
};

export default Monitoring; 