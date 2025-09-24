/**
 * Monetization Routes
 * Routes for sponsorship tiers, premium features, and subscriptions
 */

const express = require('express');
const router = express.Router();
const monetizationService = require('../services/monetizationService');

// Get sponsorship tiers
router.get('/sponsorship-tiers', async (req, res) => {
  try {
    const tiers = monetizationService.getSponsorshipTiers();
    res.json({
      success: true,
      data: tiers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get sponsorship tiers'
    });
  }
});

// Get premium features
router.get('/premium-features', async (req, res) => {
  try {
    const features = monetizationService.getPremiumFeatures();
    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get premium features'
    });
  }
});

// Create subscription
router.post('/subscribe', async (req, res) => {
  try {
    const subscriptionData = req.body;
    
    if (!subscriptionData.userId || !subscriptionData.type) {
      return res.status(400).json({
        success: false,
        error: 'User ID and subscription type are required'
      });
    }

    // Validate subscription data
    if (subscriptionData.type === 'sponsorship' && !subscriptionData.tierId) {
      return res.status(400).json({
        success: false,
        error: 'Tier ID is required for sponsorship subscriptions'
      });
    }

    if (subscriptionData.type === 'feature' && !subscriptionData.featureId) {
      return res.status(400).json({
        success: false,
        error: 'Feature ID is required for feature subscriptions'
      });
    }

    // Get pricing from tiers/features
    let price = 0;
    if (subscriptionData.type === 'sponsorship') {
      const tier = monetizationService.getSponsorshipTiers()[subscriptionData.tierId];
      if (!tier) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tier ID'
        });
      }
      price = tier.price;
    } else if (subscriptionData.type === 'feature') {
      const feature = monetizationService.getPremiumFeatures()[subscriptionData.featureId];
      if (!feature) {
        return res.status(400).json({
          success: false,
          error: 'Invalid feature ID'
        });
      }
      price = feature.price;
    }

    const subscription = monetizationService.createSubscription({
      ...subscriptionData,
      price
    });

    res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
});

// Get subscription by ID
router.get('/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = monetizationService.getSubscription(subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription'
    });
  }
});

// Get user subscriptions
router.get('/users/:userId/subscriptions', async (req, res) => {
  try {
    const { userId } = req.params;
    const subscriptions = monetizationService.getUserSubscriptions(userId);
    
    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user subscriptions'
    });
  }
});

// Get user features
router.get('/users/:userId/features', async (req, res) => {
  try {
    const { userId } = req.params;
    const features = monetizationService.getUserFeatures(userId);
    
    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user features'
    });
  }
});

// Check feature access
router.get('/users/:userId/features/:featureId/access', async (req, res) => {
  try {
    const { userId, featureId } = req.params;
    const hasAccess = monetizationService.hasFeatureAccess(userId, featureId);
    
    res.json({
      success: true,
      data: { hasAccess }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check feature access'
    });
  }
});

// Cancel subscription
router.post('/subscriptions/:subscriptionId/cancel', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = monetizationService.cancelSubscription(subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
});

// Update subscription status
router.put('/subscriptions/:subscriptionId/status', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }
    
    const subscription = monetizationService.updateSubscriptionStatus(subscriptionId, status);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription status'
    });
  }
});

// Get revenue analytics
router.get('/analytics/revenue', async (req, res) => {
  try {
    const analytics = monetizationService.getRevenueAnalytics();
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get revenue analytics'
    });
  }
});

// Get subscription statistics
router.get('/analytics/subscriptions', async (req, res) => {
  try {
    const stats = monetizationService.getSubscriptionStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription statistics'
    });
  }
});

// Get pricing recommendations
router.get('/recommendations/:apiId', async (req, res) => {
  try {
    const { apiId } = req.params;
    const recommendations = monetizationService.getPricingRecommendations(apiId);
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get pricing recommendations'
    });
  }
});

// Webhook for payment processing (Stripe, PayPal, etc.)
router.post('/webhooks/payment', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    // Handle different payment events
    switch (event) {
      case 'payment.succeeded':
        // Update subscription status to active
        if (data.subscriptionId) {
          monetizationService.updateSubscriptionStatus(data.subscriptionId, 'active');
        }
        break;
      case 'payment.failed':
        // Update subscription status to failed
        if (data.subscriptionId) {
          monetizationService.updateSubscriptionStatus(data.subscriptionId, 'failed');
        }
        break;
      case 'subscription.cancelled':
        // Cancel subscription
        if (data.subscriptionId) {
          monetizationService.cancelSubscription(data.subscriptionId);
        }
        break;
    }
    
    res.json({
      success: true,
      message: 'Webhook processed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
});

module.exports = router;
