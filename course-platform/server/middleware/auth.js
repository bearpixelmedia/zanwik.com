const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// Check if user is instructor
const requireInstructor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!req.user.isInstructor) {
    return res.status(403).json({ message: 'Instructor access required' });
  }

  next();
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

// Check if user is student
const requireStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.isInstructor && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Student access required' });
  }

  next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check course ownership (instructor only)
const requireCourseOwnership = async (req, res, next) => {
  try {
    const Course = require('../models/Course');
    const courseId = req.params.courseId || req.params.id;
    
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID required' });
    }

    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Admin can access all courses
    if (req.user.isAdmin) {
      req.course = course;
      return next();
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Course ownership required' });
    }

    req.course = course;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error checking course ownership' });
  }
};

// Check enrollment (student only)
const requireEnrollment = async (req, res, next) => {
  try {
    const Enrollment = require('../models/Enrollment');
    const courseId = req.params.courseId || req.params.id;
    
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID required' });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
      status: { $in: ['active', 'completed'] }
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Course enrollment required' });
    }

    req.enrollment = enrollment;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error checking enrollment' });
  }
};

// Check lesson access
const requireLessonAccess = async (req, res, next) => {
  try {
    const Lesson = require('../models/Lesson');
    const Enrollment = require('../models/Enrollment');
    const lessonId = req.params.lessonId || req.params.id;
    
    if (!lessonId) {
      return res.status(400).json({ message: 'Lesson ID required' });
    }

    const lesson = await Lesson.findById(lessonId).populate('course');
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if lesson is published
    if (!lesson.isPublished) {
      return res.status(404).json({ message: 'Lesson not available' });
    }

    // Free lessons are accessible to everyone
    if (lesson.isFree) {
      req.lesson = lesson;
      return next();
    }

    // Check enrollment for paid lessons
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course._id,
      status: { $in: ['active', 'completed'] }
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Course enrollment required' });
    }

    req.lesson = lesson;
    req.enrollment = enrollment;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error checking lesson access' });
  }
};

// Rate limiting for specific actions
const rateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old attempts
    if (attempts.has(key)) {
      attempts.set(key, attempts.get(key).filter(timestamp => timestamp > windowStart));
    }

    const currentAttempts = attempts.get(key) || [];
    
    if (currentAttempts.length >= maxAttempts) {
      return res.status(429).json({ 
        message: 'Too many attempts, please try again later' 
      });
    }

    currentAttempts.push(now);
    attempts.set(key, currentAttempts);

    next();
  };
};

// Subscription check
const requireSubscription = (plan = 'basic') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const subscriptionPlans = ['free', 'basic', 'premium', 'enterprise'];
    const userPlanIndex = subscriptionPlans.indexOf(req.user.subscription.plan);
    const requiredPlanIndex = subscriptionPlans.indexOf(plan);

    if (userPlanIndex < requiredPlanIndex) {
      return res.status(403).json({ 
        message: `${plan} subscription required` 
      });
    }

    if (req.user.subscription.status !== 'active') {
      return res.status(403).json({ 
        message: 'Active subscription required' 
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireInstructor,
  requireAdmin,
  requireStudent,
  optionalAuth,
  requireCourseOwnership,
  requireEnrollment,
  requireLessonAccess,
  rateLimit,
  requireSubscription
}; 