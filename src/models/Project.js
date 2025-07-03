console.log('Loaded Project model');
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'ai_content_generator',
      'digital_marketplace',
      'freelance_platform',
      'subscription_box',
      'course_platform',
      'affiliate_dashboard',
      'dropshipping_builder',
      'social_media_tool',
      'survey_platform',
      'crypto_trading_bot'
    ]
  },
  status: {
    type: String,
    enum: ['development', 'staging', 'production', 'maintenance', 'archived'],
    default: 'development'
  },
  health: {
    type: String,
    enum: ['healthy', 'warning', 'critical', 'offline'],
    default: 'offline'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'developer', 'viewer'],
      default: 'viewer'
    },
    permissions: [{
      type: String,
      enum: ['read', 'write', 'deploy', 'admin']
    }]
  }],
  deployment: {
    method: {
      type: String,
      enum: ['docker', 'pm2', 'manual', 'vercel', 'netlify', 'heroku'],
      default: 'manual'
    },
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'development'
    },
    url: String,
    port: Number,
    domain: String,
    sslEnabled: {
      type: Boolean,
      default: false
    },
    sslExpiry: Date,
    lastDeployed: Date,
    deploymentStatus: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending'
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    gitRepository: String,
    gitBranch: {
      type: String,
      default: 'main'
    },
    dockerImage: String,
    dockerContainer: String,
    pm2Process: String
  },
  infrastructure: {
    server: {
      host: String,
      port: Number,
      username: String,
      type: {
        type: String,
        enum: ['aws', 'digitalocean', 'heroku', 'vercel', 'netlify', 'local']
      },
      region: String,
      instanceType: String
    },
    database: {
      type: {
        type: String,
        enum: ['mongodb', 'postgresql', 'mysql', 'redis']
      },
      url: String,
      name: String,
      size: Number,
      backupEnabled: {
        type: Boolean,
        default: true
      },
      lastBackup: Date
    },
    storage: {
      type: {
        type: String,
        enum: ['local', 's3', 'cloudinary', 'digitalocean']
      },
      bucket: String,
      region: String,
      used: Number,
      limit: Number
    },
    cdn: {
      enabled: {
        type: Boolean,
        default: false
      },
      provider: {
        type: String,
        enum: ['cloudflare', 'aws_cloudfront', 'digitalocean']
      },
      domain: String
    }
  },
  monitoring: {
    enabled: {
      type: Boolean,
      default: true
    },
    uptime: {
      enabled: {
        type: Boolean,
        default: true
      },
      url: String,
      checkInterval: {
        type: Number,
        default: 300 // 5 minutes
      },
      lastCheck: Date,
      status: {
        type: String,
        enum: ['up', 'down', 'unknown'],
        default: 'unknown'
      },
      responseTime: Number,
      uptimePercentage: {
        type: Number,
        default: 0
      }
    },
    performance: {
      enabled: {
        type: Boolean,
        default: true
      },
      metrics: {
        cpu: Number,
        memory: Number,
        disk: Number,
        network: Number
      },
      lastUpdated: Date
    },
    logs: {
      enabled: {
        type: Boolean,
        default: true
      },
      level: {
        type: String,
        enum: ['error', 'warn', 'info', 'debug'],
        default: 'info'
      },
      retention: {
        type: Number,
        default: 30 // days
      }
    },
    alerts: {
      enabled: {
        type: Boolean,
        default: true
      },
      channels: [{
        type: {
          type: String,
          enum: ['email', 'slack', 'discord', 'telegram']
        },
        config: mongoose.Schema.Types.Mixed
      }]
    }
  },
  analytics: {
    users: {
      total: {
        type: Number,
        default: 0
      },
      active: {
        type: Number,
        default: 0
      },
      new: {
        type: Number,
        default: 0
      },
      growth: {
        type: Number,
        default: 0
      }
    },
    revenue: {
      total: {
        type: Number,
        default: 0
      },
      monthly: {
        type: Number,
        default: 0
      },
      growth: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },
    performance: {
      responseTime: {
        type: Number,
        default: 0
      },
      errorRate: {
        type: Number,
        default: 0
      },
      throughput: {
        type: Number,
        default: 0
      }
    }
  },
  configuration: {
    environment: {
      type: Map,
      of: String
    },
    features: {
      type: Map,
      of: Boolean
    },
    settings: mongoose.Schema.Types.Mixed
  },
  security: {
    ssl: {
      enabled: {
        type: Boolean,
        default: false
      },
      provider: String,
      expiry: Date,
      autoRenew: {
        type: Boolean,
        default: true
      }
    },
    firewall: {
      enabled: {
        type: Boolean,
        default: false
      },
      rules: [{
        type: String,
        source: String,
        destination: String,
        action: {
          type: String,
          enum: ['allow', 'deny']
        }
      }]
    },
    backups: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily'
      },
      retention: {
        type: Number,
        default: 30 // days
      },
      lastBackup: Date
    }
  },
  maintenance: {
    scheduled: [{
      date: Date,
      duration: Number, // minutes
      description: String,
      status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'scheduled'
      }
    }],
    lastMaintenance: Date,
    nextMaintenance: Date
  },
  metadata: {
    tags: [String],
    category: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    notes: String,
    customFields: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
projectSchema.index({ slug: 1 });
projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ status: 1 });
projectSchema.index({ health: 1 });
projectSchema.index({ type: 1 });
projectSchema.index({ 'deployment.lastDeployed': -1 });

