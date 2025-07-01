const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  businessOwner: {
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
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  billingCycle: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  maxSubscribers: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stripePriceId: String,
  features: [{
    name: String,
    description: String,
    included: {
      type: Boolean,
      default: true
    }
  }],
  shippingCost: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 0
  },
  images: [String],
  category: {
    type: String,
    trim: true
  },
  tags: [String],
  customizationOptions: [{
    name: String,
    type: {
      type: String,
      enum: ['text', 'select', 'checkbox', 'radio']
    },
    options: [String],
    required: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Calculate total price including shipping and tax
subscriptionSchema.virtual('totalPrice').get(function() {
  const subtotal = this.price + this.shippingCost;
  return subtotal + (subtotal * this.taxRate / 100);
});

// Get current subscriber count
subscriptionSchema.virtual('currentSubscribers').get(function() {
  return this.model('CustomerSubscription').countDocuments({
    subscription: this._id,
    status: 'active'
  });
});

module.exports = mongoose.model('Subscription', subscriptionSchema); 