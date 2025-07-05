import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart,
  Download,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { analyticsAPI } from '../utils/api';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    revenue: [],
    topProjects: [],
    userMetrics: {},
    financialMetrics: {}
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch revenue analytics
      const revenueData = await analyticsAPI.getRevenueAnalytics(timeRange);
      
      // Fetch user analytics
      const userData = await analyticsAPI.getUserAnalytics(timeRange);
      
      // Fetch project performance
      const projectData = await analyticsAPI.getProjectPerformance(timeRange);

      setAnalyticsData({
        revenue: revenueData.revenue || [],
        topProjects: projectData.projects || [],
        userMetrics: userData.metrics || {},
        financialMetrics: revenueData.metrics || {}
      });
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError('Failed to load analytics data');
      
      // Fallback to mock data
      setAnalyticsData({
        revenue: [
          { month: 'Jan', revenue: 4500, growth: 12 },
          { month: 'Feb', revenue: 5200, growth: 15 },
          { month: 'Mar', revenue: 4800, growth: -8 },
          { month: 'Apr', revenue: 6100, growth: 27 },
          { month: 'May', revenue: 5800, growth: -5 },
          { month: 'Jun', revenue: 7200, growth: 24 }
        ],
        topProjects: [
          { name: 'AI Content Generator', revenue: 2450, growth: 18, users: 156 },
          { name: 'Digital Marketplace', revenue: 1890, growth: 12, users: 89 },
          { name: 'Freelance Hub', revenue: 1200, growth: 8, users: 67 },
          { name: 'E-commerce Platform', revenue: 980, growth: -3, users: 45 }
        ],
        userMetrics: {
          total: 2456,
          active: 1890,
          new: 234,
          churn: 2.1
        },
        financialMetrics: {
          totalRevenue: 45600,
          monthlyGrowth: 15.2,
          averageOrder: 89.50,
          conversionRate: 3.2
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const exportData = await analyticsAPI.exportAnalytics('revenue', timeRange, 'csv');
      // Create download link
      const link = document.createElement('a');
      link.href = exportData.downloadUrl;
      link.download = `analytics-${timeRange}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your business performance and revenue growth.</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${analyticsData.financialMetrics.totalRevenue?.toLocaleString() || '0'}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">
                +{analyticsData.financialMetrics.monthlyGrowth || 0}%
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {analyticsData.userMetrics.active?.toLocaleString() || '0'}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">
                +{analyticsData.userMetrics.new || 0}
              </span>
              <span>new this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {analyticsData.financialMetrics.conversionRate || 0}%
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+0.3%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Order
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${analyticsData.financialMetrics.averageOrder || 0}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-red-500">-2.1%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.revenue.length > 0 ? (
              <div className="h-64 flex items-end justify-between space-x-2">
                {analyticsData.revenue.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-primary/20 rounded-t-sm" 
                         style={{ height: `${(data.revenue / 8000) * 200}px` }}>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">{data.month}</div>
                    <div className="text-xs font-medium">${data.revenue}</div>
                    <div className={`text-xs ${data.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {data.growth > 0 ? '+' : ''}{data.growth}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>No revenue data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Top Projects</CardTitle>
            <CardDescription>Best performing projects by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.topProjects.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.topProjects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.users} users</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">${project.revenue}</p>
                      <p className={`text-xs ${project.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {project.growth > 0 ? '+' : ''}{project.growth}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No project data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>User Analytics</CardTitle>
            <CardDescription>Detailed user engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Users</span>
                <span className="text-sm font-medium">{analyticsData.userMetrics.total?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Users</span>
                <span className="text-sm font-medium">{analyticsData.userMetrics.active?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">New Users</span>
                <span className="text-sm font-medium text-green-500">+{analyticsData.userMetrics.new || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Churn Rate</span>
                <span className="text-sm font-medium text-red-500">{analyticsData.userMetrics.churn || '0'}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Key financial performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Monthly Growth</span>
                <span className="text-sm font-medium text-green-500">+{analyticsData.financialMetrics.monthlyGrowth || '0'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Conversion Rate</span>
                <span className="text-sm font-medium">{analyticsData.financialMetrics.conversionRate || '0'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average Order</span>
                <span className="text-sm font-medium">${analyticsData.financialMetrics.averageOrder || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Orders</span>
                <span className="text-sm font-medium">{analyticsData.financialMetrics.totalOrders?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics; 