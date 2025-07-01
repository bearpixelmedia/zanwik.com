const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  affiliate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid', 'cancelled'],
    default: 'pending'
  },
  
  // Sale information
  sale: {
    orderId: {
      type: String,
      required: true
    },
    orderNumber: String,
    customerEmail: String,
    customerName: String,
    saleAmount: {
      type: Number,
      required: true,
      min: [0, 'Sale amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    saleDate: {
      type: Date,
      required: true
    },
    products: [{
      name: String,
      sku: String,
      quantity: Number,
      price: Number
    }],
    shipping: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    }
  },
  
  // Commission calculation
  commission: {
    rate: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'tiered'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Commission amount cannot be negative']
    },
    baseAmount: {
      type: Number,
      required: true
    },
    platformFee: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      required: true
    }
  },
  
  // Tracking information
  tracking: {
    clickId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Click'
    },
    affiliateLink: String,
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmTerm: String,
    utmContent: String,
    ipAddress: String,
    userAgent: String,
    device: String,
    browser: String,
    os: String,
    country: String,
    city: String,
    timeToConversion: Number // in minutes
  },
  
  // Approval and payment
  approval: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    approvedAmount: Number,
    rejectionReason: String,
    notes: String
  },
  
  payment: {
    payoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payout'
    },
    paidAt: Date,
    paidAmount: Number,
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'bank_transfer']
    },
    transactionId: String,
    stripeTransferId: String
  },
  
  // Fraud detection
  fraud: {
    isFlagged: {
      type: Boolean,
      default: false
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    flags: [{
      type: String,
      enum: [
        'suspicious_ip', 'multiple_orders', 'high_value', 
        'new_affiliate', 'unusual_pattern', 'geo_mismatch'
      ]
    }],
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String
  },
  
  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['webhook', 'manual', 'api', 'import'],
      default: 'webhook'
    },
    externalId: String,
    tags: [String],
    notes: String
  },
  
  // Dates
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
commissionSchema.index({ affiliate: 1 });
commissionSchema.index({ program: 1 });
commissionSchema.index({ merchant: 1 });
commissionSchema.index({ status: 1 });
commissionSchema.index({ 'sale.orderId': 1 }, { unique: true });
commissionSchema.index({ 'sale.saleDate': -1 });
commissionSchema.index({ createdAt: -1 });
commissionSchema.index({ 'tracking.clickId': 1 });

// Virtual for isPending
commissionSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

// Virtual for isApproved
commissionSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

// Virtual for isPaid
commissionSchema.virtual('isPaid').get(function() {
  return this.status === 'paid';
});

// Virtual for isRejected
commissionSchema.virtual('isRejected').get(function() {
  return this.status === 'rejected';
});

// Virtual for formatted sale amount
commissionSchema.virtual('formattedSaleAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.sale.currency
  }).format(this.sale.saleAmount);
});

// Virtual for formatted commission amount
commissionSchema.virtual('formattedCommissionAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.sale.currency
  }).format(this.commission.amount);
});

// Virtual for formatted net amount
commissionSchema.virtual('formattedNetAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.sale.currency
  }).format(this.commission.netAmount);
});

// Virtual for commission percentage
commissionSchema.virtual('commissionPercentage').get(function() {
  if (this.commission.type === 'percentage') {
    return this.commission.rate;
  }
  return (this.commission.amount / this.sale.saleAmount) * 100;
});

// Pre-save middleware to update timestamps
commissionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save middleware to calculate net amount
commissionSchema.pre('save', function(next) {
  this.commission.netAmount = this.commission.amount - this.commission.platformFee;
  next();
});

// Pre-save middleware to set expiration
commissionSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Set expiration to 90 days from creation
    this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to approve commission
