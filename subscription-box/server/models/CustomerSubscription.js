const mongoose = require('mongoose');

const customerSubscriptionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  businessOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'past_due', 'unpaid'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  stripeSubscriptionId: String,
  stripeCustomerId: String,
  billingCycle: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  price: {
    type: Number,
    required: true
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'US'
    }
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'US'
    }
  },
  customization: [{
    name: String,
    value: String
  }],
  pauseHistory: [{
    startDate: Date,
    endDate: Date,
    reason: String
  }],
  skipNextShipment: {
    type: Boolean,
    default: false
  },
  totalBilled: {
    type: Number,
    default: 0
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  failedPayments: {
    type: Number,
    default: 0
  },
  lastPaymentDate: Date,
  nextPaymentAmount: Number,
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate subscription duration
customerSubscriptionSchema.virtual('duration').get(function() {
  const end = this.endDate || new Date();
  const start = this.startDate;
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // days
});

// Check if subscription is overdue
customerSubscriptionSchema.virtual('isOverdue').get(function() {
  return this.status === 'past_due' && this.nextBillingDate < new Date();
});

// Calculate days until next billing
customerSubscriptionSchema.virtual('daysUntilBilling').get(function() {
  const now = new Date();
  const next = this.nextBillingDate;
  return Math.ceil((next - now) / (1000 * 60 * 60 * 24));
});

// Update next billing date based on cycle
customerSubscriptionSchema.methods.updateNextBillingDate = function() {
  const current = this.nextBillingDate || new Date();
  let next = new Date(current);
  
  switch (this.billingCycle) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'bi-weekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  
  this.nextBillingDate = next;
  return this.save();
};

// Pause subscription
customerSubscriptionSchema.methods.pause = function(reason = 'Customer request') {
  this.status = 'paused';
  this.pauseHistory.push({
    startDate: new Date(),
    reason
  });
  return this.save();
};

// Resume subscription
customerSubscriptionSchema.methods.resume = function() {
  this.status = 'active';
  if (this.pauseHistory.length > 0) {
    this.pauseHistory[this.pauseHistory.length - 1].endDate = new Date();
  }
  return this.save();
};

// Cancel subscription
customerSubscriptionSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.endDate = new Date();
  return this.save();
};

module.exports = mongoose.model('CustomerSubscription', customerSubscriptionSchema); 