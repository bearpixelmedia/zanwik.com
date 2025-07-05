import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Globe,
  Activity,
  Zap,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { cn } from '../utils/cn';

const Infrastructure = () => {
  const [selectedService, setSelectedService] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedServiceForAction, setSelectedServiceForAction] =
    useState(null);
  const [deploying, setDeploying] = useState(false);
  const [infrastructureData, setInfrastructureData] = useState({
    services: [],
    systemStatus: {},
    resourceUsage: {},
    metrics: {},
    deployments: [],
  });

  useEffect(() => {
    fetchInfrastructureData();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchInfrastructureData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const fetchInfrastructureData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch system status
      const systemStatus = await api.getSystemStatus();

      // Fetch service metrics
      const serviceMetrics = await api.getServiceMetrics();

      // Fetch resource usage
      const resourceUsage = await api.getResourceUsage();

      setInfrastructureData({
        services: serviceMetrics.services || [],
        systemStatus: systemStatus.status || {},
        resourceUsage: resourceUsage.usage || {},
        metrics: serviceMetrics.metrics || {},
        deployments: serviceMetrics.deployments || [],
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
            lastDeploy: '2 hours ago',
            version: 'v2.1.0',
            environment: 'production',
            port: 80,
            healthCheck: 'passing',
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
            lastDeploy: '1 day ago',
            version: 'v1.5.2',
            environment: 'production',
            port: 5432,
            healthCheck: 'passing',
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
            lastDeploy: '3 days ago',
            version: 'v1.2.1',
            environment: 'production',
            port: 443,
            healthCheck: 'warning',
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
            lastDeploy: '6 hours ago',
            version: 'v3.0.0',
            environment: 'production',
            port: 8080,
            healthCheck: 'passing',
          },
        ],
        systemStatus: {
          totalServices: 4,
          averageUptime: '99.5%',
          cpuUsage: 29,
          memoryUsage: 61,
        },
        resourceUsage: {
          cpu: 29,
          memory: 61,
          disk: 23,
          network: 45,
        },
        metrics: {
          uptimeChange: 0.2,
          cpuChange: -5,
          memoryChange: 3,
        },
        deployments: [
          {
            id: 1,
            serviceId: 1,
            version: 'v2.1.0',
            status: 'completed',
            timestamp: '2024-01-20T10:30:00Z',
            duration: '2m 15s',
          },
          {
            id: 2,
            serviceId: 4,
            version: 'v3.0.0',
            status: 'completed',
            timestamp: '2024-01-20T04:15:00Z',
            duration: '1m 45s',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestartService = async serviceId => {
    try {
      await api.restartService(serviceId);
      // Refresh data after restart
      fetchInfrastructureData();
    } catch (err) {
      console.error('Failed to restart service:', err);
      alert('Failed to restart service');
    }
  };

  const handleDeployService = async serviceData => {
    try {
      setDeploying(true);
      await api.deployService(serviceData);
      fetchInfrastructureData();
      setShowDeployModal(false);
    } catch (err) {
      console.error('Failed to deploy service:', err);
      alert('Failed to deploy service');
    } finally {
      setDeploying(false);
    }
  };

  const handleServiceAction = async (serviceId, action) => {
    try {
      switch (action) {
        case 'start':
          await api.startService(serviceId);
          break;
        case 'stop':
          await api.stopService(serviceId);
          break;
        case 'restart':
          await api.restartService(serviceId);
          break;
        default:
          console.error('Unknown action:', action);
          return;
      }
      fetchInfrastructureData();
    } catch (err) {
      console.error(`Failed to ${action} service:`, err);
      alert(`Failed to ${action} service`);
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'warning':
        return <AlertCircle className='h-4 w-4 text-yellow-500' />;
      case 'error':
        return <AlertCircle className='h-4 w-4 text-red-500' />;
      default:
        return <Clock className='h-4 w-4 text-gray-500' />;
    }
  };

  const getTypeIcon = type => {
    switch (type) {
      case 'server':
        return <Server className='h-5 w-5' />;
      case 'database':
        return <Database className='h-5 w-5' />;
      case 'cdn':
        return <Globe className='h-5 w-5' />;
      case 'api':
        return <Settings className='h-5 w-5' />;
      default:
        return <Server className='h-5 w-5' />;
    }
  };

  const getHealthCheckColor = status => {
    switch (status) {
      case 'passing':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'failing':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getDeploymentStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredServices =
    selectedService === 'all'
      ? infrastructureData.services
      : infrastructureData.services.filter(
          service => service.status === selectedService
        );

  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p className='text-muted-foreground'>
            Loading infrastructure data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Infrastructure</h1>
          <p className='text-muted-foreground'>
            Monitor and manage your system resources and services.
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          {/* Auto-refresh controls */}
          <div className='flex items-center space-x-2 mr-4'>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size='sm'
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`}
              />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={e => setRefreshInterval(Number(e.target.value))}
                className='px-2 py-1 text-sm border border-border rounded bg-background'
              >
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            )}
          </div>

          <Button variant='outline' onClick={() => setShowDeployModal(true)}>
            <Upload className='h-4 w-4 mr-2' />
            Deploy Service
          </Button>

          <Button>
            <Settings className='h-4 w-4 mr-2' />
            Manage Services
          </Button>
        </div>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      {/* System Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Services
            </CardTitle>
            <Server className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {infrastructureData.systemStatus.totalServices ||
                infrastructureData.services.length}
            </div>
            <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
              <CheckCircle className='h-3 w-3 text-green-500' />
              <span className='text-green-500'>All operational</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Average Uptime
            </CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {infrastructureData.systemStatus.averageUptime || '99.5%'}
            </div>
            <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
              <TrendingUp className='h-3 w-3 text-green-500' />
              <span className='text-green-500'>
                +{infrastructureData.metrics.uptimeChange || 0}%
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              CPU Usage
            </CardTitle>
            <Cpu className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {infrastructureData.systemStatus.cpuUsage ||
                infrastructureData.resourceUsage.cpu ||
                0}
              %
            </div>
            <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
              <TrendingDown className='h-3 w-3 text-green-500' />
              <span className='text-green-500'>
                {infrastructureData.metrics.cpuChange || 0}%
              </span>
              <span>from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Memory Usage
            </CardTitle>
            <HardDrive className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {infrastructureData.systemStatus.memoryUsage ||
                infrastructureData.resourceUsage.memory ||
                0}
              %
            </div>
            <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
              <TrendingUp className='h-3 w-3 text-yellow-500' />
              <span className='text-yellow-500'>
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
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>
                Real-time status of all infrastructure services
              </CardDescription>
            </div>
            <div className='flex space-x-2'>
              <Button
                variant={selectedService === 'all' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setSelectedService('all')}
              >
                All ({infrastructureData.services.length})
              </Button>
              <Button
                variant={selectedService === 'healthy' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setSelectedService('healthy')}
              >
                Healthy (
                {
                  infrastructureData.services.filter(
                    s => s.status === 'healthy'
                  ).length
                }
                )
              </Button>
              <Button
                variant={selectedService === 'warning' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setSelectedService('warning')}
              >
                Warning (
                {
                  infrastructureData.services.filter(
                    s => s.status === 'warning'
                  ).length
                }
                )
              </Button>
              <Button
                variant={selectedService === 'error' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setSelectedService('error')}
              >
                Error (
                {
                  infrastructureData.services.filter(s => s.status === 'error')
                    .length
                }
                )
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredServices.length > 0 ? (
            <div className='space-y-4'>
              {filteredServices.map(service => (
                <div
                  key={service.id}
                  className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='flex-shrink-0'>
                      {getTypeIcon(service.type)}
                    </div>
                    <div>
                      <div className='flex items-center space-x-2'>
                        <h3 className='text-sm font-medium text-foreground'>
                          {service.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDeploymentStatusColor(
                            service.healthCheck
                          )}`}
                        >
                          {service.healthCheck}
                        </span>
                      </div>
                      <div className='flex items-center space-x-4 text-xs text-muted-foreground mt-1'>
                        <span>v{service.version}</span>
                        <span>{service.environment}</span>
                        <span>Port {service.port}</span>
                        <span>Last deploy: {service.lastDeploy}</span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center space-x-6'>
                    <div className='text-right'>
                      <div className='flex items-center space-x-2'>
                        {getStatusIcon(service.status)}
                        <span
                          className={`text-sm font-medium ${getStatusColor(
                            service.status
                          )}`}
                        >
                          {service.status}
                        </span>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        Uptime: {service.uptime}
                      </p>
                    </div>
                    <div className='flex items-center space-x-4 text-xs text-muted-foreground'>
                      <div className='text-center'>
                        <div className='font-medium'>{service.cpu}%</div>
                        <div>CPU</div>
                      </div>
                      <div className='text-center'>
                        <div className='font-medium'>{service.memory}%</div>
                        <div>RAM</div>
                      </div>
                      <div className='text-center'>
                        <div className='font-medium'>{service.disk}%</div>
                        <div>Disk</div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleServiceAction(service.id, 'start')}
                        disabled={service.status === 'healthy'}
                      >
                        <Play className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleServiceAction(service.id, 'stop')}
                        disabled={service.status === 'error'}
                      >
                        <Pause className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          handleServiceAction(service.id, 'restart')
                        }
                      >
                        <RefreshCw className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setSelectedServiceForAction(service);
                          setShowServiceModal(true);
                        }}
                      >
                        <Eye className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>
              <Server className='h-8 w-8 mx-auto mb-2 opacity-50' />
              <p>No services found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Deployments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
          <CardDescription>
            Latest service deployments and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {infrastructureData.deployments.length > 0 ? (
            <div className='space-y-4'>
              {infrastructureData.deployments.map(deployment => {
                const service = infrastructureData.services.find(
                  s => s.id === deployment.serviceId
                );
                return (
                  <div
                    key={deployment.id}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div className='flex items-center space-x-4'>
                      <div className='flex-shrink-0'>
                        <GitBranch className='h-5 w-5 text-blue-500' />
                      </div>
                      <div>
                        <h3 className='text-sm font-medium text-foreground'>
                          {service?.name || 'Unknown Service'} -{' '}
                          {deployment.version}
                        </h3>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(deployment.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDeploymentStatusColor(
                          deployment.status
                        )}`}
                      >
                        {deployment.status}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        Duration: {deployment.duration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>
              <GitBranch className='h-8 w-8 mx-auto mb-2 opacity-50' />
              <p>No recent deployments</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deploy Service Modal */}
      {showDeployModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='w-full max-w-md mx-4'>
            <CardHeader>
              <CardTitle>Deploy Service</CardTitle>
              <CardDescription>
                Deploy a new service or update existing one
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-foreground'>
                  Service Name
                </label>
                <input
                  type='text'
                  placeholder='Enter service name'
                  className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>
              <div>
                <label className='text-sm font-medium text-foreground'>
                  Service Type
                </label>
                <select className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'>
                  <option value='server'>Web Server</option>
                  <option value='database'>Database</option>
                  <option value='cdn'>CDN</option>
                  <option value='api'>API Gateway</option>
                </select>
              </div>
              <div>
                <label className='text-sm font-medium text-foreground'>
                  Version
                </label>
                <input
                  type='text'
                  placeholder='v1.0.0'
                  className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>
              <div>
                <label className='text-sm font-medium text-foreground'>
                  Environment
                </label>
                <select className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'>
                  <option value='production'>Production</option>
                  <option value='staging'>Staging</option>
                  <option value='development'>Development</option>
                </select>
              </div>
              <div className='flex space-x-2 pt-4'>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={() => setShowDeployModal(false)}
                  disabled={deploying}
                >
                  Cancel
                </Button>
                <Button
                  className='flex-1'
                  onClick={() => handleDeployService({})}
                  disabled={deploying}
                >
                  {deploying ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Deploying...
                    </>
                  ) : (
                    'Deploy Service'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Service Detail Modal */}
      {showServiceModal && selectedServiceForAction && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>{selectedServiceForAction.name}</CardTitle>
                  <CardDescription>
                    Service details and management
                  </CardDescription>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setShowServiceModal(false);
                    setSelectedServiceForAction(null);
                  }}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Service Overview */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h4 className='font-medium text-foreground mb-2'>
                    Service Information
                  </h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Type:</span>
                      <span>{selectedServiceForAction.type}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Version:</span>
                      <span>v{selectedServiceForAction.version}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Environment:
                      </span>
                      <span>{selectedServiceForAction.environment}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Port:</span>
                      <span>{selectedServiceForAction.port}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className='font-medium text-foreground mb-2'>Status</h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Status:</span>
                      <span
                        className={getStatusColor(
                          selectedServiceForAction.status
                        )}
                      >
                        {selectedServiceForAction.status}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Uptime:</span>
                      <span>{selectedServiceForAction.uptime}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Health Check:
                      </span>
                      <span
                        className={getHealthCheckColor(
                          selectedServiceForAction.healthCheck
                        )}
                      >
                        {selectedServiceForAction.healthCheck}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Last Deploy:
                      </span>
                      <span>{selectedServiceForAction.lastDeploy}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Usage */}
              <div>
                <h4 className='font-medium text-foreground mb-2'>
                  Resource Usage
                </h4>
                <div className='grid grid-cols-3 gap-4'>
                  <div className='text-center p-3 border rounded'>
                    <div className='text-2xl font-bold text-blue-500'>
                      {selectedServiceForAction.cpu}%
                    </div>
                    <div className='text-sm text-muted-foreground'>CPU</div>
                  </div>
                  <div className='text-center p-3 border rounded'>
                    <div className='text-2xl font-bold text-green-500'>
                      {selectedServiceForAction.memory}%
                    </div>
                    <div className='text-sm text-muted-foreground'>Memory</div>
                  </div>
                  <div className='text-center p-3 border rounded'>
                    <div className='text-2xl font-bold text-purple-500'>
                      {selectedServiceForAction.disk}%
                    </div>
                    <div className='text-sm text-muted-foreground'>Disk</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className='font-medium text-foreground mb-2'>Actions</h4>
                <div className='flex space-x-2'>
                  <Button
                    variant='outline'
                    onClick={() =>
                      handleServiceAction(selectedServiceForAction.id, 'start')
                    }
                    disabled={selectedServiceForAction.status === 'healthy'}
                  >
                    <Play className='h-4 w-4 mr-2' />
                    Start
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() =>
                      handleServiceAction(selectedServiceForAction.id, 'stop')
                    }
                    disabled={selectedServiceForAction.status === 'error'}
                  >
                    <Pause className='h-4 w-4 mr-2' />
                    Stop
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() =>
                      handleServiceAction(
                        selectedServiceForAction.id,
                        'restart'
                      )
                    }
                  >
                    <RefreshCw className='h-4 w-4 mr-2' />
                    Restart
                  </Button>
                  <Button variant='outline'>
                    <BarChart3 className='h-4 w-4 mr-2' />
                    Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Infrastructure;
