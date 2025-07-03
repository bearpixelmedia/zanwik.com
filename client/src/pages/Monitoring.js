import React, { useState } from 'react';
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
  Database
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Monitoring = () => {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const alerts = [
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
  ];

  const metrics = [
    { name: 'Response Time', value: '245ms', change: '+12ms', trend: 'up' },
    { name: 'Error Rate', value: '0.2%', change: '-0.1%', trend: 'down' },
    { name: 'Throughput', value: '1.2k req/s', change: '+150', trend: 'up' },
    { name: 'Uptime', value: '99.9%', change: '+0.1%', trend: 'up' }
  ];

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
    ? alerts 
    : alerts.filter(alert => alert.severity === selectedSeverity);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
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
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
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
            <CardDescription>Overall system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Network</span>
                </div>
                <span className="text-sm text-green-500">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Database</span>
                </div>
                <span className="text-sm text-green-500">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">CPU</span>
                </div>
                <span className="text-sm text-yellow-500">Warning</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Security</span>
                </div>
                <span className="text-sm text-green-500">Healthy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
            <CardDescription>Average response time over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between space-x-1">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" 
                     style={{ height: `${Math.random() * 60 + 20}%` }}>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>00:00</span>
              <span>12:00</span>
              <span>24:00</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate Trend</CardTitle>
            <CardDescription>Error rate percentage over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between space-x-1">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex-1 bg-red-500/20 rounded-t-sm" 
                     style={{ height: `${Math.random() * 30}%` }}>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>00:00</span>
              <span>12:00</span>
              <span>24:00</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Monitoring; 