commissionSchema.methods.approve = async function(approvedBy, approvedAmount = null) {
  this.status = 'approved';
  this.approval.approvedBy = approvedBy;
  this.approval.approvedAt = new Date();
  
  if (approvedAmount !== null) {
    this.approval.approvedAmount = approvedAmount;
    this.commission.amount = approvedAmount;
    this.commission.netAmount = approvedAmount - this.commission.platformFee;
  }
  
  await this.save();
  
  // Emit real-time update
  if (global.io) {
    global.io.to(`user-${this.affiliate}`).emit('commission-approved', {
      commissionId: this._id,
      amount: this.commission.amount
    });
  }
};

// Method to reject commission
commissionSchema.methods.reject = async function(rejectedBy, reason) {
  this.status = 'rejected';
  this.approval.rejectionReason = reason;
  this.approval.approvedBy = rejectedBy;
  this.approval.approvedAt = new Date();
  
  await this.save();
  
  // Emit real-time update
  if (global.io) {
    global.io.to(`user-${this.affiliate}`).emit('commission-rejected', {
      commissionId: this._id,
      reason: reason
    });
  }
};

// Method to mark as paid
commissionSchema.methods.markAsPaid = async function(payoutId, paidAmount, paymentMethod, transactionId) {
  this.status = 'paid';
  this.payment.payoutId = payoutId;
  this.payment.paidAt = new Date();
  this.payment.paidAmount = paidAmount;
  this.payment.paymentMethod = paymentMethod;
  this.payment.transactionId = transactionId;
  
  await this.save();
  
  // Emit real-time update
  if (global.io) {
    global.io.to(`user-${this.affiliate}`).emit('commission-paid', {
      commissionId: this._id,
      amount: paidAmount
    });
  }
};

// Method to flag for fraud review
commissionSchema.methods.flagForReview = async function(riskScore, flags) {
  this.fraud.isFlagged = true;
  this.fraud.riskScore = riskScore;
  this.fraud.flags = flags;
  
  await this.save();
};

// Static method to find affiliate commissions
commissionSchema.statics.findByAffiliate = function(affiliateId, options = {}) {
  const query = { affiliate: affiliateId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.program) {
    query.program = options.program;
  }
  
  return this.find(query)
    .populate('program', 'name category')
    .populate('merchant', 'firstName lastName company.name')
    .sort({ createdAt: -1 });
};

// Static method to find program commissions
commissionSchema.statics.findByProgram = function(programId, options = {}) {
  const query = { program: programId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('affiliate', 'firstName lastName email')
    .populate('merchant', 'firstName lastName company.name')
    .sort({ createdAt: -1 });
};

// Static method to find merchant commissions
commissionSchema.statics.findByMerchant = function(merchantId, options = {}) {
  const query = { merchant: merchantId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('affiliate', 'firstName lastName email')
    .populate('program', 'name category')
    .sort({ createdAt: -1 });
};

// Static method to get commission statistics
commissionSchema.statics.getStats = function(filters = {}) {
  const matchStage = {};
  
  if (filters.affiliate) matchStage.affiliate = filters.affiliate;
  if (filters.program) matchStage.program = filters.program;
  if (filters.merchant) matchStage.merchant = filters.merchant;
  if (filters.status) matchStage.status = filters.status;
  if (filters.dateFrom) matchStage.createdAt = { $gte: new Date(filters.dateFrom) };
  if (filters.dateTo) {
    if (matchStage.createdAt) {
      matchStage.createdAt.$lte = new Date(filters.dateTo);
    } else {
      matchStage.createdAt = { $lte: new Date(filters.dateTo) };
    }
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCommissions: { $sum: 1 },
        totalAmount: { $sum: '$commission.amount' },
        totalNetAmount: { $sum: '$commission.netAmount' },
        totalSales: { $sum: '$sale.saleAmount' },
        averageCommission: { $avg: '$commission.amount' },
        averageSale: { $avg: '$sale.saleAmount' },
        pendingCommissions: { 
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approvedCommissions: { 
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        paidCommissions: { 
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Commission', commissionSchema); 