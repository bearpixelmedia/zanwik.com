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

// Check if user has specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

// Check if user owns resource or is admin
const requireOwnership = (resourceModel) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const resourceId = req.params.id || req.params.surveyId;
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      // Admin can access everything
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // Check if user owns the resource
      if (resource.creator.toString() === req.user._id.toString()) {
        req.resource = resource;
        return next();
      }

      // Check team access
      if (resource.team && resource.team.toString() === req.user._id.toString()) {
        req.resource = resource;
        return next();
      }

      // Check if user is team member
      if (req.user.team && req.user.team.owner && 
          req.user.team.owner.toString() === resource.creator.toString()) {
        req.resource = resource;
        return next();
      }

      return res.status(403).json({ 
        message: 'Access denied. You do not own this resource.' 
      });
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

// Check subscription limits
const checkSubscriptionLimits = (limitType) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const limits = req.user.getSubscriptionLimits();
      const currentUsage = req.user.usage;
      
      let canProceed = true;
      let message = '';

      switch (limitType) {
        case 'surveys':
          if (limits.surveys !== -1 && currentUsage.surveysCreated >= limits.surveys) {
            canProceed = false;
            message = 'Survey limit reached. Please upgrade your subscription.';
          }
          break;
          
        case 'responses':
          const responseCount = parseInt(req.body.responseCount) || 1;
          if (limits.responses !== -1 && 
              currentUsage.responsesCollected + responseCount > limits.responses) {
            canProceed = false;
            message = 'Response limit reached. Please upgrade your subscription.';
          }
          break;
          
        case 'questions':
          const questionCount = parseInt(req.body.questionCount) || 1;
          if (limits.questions !== -1 && questionCount > limits.questions) {
            canProceed = false;
            message = 'Question limit exceeded. Please upgrade your subscription.';
          }
          break;
          
        case 'team':
          if (limits.teamMembers !== -1 && 
              req.user.team && req.user.team.members.length >= limits.teamMembers) {
            canProceed = false;
            message = 'Team member limit reached. Please upgrade your subscription.';
          }
          break;
          
        case 'storage':
          const fileSize = parseInt(req.body.fileSize) || 0;
          if (currentUsage.storageUsed + fileSize > 100 * 1024 * 1024) { // 100MB limit
            canProceed = false;
            message = 'Storage limit reached. Please upgrade your subscription.';
          }
          break;
      }

      if (!canProceed) {
        return res.status(403).json({ 
          message,
          limitType,
          currentUsage: req.user.usage,
          limits
        });
      }

      next();
    } catch (error) {
      console.error('Subscription limit check error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

// Rate limiting for survey responses
const responseRateLimit = (maxResponses = 1, windowMs = 24 * 60 * 60 * 1000) => {
  return async (req, res, next) => {
    try {
      const surveyId = req.params.surveyId || req.body.surveyId;
      const identifier = req.user ? req.user._id : req.ip;
      
      // Check if user has already responded recently
      const Response = require('../models/Response');
      const recentResponses = await Response.countDocuments({
        survey: surveyId,
        $or: [
          { 'respondent.user': identifier },
          { 'location.ip': req.ip }
        ],
        'timing.startedAt': { $gte: new Date(Date.now() - windowMs) }
      });

      if (recentResponses >= maxResponses) {
        return res.status(429).json({ 
          message: 'Too many responses. Please try again later.' 
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit check error:', error);
      next();
    }
  };
};

// Validate survey access
const validateSurveyAccess = async (req, res, next) => {
  try {
    const surveyId = req.params.surveyId || req.params.id;
    const Survey = require('../models/Survey');
    
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Check if survey is published
    if (survey.status !== 'published') {
      return res.status(404).json({ message: 'Survey is not available' });
    }

    // Check if survey has reached response limit
    if (survey.settings.response.maxResponses && 
        survey.analytics.totalResponses >= survey.settings.response.maxResponses) {
      return res.status(410).json({ message: 'Survey has reached maximum responses' });
    }

    // Check if survey has closed
    if (survey.settings.response.closeDate && 
        new Date() > survey.settings.response.closeDate) {
      return res.status(410).json({ message: 'Survey has closed' });
    }

    req.survey = survey;
    next();
  } catch (error) {
    console.error('Survey access validation error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  auth,
  optionalAuth,
  requireRole,
  requireOwnership,
  checkSubscriptionLimits,
  responseRateLimit,
  validateSurveyAccess
}; 