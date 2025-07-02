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
  role: {
    type: String,
    enum: ['user', 'admin', 'premium'],
    default: 'user'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
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
  tradingSettings: {
    defaultStrategy: {
      type: String,
      default: 'ma_crossover'
    },
    riskPerTrade: {
      type: Number,
      default: 0.02,
      min: 0.001,
      max: 0.1
    },
    maxPortfolioRisk: {
      type: Number,
      default: 0.1,
      min: 0.01,
      max: 0.5
    },
    stopLossPercentage: {
      type: Number,
      default: 0.05,
      min: 0.01,
      max: 0.2
    },
    takeProfitPercentage: {
      type: Number,
      default: 0.1,
      min: 0.01,
      max: 0.5
    },
    maxDailyTrades: {
      type: Number,
      default: 10,
      min: 1,
      max: 100
    },
    minTradeAmount: {
      type: Number,
      default: 10,
      min: 1
    },
    maxTradeAmount: {
      type: Number,
      default: 1000,
      min: 10
    },
    preferredExchanges: [{
      type: String,
      enum: ['binance', 'coinbase', 'kraken', 'kucoin', 'gate']
    }],
    preferredPairs: [{
      base: String,
      quote: String
    }],
    tradingHours: {
      start: String, // HH:MM format
      end: String,   // HH:MM format
      timezone: {
        type: String,
        default: 'UTC'
      }
    }
  },
  exchangeAccounts: [{
    exchange: {
      type: String,
      required: true,
      enum: ['binance', 'coinbase', 'kraken', 'kucoin', 'gate']
    },
    apiKey: {
      type: String,
      required: true
    },
    secretKey: {
      type: String,
      required: true
    },
    passphrase: String, // For some exchanges like Coinbase
    isActive: {
      type: Boolean,
      default: true
    },
    permissions: [{
      type: String,
      enum: ['read', 'trade', 'withdraw']
    }],
    lastSync: Date,
    balance: {
      type: Map,
      of: Number
    }
  }],
  limits: {
    maxStrategies: {
      type: Number,
      default: 3
    },
    maxConcurrentTrades: {
      type: Number,
      default: 5
    },
    maxBacktestDays: {
      type: Number,
      default: 30
    },
    maxApiCalls: {
      type: Number,
      default: 1000
    }
  },
  usage: {
    strategiesCreated: {
      type: Number,
      default: 0
    },
    tradesExecuted: {
      type: Number,
      default: 0
    },
    backtestsRun: {
      type: Number,
      default: 0
    },
    apiCallsUsed: {
      type: Number,
      default: 0
    }
  },
  notifications: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      tradeExecuted: {
        type: Boolean,
        default: true
      },
      stopLossHit: {
        type: Boolean,
        default: true
      },
      takeProfitHit: {
        type: Boolean,
        default: true
      },
      dailyReport: {
        type: Boolean,
        default: false
      },
      weeklyReport: {
        type: Boolean,
        default: true
      }
    },
    telegram: {
      enabled: {
        type: Boolean,
        default: false
      },
      chatId: String,
      tradeExecuted: {
        type: Boolean,
        default: true
      },
      stopLossHit: {
        type: Boolean,
        default: true
      },
      takeProfitHit: {
        type: Boolean,
        default: true
      }
    },
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      phoneNumber: String,
      emergencyOnly: {
        type: Boolean,
        default: true
      }
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark'
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
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '24h'
    }
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
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String,
    location: String
  }],
  apiKeys: [{
    name: String,
    key: String,
    permissions: [String],
    lastUsed: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.stripeCustomerId': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

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

// Method to check if user can create more strategies
userSchema.methods.canCreateStrategy = function() {
  return this.usage.strategiesCreated < this.limits.maxStrategies;
};

// Method to check if user can execute more trades
userSchema.methods.canExecuteTrade = function() {
  return this.usage.tradesExecuted < this.limits.maxConcurrentTrades;
};

// Method to get subscription limits
userSchema.methods.getSubscriptionLimits = function() {
  const limits = {
    free: { strategies: 3, trades: 5, backtestDays: 30, apiCalls: 1000 },
    basic: { strategies: 10, trades: 20, backtestDays: 90, apiCalls: 5000 },
    premium: { strategies: 50, trades: 100, backtestDays: 365, apiCalls: 25000 },
    enterprise: { strategies: -1, trades: -1, backtestDays: -1, apiCalls: -1 }
  };
  
  return limits[this.subscription.plan] || limits.free;
};

// Method to update usage
userSchema.methods.updateUsage = function(type, amount = 1) {
  switch (type) {
    case 'strategies':
      this.usage.strategiesCreated += amount;
      break;
    case 'trades':
      this.usage.tradesExecuted += amount;
      break;
    case 'backtests':
      this.usage.backtestsRun += amount;
      break;
    case 'apiCalls':
      this.usage.apiCallsUsed += amount;
      break;
  }
  return this.save();
};

// Method to add exchange account
userSchema.methods.addExchangeAccount = function(exchangeData) {
  const existingAccount = this.exchangeAccounts.find(
    account => account.exchange === exchangeData.exchange
  );
  
  if (existingAccount) {
    Object.assign(existingAccount, exchangeData);
  } else {
    this.exchangeAccounts.push(exchangeData);
  }
  
  return this.save();
};

// Method to remove exchange account
userSchema.methods.removeExchangeAccount = function(exchange) {
  this.exchangeAccounts = this.exchangeAccounts.filter(
    account => account.exchange !== exchange
  );
  return this.save();
};

// Method to get active exchange accounts
userSchema.methods.getActiveExchangeAccounts = function() {
  return this.exchangeAccounts.filter(account => account.isActive);
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get users by subscription
userSchema.statics.findBySubscription = function(plan) {
  return this.find({ 'subscription.plan': plan });
};

module.exports = mongoose.model('User', userSchema); 