const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
  sku: {
    type: String,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    min: 0
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  images: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  variants: [{
    name: String,
    value: String,
    priceAdjustment: {
      type: Number,
      default: 0
    },
    stockQuantity: {
      type: Number,
      default: 0
    }
  }],
  tags: [String],
  attributes: [{
    name: String,
    value: String
  }],
  supplier: {
    name: String,
    contact: String,
    email: String,
    phone: String
  },
  reorderPoint: {
    type: Number,
    default: 5
  },
  reorderQuantity: {
    type: Number,
    default: 50
  },
  leadTime: {
    type: Number,
    default: 7 // days
  },
  isSubscriptionOnly: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Check if product is in stock
productSchema.virtual('inStock').get(function() {
  return this.stockQuantity > 0;
});

// Check if product is low on stock
productSchema.virtual('isLowStock').get(function() {
  return this.stockQuantity <= this.lowStockThreshold;
});

// Calculate profit margin
productSchema.virtual('profitMargin').get(function() {
  if (!this.cost || this.cost === 0) return null;
  return ((this.price - this.cost) / this.price) * 100;
});

// Generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku) {
    this.sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema); 