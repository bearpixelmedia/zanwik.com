const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'developer', 'viewer'],
    default: 'viewer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      slack: {
        type: Boolean,
        default: false
      },
      discord: {
        type: Boolean,
        default: false
      },
      telegram: {
        type: Boolean,
        default: false
      }
    },
    dashboard: {
      defaultView: {
        type: String,
        enum: ['overview', 'projects', 'analytics', 'monitoring'],
        default: 'overview'
      },
      refreshInterval: {
        type: Number,
        default: 30000 // 30 seconds
      }
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String,
    success: {
      type: Boolean,
      default: true
    }
  }],
  apiKeys: [{
    name: String,
    key: String,
    permissions: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false
    },
    secret: String,
    backupCodes: [String]
  },
  permissions: {
    projects: {
      create: {
        type: Boolean,
        default: false
      },
      read: {
        type: Boolean,
        default: true
      },
      update: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      },
      deploy: {
        type: Boolean,
        default: false
      }
    },
    analytics: {
      read: {
        type: Boolean,
        default: true
      },
      export: {
        type: Boolean,
        default: false
      }
    },
    infrastructure: {
      read: {
        type: Boolean,
        default: true
      },
      manage: {
        type: Boolean,
        default: false
      }
    },
    users: {
      read: {
        type: Boolean,
        default: false
      },
      create: {
        type: Boolean,
        default: false
      },
      update: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'lastLogin': -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.fullName || this.email;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has permission
userSchema.methods.hasPermission = function(resource, action) {
  if (this.role === 'admin') return true;
  
  const resourcePermissions = this.permissions[resource];
  if (!resourcePermissions) return false;
  
  return resourcePermissions[action] || false;
};

// Method to update last login
userSchema.methods.updateLastLogin = function(ip, userAgent) {
  this.lastLogin = new Date();
  this.loginHistory.push({
    timestamp: new Date(),
    ip,
    userAgent,
    success: true
  });
  
  // Keep only last 50 login attempts
  if (this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(-50);
  }
  
  return this.save();
};

// Method to record failed login
userSchema.methods.recordFailedLogin = function(ip, userAgent) {
  this.loginHistory.push({
    timestamp: new Date(),
    ip,
    userAgent,
    success: false
  });
  
  // Keep only last 50 login attempts
  if (this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(-50);
  }
  
  return this.save();
};

// Method to generate API key
userSchema.methods.generateApiKey = function(name, permissions) {
  const crypto = require('crypto');
  const key = crypto.randomBytes(32).toString('hex');
  
  this.apiKeys.push({
    name,
    key,
    permissions,
    createdAt: new Date()
  });
  
  return this.save().then(() => key);
};

// Method to revoke API key
userSchema.methods.revokeApiKey = function(keyId) {
  this.apiKeys = this.apiKeys.filter(key => key._id.toString() !== keyId);
  return this.save();
};

// Method to enable 2FA
userSchema.methods.enable2FA = function(secret, backupCodes) {
  this.twoFactorAuth.enabled = true;
  this.twoFactorAuth.secret = secret;
  this.twoFactorAuth.backupCodes = backupCodes;
  return this.save();
};

// Method to disable 2FA
userSchema.methods.disable2FA = function() {
  this.twoFactorAuth.enabled = false;
  this.twoFactorAuth.secret = null;
  this.twoFactorAuth.backupCodes = [];
  return this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role });
};

// Static method to get user statistics
userSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
        verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
        adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        managerUsers: { $sum: { $cond: [{ $eq: ['$role', 'manager'] }, 1, 0] } },
        developerUsers: { $sum: { $cond: [{ $eq: ['$role', 'developer'] }, 1, 0] } },
        viewerUsers: { $sum: { $cond: [{ $eq: ['$role', 'viewer'] }, 1, 0] } }
      }
    }
  ]);
};

// Method to get user's project permissions
userSchema.methods.getProjectPermissions = function(projectId) {
  // This would be implemented based on project-team relationships
  // For now, return basic permissions based on role
  const basePermissions = {
    read: this.hasPermission('projects', 'read'),
    write: this.hasPermission('projects', 'update'),
    deploy: this.hasPermission('projects', 'deploy'),
    admin: this.hasPermission('projects', 'delete')
  };
  
  return basePermissions;
};

module.exports = mongoose.model('User', userSchema); 