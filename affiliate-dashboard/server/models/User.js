const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['affiliate', 'merchant', 'admin'],
    default: 'affiliate'
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  phone: {
    type: String,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  company: {
    name: String,
    website: String,
    industry: String,
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-1000', '1000+']
    }
  },
  location: {
    country: String,
    city: String,
    timezone: String
  },
  socialLinks: {
    website: String,
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String,
    youtube: String
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Affiliate specific fields
  affiliate: {
    isApproved: {
      type: Boolean,
      default: false
    },
    approvalDate: Date,
    referralCode: {
      type: String,
      unique: true,
      sparse: true
    },
    paymentInfo: {
      method: {
        type: String,
        enum: ['stripe', 'paypal', 'bank_transfer'],
        default: 'stripe'
      },
      stripeAccountId: String,
      paypalEmail: String,
      bankDetails: {
        accountName: String,
        accountNumber: String,
        routingNumber: String,
        bankName: String
      }
    },
    taxInfo: {
      taxId: String,
      taxForm: {
        type: String,
        enum: ['w9', 'w8ben', 'other']
      }
    },
    marketingChannels: [{
      type: String,
      enum: ['blog', 'social_media', 'email', 'youtube', 'podcast', 'website', 'other']
    }],
    audienceSize: {
      type: String,
      enum: ['1k-10k', '10k-50k', '50k-100k', '100k-500k', '500k+']
    },
    niche: [String],
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert']
    }
  },
  
  // Merchant specific fields
  merchant: {
    businessType: {
      type: String,
      enum: ['ecommerce', 'saas', 'digital_products', 'services', 'other']
    },
    industry: String,
    website: String,
    monthlyRevenue: {
      type: String,
      enum: ['0-10k', '10k-50k', '50k-100k', '100k-500k', '500k+']
    },
    affiliateProgram: {
      isActive: {
        type: Boolean,
        default: false
      },
      commissionRate: {
        type: Number,
        default: 10,
        min: 0,
        max: 100
      },
      cookieDuration: {
        type: Number,
        default: 30,
        min: 1,
        max: 365
      },
      minimumPayout: {
        type: Number,
        default: 50
      },
      payoutSchedule: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly'],
        default: 'monthly'
      }
    }
  },
  
  // Stripe integration
  stripeCustomerId: String,
  stripeAccountId: String,
  
  // Subscription and billing
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date,
    stripeSubscriptionId: String
  },
  
  // Statistics
  stats: {
    totalEarnings: {
      type: Number,
      default: 0
    },
    totalCommissions: {
      type: Number,
      default: 0
    },
    totalClicks: {
      type: Number,
      default: 0
    },
    totalConversions: {
      type: Number,
      default: 0
    },
    averageCommission: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  
  // Account status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspensionReason: String,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  // Security
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'affiliate.referralCode': 1 });
userSchema.index({ 'subscription.status': 1 });
userSchema.index({ 'affiliate.isApproved': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for isAffiliate
userSchema.virtual('isAffiliate').get(function() {
  return this.role === 'affiliate';
});

// Virtual for isMerchant
userSchema.virtual('isMerchant').get(function() {
  return this.role === 'merchant';
});

// Virtual for isAdmin
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
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

// Pre-save middleware to generate referral code
userSchema.pre('save', function(next) {
  if (this.isAffiliate && !this.affiliate.referralCode) {
    this.affiliate.referralCode = this.generateReferralCode();
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate referral code
userSchema.methods.generateReferralCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.twoFactorSecret;
  delete userObject.stripeCustomerId;
  delete userObject.stripeAccountId;
  
  return userObject;
};

// Method to update stats
userSchema.methods.updateStats = async function() {
  const Commission = require('./Commission');
  const Click = require('./Click');
  
  if (this.isAffiliate) {
    const commissions = await Commission.find({ affiliate: this._id });
    const clicks = await Click.find({ affiliate: this._id });
    
    const totalEarnings = commissions.reduce((sum, commission) => sum + commission.amount, 0);
    const totalCommissions = commissions.length;
    const totalClicks = clicks.length;
    const totalConversions = commissions.filter(c => c.status === 'paid').length;
    const averageCommission = totalCommissions > 0 ? totalEarnings / totalCommissions : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    
    this.stats.totalEarnings = totalEarnings;
    this.stats.totalCommissions = totalCommissions;
    this.stats.totalClicks = totalClicks;
    this.stats.totalConversions = totalConversions;
    this.stats.averageCommission = Math.round(averageCommission * 100) / 100;
    this.stats.conversionRate = Math.round(conversionRate * 100) / 100;
    
    await this.save();
  }
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by referral code
userSchema.statics.findByReferralCode = function(referralCode) {
  return this.findOne({ 'affiliate.referralCode': referralCode });
};

// Static method to find affiliates
userSchema.statics.findAffiliates = function() {
  return this.find({ role: 'affiliate' });
};

// Static method to find merchants
userSchema.statics.findMerchants = function() {
  return this.find({ role: 'merchant' });
};

module.exports = mongoose.model('User', userSchema); 