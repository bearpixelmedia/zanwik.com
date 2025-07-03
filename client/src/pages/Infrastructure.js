import React, { useState } from 'react';
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
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Infrastructure = () => {
  const [selectedService, setSelectedService] = useState('all');

  const services = [
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
  ];

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
    ? services 
    : services.filter(service => service.status === selectedService);

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
            <div className="text-2xl font-bold text-foreground">{services.length}</div>
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
            <div className="text-2xl font-bold text-foreground">99.5%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+0.2%</span>
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
            <div className="text-2xl font-bold text-foreground">29%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-green-500">-5%</span>
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
            <div className="text-2xl font-bold text-foreground">61%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-yellow-500" />
              <span className="text-yellow-500">+3%</span>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(service.type)}
                    <div>
                      <h3 className="font-medium text-foreground">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">Last deployed {service.lastDeploy}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{service.uptime}</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{service.cpu}%</p>
                    <p className="text-xs text-muted-foreground">CPU</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{service.memory}%</p>
                    <p className="text-xs text-muted-foreground">Memory</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{service.disk}%</p>
                    <p className="text-xs text-muted-foreground">Disk</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(service.status)}
                    <span className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage Over Time</CardTitle>
            <CardDescription>24-hour CPU utilization across all services</CardDescription>
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
            <CardTitle>Memory Usage Over Time</CardTitle>
            <CardDescription>24-hour memory utilization across all services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between space-x-1">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex-1 bg-blue-500/20 rounded-t-sm" 
                     style={{ height: `${Math.random() * 40 + 40}%` }}>
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

export default Infrastructure; 