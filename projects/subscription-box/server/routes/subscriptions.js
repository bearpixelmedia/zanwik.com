const express = require('express');
const { body, validationResult } = require('express-validator');
const Subscription = require('../models/Subscription');
const CustomerSubscription = require('../models/CustomerSubscription');
const Product = require('../models/Product');
const { auth, businessOwner, customer, checkSubscriptionLimits } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/subscriptions
// @desc    Get all subscriptions (business owner) or available subscriptions (customer)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let subscriptions;
    
    if (req.user.role === 'business_owner') {
      // Business owner sees their own subscriptions
      subscriptions = await Subscription.find({ businessOwner: req.user._id })
        .populate('products.product', 'name sku price images')
        .sort({ createdAt: -1 });
    } else {
      // Customer sees all active subscriptions from all businesses
      subscriptions = await Subscription.find({ isActive: true })
        .populate('businessOwner', 'businessName firstName lastName')
        .populate('products.product', 'name sku price images')
        .sort({ createdAt: -1 });
    }

    res.json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subscriptions
// @desc    Create a new subscription tier
// @access  Private (Business Owner)
router.post('/', [auth, businessOwner, checkSubscriptionLimits], [
  body('name').trim().notEmpty(),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }),
  body('billingCycle').isIn(['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly']),
  body('products').isArray(),
  body('shippingCost').optional().isFloat({ min: 0 }),
  body('taxRate').optional().isFloat({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      price,
      billingCycle,
      products,
      shippingCost = 0,
      taxRate = 0,
      features,
      category,
      tags,
      customizationOptions
    } = req.body;

    // Validate products exist and belong to business owner
    if (products && products.length > 0) {
      for (const productItem of products) {
        const product = await Product.findOne({
          _id: productItem.product,
          businessOwner: req.user._id
        });
        if (!product) {
          return res.status(400).json({ message: 'Invalid product ID' });
        }
      }
    }

    const subscription = new Subscription({
      businessOwner: req.user._id,
      name,
      description,
      price,
      billingCycle,
      products,
      shippingCost,
      taxRate,
      features,
      category,
      tags,
      customizationOptions
    });

    await subscription.save();

    // Populate product details
    await subscription.populate('products.product', 'name sku price images');

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subscriptions/:id
// @desc    Get subscription by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    let subscription;
    
    if (req.user.role === 'business_owner') {
      subscription = await Subscription.findOne({
        _id: req.params.id,
        businessOwner: req.user._id
      }).populate('products.product', 'name sku price images stockQuantity');
    } else {
      subscription = await Subscription.findOne({
        _id: req.params.id,
        isActive: true
      }).populate('businessOwner', 'businessName firstName lastName')
        .populate('products.product', 'name sku price images');
    }

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/subscriptions/:id
// @desc    Update subscription
// @access  Private (Business Owner)
router.put('/:id', [auth, businessOwner], [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('billingCycle').optional().isIn(['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly']),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const subscription = await Subscription.findOne({
      _id: req.params.id,
      businessOwner: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (subscription.schema.paths[key]) {
        subscription[key] = req.body[key];
      }
    });

    await subscription.save();
    await subscription.populate('products.product', 'name sku price images');

    res.json({
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/subscriptions/:id
// @desc    Delete subscription
// @access  Private (Business Owner)
router.delete('/:id', [auth, businessOwner], async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      businessOwner: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if there are active customer subscriptions
    const activeSubscriptions = await CustomerSubscription.countDocuments({
      subscription: req.params.id,
      status: 'active'
    });

    if (activeSubscriptions > 0) {
      return res.status(400).json({ 
        message: `Cannot delete subscription with ${activeSubscriptions} active customers. Deactivate instead.` 
      });
    }

    await subscription.remove();

    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subscriptions/:id/subscribe
// @desc    Subscribe to a subscription
// @access  Private (Customer)
router.post('/:id/subscribe', [auth, customer], [
  body('shippingAddress').isObject(),
  body('customization').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const subscription = await Subscription.findOne({
      _id: req.params.id,
      isActive: true
    }).populate('businessOwner', 'businessName');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if customer is already subscribed
    const existingSubscription = await CustomerSubscription.findOne({
      customer: req.user._id,
      subscription: req.params.id,
      status: { $in: ['active', 'paused'] }
    });

    if (existingSubscription) {
      return res.status(400).json({ message: 'Already subscribed to this subscription' });
    }

    // Calculate next billing date
    const nextBillingDate = new Date();
    switch (subscription.billingCycle) {
      case 'weekly':
        nextBillingDate.setDate(nextBillingDate.getDate() + 7);
        break;
      case 'bi-weekly':
        nextBillingDate.setDate(nextBillingDate.getDate() + 14);
        break;
      case 'monthly':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
        break;
      case 'yearly':
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        break;
    }

    const customerSubscription = new CustomerSubscription({
      customer: req.user._id,
      subscription: req.params.id,
      businessOwner: subscription.businessOwner._id,
      nextBillingDate,
      billingCycle: subscription.billingCycle,
      price: subscription.price + subscription.shippingCost,
      shippingAddress: req.body.shippingAddress,
      billingAddress: req.body.billingAddress || req.body.shippingAddress,
      customization: req.body.customization || []
    });

    await customerSubscription.save();

    // TODO: Process payment with Stripe
    // For now, just save the subscription

    res.status(201).json({
      message: 'Subscription created successfully',
      customerSubscription
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subscriptions/my-subscriptions
// @desc    Get customer's subscriptions
// @access  Private (Customer)
router.get('/my-subscriptions', [auth, customer], async (req, res) => {
  try {
    const subscriptions = await CustomerSubscription.find({
      customer: req.user._id
    })
    .populate('subscription', 'name description price billingCycle images')
    .populate('businessOwner', 'businessName')
    .sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    console.error('Get my subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/subscriptions/:id/pause
// @desc    Pause subscription
// @access  Private (Customer)
router.put('/:id/pause', [auth, customer], [
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const customerSubscription = await CustomerSubscription.findOne({
      _id: req.params.id,
      customer: req.user._id
    });

    if (!customerSubscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    await customerSubscription.pause(req.body.reason);

    res.json({
      message: 'Subscription paused successfully',
      customerSubscription
    });
  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/subscriptions/:id/resume
// @desc    Resume subscription
// @access  Private (Customer)
router.put('/:id/resume', [auth, customer], async (req, res) => {
  try {
    const customerSubscription = await CustomerSubscription.findOne({
      _id: req.params.id,
      customer: req.user._id
    });

    if (!customerSubscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    await customerSubscription.resume();

    res.json({
      message: 'Subscription resumed successfully',
      customerSubscription
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/subscriptions/:id/cancel
// @desc    Cancel subscription
// @access  Private (Customer)
router.put('/:id/cancel', [auth, customer], async (req, res) => {
  try {
    const customerSubscription = await CustomerSubscription.findOne({
      _id: req.params.id,
      customer: req.user._id
    });

    if (!customerSubscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    await customerSubscription.cancel();

    res.json({
      message: 'Subscription cancelled successfully',
      customerSubscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 