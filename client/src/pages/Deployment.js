import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Zap,
  Filter,
  Bell,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Package,
  Shield,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Clock,
  Server,
  Database,
  Globe,
  RefreshCw,
  Settings,
  Plus,
  GitBranch,
  TrendingUp,
  Calendar,
  Eye,
  BarChart3,
  Target,
  Activity,
  Search,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
const Deployment = () => {
  console.log('Rendering Deployment');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedEnvironment, setSelectedEnvironment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [setShowPipelineModal] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deploymentData, setDeploymentData] = useState({
    deployments: [],
    pipelines: [],
    environments: [],
    stats: {},
    recentActivity: [],
  });

  useEffect(() => {
    fetchDeploymentData();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDeploymentData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const fetchDeploymentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockData = {
        deployments: [
          {
            id: 1,
            name: 'AI Content Generator',
            environment: 'production',
            status: 'completed',
            version: 'v2.1.0',
            branch: 'main',
            commit: 'a1b2c3d4',
            deployedBy: 'john@example.com',
            deployedAt: '2024-01-20T10:30:00Z',
            duration: '2m 15s',
            buildNumber: 1234,
            tests: { passed: 45, failed: 0, total: 45 },
            coverage: 87.5,
          },
          {
            id: 2,
            name: 'Digital Marketplace',
            environment: 'staging',
            status: 'in-progress',
            version: 'v1.5.2',
            branch: 'feature/new-ui',
            commit: 'e5f6g7h8',
            deployedBy: 'jane@example.com',
            deployedAt: '2024-01-20T09:15:00Z',
            duration: '1m 45s',
            buildNumber: 1233,
            tests: { passed: 38, failed: 2, total: 40 },
            coverage: 82.1,
          },
          {
            id: 3,
            name: 'Freelance Platform',
            environment: 'development',
            status: 'failed',
            version: 'v0.9.1',
            branch: 'develop',
            commit: 'i9j0k1l2',
            deployedBy: 'bob@example.com',
            deployedAt: '2024-01-20T08:45:00Z',
            duration: '0m 30s',
            buildNumber: 1232,
            tests: { passed: 25, failed: 8, total: 33 },
            coverage: 65.2,
          },
          {
            id: 4,
            name: 'API Gateway',
            environment: 'production',
            status: 'completed',
            version: 'v3.0.0',
            branch: 'main',
            commit: 'm3n4o5p6',
            deployedBy: 'alice@example.com',
            deployedAt: '2024-01-19T16:20:00Z',
            duration: '3m 10s',
            buildNumber: 1231,
            tests: { passed: 67, failed: 0, total: 67 },
            coverage: 94.3,
          },
        ],
        pipelines: [
          {
            id: 1,
            name: 'Production Pipeline',
            status: 'active',
            environment: 'production',
            stages: ['build', 'test', 'deploy'],
            lastRun: '2024-01-20T10:30:00Z',
            successRate: 95.2,
            avgDuration: '4m 30s',
          },
          {
            id: 2,
            name: 'Staging Pipeline',
            status: 'active',
            environment: 'staging',
            stages: ['build', 'test', 'deploy'],
            lastRun: '2024-01-20T09:15:00Z',
            successRate: 88.7,
            avgDuration: '3m 45s',
          },
          {
            id: 3,
            name: 'Development Pipeline',
            status: 'paused',
            environment: 'development',
            stages: ['build', 'test'],
            lastRun: '2024-01-20T08:45:00Z',
            successRate: 76.3,
            avgDuration: '2m 15s',
          },
        ],
        environments: [
          {
            name: 'production',
            status: 'healthy',
            deployments: 45,
            uptime: 99.9,
          },
          { name: 'staging', status: 'healthy', deployments: 23, uptime: 99.8 },
          {
            name: 'development',
            status: 'warning',
            deployments: 67,
            uptime: 98.5,
          },
        ],
        stats: {
          totalDeployments: 135,
          successfulDeployments: 128,
          failedDeployments: 7,
          successRate: 94.8,
          avgDeploymentTime: '2m 45s',
          totalPipelines: 3,
          activePipelines: 2,
        },
        recentActivity: [
          {
            id: 1,
            type: 'deployment',
            title: 'Production deployment completed',
            description: 'AI Content Generator v2.1.0 deployed successfully',
            time: '2 minutes ago',
            status: 'success',
          },
          {
            id: 2,
            type: 'pipeline',
            title: 'Pipeline triggered',
            description: 'Staging pipeline started for Digital Marketplace',
            time: '15 minutes ago',
            status: 'running',
          },
          {
            id: 3,
            type: 'rollback',
            title: 'Rollback initiated',
            description: 'Freelance Platform rolled back to v0.9.0',
            time: '1 hour ago',
            status: 'warning',
          },
        ],
      };

      setDeploymentData(mockData);
    } catch (err) {
      console.error('Failed to fetch deployment data:', err);
      setError('Failed to load deployment data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    try {
      setDeploying(true);
      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowDeployModal(false);
      fetchDeploymentData();
    } catch (err) {
      console.error('Deployment failed:', err);
      alert('Deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  const handleRollback = async () => {
    if (!window.confirm('Are you sure you want to rollback this deployment?')) {
      return;
    }

    try {
      // Simulate rollback
      await new Promise(resolve => setTimeout(resolve, 1500));
      fetchDeploymentData();
    } catch (err) {
      console.error('Rollback failed:', err);
      alert('Rollback failed');
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in-progress':
        return 'text-blue-500';
      case 'failed':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadge = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'in-progress':
        return <Loader2 className='h-4 w-4 animate-spin text-blue-500' />;
      case 'failed':
        return <AlertTriangle className='h-4 w-4 text-red-500' />;
      case 'pending':
        return <Clock className='h-4 w-4 text-yellow-500' />;
      default:
        return <Clock className='h-4 w-4 text-gray-500' />;
    }
  };

  const getEnvironmentIcon = environment => {
    switch (environment) {
      case 'production':
        return <Server className='h-4 w-4 text-red-500' />;
      case 'staging':
        return <Database className='h-4 w-4 text-yellow-500' />;
      case 'development':
        return <Globe className='h-4 w-4 text-blue-500' />;
      default:
        return <Server className='h-4 w-4 text-gray-500' />;
    }
  };

  const filteredDeployments = deploymentData.deployments.filter(deployment => {
    const matchesEnvironment =
      selectedEnvironment === 'all' ||
      deployment.environment === selectedEnvironment;
    const matchesStatus =
      selectedStatus === 'all' || deployment.status === selectedStatus;
    return matchesEnvironment && matchesStatus;
  });

  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p className='text-muted-foreground'>Loading deployment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Deployments</h1>
          <p className='text-muted-foreground'>
            Manage your CI/CD pipelines and deployments.
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

          <Button variant='outline' onClick={() => setShowPipelineModal(true)}>
            <Settings className='h-4 w-4 mr-2' />
            Manage Pipelines
          </Button>

          <Button onClick={() => setShowDeployModal(true)}>
            <Plus className='h-4 w-4 mr-2' />
            New Deployment
          </Button>
        </div>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Deployments
            </CardTitle>
            <GitBranch className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {deploymentData.stats.totalDeployments}
            </div>
            <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
              <TrendingUp className='h-3 w-3 text-green-500' />
              <span className='text-green-500'>+12</span>
              <span>this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Success Rate
            </CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {deploymentData.stats.successRate}%
            </div>
            <div className='text-xs text-muted-foreground'>
              {deploymentData.stats.successfulDeployments} successful
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Avg Deployment Time
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {deploymentData.stats.avgDeploymentTime}
            </div>
            <div className='text-xs text-muted-foreground'>
              Across all environments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Active Pipelines
            </CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {deploymentData.stats.activePipelines}/
              {deploymentData.stats.totalPipelines}
            </div>
            <div className='text-xs text-muted-foreground'>
              Pipelines running
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Status */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {deploymentData.environments.map((env, index) => (
          <Card key={index}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                {env.name.charAt(0).toUpperCase() + env.name.slice(1)}
              </CardTitle>
              {getEnvironmentIcon(env.name)}
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-foreground'>
                {env.deployments}
              </div>
              <div className='flex items-center justify-between text-xs text-muted-foreground'>
                <span>Deployments</span>
                <span className={getStatusColor(env.status)}>
                  {env.uptime}% uptime
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <input
            type='text'
            placeholder='Search deployments...'
            className='w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
          />
        </div>
        <select
          value={selectedEnvironment}
          onChange={e => setSelectedEnvironment(e.target.value)}
          className='px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
        >
          <option value='all'>All Environments</option>
          <option value='production'>Production</option>
          <option value='staging'>Staging</option>
          <option value='development'>Development</option>
        </select>
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className='px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
        >
          <option value='all'>All Status</option>
          <option value='completed'>Completed</option>
          <option value='in-progress'>In Progress</option>
          <option value='failed'>Failed</option>
          <option value='pending'>Pending</option>
        </select>
      </div>

      {/* Deployments List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
          <CardDescription>
            Latest deployments across all environments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {filteredDeployments.map(deployment => (
              <div
                key={deployment.id}
                className='flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors'
              >
                <div className='flex items-center space-x-4'>
                  <div className='flex-shrink-0'>
                    {getStatusIcon(deployment.status)}
                  </div>
                  <div>
                    <div className='flex items-center space-x-2'>
                      <h3 className='text-sm font-medium text-foreground'>
                        {deployment.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(
                          deployment.status,
                        )}`}
                      >
                        {deployment.status}
                      </span>
                    </div>
                    <div className='flex items-center space-x-4 text-xs text-muted-foreground mt-1'>
                      <span>v{deployment.version}</span>
                      <span>{deployment.branch}</span>
                      <span>#{deployment.buildNumber}</span>
                      <span>{deployment.commit.substring(0, 8)}</span>
                    </div>
                  </div>
                </div>

                <div className='flex items-center space-x-6'>
                  <div className='text-right text-sm text-muted-foreground'>
                    <div className='flex items-center space-x-1'>
                      <Calendar className='h-3 w-3' />
                      <span>
                        {new Date(deployment.deployedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <span>Duration: {deployment.duration}</span>
                      <span>
                        Tests: {deployment.tests.passed}/
                        {deployment.tests.total}
                      </span>
                      <span>Coverage: {deployment.coverage}%</span>
                    </div>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        /* View details */
                      }}
                    >
                      <Eye className='h-3 w-3' />
                    </Button>
                    {deployment.status === 'completed' && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleRollback()}
                      >
                        <RefreshCw className='h-3 w-3' />
                      </Button>
                    )}
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        /* View logs */
                      }}
                    >
                      <BarChart3 className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipelines */}
      <Card>
        <CardHeader>
          <CardTitle>CI/CD Pipelines</CardTitle>
          <CardDescription>Active pipelines and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {deploymentData.pipelines.map(pipeline => (
              <div key={pipeline.id} className='p-4 border rounded-lg'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='font-medium'>{pipeline.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(
                      pipeline.status,
                    )}`}
                  >
                    {pipeline.status}
                  </span>
                </div>
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <div className='flex items-center space-x-2'>
                    <Target className='h-3 w-3' />
                    <span>{pipeline.environment}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Activity className='h-3 w-3' />
                    <span>{pipeline.successRate}% success rate</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-3 w-3' />
                    <span>{pipeline.avgDuration} avg</span>
                  </div>
                </div>
                <div className='mt-3 flex space-x-2'>
                  <Button variant='outline' size='sm' className='flex-1'>
                    <Play className='h-3 w-3 mr-1' />
                    Run
                  </Button>
                  <Button variant='outline' size='sm'>
                    <Settings className='h-3 w-3' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest deployment and pipeline activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {deploymentData.recentActivity.map(activity => (
              <div
                key={activity.id}
                className='flex items-start space-x-3 p-3 border rounded-lg'
              >
                <div className='flex-shrink-0 mt-1'>
                  {getStatusIcon(
                    activity.status === 'success'
                      ? 'completed'
                      : activity.status === 'running'
                      ? 'in-progress'
                      : 'failed',
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-foreground'>
                    {activity.title}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {activity.description}
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='w-full max-w-md mx-4'>
            <CardHeader>
              <CardTitle>New Deployment</CardTitle>
              <CardDescription>
                Deploy a new version to an environment
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label htmlFor="-application-">
                  Application
                </label>
                <select className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'>
                  <option value=''>Select Application</option>
                  <option value='ai-content'>AI Content Generator</option>
                  <option value='marketplace'>Digital Marketplace</option>
                  <option value='freelance'>Freelance Platform</option>
                </select>
              </div>
              <div>
                <label htmlFor="-environment-">
                  Environment
                </label>
                <select className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'>
                  <option value='staging'>Staging</option>
                  <option value='production'>Production</option>
                </select>
              </div>
              <div>
                <label htmlFor="-branch-">
                  Branch
                </label>
                <input
                  type='text'
                  placeholder='main'
                  className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                />
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
                  onClick={() => handleDeploy()}
                  disabled={deploying}
                >
                  {deploying ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Deploying...
                    </>
                  ) : (
                    'Deploy'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Deployment;
