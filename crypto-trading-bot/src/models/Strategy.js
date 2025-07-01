const mongoose = require('mongoose');

const strategySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'ma_crossover',
      'rsi_divergence',
      'bollinger_bands',
      'macd',
      'stochastic',
      'grid_trading',
      'dca',
      'momentum',
      'mean_reversion',
      'arbitrage',
      'custom'
    ]
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'stopped'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  },
  parameters: {
    // Moving Average Crossover
    shortPeriod: {
      type: Number,
      min: 1,
      max: 200
    },
    longPeriod: {
      type: Number,
      min: 1,
      max: 200
    },
    maType: {
      type: String,
      enum: ['sma', 'ema', 'wma', 'hma'],
      default: 'sma'
    },
    
    // RSI
    rsiPeriod: {
      type: Number,
      min: 1,
      max: 100,
      default: 14
    },
    rsiOverbought: {
      type: Number,
      min: 50,
      max: 100,
      default: 70
    },
    rsiOversold: {
      type: Number,
      min: 0,
      max: 50,
      default: 30
    },
    
    // Bollinger Bands
    bbPeriod: {
      type: Number,
      min: 1,
      max: 200,
      default: 20
    },
    bbStdDev: {
      type: Number,
      min: 0.1,
      max: 5,
      default: 2
    },
    
    // MACD
    macdFastPeriod: {
      type: Number,
      min: 1,
      max: 100,
      default: 12
    },
    macdSlowPeriod: {
      type: Number,
      min: 1,
      max: 100,
      default: 26
    },
    macdSignalPeriod: {
      type: Number,
      min: 1,
      max: 100,
      default: 9
    },
    
    // Stochastic
    stochKPeriod: {
      type: Number,
      min: 1,
      max: 100,
      default: 14
    },
    stochDPeriod: {
      type: Number,
      min: 1,
      max: 100,
      default: 3
    },
    stochOverbought: {
      type: Number,
      min: 50,
      max: 100,
      default: 80
    },
    stochOversold: {
      type: Number,
      min: 0,
      max: 50,
      default: 20
    },
    
    // Grid Trading
    gridLevels: {
      type: Number,
      min: 2,
      max: 100,
      default: 10
    },
    gridSpacing: {
      type: Number,
      min: 0.001,
      max: 0.1,
      default: 0.02
    },
    gridInvestment: {
      type: Number,
      min: 10,
      default: 1000
    },
    
    // DCA
    dcaAmount: {
      type: Number,
      min: 1,
      default: 100
    },
    dcaInterval: {
      type: Number,
      min: 1,
      default: 7
    },
    dcaIntervalUnit: {
      type: String,
      enum: ['minutes', 'hours', 'days', 'weeks'],
      default: 'days'
    },
    
    // General parameters
    timeframe: {
      type: String,
      enum: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'],
      default: '1h'
    },
    lookbackPeriod: {
      type: Number,
      min: 1,
      max: 1000,
      default: 100
    }
  },
  conditions: {
    entry: {
      type: String,
      required: true
    },
    exit: {
      type: String,
      required: true
    },
    filters: [{
      name: String,
      condition: String,
      value: mongoose.Schema.Types.Mixed
    }]
  },
  riskManagement: {
    stopLoss: {
      enabled: {
        type: Boolean,
        default: true
      },
      percentage: {
        type: Number,
        min: 0.001,
        max: 0.5,
        default: 0.05
      },
      trailing: {
        type: Boolean,
        default: false
      },
      trailingPercentage: {
        type: Number,
        min: 0.001,
        max: 0.1,
        default: 0.02
      }
    },
    takeProfit: {
      enabled: {
        type: Boolean,
        default: true
      },
      percentage: {
        type: Number,
        min: 0.001,
        max: 1,
        default: 0.1
      },
      levels: [{
        percentage: Number,
        quantity: Number
      }]
    },
    positionSizing: {
      method: {
        type: String,
        enum: ['fixed', 'percentage', 'kelly', 'risk_based'],
        default: 'percentage'
      },
      value: {
        type: Number,
        min: 0.001,
        max: 1,
        default: 0.02
      }
    },
    maxPositions: {
      type: Number,
      min: 1,
      max: 50,
      default: 5
    },
    maxDailyTrades: {
      type: Number,
      min: 1,
      max: 100,
      default: 10
    },
    maxDrawdown: {
      type: Number,
      min: 0.01,
      max: 0.5,
      default: 0.2
    }
  },
  tradingPairs: [{
    symbol: {
      type: String,
      required: true,
      uppercase: true
    },
    baseAsset: {
      type: String,
      required: true,
      uppercase: true
    },
    quoteAsset: {
      type: String,
      required: true,
      uppercase: true
    },
    exchange: {
      type: String,
      required: true,
      enum: ['binance', 'coinbase', 'kraken', 'kucoin', 'gate']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    minQuantity: Number,
    maxQuantity: Number,
    pricePrecision: Number,
    quantityPrecision: Number
  }],
  schedule: {
    enabled: {
      type: Boolean,
      default: false
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    tradingHours: {
      start: String, // HH:MM format
      end: String    // HH:MM format
    },
    tradingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    holidays: [Date]
  },
  performance: {
    totalTrades: {
      type: Number,
      default: 0
    },
    winningTrades: {
      type: Number,
      default: 0
    },
    losingTrades: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number,
      default: 0
    },
    totalPnl: {
      type: Number,
      default: 0
    },
    totalVolume: {
      type: Number,
      default: 0
    },
    avgPnl: {
      type: Number,
      default: 0
    },
    maxDrawdown: {
      type: Number,
      default: 0
    },
    sharpeRatio: {
      type: Number,
      default: 0
    },
    profitFactor: {
      type: Number,
      default: 0
    },
    maxConsecutiveLosses: {
      type: Number,
      default: 0
    },
    maxConsecutiveWins: {
      type: Number,
      default: 0
    }
  },
  backtest: {
    enabled: {
      type: Boolean,
      default: true
    },
    startDate: Date,
    endDate: Date,
    initialBalance: {
      type: Number,
      default: 10000
    },
    results: {
      totalReturn: Number,
      annualizedReturn: Number,
      volatility: Number,
      sharpeRatio: Number,
      maxDrawdown: Number,
      calmarRatio: Number,
      sortinoRatio: Number,
      winRate: Number,
      profitFactor: Number,
      totalTrades: Number,
      avgTradeDuration: Number
    }
  },
  code: {
    language: {
      type: String,
      enum: ['javascript', 'python', 'typescript'],
      default: 'javascript'
    },
    entryFunction: String,
    exitFunction: String,
    customIndicators: [{
      name: String,
      code: String,
      parameters: mongoose.Schema.Types.Mixed
    }]
  },
  metadata: {
    tags: [String],
    category: String,
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'very_high'],
      default: 'medium'
    },
    expectedReturn: {
      type: Number,
      min: -1,
      max: 10
    },
    expectedDrawdown: {
      type: Number,
      min: 0,
      max: 1
    },
    notes: String,
    customFields: mongoose.Schema.Types.Mixed
  },
  settings: {
    notifications: {
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
      }
    },
    logging: {
      level: {
        type: String,
        enum: ['error', 'warn', 'info', 'debug'],
        default: 'info'
      },
      saveTrades: {
        type: Boolean,
        default: true
      },
      saveSignals: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true
});

