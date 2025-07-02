const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  strategy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Strategy',
    required: true
  },
  exchange: {
    type: String,
    required: true,
    enum: ['binance', 'coinbase', 'kraken', 'kucoin', 'gate']
  },
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
  side: {
    type: String,
    required: true,
    enum: ['buy', 'sell']
  },
  type: {
    type: String,
    required: true,
    enum: ['market', 'limit', 'stop', 'stop_limit']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'open', 'filled', 'cancelled', 'rejected', 'expired'],
    default: 'pending'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  averagePrice: {
    type: Number,
    min: 0
  },
  filledQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  cost: {
    type: Number,
    min: 0
  },
  fee: {
    type: Number,
    default: 0,
    min: 0
  },
  feeAsset: {
    type: String,
    uppercase: true
  },
  exchangeOrderId: String,
  exchangeTradeId: String,
  clientOrderId: String,
  timeInForce: {
    type: String,
    enum: ['GTC', 'IOC', 'FOK'],
    default: 'GTC'
  },
  stopPrice: {
    type: Number,
    min: 0
  },
  icebergQty: {
    type: Number,
    min: 0
  },
  orderBook: {
    bids: [[Number, Number]], // [price, quantity]
    asks: [[Number, Number]]  // [price, quantity]
  },
  marketData: {
    bid: Number,
    ask: Number,
    last: Number,
    high: Number,
    low: Number,
    volume: Number,
    timestamp: Date
  },
  signals: {
    rsi: Number,
    macd: {
      macd: Number,
      signal: Number,
      histogram: Number
    },
    bollingerBands: {
      upper: Number,
      middle: Number,
      lower: Number
    },
    movingAverages: {
      sma20: Number,
      sma50: Number,
      ema12: Number,
      ema26: Number
    },
    stochastic: {
      k: Number,
      d: Number
    }
  },
  riskManagement: {
    stopLoss: {
      price: Number,
      percentage: Number,
      trailing: Boolean,
      trailingPercentage: Number
    },
    takeProfit: {
      price: Number,
      percentage: Number,
      levels: [{
        price: Number,
        percentage: Number,
        quantity: Number
      }]
    },
    positionSize: {
      percentage: Number,
      amount: Number,
      riskAmount: Number
    }
  },
  performance: {
    pnl: {
      type: Number,
      default: 0
    },
    pnlPercentage: {
      type: Number,
      default: 0
    },
    unrealizedPnl: {
      type: Number,
      default: 0
    },
    realizedPnl: {
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
    winRate: {
      type: Number,
      default: 0
    }
  },
  metadata: {
    strategyName: String,
    strategyVersion: String,
    entryReason: String,
    exitReason: String,
    notes: String,
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed
  },
  timestamps: {
    created: {
      type: Date,
      default: Date.now
    },
    submitted: Date,
    filled: Date,
    cancelled: Date,
    updated: {
      type: Date,
      default: Date.now
    }
  },
  isPaperTrade: {
    type: Boolean,
    default: false
  },
  isBacktest: {
    type: Boolean,
    default: false
  },
  backtestId: String,
  relatedTrades: [{
    trade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trade'
    },
    relationship: {
      type: String,
      enum: ['entry', 'exit', 'partial', 'hedge']
    }
  }]
}, {
  timestamps: true
});

// Indexes
tradeSchema.index({ user: 1, createdAt: -1 });
tradeSchema.index({ symbol: 1, createdAt: -1 });
tradeSchema.index({ status: 1 });
tradeSchema.index({ exchange: 1, exchangeOrderId: 1 });
tradeSchema.index({ strategy: 1, createdAt: -1 });
tradeSchema.index({ isPaperTrade: 1, isBacktest: 1 });

// Virtual for total value
tradeSchema.virtual('totalValue').get(function() {
  return this.quantity * this.price;
});

// Virtual for filled value
tradeSchema.virtual('filledValue').get(function() {
  return this.filledQuantity * this.averagePrice;
});

// Virtual for is complete
tradeSchema.virtual('isComplete').get(function() {
  return this.status === 'filled' || this.status === 'cancelled';
});

