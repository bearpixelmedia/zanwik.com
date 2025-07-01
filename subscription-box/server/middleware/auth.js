const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Check if user is business owner
const businessOwner = async (req, res, next) => {
  try {
    if (req.user.role !== 'business_owner') {
      return res.status(403).json({ message: 'Access denied. Business owner role required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is customer
const customer = async (req, res, next) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Customer role required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check subscription plan limits
const checkSubscriptionLimits = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Get current subscriber count
    const CustomerSubscription = require('../models/CustomerSubscription');
    const currentSubscribers = await CustomerSubscription.countDocuments({
      businessOwner: user._id,
      status: 'active'
    });

    // Check limits based on plan
    let maxSubscribers;
    switch (user.subscriptionPlan) {
      case 'free':
        maxSubscribers = 50;
        break;
      case 'starter':
        maxSubscribers = 100;
        break;
      case 'professional':
        maxSubscribers = 1000;
        break;
      case 'enterprise':
        maxSubscribers = Infinity;
        break;
      default:
        maxSubscribers = 50;
    }

    if (currentSubscribers >= maxSubscribers) {
      return res.status(403).json({ 
        message: `Subscription limit reached. Current plan allows ${maxSubscribers} subscribers.` 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

module.exports = {
  auth,
  businessOwner,
  customer,
  checkSubscriptionLimits,
  optionalAuth
}; 