// Virtual for full URL
projectSchema.virtual('fullUrl').get(function() {
  if (this.deployment.sslEnabled) {
    return `https://${this.deployment.domain || this.deployment.url}`;
  }
  return `http://${this.deployment.url}`;
});

// Virtual for uptime status
projectSchema.virtual('uptimeStatus').get(function() {
  if (!this.monitoring.uptime.enabled) return 'disabled';
  return this.monitoring.uptime.status;
});

// Pre-save middleware to update health status
projectSchema.pre('save', function(next) {
  // Update health based on uptime status
  if (this.monitoring.uptime.status === 'down') {
    this.health = 'critical';
  } else if (this.monitoring.uptime.status === 'unknown') {
    this.health = 'warning';
  } else {
    this.health = 'healthy';
  }
  
  next();
});

// Method to update uptime status
projectSchema.methods.updateUptimeStatus = function(status, responseTime) {
  this.monitoring.uptime.status = status;
  this.monitoring.uptime.responseTime = responseTime;
  this.monitoring.uptime.lastCheck = new Date();
  
  // Update health based on status
  if (status === 'down') {
    this.health = 'critical';
  } else if (status === 'unknown') {
    this.health = 'warning';
  } else {
    this.health = 'healthy';
  }
  
  return this.save();
};

// Method to update performance metrics
projectSchema.methods.updatePerformanceMetrics = function(metrics) {
  this.monitoring.performance.metrics = metrics;
  this.monitoring.performance.lastUpdated = new Date();
  return this.save();
};

// Method to update analytics
projectSchema.methods.updateAnalytics = function(analytics) {
  Object.assign(this.analytics, analytics);
  return this.save();
};

// Method to deploy project
projectSchema.methods.deploy = function(version) {
  this.deployment.deploymentStatus = 'in_progress';
  this.deployment.version = version;
  this.deployment.lastDeployed = new Date();
  return this.save();
};

// Method to complete deployment
projectSchema.methods.completeDeployment = function(success) {
  this.deployment.deploymentStatus = success ? 'completed' : 'failed';
  return this.save();
};

// Method to add team member
projectSchema.methods.addTeamMember = function(userId, role, permissions) {
  const existingMember = this.team.find(member => member.user.toString() === userId);
  
  if (existingMember) {
    existingMember.role = role;
    existingMember.permissions = permissions;
  } else {
    this.team.push({
      user: userId,
      role,
      permissions
    });
  }
  
  return this.save();
};

// Method to remove team member
projectSchema.methods.removeTeamMember = function(userId) {
  this.team = this.team.filter(member => member.user.toString() !== userId);
  return this.save();
};

// Method to check if user has permission
projectSchema.methods.hasPermission = function(userId, permission) {
  if (this.owner.toString() === userId) return true;
  
  const member = this.team.find(m => m.user.toString() === userId);
  return member && member.permissions.includes(permission);
};

// Static method to find by type
projectSchema.statics.findByType = function(type) {
  return this.find({ type });
};

// Static method to find healthy projects
projectSchema.statics.findHealthy = function() {
  return this.find({ health: 'healthy' });
};

// Static method to find critical projects
projectSchema.statics.findCritical = function() {
  return this.find({ health: 'critical' });
};

// Static method to get project statistics
projectSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalProjects: { $sum: 1 },
        healthyProjects: { $sum: { $cond: [{ $eq: ['$health', 'healthy'] }, 1, 0] } },
        criticalProjects: { $sum: { $cond: [{ $eq: ['$health', 'critical'] }, 1, 0] } },
        productionProjects: { $sum: { $cond: [{ $eq: ['$status', 'production'] }, 1, 0] } },
        totalRevenue: { $sum: '$analytics.revenue.total' },
        totalUsers: { $sum: '$analytics.users.total' }
      }
    }
  ]);
};

module.exports = mongoose.model('Project', projectSchema); 