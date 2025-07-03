import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Globe, 
  Cpu, 
  HardDrive, 
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { infrastructureAPI } from '../utils/api';

const Infrastructure = () => {
  const [selectedService, setSelectedService] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [infrastructureData, setInfrastructureData] = useState({
    services: [],
    systemStatus: {},
    resourceUsage: {},
    metrics: {}
  });

  useEffect(() => {
    fetchInfrastructureData();
  }, []);

  const fetchInfrastructureData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch system status
      const systemStatus = await infrastructureAPI.getSystemStatus();
      
      // Fetch service metrics
      const serviceMetrics = await infrastructureAPI.getServiceMetrics();
      
      // Fetch resource usage
      const resourceUsage = await infrastructureAPI.getResourceUsage();

      setInfrastructureData({
        services: serviceMetrics.services || [],
        systemStatus: systemStatus.status || {},
        resourceUsage: resourceUsage.usage || {},
        metrics: serviceMetrics.metrics || {}
      });
    } catch (err) {
      console.error('Failed to fetch infrastructure data:', err);
      setError('Failed to load infrastructure data');
      
      // Fallback to mock data
      setInfrastructureData({
        services: [
          {
            id: 1,
            name: 'Web Server',
            type: 'server',
            status: 'healthy',
            uptime: '99.9%',
            cpu: 45,
            memory: 67,
            disk: 23,
            lastDeploy: '2 hours ago'
          },
          {
            id: 2,
            name: 'Database',
            type: 'database',
            status: 'healthy',
            uptime: '99.8%',
            cpu: 32,
            memory: 89,
            disk: 45,
            lastDeploy: '1 day ago'
          },
          {
            id: 3,
            name: 'CDN',
            type: 'cdn',
            status: 'warning',
            uptime: '98.5%',
            cpu: 12,
            memory: 34,
            disk: 8,
            lastDeploy: '3 days ago'
          },
          {
            id: 4,
            name: 'API Gateway',
            type: 'api',
            status: 'healthy',
            uptime: '99.7%',
            cpu: 28,
            memory: 56,
            disk: 15,
            lastDeploy: '6 hours ago'
          }
        ],
        systemStatus: {
          totalServices: 4,
          averageUptime: '99.5%',
          cpuUsage: 29,
          memoryUsage: 61
        },
        resourceUsage: {
          cpu: 29,
          memory: 61,
          disk: 23,
          network: 45
        },
        metrics: {
          uptimeChange: 0.2,
          cpuChange: -5,
          memoryChange: 3
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestartService = async (serviceId) => {
    try {
      await infrastructureAPI.restartService(serviceId);
      // Refresh data after restart
      fetchInfrastructureData();
    } catch (err) {
      console.error('Failed to restart service:', err);
      alert('Failed to restart service');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'server': return <Server className="h-5 w-5" />;
      case 'database': return <Database className="h-5 w-5" />;
      case 'cdn': return <Globe className="h-5 w-5" />;
      case 'api': return <Settings className="h-5 w-5" />;
      default: return <Server className="h-5 w-5" />;
    }
  };

  const filteredServices = selectedService === 'all' 
    ? infrastructureData.services 
    : infrastructureData.services.filter(service => service.status === selectedService);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading infrastructure data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Infrastructure</h1>
          <p className="text-muted-foreground">Monitor and manage your system resources and services.</p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Manage Services
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Services
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {infrastructureData.systemStatus.totalServices || infrastructureData.services.length}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-green-500">All operational</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Uptime
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {infrastructureData.systemStatus.averageUptime || '99.5%'}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">
                +{infrastructureData.metrics.uptimeChange || 0}%
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CPU Usage
            </CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {infrastructureData.systemStatus.cpuUsage || infrastructureData.resourceUsage.cpu || 0}%
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-green-500">
                {infrastructureData.metrics.cpuChange || 0}%
              </span>
              <span>from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Memory Usage
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {infrastructureData.systemStatus.memoryUsage || infrastructureData.resourceUsage.memory || 0}%
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-yellow-500" />
              <span className="text-yellow-500">
                +{infrastructureData.metrics.memoryChange || 0}%
              </span>
              <span>from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Real-time status of all infrastructure services</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={selectedService === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedService('all')}
              >
                All
              </Button>
              <Button
                variant={selectedService === 'healthy' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedService('healthy')}
              >
                Healthy
              </Button>
              <Button
                variant={selectedService === 'warning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedService('warning')}
              >
                Warning
              </Button>
              <Button
                variant={selectedService === 'error' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedService('error')}
              >
                Error
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredServices.length > 0 ? (
            <div className="space-y-4">
              {filteredServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getTypeIcon(service.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{service.name}</h3>
                      <p className="text-xs text-muted-foreground">Last deploy: {service.lastDeploy}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(service.status)}
                        <span className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Uptime: {service.uptime}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>CPU: {service.cpu}%</span>
                      <span>RAM: {service.memory}%</span>
                      <span>Disk: {service.disk}%</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestartService(service.id)}
                    >
                      Restart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Server className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No services found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Infrastructure; 