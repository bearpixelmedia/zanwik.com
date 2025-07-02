const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'researcher', 'analyst', 'viewer'],
    default: 'researcher'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'business', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'active'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    }
  },
  limits: {
    surveys: {
      type: Number,
      default: 5
    },
    responses: {
      type: Number,
      default: 100
    },
    questions: {
      type: Number,
      default: 20
    },
    teamMembers: {
      type: Number,
      default: 1
    }
  },
  usage: {
    surveysCreated: {
      type: Number,
      default: 0
    },
    responsesCollected: {
      type: Number,
      default: 0
    },
    storageUsed: {
      type: Number,
      default: 0
    }
  },
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    responseNotifications: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: false
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  team: {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['admin', 'researcher', 'analyst', 'viewer'],
        default: 'viewer'
      },
      invitedAt: {
        type: Date,
        default: Date.now
      },
      acceptedAt: Date
    }]
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: String,
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    dashboardLayout: {
      type: String,
      default: 'default'
    }
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.stripeCustomerId': 1 });
userSchema.index({ 'team.owner': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for subscription status
userSchema.virtual('isSubscriptionActive').get(function() {
  return this.subscription.status === 'active' && 
         (!this.subscription.currentPeriodEnd || 
          this.subscription.currentPeriodEnd > new Date());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user can create more surveys
userSchema.methods.canCreateSurvey = function() {
  return this.usage.surveysCreated < this.limits.surveys;
};

// Method to check if user can collect more responses
userSchema.methods.canCollectResponses = function(count = 1) {
  return this.usage.responsesCollected + count <= this.limits.responses;
};

// Method to get subscription limits
userSchema.methods.getSubscriptionLimits = function() {
  const limits = {
    free: { surveys: 5, responses: 100, questions: 20, teamMembers: 1 },
    starter: { surveys: 20, responses: 1000, questions: 50, teamMembers: 3 },
    professional: { surveys: 100, responses: 10000, questions: 100, teamMembers: 10 },
    business: { surveys: 500, responses: 100000, questions: 200, teamMembers: 25 },
    enterprise: { surveys: -1, responses: -1, questions: -1, teamMembers: -1 }
  };
  
  return limits[this.subscription.plan] || limits.free;
};

// Method to update usage
userSchema.methods.updateUsage = function(type, amount = 1) {
  switch (type) {
    case 'surveys':
      this.usage.surveysCreated += amount;
      break;
    case 'responses':
      this.usage.responsesCollected += amount;
      break;
    case 'storage':
      this.usage.storageUsed += amount;
      break;
  }
  return this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get team members
userSchema.statics.getTeamMembers = function(userId) {
  return this.find({
    $or: [
      { 'team.owner': userId },
      { 'team.members.user': userId }
    ]
  }).populate('team.members.user', 'firstName lastName email avatar');
};

module.exports = mongoose.model('User', userSchema); 