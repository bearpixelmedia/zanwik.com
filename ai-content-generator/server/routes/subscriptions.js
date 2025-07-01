const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Create checkout session
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { priceId } = req.body;

    const prices = {
      'starter': 'price_starter_monthly',
      'pro': 'price_pro_monthly',
      'premium': 'price_premium_monthly'
    };

    const stripePriceId = prices[priceId];
    if (!stripePriceId) {
      return res.status(400).json({ error: 'Invalid price ID.' });
    }

    // Create or get Stripe customer
    let customerId = req.user.subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: req.user._id.toString()
        }
      });
      customerId = customer.id;
      
      // Update user with customer ID
      await User.findByIdAndUpdate(req.user._id, {
        'subscription.stripeCustomerId': customerId
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?canceled=true`,
      metadata: {
        userId: req.user._id.toString(),
        plan: priceId
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: 'Error creating checkout session.' });
  }
});

// Create portal session
router.post('/create-portal-session', auth, async (req, res) => {
  try {
    const customerId = req.user.subscription.stripeCustomerId;
    
    if (!customerId) {
      return res.status(400).json({ error: 'No subscription found.' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create portal session error:', error);
    res.status(500).json({ error: 'Error creating portal session.' });
  }
});

// Webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed.' });
  }
});

// Handle checkout completion
async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const plan = session.metadata.plan;

  await User.findByIdAndUpdate(userId, {
    'subscription.plan': plan,
    'subscription.status': 'active',
    'subscription.stripeSubscriptionId': session.subscription,
    'subscription.currentPeriodEnd': new Date(session.subscription.current_period_end * 1000)
  });
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  
  if (user) {
    await User.findByIdAndUpdate(user._id, {
      'subscription.status': subscription.status,
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000)
    });
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  
  if (user) {
    await User.findByIdAndUpdate(user._id, {
      'subscription.status': 'cancelled',
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000)
    });
  }
}

// Get subscription status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      plan: user.subscription.plan,
      status: user.subscription.status,
      usageCount: user.usageCount,
      usageLimit: user.getUsageLimit(),
      canGenerate: user.canGenerateContent(),
      currentPeriodEnd: user.subscription.currentPeriodEnd
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Error getting subscription status.' });
  }
});

module.exports = router; 