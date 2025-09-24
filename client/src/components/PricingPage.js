import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const PricingPage = () => {
  const [sponsorshipTiers, setSponsorshipTiers] = useState({});
  const [premiumFeatures, setPremiumFeatures] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [billingPeriod, setBillingPeriod] = useState('month');

  // Load pricing data
  const loadPricingData = async () => {
    try {
      const [tiersResponse, featuresResponse] = await Promise.all([
        fetch('/api/monetization/sponsorship-tiers'),
        fetch('/api/monetization/premium-features')
      ]);
      
      const tiersData = await tiersResponse.json();
      const featuresData = await featuresResponse.json();
      
      if (tiersData.success) {
        setSponsorshipTiers(tiersData.data);
      }
      
      if (featuresData.success) {
        setPremiumFeatures(featuresData.data);
      }
    } catch (error) {
      console.error('Error loading pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to tier
  const subscribeToTier = async (tierId) => {
    try {
      const response = await fetch('/api/monetization/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'current-user', // This would come from auth context
          type: 'sponsorship',
          tierId: tierId,
          paymentMethod: 'stripe' // This would be selected by user
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Subscription created successfully!');
        // Redirect to payment or success page
      } else {
        alert('Failed to create subscription: ' + data.error);
      }
    } catch (error) {
      console.error('Error subscribing to tier:', error);
      alert('Failed to create subscription: ' + error.message);
    }
  };

  // Subscribe to feature
  const subscribeToFeature = async (featureId) => {
    try {
      const response = await fetch('/api/monetization/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'current-user', // This would come from auth context
          type: 'feature',
          featureId: featureId,
          paymentMethod: 'stripe' // This would be selected by user
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Feature subscription created successfully!');
      } else {
        alert('Failed to create feature subscription: ' + data.error);
      }
    } catch (error) {
      console.error('Error subscribing to feature:', error);
      alert('Failed to create feature subscription: ' + error.message);
    }
  };

  useEffect(() => {
    loadPricingData();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTierColor = (tierId) => {
    switch (tierId) {
      case 'bronze': return 'border-yellow-500 bg-yellow-50';
      case 'silver': return 'border-gray-400 bg-gray-50';
      case 'gold': return 'border-yellow-400 bg-yellow-50';
      case 'platinum': return 'border-purple-500 bg-purple-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading pricing...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Promote your APIs and grow your business with our sponsorship tiers
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <span className={`text-sm ${billingPeriod === 'month' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'month' ? 'year' : 'month')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingPeriod === 'year' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${billingPeriod === 'year' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
            <span className="ml-1 text-green-600 font-medium">(Save 20%)</span>
          </span>
        </div>
      </div>

      {/* Sponsorship Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {Object.entries(sponsorshipTiers).map(([tierId, tier]) => (
          <Card 
            key={tierId} 
            className={`p-6 relative ${getTierColor(tierId)} ${
              selectedTier === tierId ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {tierId === 'gold' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {formatPrice(tier.price)}
                <span className="text-lg text-gray-500">/{tier.period}</span>
              </div>
              <p className="text-gray-600 text-sm">
                {tierId === 'bronze' && 'Perfect for getting started'}
                {tierId === 'silver' && 'Great for growing businesses'}
                {tierId === 'gold' && 'Ideal for established companies'}
                {tierId === 'platinum' && 'For enterprise-level promotion'}
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => subscribeToTier(tierId)}
              className="w-full"
              variant={tierId === 'gold' ? 'default' : 'outline'}
            >
              {selectedTier === tierId ? 'Selected' : 'Choose Plan'}
            </Button>
          </Card>
        ))}
      </div>

      {/* Premium Features */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Add Premium Features
        </h2>
        <p className="text-xl text-gray-600 text-center mb-8">
          Enhance your experience with individual premium features
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(premiumFeatures).map(([featureId, feature]) => (
            <Card key={featureId} className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.name}</h3>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatPrice(feature.price)}
                  <span className="text-sm text-gray-500">/{feature.period}</span>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
              
              <Button
                onClick={() => subscribeToFeature(featureId)}
                variant="outline"
                className="w-full"
              >
                Add Feature
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Can I change my plan anytime?
            </h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
              and we'll prorate any billing differences.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-gray-600">
              We accept all major credit cards (Visa, MasterCard, American Express), PayPal, 
              and bank transfers for enterprise plans.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Is there a free trial?
            </h3>
            <p className="text-gray-600">
              Yes, all plans come with a 14-day free trial. No credit card required to start. 
              You can cancel anytime during the trial period.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What happens if I exceed my limits?
            </h3>
            <p className="text-gray-600">
              We'll notify you when you're approaching your limits. You can upgrade your plan 
              or purchase additional capacity as needed.
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-blue-600 text-white py-12 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Promote Your APIs?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of API providers who are growing their business with Zanwik
        </p>
        <Button size="lg" variant="secondary" className="px-8 py-3">
          Start Free Trial
        </Button>
      </div>
    </div>
  );
};

export default PricingPage;
