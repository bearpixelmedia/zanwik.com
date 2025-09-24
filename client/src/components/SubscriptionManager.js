import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const SubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [userFeatures, setUserFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  // Load user subscriptions
  const loadSubscriptions = async () => {
    try {
      const response = await fetch('/api/monetization/users/current-user/subscriptions');
      const data = await response.json();
      
      if (data.success) {
        setSubscriptions(data.data);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  // Load user features
  const loadUserFeatures = async () => {
    try {
      const response = await fetch('/api/monetization/users/current-user/features');
      const data = await response.json();
      
      if (data.success) {
        setUserFeatures(data.data);
      }
    } catch (error) {
      console.error('Error loading user features:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async (subscriptionId) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    try {
      const response = await fetch(`/api/monetization/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Subscription cancelled successfully');
        loadSubscriptions();
        loadUserFeatures();
      } else {
        alert('Failed to cancel subscription: ' + data.error);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription: ' + error.message);
    }
  };

  // Upgrade subscription
  const upgradeSubscription = async (tierId) => {
    try {
      const response = await fetch('/api/monetization/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'current-user',
          type: 'sponsorship',
          tierId: tierId,
          paymentMethod: 'stripe'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Subscription upgraded successfully!');
        setShowUpgrade(false);
        loadSubscriptions();
        loadUserFeatures();
      } else {
        alert('Failed to upgrade subscription: ' + data.error);
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      alert('Failed to upgrade subscription: ' + error.message);
    }
  };

  useEffect(() => {
    loadSubscriptions();
    loadUserFeatures();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription Management</h2>
          <p className="text-gray-600">Manage your subscriptions and features</p>
        </div>
        <Button onClick={() => setShowUpgrade(true)}>
          Upgrade Plan
        </Button>
      </div>

      {/* Current Features */}
      {userFeatures && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Current Features</h3>
          
          {userFeatures.sponsorshipTier ? (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-2">Sponsorship Tier</h4>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {userFeatures.sponsorshipTier.name}
                </span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(userFeatures.sponsorshipTier.price)}/{userFeatures.sponsorshipTier.period}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-2">Sponsorship Tier</h4>
              <p className="text-sm text-gray-600">No active sponsorship tier</p>
            </div>
          )}

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-2">Premium Features</h4>
            {userFeatures.premiumFeatures.length > 0 ? (
              <div className="space-y-2">
                {userFeatures.premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{feature.name}</span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(feature.price)}/{feature.period}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No premium features active</p>
            )}
          </div>
        </Card>
      )}

      {/* Active Subscriptions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Active Subscriptions</h3>
        
        {subscriptions.length > 0 ? (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="font-medium">
                      {subscription.type === 'sponsorship' ? 'Sponsorship' : 'Premium Feature'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {subscription.type === 'sponsorship' ? subscription.tierId : subscription.featureId}
                    </div>
                    <div className="text-xs text-gray-500">
                      Started {formatDate(subscription.startDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(subscription.status)}`}>
                    {subscription.status}
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(subscription.price)}/{subscription.period}
                  </span>
                  {subscription.status === 'active' && (
                    <Button
                      onClick={() => cancelSubscription(subscription.id)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No active subscriptions
          </div>
        )}
      </Card>

      {/* Usage Limits */}
      {userFeatures && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Usage Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Featured APIs</div>
              <div className="text-2xl font-bold">
                {userFeatures.limits.featuredApis === -1 ? 'Unlimited' : userFeatures.limits.featuredApis}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Priority Support</div>
              <div className="text-2xl font-bold">
                {userFeatures.limits.prioritySupport ? '✓' : '✗'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Advanced Analytics</div>
              <div className="text-2xl font-bold">
                {userFeatures.limits.advancedAnalytics ? '✓' : '✗'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Custom Branding</div>
              <div className="text-2xl font-bold">
                {userFeatures.limits.customBranding ? '✓' : '✗'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Upgrade Your Plan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Tier</label>
                <select
                  value={selectedTier || ''}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose a tier...</option>
                  <option value="bronze">Bronze - $99/month</option>
                  <option value="silver">Silver - $199/month</option>
                  <option value="gold">Gold - $499/month</option>
                  <option value="platinum">Platinum - $999/month</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button 
                onClick={() => upgradeSubscription(selectedTier)} 
                className="flex-1"
                disabled={!selectedTier}
              >
                Upgrade
              </Button>
              <Button 
                onClick={() => setShowUpgrade(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
