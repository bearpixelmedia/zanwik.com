import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FolderOpen,
  BarChart3,
  Settings
} from 'lucide-react';
import { apiHelpers } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Fetch dashboard data
  const { data: overview, isLoading, error } = useQuery(
    'dashboard-overview',
    apiHelpers.getAnalyticsOverview,
    {
      refetchInterval: refreshInterval,
      staleTime: 10000,
    }
  );

  // Fetch projects
  const { data: projectsData } = useQuery(
    'projects',
    () => apiHelpers.getProjects({ limit: 10 }),
    {
      refetchInterval: refreshInterval,
      staleTime: 10000,
    }
  );

  const projects = projectsData?.projects || [];

  // Metrics cards data
  const metrics = [
    {
      name: 'Total Projects',
      value: overview?.summary?.totalProjects || 0,
      change: '+2',
      changeType: 'positive',
      icon: Server,
      color: 'blue',
    },
    {
      name: 'Healthy Projects',
      value: overview?.summary?.healthyProjects || 0,
      change: '+1',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'green',
    },
    {
      name: 'Total Revenue',
      value: `$${(overview?.summary?.totalRevenue || 0).toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'emerald',
    },
    {
      name: 'Active Users',
      value: (overview?.summary?.activeUsers || 0).toLocaleString(),
      change: '+5.2%',
      changeType: 'positive',
      icon: Users,
      color: 'purple',
    },
  ];

  const getStatusColor = (health) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (health) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'critical':
        return <AlertTriangle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard data</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="select-field w-32"
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
            <option value={300000}>5m</option>
          </select>
          <span className="text-sm text-gray-500">Auto-refresh</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="metric-card">
              <div className="metric-card-header">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-md bg-${metric.color}-100`}>
                    <Icon className={`h-6 w-6 text-${metric.color}-600`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="metric-card-title">{metric.name}</dt>
                      <dd className="metric-card-value">{metric.value}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className={`metric-card-change ${
                    metric.changeType === 'positive' 
                      ? 'metric-card-change-positive' 
                      : 'metric-card-change-negative'
                  }`}>
                    {metric.changeType === 'positive' ? (
                      <TrendingUp className="self-center flex-shrink-0 h-5 w-5" />
                    ) : (
                      <TrendingDown className="self-center flex-shrink-0 h-5 w-5" />
                    )}
                    <span className="ml-2">{metric.change}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Projects Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Projects</h3>
            <p className="card-subtitle">Status of your latest projects</p>
          </div>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div key={project._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(project.health)}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{project.name}</h4>
                    <p className="text-xs text-gray-500">{project.type.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.health)}`}>
                    {project.health}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Server size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No projects found</p>
              </div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">System Health</h3>
            <p className="card-subtitle">Overall system status</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-600" />
                <div>
                  <h4 className="text-sm font-medium text-green-900">All Systems Operational</h4>
                  <p className="text-xs text-green-600">No issues detected</p>
                </div>
              </div>
              <span className="text-green-600 text-sm font-medium">100%</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Activity size={24} className="mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">CPU Usage</p>
                <p className="text-2xl font-bold text-blue-600">23%</p>
              </div>
              <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <Server size={24} className="mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium text-purple-900">Memory</p>
                <p className="text-2xl font-bold text-purple-600">67%</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Database</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Redis Cache</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">SSL Certificates</span>
                <span className="text-green-600 font-medium">Valid</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
          <p className="card-subtitle">Common tasks and shortcuts</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FolderOpen size={24} className="text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">New Project</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 size={24} className="text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Analytics</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Activity size={24} className="text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Monitoring</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings size={24} className="text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 