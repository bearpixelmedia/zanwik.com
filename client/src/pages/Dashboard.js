import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Calendar,
  Globe,
  Search,
  Settings,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { cn } from '../utils/cn';

const Dashboard = () => {
  console.log('Rendering Dashboard');
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentActivity: [],
    overview: {},
    performance: {},
    alerts: [],
    systemHealth: {},
  });

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard overview
      const overview = await api.analytics.getDashboardOverview();

      // Use overview data for project stats instead of separate API call
      const projectStats = {
        total: overview.overview?.totalProjects || 0,
        active: overview.overview?.topProjects?.length || 0,
      };

      // Transform data for display
      const stats = [
        {
          title: 'Total Revenue',
          value: `$${overview.revenue?.total?.toLocaleString() || '0'}`,
          change: `${overview.revenue?.change || 0}%`,
          changeType: overview.revenue?.change >= 0 ? 'positive' : 'negative',
          icon: DollarSign,
          description: 'from last month',
          trend: overview.revenue?.trend || [],
        },
        {
          title: 'Active Users',
          value: overview.users?.active?.toLocaleString() || '0',
          change: `${overview.users?.change || 0}%`,
          changeType: overview.users?.change >= 0 ? 'positive' : 'negative',
          icon: Users,
          description: 'from last month',
          trend: overview.users?.trend || [],
        },
        {
          title: 'Projects',
          value: projectStats.total?.toString() || '0',
          change: `+${projectStats.active || 0}`,
          changeType: 'positive',
          icon: TrendingUp,
          description: 'active projects',
          trend: [],
        },
        {
          title: 'System Health',
          value: `${overview.system?.health || 0}%`,
          change: `${overview.system?.change || 0}%`,
          changeType: overview.system?.change >= 0 ? 'positive' : 'negative',
          icon: Activity,
          description: 'uptime this month',
          trend: overview.system?.trend || [],
        },
      ];

      // Recent activity from overview
      const recentActivity =
        overview.recentActivity?.map((activity, index) => ({
          id: index + 1,
          title: activity.title,
          description: activity.description,
          time: activity.timestamp,
          type: activity.type,
          priority: activity.priority || 'normal',
        })) || [];

      // Performance metrics
      const performance = {
        responseTime: overview.performance?.responseTime || 245,
        throughput: overview.performance?.throughput || 1250,
        errorRate: overview.performance?.errorRate || 0.5,
        uptime: overview.performance?.uptime || 99.9,
      };

      // System alerts
      const alerts = [
        {
          id: 1,
          type: 'warning',
          title: 'High CPU Usage',
          description: 'Server CPU usage is at 85%',
          time: '5 minutes ago',
          resolved: false,
        },
        {
          id: 2,
          type: 'info',
          title: 'Database Backup',
          description: 'Daily backup completed successfully',
          time: '1 hour ago',
          resolved: true,
        },
      ];

      // System health details
      const systemHealth = {
        servers: [
          {
            name: 'Web Server',
            status: 'healthy',
            cpu: 45,
            memory: 67,
            uptime: '99.9%',
          },
          {
            name: 'Database',
            status: 'healthy',
            cpu: 32,
            memory: 89,
            uptime: '99.8%',
          },
          {
            name: 'CDN',
            status: 'warning',
            cpu: 12,
            memory: 34,
            uptime: '98.5%',
          },
        ],
        services: [
          { name: 'API Gateway', status: 'healthy', responseTime: 120 },
          { name: 'Authentication', status: 'healthy', responseTime: 85 },
          { name: 'File Storage', status: 'healthy', responseTime: 200 },
        ],
      };

      setDashboardData({
        stats,
        recentActivity,
        overview,
        performance,
        alerts,
        systemHealth,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');

      // Fallback to static data if API fails
      setDashboardData({
        stats: [
          {
            title: 'Total Revenue',
            value: '$45,230',
            change: '+12.5%',
            changeType: 'positive',
            icon: DollarSign,
            description: 'from last month',
            trend: [30, 45, 35, 50, 40, 60, 45],
          },
          {
            title: 'Active Users',
            value: '2,847',
            change: '+8.2%',
            changeType: 'positive',
            icon: Users,
            description: 'from last month',
            trend: [1200, 1400, 1300, 1600, 1500, 1800, 1700],
          },
          {
            title: 'Projects',
            value: '12',
            change: '+3',
            changeType: 'positive',
            icon: TrendingUp,
            description: 'active projects',
            trend: [8, 9, 10, 11, 12, 12, 12],
          },
          {
            title: 'System Health',
            value: '99.9%',
            change: '+0.1%',
            changeType: 'positive',
            icon: Activity,
            description: 'uptime this month',
            trend: [99.5, 99.7, 99.8, 99.9, 99.9, 99.9, 99.9],
          },
        ],
        recentActivity: [
          {
            id: 1,
            title: 'New user registration',
            description: 'John Doe joined the platform',
            time: '2 minutes ago',
            type: 'user',
            priority: 'normal',
          },
          {
            id: 2,
            title: 'Project deployment',
            description: 'AI Content Generator deployed successfully',
            time: '15 minutes ago',
            type: 'deployment',
            priority: 'high',
          },
          {
            id: 3,
            title: 'Payment received',
            description: 'Monthly subscription payment processed',
            time: '1 hour ago',
            type: 'payment',
            priority: 'normal',
          },
        ],
        overview: {},
        performance: {
          responseTime: 245,
          throughput: 1250,
          errorRate: 0.5,
          uptime: 99.9,
        },
        alerts: [
          {
            id: 1,
            type: 'warning',
            title: 'High CPU Usage',
            description: 'Server CPU usage is at 85%',
            time: '5 minutes ago',
            resolved: false,
          },
        ],
        systemHealth: {
          servers: [
            {
              name: 'Web Server',
              status: 'healthy',
              cpu: 45,
              memory: 67,
              uptime: '99.9%',
            },
            {
              name: 'Database',
              status: 'healthy',
              cpu: 32,
              memory: 89,
              uptime: '99.8%',
            },
            {
              name: 'CDN',
              status: 'warning',
              cpu: 12,
              memory: 34,
              uptime: '98.5%',
            },
          ],
          services: [
            { name: 'API Gateway', status: 'healthy', responseTime: 120 },
            { name: 'Authentication', status: 'healthy', responseTime: 85 },
            { name: 'File Storage', status: 'healthy', responseTime: 200 },
          ],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = type => {
    switch (type) {
      case 'deployment':
        return <TrendingUp className='h-4 w-4 text-green-500' />;
      case 'user':
        return <Users className='h-4 w-4 text-blue-500' />;
      case 'payment':
        return <DollarSign className='h-4 w-4 text-green-500' />;
      case 'system':
        return <Activity className='h-4 w-4 text-purple-500' />;
      default:
        return <Activity className='h-4 w-4 text-gray-500' />;
    }
  };

  const getAlertIcon = type => {
    switch (type) {
      case 'error':
        return <AlertTriangle className='h-4 w-4 text-red-500' />;
      case 'warning':
        return <AlertTriangle className='h-4 w-4 text-yellow-500' />;
      case 'info':
        return <CheckCircle className='h-4 w-4 text-blue-500' />;
      default:
        return <AlertTriangle className='h-4 w-4 text-gray-500' />;
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

  const getStatusBadge = status => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p className='text-muted-foreground'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Welcome back, {user?.email}! Here's what's happening with your
            projects.
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

          {/* Time range selector */}
          <select
            value={selectedTimeRange}
            onChange={e => setSelectedTimeRange(e.target.value)}
            className='px-3 py-2 text-sm border border-input rounded bg-background'
          >
            <option value='1d'>Last 24 hours</option>
            <option value='7d'>Last 7 days</option>
            <option value='30d'>Last 30 days</option>
            <option value='90d'>Last 90 days</option>
          </select>

          <Button variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>

          <Button>
            <TrendingUp className='h-4 w-4 mr-2' />
            View Analytics
          </Button>
        </div>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {dashboardData.stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className='hover:shadow-md transition-shadow'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  {stat.title}
                </CardTitle>
                <Icon className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-foreground'>
                  {stat.value}
                </div>
                <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className='h-3 w-3 text-green-500' />
                  ) : (
                    <ArrowDownRight className='h-3 w-3 text-red-500' />
                  )}
                  <span
                    className={
                      stat.changeType === 'positive'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  >
                    {stat.change}
                  </span>
                  <span>{stat.description}</span>
                </div>
                {/* Mini trend chart */}
                {stat.trend && stat.trend.length > 0 && (
                  <div className='mt-3 flex items-end space-x-1 h-8'>
                    {stat.trend.map((value, i) => {
                      const max = Math.max(...stat.trend);
                      const height = (value / max) * 100;
                      return (
                        <div
                          key={i}
                          className='flex-1 bg-gradient-to-t from-primary/20 to-primary/5 rounded-sm'
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Response Time
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {dashboardData.performance.responseTime}ms
            </div>
            <div className='text-xs text-muted-foreground'>
              Average API response time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Throughput
            </CardTitle>
            <Zap className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {dashboardData.performance.throughput.toLocaleString()}
            </div>
            <div className='text-xs text-muted-foreground'>
              Requests per minute
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Error Rate
            </CardTitle>
            <AlertTriangle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {dashboardData.performance.errorRate}%
            </div>
            <div className='text-xs text-muted-foreground'>Failed requests</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Uptime
            </CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {dashboardData.performance.uptime}%
            </div>
            <div className='text-xs text-muted-foreground'>
              System availability
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Alerts */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Real-time system status</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {dashboardData.systemHealth.servers.map((server, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-3 border rounded-lg'
              >
                <div className='flex items-center space-x-3'>
                  <Server className='h-5 w-5 text-blue-500' />
                  <div>
                    <p className='text-sm font-medium'>{server.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      CPU: {server.cpu}% | RAM: {server.memory}%
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(
                      server.status
                    )}`}
                  >
                    {server.status}
                  </span>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {server.uptime}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>System notifications and warnings</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {dashboardData.alerts.length > 0 ? (
              dashboardData.alerts.map(alert => (
                <div
                  key={alert.id}
                  className='flex items-start space-x-3 p-3 border rounded-lg'
                >
                  <div className='flex-shrink-0 mt-1'>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-foreground'>
                      {alert.title}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {alert.description}
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {alert.time}
                    </p>
                  </div>
                  {!alert.resolved && (
                    <Button variant='outline' size='sm'>
                      <Eye className='h-3 w-3' />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                <CheckCircle className='h-8 w-8 mx-auto mb-2 opacity-50' />
                <p>All systems operational</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>API and service performance</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {dashboardData.systemHealth.services.map((service, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-3 border rounded-lg'
              >
                <div className='flex items-center space-x-3'>
                  <Database className='h-5 w-5 text-green-500' />
                  <div>
                    <p className='text-sm font-medium'>{service.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {service.responseTime}ms avg
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(
                    service.status
                  )}`}
                >
                  {service.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Recent Activity */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your projects and system
                </CardDescription>
              </div>
              <div className='flex items-center space-x-2'>
                <Button variant='outline' size='sm'>
                  <Filter className='h-4 w-4 mr-2' />
                  Filter
                </Button>
                <Button variant='outline' size='sm'>
                  <Eye className='h-4 w-4 mr-2' />
                  View All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map(activity => (
                  <div
                    key={activity.id}
                    className='flex items-start space-x-4 p-3 rounded-lg hover:bg-accent transition-colors'
                  >
                    <div className='flex-shrink-0 mt-1'>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center space-x-2'>
                        <p className='text-sm font-medium text-foreground'>
                          {activity.title}
                        </p>
                        {activity.priority === 'high' && (
                          <span className='text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full'>
                            High Priority
                          </span>
                        )}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {activity.description}
                      </p>
                      <div className='flex items-center space-x-2 mt-1'>
                        <Clock className='h-3 w-3 text-muted-foreground' />
                        <p className='text-xs text-muted-foreground'>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                    <Button variant='outline' size='sm'>
                      <ExternalLink className='h-3 w-3' />
                    </Button>
                  </div>
                ))
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  <Activity className='h-8 w-8 mx-auto mb-2 opacity-50' />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Button variant='outline' className='w-full justify-start'>
              <Target className='h-4 w-4 mr-2' />
              Create Project
            </Button>
            <Button variant='outline' className='w-full justify-start'>
              <Users className='h-4 w-4 mr-2' />
              Invite Team Member
            </Button>
            <Button variant='outline' className='w-full justify-start'>
              <Activity className='h-4 w-4 mr-2' />
              View Reports
            </Button>
            <Button variant='outline' className='w-full justify-start'>
              <DollarSign className='h-4 w-4 mr-2' />
              Manage Billing
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Project Status */}
      <Card>
        <CardHeader>
          <CardTitle>Project Status</CardTitle>
          <CardDescription>Overview of your active projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 border border-border rounded-lg'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='font-medium'>AI Content Generator</h3>
                <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
                  Live
                </span>
              </div>
              <p className='text-sm text-muted-foreground mb-3'>
                SaaS platform for AI-powered content creation
              </p>
              <div className='flex items-center justify-between text-sm'>
                <span>Revenue: $12,450</span>
                <span>Users: 1,234</span>
              </div>
            </div>

            <div className='p-4 border border-border rounded-lg'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='font-medium'>Digital Marketplace</h3>
                <span className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full'>
                  Dev
                </span>
              </div>
              <p className='text-sm text-muted-foreground mb-3'>
                Platform for digital product sales
              </p>
              <div className='flex items-center justify-between text-sm'>
                <span>Revenue: $8,920</span>
                <span>Users: 856</span>
              </div>
            </div>

            <div className='p-4 border border-border rounded-lg'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='font-medium'>Freelance Platform</h3>
                <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                  Planning
                </span>
              </div>
              <p className='text-sm text-muted-foreground mb-3'>
                Marketplace for freelancers and clients
              </p>
              <div className='flex items-center justify-between text-sm'>
                <span>Revenue: $0</span>
                <span>Users: 0</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
