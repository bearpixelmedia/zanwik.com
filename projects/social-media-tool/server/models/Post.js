const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'carousel', 'story', 'reel', 'live'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed', 'cancelled'],
    default: 'draft'
  },
  
  // Media content
  media: {
    images: [{
      url: String,
      alt: String,
      caption: String,
      order: Number
    }],
    videos: [{
      url: String,
      thumbnail: String,
      duration: Number,
      caption: String
    }],
    files: [{
      url: String,
      name: String,
      type: String,
      size: Number
    }]
  },
  
  // Platform-specific content
  platforms: {
    facebook: {
      content: String,
      link: String,
      scheduledTime: Date,
      publishedTime: Date,
      postId: String,
      status: {
        type: String,
        enum: ['pending', 'published', 'failed'],
        default: 'pending'
      }
    },
    instagram: {
      content: String,
      hashtags: [String],
      location: String,
      scheduledTime: Date,
      publishedTime: Date,
      postId: String,
      status: {
        type: String,
        enum: ['pending', 'published', 'failed'],
        default: 'pending'
      }
    },
    twitter: {
      content: String,
      thread: [{
        content: String,
        order: Number
      }],
      scheduledTime: Date,
      publishedTime: Date,
      tweetId: String,
      status: {
        type: String,
        enum: ['pending', 'published', 'failed'],
        default: 'pending'
      }
    },
    linkedin: {
      content: String,
      article: {
        title: String,
        content: String,
        url: String
      },
      scheduledTime: Date,
      publishedTime: Date,
      postId: String,
      status: {
        type: String,
        enum: ['pending', 'published', 'failed'],
        default: 'pending'
      }
    },
    youtube: {
      title: String,
      description: String,
      tags: [String],
      category: String,
      privacy: {
        type: String,
        enum: ['public', 'unlisted', 'private'],
        default: 'public'
      },
      scheduledTime: Date,
      publishedTime: Date,
      videoId: String,
      status: {
        type: String,
        enum: ['pending', 'published', 'failed'],
        default: 'pending'
      }
    },
    tiktok: {
      content: String,
      hashtags: [String],
      music: String,
      scheduledTime: Date,
      publishedTime: Date,
      videoId: String,
      status: {
        type: String,
        enum: ['pending', 'published', 'failed'],
        default: 'pending'
      }
    }
  },
  
  // Scheduling
  scheduling: {
    isScheduled: {
      type: Boolean,
      default: false
    },
    scheduledTime: {
      type: Date,
      required: function() { return this.scheduling.isScheduled; }
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    optimalTime: {
      type: Boolean,
      default: false
    },
    platforms: [{
      platform: String,
      scheduledTime: Date,
      timezone: String
    }]
  },
  
  // Targeting and audience
  targeting: {
    audience: {
      type: String,
      enum: ['public', 'followers', 'custom'],
      default: 'public'
    },
    demographics: {
      age: {
        min: Number,
        max: Number
      },
      gender: [String],
      location: [String],
      interests: [String]
    },
    customAudience: [String]
  },
  
  // Engagement tracking
  engagement: {
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    impressions: {
      type: Number,
      default: 0
    },
    reach: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    },
    engagementRate: {
      type: Number,
      default: 0
    }
  },
  
  // Hashtags and mentions
  hashtags: [{
    tag: String,
    platform: String,
    performance: {
      impressions: Number,
      clicks: Number
    }
  }],
  mentions: [{
    username: String,
    platform: String,
    type: {
      type: String,
      enum: ['user', 'brand', 'location'],
      default: 'user'
    }
  }],
  
  // Campaign and categorization
  campaign: {
    name: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    }
  },
  category: {
    type: String,
    enum: [
      'product', 'service', 'announcement', 'event', 'promotion',
      'educational', 'entertainment', 'news', 'behind-the-scenes',
      'user-generated', 'testimonial', 'other'
    ]
  },
  tags: [String],
  
  // Approval workflow
  approval: {
    requiresApproval: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    approvalNotes: String,
    rejectionReason: String
  },
  
  // Analytics and performance
  analytics: {
    platformMetrics: {
      facebook: {
        likes: Number,
        comments: Number,
        shares: Number,
        reach: Number,
        impressions: Number
      },
      instagram: {
        likes: Number,
        comments: Number,
        saves: Number,
        reach: Number,
        impressions: Number
      },
      twitter: {
        retweets: Number,
        likes: Number,
        replies: Number,
        impressions: Number
      },
      linkedin: {
        reactions: Number,
        comments: Number,
        shares: Number,
        impressions: Number
      }
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['manual', 'import', 'api', 'automation'],
      default: 'manual'
    },
    externalId: String,
    notes: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
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
postSchema.index({ user: 1 });
postSchema.index({ team: 1 });
postSchema.index({ status: 1 });
postSchema.index({ 'scheduling.scheduledTime': 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ category: 1 });
postSchema.index({ 'campaign.id': 1 });

// Virtual for isScheduled
postSchema.virtual('isScheduled').get(function() {
  return this.scheduling.isScheduled;
});

// Virtual for isPublished
postSchema.virtual('isPublished').get(function() {
  return this.status === 'published';
});

// Virtual for isDraft
postSchema.virtual('isDraft').get(function() {
  return this.status === 'draft';
});

// Virtual for total engagement
postSchema.virtual('totalEngagement').get(function() {
  return this.engagement.likes + this.engagement.comments + this.engagement.shares;
});

// Virtual for formatted scheduled time
postSchema.virtual('formattedScheduledTime').get(function() {
  if (!this.scheduling.scheduledTime) return null;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: this.scheduling.timezone
  }).format(this.scheduling.scheduledTime);
});