// Virtual for is profitable
tradeSchema.virtual('isProfitable').get(function() {
  return this.performance.pnl > 0;
});

// Pre-save middleware to update remaining quantity
tradeSchema.pre('save', function(next) {
  if (this.isModified('filledQuantity')) {
    this.remainingQuantity = this.quantity - this.filledQuantity;
  }
  
  if (this.isModified('filledQuantity') && this.filledQuantity > 0) {
    this.averagePrice = this.cost / this.filledQuantity;
  }
  
  this.timestamps.updated = new Date();
  next();
});

// Method to update performance metrics
tradeSchema.methods.updatePerformance = function(currentPrice) {
  if (this.side === 'buy') {
    this.performance.unrealizedPnl = (currentPrice - this.averagePrice) * this.filledQuantity;
    this.performance.pnlPercentage = ((currentPrice - this.averagePrice) / this.averagePrice) * 100;
  } else {
    this.performance.unrealizedPnl = (this.averagePrice - currentPrice) * this.filledQuantity;
    this.performance.pnlPercentage = ((this.averagePrice - currentPrice) / this.averagePrice) * 100;
  }
  
  this.performance.pnl = this.performance.unrealizedPnl - this.fee;
  return this.save();
};

// Method to close trade
tradeSchema.methods.closeTrade = function(exitPrice, exitQuantity, exitReason) {
  this.status = 'filled';
  this.filledQuantity = exitQuantity;
  this.averagePrice = exitPrice;
  this.cost = exitQuantity * exitPrice;
  this.timestamps.filled = new Date();
  this.metadata.exitReason = exitReason;
  
  // Calculate realized P&L
  if (this.side === 'buy') {
    this.performance.realizedPnl = (exitPrice - this.price) * exitQuantity - this.fee;
  } else {
    this.performance.realizedPnl = (this.price - exitPrice) * exitQuantity - this.fee;
  }
  
  this.performance.pnl = this.performance.realizedPnl;
  this.performance.pnlPercentage = (this.performance.realizedPnl / this.cost) * 100;
  
  return this.save();
};

// Method to cancel trade
tradeSchema.methods.cancelTrade = function(reason) {
  this.status = 'cancelled';
  this.timestamps.cancelled = new Date();
  this.metadata.exitReason = reason || 'Cancelled by user';
  return this.save();
};

// Method to add related trade
tradeSchema.methods.addRelatedTrade = function(tradeId, relationship) {
  this.relatedTrades.push({
    trade: tradeId,
    relationship
  });
  return this.save();
};

// Static method to find open trades
tradeSchema.statics.findOpenTrades = function(userId) {
  return this.find({
    user: userId,
    status: { $in: ['pending', 'open'] }
  });
};

// Static method to find completed trades
tradeSchema.statics.findCompletedTrades = function(userId, startDate, endDate) {
  const query = {
    user: userId,
    status: { $in: ['filled', 'cancelled'] }
  };
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  return this.find(query);
};

// Static method to get performance statistics
tradeSchema.statics.getPerformanceStats = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        status: 'filled',
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalTrades: { $sum: 1 },
        winningTrades: {
          $sum: { $cond: [{ $gt: ['$performance.pnl', 0] }, 1, 0] }
        },
        totalPnl: { $sum: '$performance.pnl' },
        totalVolume: { $sum: '$cost' },
        avgPnl: { $avg: '$performance.pnl' },
        maxPnl: { $max: '$performance.pnl' },
        minPnl: { $min: '$performance.pnl' },
        totalFees: { $sum: '$fee' }
      }
    },
    {
      $project: {
        _id: 0,
        totalTrades: 1,
        winningTrades: 1,
        losingTrades: { $subtract: ['$totalTrades', '$winningTrades'] },
        winRate: {
          $multiply: [
            { $divide: ['$winningTrades', '$totalTrades'] },
            100
          ]
        },
        totalPnl: 1,
        totalVolume: 1,
        avgPnl: 1,
        maxPnl: 1,
        minPnl: 1,
        totalFees: 1,
        netPnl: { $subtract: ['$totalPnl', '$totalFees'] }
      }
    }
  ]);
};

module.exports = mongoose.model('Trade', tradeSchema); 