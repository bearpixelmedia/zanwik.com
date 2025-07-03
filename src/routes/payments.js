const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');

// Get payment methods
router.get('/methods', async (req, res) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: req.user.stripeCustomerId,
      type: 'card',
    });
    
    res.json(paymentMethods.data);
  } catch (error) {
    logger.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Failed to fetch payment methods' });
  }
});

// Add payment method
router.post('/methods', async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: req.user.stripeCustomerId,
    });
    
    res.json({ message: 'Payment method added successfully' });
  } catch (error) {
    logger.error('Error adding payment method:', error);
    res.status(500).json({ message: 'Failed to add payment method' });
  }
});

// Remove payment method
router.delete('/methods/:id', async (req, res) => {
  try {
    await stripe.paymentMethods.detach(req.params.id);
    
    res.json({ message: 'Payment method removed successfully' });
  } catch (error) {
    logger.error('Error removing payment method:', error);
    res.status(500).json({ message: 'Failed to remove payment method' });
  }
});

// Create subscription
router.post('/subscriptions', async (req, res) => {
  try {
    const { priceId, paymentMethodId } = req.body;
    
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: req.user.stripeCustomerId,
    });
    
    // Set as default payment method
    await stripe.customers.update(req.user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: req.user.stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
    
    res.json(subscription);
  } catch (error) {
    logger.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
});

// Get subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: req.user.stripeCustomerId,
      status: 'all',
    });
    
    res.json(subscriptions.data);
  } catch (error) {
    logger.error('Error fetching subscriptions:', error);
    res.status(500).json({ message: 'Failed to fetch subscriptions' });
  }
});

// Cancel subscription
router.post('/subscriptions/:id/cancel', async (req, res) => {
  try {
    const subscription = await stripe.subscriptions.update(req.params.id, {
      cancel_at_period_end: true,
    });
    
    res.json(subscription);
  } catch (error) {
    logger.error('Error canceling subscription:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
});

// Reactivate subscription
router.post('/subscriptions/:id/reactivate', async (req, res) => {
  try {
    const subscription = await stripe.subscriptions.update(req.params.id, {
      cancel_at_period_end: false,
    });
    
    res.json(subscription);
  } catch (error) {
    logger.error('Error reactivating subscription:', error);
    res.status(500).json({ message: 'Failed to reactivate subscription' });
  }
});

// Get invoices
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await stripe.invoices.list({
      customer: req.user.stripeCustomerId,
      limit: 20,
    });
    
    res.json(invoices.data);
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

// Create payment intent for one-time payment
router.post('/payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', description } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: req.user.stripeCustomerId,
      description,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.json(paymentIntent);
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Get revenue analytics
router.get('/analytics/revenue', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    // Get invoices for the period
    const invoices = await stripe.invoices.list({
      customer: req.user.stripeCustomerId,
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
        lte: Math.floor(endDate.getTime() / 1000),
      },
      status: 'paid',
    });
    
    // Calculate revenue
    const totalRevenue = invoices.data.reduce((sum, invoice) => {
      return sum + invoice.amount_paid;
    }, 0);
    
    // Get subscription revenue
    const subscriptions = await stripe.subscriptions.list({
      customer: req.user.stripeCustomerId,
      status: 'active',
    });
    
    const mrr = subscriptions.data.reduce((sum, sub) => {
      return sum + (sub.items.data[0].price.unit_amount || 0);
    }, 0);
    
    res.json({
      totalRevenue,
      mrr,
      invoiceCount: invoices.data.length,
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching revenue analytics:', error);
    res.status(500).json({ message: 'Failed to fetch revenue analytics' });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({ message: 'Webhook handler failed' });
  }
});

// Webhook handlers
async function handlePaymentSucceeded(invoice) {
  logger.info(`Payment succeeded for invoice ${invoice.id}`);
  // Update user subscription status, send confirmation email, etc.
}

async function handlePaymentFailed(invoice) {
  logger.info(`Payment failed for invoice ${invoice.id}`);
  // Send payment failure notification, update subscription status, etc.
}

async function handleSubscriptionUpdated(subscription) {
  logger.info(`Subscription updated: ${subscription.id}`);
  // Update user subscription in database, send notification, etc.
}

async function handleSubscriptionDeleted(subscription) {
  logger.info(`Subscription deleted: ${subscription.id}`);
  // Update user subscription status, send cancellation email, etc.
}

module.exports = router; 