// Pre-save middleware to update timestamps
postSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save middleware to calculate engagement rate
postSchema.pre('save', function(next) {
  if (this.engagement.reach > 0) {
    this.engagement.engagementRate = (this.totalEngagement / this.engagement.reach) * 100;
  }
  next();
});

// Method to publish post
postSchema.methods.publish = async function() {
  this.status = 'published';
  this.publishedAt = new Date();
  
  // Update platform statuses
  for (const platform of Object.keys(this.platforms)) {
    if (this.platforms[platform].status === 'pending') {
      this.platforms[platform].status = 'published';
      this.platforms[platform].publishedTime = new Date();
    }
  }
  
  await this.save();
  
  // Emit real-time update
  if (global.io) {
    global.io.to(`user-${this.user}`).emit('post-published', {
      postId: this._id,
      status: 'published'
    });
  }
};

// Method to schedule post
postSchema.methods.schedule = async function(scheduledTime, timezone = 'UTC') {
  this.scheduling.isScheduled = true;
  this.scheduling.scheduledTime = scheduledTime;
  this.scheduling.timezone = timezone;
  this.status = 'scheduled';
  
  await this.save();
  
  // Emit real-time update
  if (global.io) {
    global.io.to(`user-${this.user}`).emit('post-scheduled', {
      postId: this._id,
      scheduledTime: scheduledTime
    });
  }
};

// Method to update analytics
postSchema.methods.updateAnalytics = async function(platform, metrics) {
  if (this.analytics.platformMetrics[platform]) {
    this.analytics.platformMetrics[platform] = {
      ...this.analytics.platformMetrics[platform],
      ...metrics
    };
  }
  
  this.analytics.lastUpdated = new Date();
  
  // Update overall engagement
  this.engagement.likes += metrics.likes || 0;
  this.engagement.comments += metrics.comments || 0;
  this.engagement.shares += metrics.shares || 0;
  this.engagement.reach += metrics.reach || 0;
  this.engagement.impressions += metrics.impressions || 0;
  
  await this.save();
};

// Static method to find scheduled posts
postSchema.statics.findScheduled = function() {
  return this.find({
    'scheduling.isScheduled': true,
    'scheduling.scheduledTime': { $lte: new Date() },
    status: 'scheduled'
  }).populate('user', 'firstName lastName');
};

// Static method to find user posts
postSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.platform) {
    query[`platforms.${options.platform}.status`] = { $exists: true };
  }
  
  return this.find(query)
    .populate('team', 'name')
    .populate('campaign.id', 'name')
    .sort({ createdAt: -1 });
};

// Static method to find team posts
postSchema.statics.findByTeam = function(teamId, options = {}) {
  const query = { team: teamId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('user', 'firstName lastName')
    .populate('campaign.id', 'name')
    .sort({ createdAt: -1 });
};

// Static method to get post analytics
postSchema.statics.getAnalytics = function(filters = {}) {
  const matchStage = {};
  
  if (filters.user) matchStage.user = filters.user;
  if (filters.team) matchStage.team = filters.team;
  if (filters.status) matchStage.status = filters.status;
  if (filters.platform) matchStage[`platforms.${filters.platform}.status`] = 'published';
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
        totalPosts: { $sum: 1 },
        totalEngagement: { $sum: { $add: ['$engagement.likes', '$engagement.comments', '$engagement.shares'] } },
        totalReach: { $sum: '$engagement.reach' },
        totalImpressions: { $sum: '$engagement.impressions' },
        averageEngagementRate: { $avg: '$engagement.engagementRate' },
        publishedPosts: { 
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        scheduledPosts: { 
          $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Post', postSchema); 