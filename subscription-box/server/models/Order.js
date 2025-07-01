const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerSubscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerSubscription',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    sku: String,
    quantity: {
      type: Number,
      default: 1
    },
    price: Number,
    variant: {
      name: String,
      value: String
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
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
  paymentMethod: {
    type: String,
    default: 'stripe'
  },
  stripePaymentIntentId: String,
  stripeChargeId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  shippingMethod: {
    name: String,
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date
  },
  shippedAt: Date,
  deliveredAt: Date,
  notes: String,
  isSubscriptionOrder: {
    type: Boolean,
    default: true
  },
  subscriptionCycle: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly']
  },
  nextOrderDate: Date,
  customization: [{
    name: String,
    value: String
  }]
}, {
  timestamps: true
});

// Generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5);
    this.orderNumber = `ORD-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Calculate total if not provided
orderSchema.pre('save', function(next) {
  if (!this.total) {
    this.total = this.subtotal + this.shippingCost + this.taxAmount;
  }
  next();
});

// Virtual for order summary
orderSchema.virtual('orderSummary').get(function() {
  return {
    orderNumber: this.orderNumber,
    status: this.status,
    total: this.total,
    itemCount: this.items.length,
    createdAt: this.createdAt
  };
});

// Check if order is overdue
orderSchema.virtual('isOverdue').get(function() {
  if (this.status === 'pending' || this.status === 'processing') {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return this.createdAt < threeDaysAgo;
  }
  return false;
});

// Mark as shipped
orderSchema.methods.markAsShipped = function(trackingInfo) {
  this.status = 'shipped';
  this.shippedAt = new Date();
  this.shippingMethod = {
    ...this.shippingMethod,
    ...trackingInfo
  };
  return this.save();
};

// Mark as delivered
orderSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

// Process refund
orderSchema.methods.processRefund = function(amount, reason) {
  this.status = 'refunded';
  this.paymentStatus = 'refunded';
  this.notes = `${this.notes || ''}\nRefund processed: $${amount} - ${reason}`;
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema); 