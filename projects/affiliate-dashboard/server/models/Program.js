const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Program name is required'],
    trim: true,
    maxlength: [100, 'Program name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Program description is required'],
    maxlength: [2000, 'Program description cannot exceed 2000 characters']
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed'],
    default: 'draft'
  },
  category: {
    type: String,
    required: [true, 'Program category is required'],
    enum: [
      'ecommerce', 'saas', 'digital_products', 'services', 'finance',
      'health', 'education', 'travel', 'gaming', 'technology',
      'fashion', 'beauty', 'food', 'lifestyle', 'other'
    ]
  },
  subcategory: String,
  
  // Commission structure
  commission: {
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'tiered'],
      default: 'percentage'
    },
    rate: {
      type: Number,
      required: [true, 'Commission rate is required'],
      min: [0, 'Commission rate cannot be negative'],
      max: [100, 'Commission rate cannot exceed 100%']
    },
    fixedAmount: {
      type: Number,
      min: [0, 'Fixed amount cannot be negative']
    },
    tiers: [{
      minSales: {
        type: Number,
        required: true
      },
      rate: {
        type: Number,
        required: true
      }
    }],
    minimumSale: {
      type: Number,
      default: 0
    },
    maximumCommission: {
      type: Number
    }
  },
  
  // Tracking settings
  tracking: {
    cookieDuration: {
      type: Number,
      default: 30,
      min: [1, 'Cookie duration must be at least 1 day'],
      max: [365, 'Cookie duration cannot exceed 365 days']
    },
    allowMultipleCommissions: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    autoApprove: {
      type: Boolean,
      default: true
    },
    fraudProtection: {
      type: Boolean,
      default: true
    }
  },
  
  // Payout settings
  payout: {
    minimumPayout: {
      type: Number,
      default: 50,
      min: [0, 'Minimum payout cannot be negative']
    },
    schedule: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'monthly'
    },
    methods: [{
      type: String,
      enum: ['stripe', 'paypal', 'bank_transfer'],
      default: 'stripe'
    }],
    holdPeriod: {
      type: Number,
      default: 30,
      min: [0, 'Hold period cannot be negative']
    }
  },
  
  // Program details
  details: {
    website: {
      type: String,
      required: [true, 'Website URL is required']
    },
    logo: String,
    banner: String,
    productImages: [String],
    highlights: [String],
    requirements: [String],
    restrictions: [String],
    terms: String,
    privacyPolicy: String
  },
  
  // Marketing materials
  materials: {
    banners: [{
      name: String,
      url: String,
      size: String,
      format: String
    }],
    videos: [{
      name: String,
      url: String,
      duration: Number,
      format: String
    }],
    emails: [{
      name: String,
      subject: String,
      content: String,
      variables: [String]
    }],
    socialMedia: [{
      platform: String,
      content: String,
      image: String
    }],
    landingPages: [{
      name: String,
      url: String,
      template: String
    }]
  },
  
  // Performance metrics
  stats: {
    totalAffiliates: {
      type: Number,
      default: 0
    },
    activeAffiliates: {
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
    totalSales: {
      type: Number,
      default: 0
    },
    totalCommissions: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    epc: {
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
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowMultipleApplications: {
      type: Boolean,
      default: false
    },
    autoApproveApplications: {
      type: Boolean,
      default: true
    },
    sendNotifications: {
      type: Boolean,
      default: true
    },
    allowCreativeRequests: {
      type: Boolean,
      default: true
    }
  },
  
  // SEO and metadata
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  
  // Dates
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  publishedAt: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
programSchema.index({ merchant: 1 });
programSchema.index({ status: 1 });
programSchema.index({ category: 1 });
programSchema.index({ 'seo.slug': 1 });
programSchema.index({ isPublic: 1 });
programSchema.index({ createdAt: -1 });

// Virtual for isActive
programSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Virtual for formatted commission rate
programSchema.virtual('formattedCommissionRate').get(function() {
  if (this.commission.type === 'percentage') {
    return `${this.commission.rate}%`;
  } else if (this.commission.type === 'fixed') {
    return `$${this.commission.fixedAmount}`;
  }
  return 'Tiered';
});

// Virtual for program duration
programSchema.virtual('duration').get(function() {
  if (!this.endDate) return 'Ongoing';
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days`;
});

// Pre-save middleware to generate slug
programSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.seo.slug) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Pre-save middleware to update published date
programSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Method to update program stats
programSchema.methods.updateStats = async function() {
  const Affiliate = require('./Affiliate');
  const Click = require('./Click');
  const Commission = require('./Commission');
  
  // Count affiliates
  const affiliates = await Affiliate.find({ program: this._id });
  const totalAffiliates = affiliates.length;
  const activeAffiliates = affiliates.filter(a => a.status === 'active').length;
  
  // Count clicks and conversions
  const clicks = await Click.find({ program: this._id });
  const commissions = await Commission.find({ program: this._id });
  
  const totalClicks = clicks.length;
  const totalConversions = commissions.length;
  const totalSales = commissions.reduce((sum, commission) => sum + commission.saleAmount, 0);
  const totalCommissions = commissions.reduce((sum, commission) => sum + commission.amount, 0);
  
  // Calculate metrics
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const averageOrderValue = totalConversions > 0 ? totalSales / totalConversions : 0;
  const epc = totalClicks > 0 ? totalCommissions / totalClicks : 0;
  
  // Update stats
  this.stats.totalAffiliates = totalAffiliates;
  this.stats.activeAffiliates = activeAffiliates;
  this.stats.totalClicks = totalClicks;
  this.stats.totalConversions = totalConversions;
  this.stats.totalSales = totalSales;
  this.stats.totalCommissions = totalCommissions;
  this.stats.conversionRate = Math.round(conversionRate * 100) / 100;
  this.stats.averageOrderValue = Math.round(averageOrderValue * 100) / 100;
  this.stats.epc = Math.round(epc * 100) / 100;
  
  await this.save();
};

// Method to calculate commission
programSchema.methods.calculateCommission = function(saleAmount) {
  if (saleAmount < this.commission.minimumSale) {
    return 0;
  }
  
  let commission = 0;
  
  if (this.commission.type === 'percentage') {
    commission = (saleAmount * this.commission.rate) / 100;
  } else if (this.commission.type === 'fixed') {
    commission = this.commission.fixedAmount;
  } else if (this.commission.type === 'tiered') {
    // Find the appropriate tier
    const tier = this.commission.tiers
      .sort((a, b) => b.minSales - a.minSales)
      .find(t => saleAmount >= t.minSales);
    
    if (tier) {
      commission = (saleAmount * tier.rate) / 100;
    }
  }
  
  // Apply maximum commission limit
  if (this.commission.maximumCommission && commission > this.commission.maximumCommission) {
    commission = this.commission.maximumCommission;
  }
  
  return Math.round(commission * 100) / 100;
};

// Static method to find active programs
programSchema.statics.findActive = function() {
  return this.find({ 
    status: 'active',
    isPublic: true
  }).populate('merchant', 'firstName lastName company.name');
};

// Static method to find by category
programSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category,
    status: 'active',
    isPublic: true
  }).populate('merchant', 'firstName lastName company.name');
};

// Static method to search programs
programSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    status: 'active',
    isPublic: true,
    ...filters
  };
  
  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
      { subcategory: { $regex: query, $options: 'i' } }
    ];
  }
  
  return this.find(searchQuery).populate('merchant', 'firstName lastName company.name');
};

module.exports = mongoose.model('Program', programSchema); 