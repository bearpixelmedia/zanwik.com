import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { analyticsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentActivity: [],
    overview: {}
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard overview
        const overview = await analyticsAPI.getDashboardOverview();
        
        // Use overview data for project stats instead of separate API call
        const projectStats = {
          total: overview.overview?.totalProjects || 0,
          active: overview.overview?.topProjects?.length || 0
        };
        
        // Transform data for display
        const stats = [
          {
            title: "Total Revenue",
            value: `$${overview.revenue?.total?.toLocaleString() || '0'}`,
            change: `${overview.revenue?.change || 0}%`,
            changeType: overview.revenue?.change >= 0 ? "positive" : "negative",
            icon: DollarSign,
            description: "from last month"
          },
          {
            title: "Active Users",
            value: overview.users?.active?.toLocaleString() || '0',
            change: `${overview.users?.change || 0}%`,
            changeType: overview.users?.change >= 0 ? "positive" : "negative",
            icon: Users,
            description: "from last month"
          },
          {
            title: "Projects",
            value: projectStats.total?.toString() || '0',
            change: `+${projectStats.active || 0}`,
            changeType: "positive",
            icon: Target,
            description: "active projects"
          },
          {
            title: "System Health",
            value: `${overview.system?.health || 0}%`,
            change: `${overview.system?.change || 0}%`,
            changeType: overview.system?.change >= 0 ? "positive" : "negative",
            icon: Activity,
            description: "uptime this month"
          }
        ];

        // Recent activity from overview
        const recentActivity = overview.recentActivity?.map((activity, index) => ({
          id: index + 1,
          title: activity.title,
          description: activity.description,
          time: activity.timestamp,
          type: activity.type
        })) || [];

        setDashboardData({
          stats,
          recentActivity,
          overview
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
        
        // Fallback to static data if API fails
        setDashboardData({
          stats: [
            {
              title: "Total Revenue",
              value: "$0",
              change: "0%",
              changeType: "positive",
              icon: DollarSign,
              description: "from last month"
            },
            {
              title: "Active Users",
              value: "0",
              change: "0%",
              changeType: "positive",
              icon: Users,
              description: "from last month"
            },
            {
              title: "Projects",
              value: "0",
              change: "+0",
              changeType: "positive",
              icon: Target,
              description: "active projects"
            },
            {
              title: "System Health",
              value: "100%",
              change: "0%",
              changeType: "positive",
              icon: Activity,
              description: "uptime this month"
            }
          ],
          recentActivity: [
            {
              id: 1,
              title: "Dashboard loaded",
              description: "Welcome to your dashboard",
              time: "Just now",
              type: "system"
            }
          ],
          overview: {}
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'deployment':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'user':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'system':
        return <Activity className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email}! Here's what's happening with your projects.
          </p>
        </div>
        <Button>
          <TrendingUp className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}>
                    {stat.change}
                  </span>
                  <span>{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your projects and system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
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
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Target className="h-4 w-4 mr-2" />
              Create Project
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Invite Team Member
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Activity className="h-4 w-4 mr-2" />
              View Reports
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Project Status */}
      <Card>
        <CardHeader>
          <CardTitle>Project Status</CardTitle>
          <CardDescription>
            Overview of your active projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">AI Content Generator</h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Live</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">SaaS platform for AI-powered content creation</p>
              <div className="flex items-center justify-between text-sm">
                <span>Revenue: $12,450</span>
                <span>Users: 1,234</span>
              </div>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Digital Marketplace</h3>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Dev</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Platform for digital product sales</p>
              <div className="flex items-center justify-between text-sm">
                <span>Revenue: $8,920</span>
                <span>Users: 856</span>
              </div>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Freelance Platform</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Planning</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Marketplace for freelancers and clients</p>
              <div className="flex items-center justify-between text-sm">
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