// Indexes
strategySchema.index({ user: 1, createdAt: -1 });
strategySchema.index({ type: 1 });
strategySchema.index({ status: 1 });
strategySchema.index({ isPublic: 1, isTemplate: 1 });
strategySchema.index({ 'performance.totalPnl': -1 });

// Virtual for win rate
strategySchema.virtual('winRatePercentage').get(function() {
  return this.performance.totalTrades > 0 
    ? (this.performance.winningTrades / this.performance.totalTrades) * 100
    : 0;
});

// Virtual for profit factor
strategySchema.virtual('profitFactor').get(function() {
  return this.performance.losingTrades > 0 
    ? this.performance.winningTrades / this.performance.losingTrades
    : 0;
});

// Method to activate strategy
strategySchema.methods.activate = function() {
  this.status = 'active';
  return this.save();
};

// Method to pause strategy
strategySchema.methods.pause = function() {
  this.status = 'paused';
  return this.save();
};

// Method to stop strategy
strategySchema.methods.stop = function() {
  this.status = 'stopped';
  return this.save();
};

// Method to duplicate strategy
strategySchema.methods.duplicate = function(newUserId) {
  const duplicated = new this.constructor({
    ...this.toObject(),
    _id: undefined,
    user: newUserId,
    name: `${this.name} (Copy)`,
    status: 'draft',
    isPublic: false,
    isTemplate: false,
    performance: {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnl: 0,
      totalVolume: 0,
      avgPnl: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      profitFactor: 0,
      maxConsecutiveLosses: 0,
      maxConsecutiveWins: 0
    },
    backtest: {
      ...this.backtest,
      results: {}
    },
    createdAt: undefined,
    updatedAt: undefined
  });
  
  return duplicated.save();
};

// Method to update performance
strategySchema.methods.updatePerformance = function(trade) {
  this.performance.totalTrades += 1;
  this.performance.totalVolume += trade.cost;
  
  if (trade.performance.pnl > 0) {
    this.performance.winningTrades += 1;
  } else {
    this.performance.losingTrades += 1;
  }
  
  this.performance.totalPnl += trade.performance.pnl;
  this.performance.winRate = (this.performance.winningTrades / this.performance.totalTrades) * 100;
  this.performance.avgPnl = this.performance.totalPnl / this.performance.totalTrades;
  
  return this.save();
};

// Static method to find active strategies
strategySchema.statics.findActive = function(userId) {
  return this.find({ user: userId, status: 'active' });
};

// Static method to find templates
strategySchema.statics.findTemplates = function() {
  return this.find({ isTemplate: true, isPublic: true });
};

// Static method to find by type
strategySchema.statics.findByType = function(userId, type) {
  return this.find({ user: userId, type });
};

module.exports = mongoose.model('Strategy', strategySchema); 