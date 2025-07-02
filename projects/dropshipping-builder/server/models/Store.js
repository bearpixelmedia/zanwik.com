const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    maxlength: [100, 'Store name cannot exceed 100 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed'],
    default: 'draft'
  },
  
  // Store configuration
  config: {
    domain: {
      type: String,
      unique: true,
      sparse: true
    },
    subdomain: {
      type: String,
      unique: true,
      sparse: true
    },
    customDomain: String,
    sslEnabled: {
      type: Boolean,
      default: true
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    }
  },
  
  // Theme and design
  theme: {
    name: {
      type: String,
      default: 'default'
    },
    customizations: {
      primaryColor: {
        type: String,
        default: '#3B82F6'
      },
      secondaryColor: {
        type: String,
        default: '#1F2937'
      },
      fontFamily: {
        type: String,
        default: 'Inter'
      },
      logo: String,
      favicon: String,
      banner: String,
      heroImage: String
    },
    layout: {
      headerStyle: {
        type: String,
        enum: ['minimal', 'standard', 'mega'],
        default: 'standard'
      },
      footerStyle: {
        type: String,
        enum: ['minimal', 'standard', 'detailed'],
        default: 'standard'
      },
      sidebarEnabled: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Business settings
  business: {
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required']
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
      tiktok: String
    },
    businessHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    }
  },
  
  // Payment settings
  payment: {
    currency: {
      type: String,
      default: 'USD'
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    shippingMethods: [{
      name: String,
      price: Number,
      freeThreshold: Number,
      estimatedDays: String
    }],
    paymentMethods: [{
      type: String,
      enum: ['stripe', 'paypal', 'apple_pay', 'google_pay'],
      enabled: Boolean
    }],
    stripeAccountId: String,
    paypalClientId: String
  },
  
  // SEO settings
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    googleAnalyticsId: String,
    facebookPixelId: String,
    structuredData: Object
  },
  
  // Automation settings
  automation: {
    autoFulfillOrders: {
      type: Boolean,
      default: true
    },
    autoUpdatePrices: {
      type: Boolean,
      default: false
    },
    autoSyncInventory: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    lowStockAlerts: {
      type: Boolean,
      default: true
    },
    priceChangeAlerts: {
      type: Boolean,
      default: false
    }
  },
  
  // Performance metrics
  stats: {
    totalProducts: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalCustomers: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    monthlyVisitors: {
      type: Number,
      default: 0
    }
  },
  
  // Settings
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    allowGuestCheckout: {
      type: Boolean,
      default: true
    },
    requireAccountCreation: {
      type: Boolean,
      default: false
    },
    enableReviews: {
      type: Boolean,
      default: true
    },
    enableWishlist: {
      type: Boolean,
      default: true
    },
    enableCompare: {
      type: Boolean,
      default: false
    },
    enableNewsletter: {
      type: Boolean,
      default: true
    }
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
  publishedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
storeSchema.index({ owner: 1 });
storeSchema.index({ status: 1 });
storeSchema.index({ 'config.domain': 1 });
storeSchema.index({ 'config.subdomain': 1 });
storeSchema.index({ isPublic: 1 });
storeSchema.index({ createdAt: -1 });

// Virtual for isActive
storeSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Virtual for store URL
storeSchema.virtual('storeUrl').get(function() {
  if (this.config.customDomain) {
    return `https://${this.config.customDomain}`;
  }
  if (this.config.subdomain) {
    return `https://${this.config.subdomain}.yourplatform.com`;
  }
  return `https://yourplatform.com/store/${this._id}`;
});

// Virtual for formatted revenue
storeSchema.virtual('formattedRevenue').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.payment.currency
  }).format(this.stats.totalRevenue);
});

// Pre-save middleware to generate subdomain
storeSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.config.subdomain) {
    this.config.subdomain = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Pre-save middleware to update published date
storeSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Method to update store stats
storeSchema.methods.updateStats = async function() {
  const Product = require('./Product');
  const Order = require('./Order');
  const Customer = require('./Customer');
  
  // Count products
  const totalProducts = await Product.countDocuments({ store: this._id, isActive: true });
  
  // Count orders and calculate revenue
  const orders = await Order.find({ store: this._id });
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  
  // Count unique customers
  const totalCustomers = await Customer.countDocuments({ store: this._id });
  
  // Calculate metrics
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Update stats
  this.stats.totalProducts = totalProducts;
  this.stats.totalOrders = totalOrders;
  this.stats.totalRevenue = totalRevenue;
  this.stats.totalCustomers = totalCustomers;
  this.stats.averageOrderValue = Math.round(averageOrderValue * 100) / 100;
  
  await this.save();
};

// Method to get store analytics
storeSchema.methods.getAnalytics = async function(period = '30d') {
  const Order = require('./Order');
  const Product = require('./Product');
  
  const startDate = new Date();
  if (period === '7d') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === '30d') {
    startDate.setDate(startDate.getDate() - 30);
  } else if (period === '90d') {
    startDate.setDate(startDate.getDate() - 90);
  }
  
  const orders = await Order.find({
    store: this._id,
    createdAt: { $gte: startDate }
  });
  
  const products = await Product.find({
    store: this._id,
    createdAt: { $gte: startDate }
  });
  
  return {
    period,
    orders: orders.length,
    revenue: orders.reduce((sum, order) => sum + order.total, 0),
    products: products.length,
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0
  };
};

// Static method to find active stores
storeSchema.statics.findActive = function() {
  return this.find({ 
    status: 'active',
    isPublic: true
  }).populate('owner', 'firstName lastName');
};

// Static method to find by owner
storeSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId }).sort({ createdAt: -1 });
};

// Static method to find by domain
storeSchema.statics.findByDomain = function(domain) {
  return this.findOne({
    $or: [
      { 'config.domain': domain },
      { 'config.subdomain': domain },
      { 'config.customDomain': domain }
    ]
  });
};

module.exports = mongoose.model('Store', storeSchema); 