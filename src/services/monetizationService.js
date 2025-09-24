/**
 * Monetization Service
 * Handles sponsorship tiers, premium features, and revenue tracking
 */

class MonetizationService {
  constructor() {
    this.sponsorshipTiers = {
      bronze: {
        id: 'bronze',
        name: 'Bronze',
        price: 99,
        currency: 'USD',
        period: 'month',
        features: [
          'Basic API listing promotion',
          'Standard support',
          'Basic analytics',
          'Up to 5 featured APIs'
        ],
        limits: {
          featuredApis: 5,
          prioritySupport: false,
          advancedAnalytics: false,
          customBranding: false
        }
      },
      silver: {
        id: 'silver',
        name: 'Silver',
        price: 199,
        currency: 'USD',
        period: 'month',
        features: [
          'Category highlight placement',
          'Priority support',
          'Advanced analytics',
          'Up to 15 featured APIs',
          'Custom API descriptions'
        ],
        limits: {
          featuredApis: 15,
          prioritySupport: true,
          advancedAnalytics: true,
          customBranding: false
        }
      },
      gold: {
        id: 'gold',
        name: 'Gold',
        price: 499,
        currency: 'USD',
        period: 'month',
        features: [
          'Featured listing placement',
          'Premium support',
          'Revenue tracking',
          'Up to 50 featured APIs',
          'Custom branding',
          'API usage analytics'
        ],
        limits: {
          featuredApis: 50,
          prioritySupport: true,
          advancedAnalytics: true,
          customBranding: true
        }
      },
      platinum: {
        id: 'platinum',
        name: 'Platinum',
        price: 999,
        currency: 'USD',
        period: 'month',
        features: [
          'Top placement on homepage',
          'Dedicated support',
          'Full revenue tracking',
          'Unlimited featured APIs',
          'Custom integration support',
          'White-label options'
        ],
        limits: {
          featuredApis: -1, // unlimited
          prioritySupport: true,
          advancedAnalytics: true,
          customBranding: true
        }
      }
    };

    this.premiumFeatures = {
      advancedAnalytics: {
        id: 'advanced-analytics',
        name: 'Advanced Analytics',
        description: 'Detailed API performance metrics and business insights',
        price: 49,
        currency: 'USD',
        period: 'month'
      },
      prioritySupport: {
        id: 'priority-support',
        name: 'Priority Support',
        description: '24/7 priority support with faster response times',
        price: 29,
        currency: 'USD',
        period: 'month'
      },
      customBranding: {
        id: 'custom-branding',
        name: 'Custom Branding',
        description: 'Custom logos, colors, and branding on your API listings',
        price: 79,
        currency: 'USD',
        period: 'month'
      },
      revenueTracking: {
        id: 'revenue-tracking',
        name: 'Revenue Tracking',
        description: 'Track revenue generated from your API integrations',
        price: 99,
        currency: 'USD',
        period: 'month'
      }
    };

    this.subscriptions = new Map();
    this.revenue = {
      total: 0,
      monthly: 0,
      byTier: {},
      byFeature: {}
    };
  }

  /**
   * Get all sponsorship tiers
   * @returns {Object} Sponsorship tiers
   */
  getSponsorshipTiers() {
    return this.sponsorshipTiers;
  }

  /**
   * Get all premium features
   * @returns {Object} Premium features
   */
  getPremiumFeatures() {
    return this.premiumFeatures;
  }

  /**
   * Create a subscription
   * @param {Object} subscriptionData - Subscription data
   * @returns {Object} Created subscription
   */
  createSubscription(subscriptionData) {
    const subscriptionId = this.generateSubscriptionId();
    const subscription = {
      id: subscriptionId,
      userId: subscriptionData.userId,
      type: subscriptionData.type, // 'sponsorship' or 'feature'
      tierId: subscriptionData.tierId,
      featureId: subscriptionData.featureId,
      status: 'active',
      price: subscriptionData.price,
      currency: subscriptionData.currency || 'USD',
      period: subscriptionData.period || 'month',
      startDate: new Date().toISOString(),
      endDate: this.calculateEndDate(subscriptionData.period),
      paymentMethod: subscriptionData.paymentMethod,
      createdAt: new Date().toISOString()
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.updateRevenue(subscription);
    
    return subscription;
  }

  /**
   * Get subscription by ID
   * @param {string} subscriptionId - Subscription ID
   * @returns {Object|null} Subscription or null
   */
  getSubscription(subscriptionId) {
    return this.subscriptions.get(subscriptionId) || null;
  }

  /**
   * Get subscriptions by user ID
   * @param {string} userId - User ID
   * @returns {Array} User subscriptions
   */
  getUserSubscriptions(userId) {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.userId === userId);
  }

  /**
   * Update subscription status
   * @param {string} subscriptionId - Subscription ID
   * @param {string} status - New status
   * @returns {Object|null} Updated subscription or null
   */
  updateSubscriptionStatus(subscriptionId, status) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return null;

    subscription.status = status;
    subscription.updatedAt = new Date().toISOString();
    
    this.subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  /**
   * Cancel subscription
   * @param {string} subscriptionId - Subscription ID
   * @returns {Object|null} Cancelled subscription or null
   */
  cancelSubscription(subscriptionId) {
    return this.updateSubscriptionStatus(subscriptionId, 'cancelled');
  }

