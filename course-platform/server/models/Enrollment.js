const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  completionDate: Date,
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  
  // Payment information
  payment: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    method: {
      type: String,
      enum: ['stripe', 'paypal', 'free', 'coupon', 'subscription'],
      default: 'stripe'
    },
    transactionId: String,
    stripePaymentIntentId: String,
    couponCode: String,
    discountAmount: {
      type: Number,
      default: 0
    }
  },
  
  // Progress tracking
  progress: {
    totalLessons: {
      type: Number,
      default: 0
    },
    completedLessons: {
      type: Number,
      default: 0
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    totalTimeSpent: {
      type: Number,
      default: 0 // in minutes
    },
    averageTimePerLesson: {
      type: Number,
      default: 0
    },
    lastLessonCompleted: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    currentLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }
  },
  
  // Assessment results
  assessments: {
    totalQuizzes: {
      type: Number,
      default: 0
    },
    completedQuizzes: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    totalAssignments: {
      type: Number,
      default: 0
    },
    submittedAssignments: {
      type: Number,
      default: 0
    },
    gradedAssignments: {
      type: Number,
      default: 0
    }
  },
  
  // Certificate
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedDate: Date,
    certificateId: String,
    downloadUrl: String,
    requirements: {
      completionRate: {
        type: Number,
        default: 80
      },
      minimumScore: {
        type: Number,
        default: 70
      },
      timeSpent: {
        type: Number,
        default: 0 // minimum time required
      }
    },
    met: {
      completionRate: {
        type: Boolean,
        default: false
      },
      minimumScore: {
        type: Boolean,
        default: false
      },
      timeSpent: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Access control
  access: {
    expiresAt: Date,
    isLifetime: {
      type: Boolean,
      default: true
    },
    canDownload: {
      type: Boolean,
      default: true
    },
    canAccessOffline: {
      type: Boolean,
      default: false
    },
    canAccessMobile: {
      type: Boolean,
      default: true
    }
  },
  
  // Notes and feedback
  notes: {
    student: [{
      content: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    instructor: [{
      content: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Engagement metrics
  engagement: {
    totalSessions: {
      type: Number,
      default: 0
    },
    averageSessionDuration: {
      type: Number,
      default: 0
    },
    lastSessionDuration: {
      type: Number,
      default: 0
    },
    daysActive: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    }
  },
  
  // Settings
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    progressReminders: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ instructor: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrollmentDate: -1 });
enrollmentSchema.index({ lastAccessed: -1 });
enrollmentSchema.index({ 'progress.completionPercentage': -1 });

// Virtual for isCompleted
enrollmentSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Virtual for isActive
enrollmentSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Virtual for formatted enrollment date
enrollmentSchema.virtual('formattedEnrollmentDate').get(function() {
  return this.enrollmentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted completion date
enrollmentSchema.virtual('formattedCompletionDate').get(function() {
  if (!this.completionDate) return null;
  return this.completionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for time to completion
enrollmentSchema.virtual('timeToCompletion').get(function() {
  if (!this.completionDate) return null;
  const diffTime = Math.abs(this.completionDate - this.enrollmentDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to update completion status
enrollmentSchema.pre('save', function(next) {
  if (this.progress.completionPercentage >= 100 && this.status === 'active') {
    this.status = 'completed';
    this.completionDate = new Date();
  }
  next();
});

// Pre-save middleware to update certificate eligibility
enrollmentSchema.pre('save', function(next) {
  if (this.progress.completionPercentage >= this.certificate.requirements.completionRate) {
    this.certificate.met.completionRate = true;
  }
  
  if (this.assessments.averageScore >= this.certificate.requirements.minimumScore) {
    this.certificate.met.minimumScore = true;
  }
  
  if (this.progress.totalTimeSpent >= this.certificate.requirements.timeSpent) {
    this.certificate.met.timeSpent = true;
  }
  
  // Issue certificate if all requirements are met
  if (this.certificate.met.completionRate && 
      this.certificate.met.minimumScore && 
      this.certificate.met.timeSpent && 
      !this.certificate.issued) {
    this.certificate.issued = true;
    this.certificate.issuedDate = new Date();
    this.certificate.certificateId = `CERT-${this._id.toString().slice(-8).toUpperCase()}`;
  }
  
  next();
});

// Method to update progress
enrollmentSchema.methods.updateProgress = async function() {
  const Lesson = require('./Lesson');
  const LessonProgress = require('./LessonProgress');
  
  // Get total lessons for this course
  const totalLessons = await Lesson.countDocuments({ 
    course: this.course, 
    isPublished: true 
  });
  
  // Get completed lessons
  const completedLessons = await LessonProgress.countDocuments({
    student: this.student,
    lesson: { $in: await Lesson.find({ course: this.course }).distinct('_id') },
    isCompleted: true
  });
  
  // Calculate completion percentage
  const completionPercentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;
  
  // Update progress
  this.progress.totalLessons = totalLessons;
  this.progress.completedLessons = completedLessons;
  this.progress.completionPercentage = completionPercentage;
  
  // Update last accessed
  this.lastAccessed = new Date();
  
  await this.save();
};

// Method to calculate time spent
enrollmentSchema.methods.calculateTimeSpent = async function() {
  const LessonProgress = require('./LessonProgress');
  
  const progress = await LessonProgress.find({
    student: this.student,
    lesson: { $in: await Lesson.find({ course: this.course }).distinct('_id') }
  });
  
  const totalTimeSpent = progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
  const averageTimePerLesson = progress.length > 0 
    ? Math.round(totalTimeSpent / progress.length) 
    : 0;
  
  this.progress.totalTimeSpent = totalTimeSpent;
  this.progress.averageTimePerLesson = averageTimePerLesson;
  
  await this.save();
};

// Static method to find student enrollments
enrollmentSchema.statics.findByStudent = function(studentId, options = {}) {
  const query = { student: studentId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('course', 'title slug thumbnail instructor')
    .populate('instructor', 'firstName lastName avatar')
    .sort({ lastAccessed: -1 });
};

// Static method to find course enrollments
enrollmentSchema.statics.findByCourse = function(courseId, options = {}) {
  const query = { course: courseId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('student', 'firstName lastName email avatar')
    .sort({ enrollmentDate: -1 });
};

// Static method to find instructor enrollments
enrollmentSchema.statics.findByInstructor = function(instructorId, options = {}) {
  const query = { instructor: instructorId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('course', 'title slug thumbnail')
    .populate('student', 'firstName lastName email avatar')
    .sort({ enrollmentDate: -1 });
};

// Static method to get enrollment statistics
enrollmentSchema.statics.getStats = function(courseId) {
  return this.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        activeEnrollments: { 
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedEnrollments: { 
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageCompletionRate: { $avg: '$progress.completionPercentage' },
        averageTimeSpent: { $avg: '$progress.totalTimeSpent' },
        totalRevenue: { $sum: '$payment.amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Enrollment', enrollmentSchema); 