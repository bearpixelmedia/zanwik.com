import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const RevenueAnalytics = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [subscriptionStats, setSubscriptionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  // Load revenue analytics
  const loadRevenueAnalytics = async () => {
    try {
      const response = await fetch('/api/monetization/analytics/revenue');
      const data = await response.json();
      
      if (data.success) {
        setRevenueData(data.data);
      }
    } catch (error) {
      console.error('Error loading revenue analytics:', error);
    }
  };

  // Load subscription statistics
  const loadSubscriptionStats = async () => {
    try {
      const response = await fetch('/api/monetization/analytics/subscriptions');
      const data = await response.json();
      
      if (data.success) {
        setSubscriptionStats(data.data);
      }
    } catch (error) {
      console.error('Error loading subscription stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenueAnalytics();
    loadSubscriptionStats();
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTierColor = (tierId) => {
    switch (tierId) {
      case 'bronze': return 'text-yellow-600 bg-yellow-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getFeatureColor = (featureId) => {
    switch (featureId) {
      case 'advanced-analytics': return 'text-blue-600 bg-blue-100';
      case 'priority-support': return 'text-green-600 bg-green-100';
      case 'custom-branding': return 'text-purple-600 bg-purple-100';
      case 'revenue-tracking': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Revenue Analytics</h2>
          <p className="text-gray-600">Track your monetization performance</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button onClick={() => { loadRevenueAnalytics(); loadSubscriptionStats(); }} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Revenue Overview */}
      {revenueData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(revenueData.total)}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(revenueData.monthly)}</div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-600">{revenueData.activeSubscriptions}</div>
            <div className="text-sm text-gray-600">Active Subscriptions</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-600">{revenueData.totalSubscriptions}</div>
            <div className="text-sm text-gray-600">Total Subscriptions</div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Tier */}
        {revenueData && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue by Tier</h3>
            <div className="space-y-4">
              {Object.entries(revenueData.byTier).map(([tierId, amount]) => (
                <div key={tierId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTierColor(tierId)}`}>
                      {tierId.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {subscriptionStats?.byTier?.[tierId] || 0} subscriptions
                    </span>
                  </div>
                  <div className="text-sm font-medium">{formatCurrency(amount)}</div>
                </div>
              ))}
              {Object.keys(revenueData.byTier).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No tier revenue yet
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Revenue by Feature */}
        {revenueData && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue by Feature</h3>
            <div className="space-y-4">
              {Object.entries(revenueData.byFeature).map(([featureId, amount]) => (
                <div key={featureId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getFeatureColor(featureId)}`}>
                      {featureId.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {subscriptionStats?.byFeature?.[featureId] || 0} subscriptions
                    </span>
                  </div>
                  <div className="text-sm font-medium">{formatCurrency(amount)}</div>
                </div>
              ))}
              {Object.keys(revenueData.byFeature).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No feature revenue yet
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Subscription Statistics */}
      {subscriptionStats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Subscription Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{subscriptionStats.total}</div>
              <div className="text-sm text-gray-600">Total Subscriptions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{subscriptionStats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{subscriptionStats.cancelled}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {subscriptionStats.total > 0 ? Math.round((subscriptionStats.active / subscriptionStats.total) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Retention Rate</div>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-green-600">✓</span>
              <span className="text-sm">New Gold subscription created</span>
            </div>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-blue-600">+</span>
              <span className="text-sm">Advanced Analytics feature added</span>
            </div>
            <span className="text-xs text-gray-500">1 day ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-yellow-600">⚠</span>
              <span className="text-sm">Payment failed for Silver subscription</span>
            </div>
            <span className="text-xs text-gray-500">3 days ago</span>
          </div>
        </div>
      </Card>

      {/* Growth Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Growth Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">+15%</div>
            <div className="text-sm text-gray-600">Monthly Revenue Growth</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">+8%</div>
            <div className="text-sm text-gray-600">Subscription Growth</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">92%</div>
            <div className="text-sm text-gray-600">Customer Satisfaction</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RevenueAnalytics;