  /**
   * Get user's active features
   * @param {string} userId - User ID
   * @returns {Object} Active features and limits
   */
  getUserFeatures(userId) {
    const userSubscriptions = this.getUserSubscriptions(userId);
    const activeSubscriptions = userSubscriptions.filter(sub => sub.status === 'active');
    
    const features = {
      sponsorshipTier: null,
      premiumFeatures: [],
      limits: {
        featuredApis: 0,
        prioritySupport: false,
        advancedAnalytics: false,
        customBranding: false
      }
    };

    // Check sponsorship tier
    const sponsorshipSub = activeSubscriptions.find(sub => sub.type === 'sponsorship');
    if (sponsorshipSub) {
      const tier = this.sponsorshipTiers[sponsorshipSub.tierId];
      if (tier) {
        features.sponsorshipTier = tier;
        features.limits = { ...features.limits, ...tier.limits };
      }
    }

    // Check premium features
    const featureSubs = activeSubscriptions.filter(sub => sub.type === 'feature');
    features.premiumFeatures = featureSubs.map(sub => {
      const feature = this.premiumFeatures[sub.featureId];
      return feature ? { ...feature, subscriptionId: sub.id } : null;
    }).filter(Boolean);

    return features;
  }

  /**
   * Check if user has feature access
   * @param {string} userId - User ID
   * @param {string} featureId - Feature ID
   * @returns {boolean} Has access
   */
  hasFeatureAccess(userId, featureId) {
    const features = this.getUserFeatures(userId);
    
    // Check if feature is included in sponsorship tier
    if (features.sponsorshipTier) {
      const tier = features.sponsorshipTier;
      if (tier.limits[featureId] === true) {
        return true;
      }
    }

    // Check if feature is purchased separately
    return features.premiumFeatures.some(feature => feature.id === featureId);
  }

  /**
   * Get revenue analytics
   * @returns {Object} Revenue analytics
   */
  getRevenueAnalytics() {
    const allSubscriptions = Array.from(this.subscriptions.values());
    const activeSubscriptions = allSubscriptions.filter(sub => sub.status === 'active');
    
    const totalRevenue = allSubscriptions.reduce((sum, sub) => sum + sub.price, 0);
    const monthlyRevenue = activeSubscriptions.reduce((sum, sub) => sum + sub.price, 0);
    
    const revenueByTier = {};
    const revenueByFeature = {};
    
    activeSubscriptions.forEach(sub => {
      if (sub.type === 'sponsorship') {
        revenueByTier[sub.tierId] = (revenueByTier[sub.tierId] || 0) + sub.price;
      } else if (sub.type === 'feature') {
        revenueByFeature[sub.featureId] = (revenueByFeature[sub.featureId] || 0) + sub.price;
      }
    });

    return {
      total: totalRevenue,
      monthly: monthlyRevenue,
      byTier: revenueByTier,
      byFeature: revenueByFeature,
      activeSubscriptions: activeSubscriptions.length,
      totalSubscriptions: allSubscriptions.length
    };
  }

  /**
   * Get pricing recommendations
   * @param {string} apiId - API ID
   * @returns {Object} Pricing recommendations
   */
  getPricingRecommendations(apiId) {
    // This would analyze API performance, usage, and market data
    // For now, return basic recommendations
    return {
      recommendedTier: 'silver',
      reasons: [
        'High API usage detected',
        'Good performance metrics',
        'Popular category'
      ],
      estimatedROI: 2.5,
      suggestedPrice: 199
    };
  }

  /**
   * Calculate end date for subscription
   * @param {string} period - Subscription period
   * @returns {string} End date ISO string
   */
  calculateEndDate(period) {
    const now = new Date();
    switch (period) {
      case 'month':
        return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
      default:
        return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    }
  }

  /**
   * Update revenue tracking
   * @param {Object} subscription - Subscription object
   */
  updateRevenue(subscription) {
    this.revenue.total += subscription.price;
    this.revenue.monthly += subscription.price;
    
    if (subscription.type === 'sponsorship') {
      this.revenue.byTier[subscription.tierId] = (this.revenue.byTier[subscription.tierId] || 0) + subscription.price;
    } else if (subscription.type === 'feature') {
      this.revenue.byFeature[subscription.featureId] = (this.revenue.byFeature[subscription.featureId] || 0) + subscription.price;
    }
  }

  /**
   * Generate subscription ID
   * @returns {string} Subscription ID
   */
  generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get subscription statistics
   * @returns {Object} Subscription statistics
   */
  getSubscriptionStats() {
    const allSubscriptions = Array.from(this.subscriptions.values());
    const activeSubscriptions = allSubscriptions.filter(sub => sub.status === 'active');
    
    const stats = {
      total: allSubscriptions.length,
      active: activeSubscriptions.length,
      cancelled: allSubscriptions.filter(sub => sub.status === 'cancelled').length,
      byTier: {},
      byFeature: {}
    };

    // Count by tier
    Object.keys(this.sponsorshipTiers).forEach(tierId => {
      stats.byTier[tierId] = activeSubscriptions.filter(sub => 
        sub.type === 'sponsorship' && sub.tierId === tierId
      ).length;
    });

    // Count by feature
    Object.keys(this.premiumFeatures).forEach(featureId => {
      stats.byFeature[featureId] = activeSubscriptions.filter(sub => 
        sub.type === 'feature' && sub.featureId === featureId
      ).length;
    });

    return stats;
  }
}

// Create singleton instance
const monetizationService = new MonetizationService();

module.exports = monetizationService;
