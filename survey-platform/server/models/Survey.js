const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'multiple_choice',
      'checkbox',
      'rating',
      'text',
      'textarea',
      'email',
      'phone',
      'date',
      'time',
      'datetime',
      'number',
      'scale',
      'matrix',
      'file_upload',
      'image_choice',
      'ranking',
      'slider',
      'location',
      'signature',
      'payment'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  required: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  },
  options: [{
    text: String,
    value: String,
    image: String,
    order: Number
  }],
  settings: {
    minValue: Number,
    maxValue: Number,
    step: Number,
    minLength: Number,
    maxLength: Number,
    pattern: String,
    placeholder: String,
    defaultValue: mongoose.Schema.Types.Mixed,
    allowMultiple: Boolean,
    randomize: Boolean,
    showProgress: Boolean,
    fileTypes: [String],
    maxFileSize: Number,
    maxFiles: Number,
    scaleLabels: {
      min: String,
      max: String
    },
    matrixRows: [{
      text: String,
      value: String
    }],
    matrixColumns: [{
      text: String,
      value: String
    }]
  },
  logic: {
    conditions: [{
      questionId: String,
      operator: {
        type: String,
        enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'selected', 'not_selected']
      },
      value: mongoose.Schema.Types.Mixed
    }],
    action: {
      type: String,
      enum: ['show', 'hide', 'skip_to', 'require']
    },
    targetQuestion: String
  }
});

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'paused', 'closed'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['survey', 'quiz', 'poll', 'form'],
    default: 'survey'
  },
  category: {
    type: String,
    enum: [
      'customer_feedback',
      'market_research',
      'employee_satisfaction',
      'academic_research',
      'event_feedback',
      'product_testing',
      'general',
      'other'
    ],
    default: 'general'
  },
  questions: [questionSchema],
  settings: {
    theme: {
      primaryColor: {
        type: String,
        default: '#3B82F6'
      },
      backgroundColor: {
        type: String,
        default: '#FFFFFF'
      },
      fontFamily: {
        type: String,
        default: 'Inter'
      },
      logo: String,
      customCSS: String
    },
    display: {
      showProgress: {
        type: Boolean,
        default: true
      },
      showQuestionNumbers: {
        type: Boolean,
        default: true
      },
      allowBackNavigation: {
        type: Boolean,
        default: true
      },
      randomizeQuestions: {
        type: Boolean,
        default: false
      },
      oneQuestionPerPage: {
        type: Boolean,
        default: false
      }
    },
    response: {
      allowAnonymous: {
        type: Boolean,
        default: true
      },
      requireLogin: {
        type: Boolean,
        default: false
      },
      allowMultipleResponses: {
        type: Boolean,
        default: false
      },
      maxResponses: Number,
      closeDate: Date,
      autoClose: {
        type: Boolean,
        default: false
      }
    },
    notifications: {
      emailOnResponse: {
        type: Boolean,
        default: false
      },
      emailRecipients: [String],
      slackWebhook: String
    },
    security: {
      requireCaptcha: {
        type: Boolean,
        default: false
      },
      ipRestriction: [String],
      password: String,
      requireApproval: {
        type: Boolean,
        default: false
      }
    },
    completion: {
      showThankYouPage: {
        type: Boolean,
        default: true
      },
      thankYouMessage: String,
      redirectUrl: String,
      showResults: {
        type: Boolean,
        default: false
      }
    }
  },
  distribution: {
    publicUrl: String,
    embedCode: String,
    qrCode: String,
    emailCampaigns: [{
      id: String,
      name: String,
      status: String,
      sentAt: Date
    }],
    socialSharing: {
      enabled: Boolean,
      platforms: [String]
    }
  },
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalResponses: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    },
    dropOffPoints: [{
      questionId: String,
      count: Number
    }],
    deviceStats: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 }
    },
    browserStats: {
      chrome: { type: Number, default: 0 },
      firefox: { type: Number, default: 0 },
      safari: { type: Number, default: 0 },
      edge: { type: Number, default: 0 }
    },
    locationStats: [{
      country: String,
      region: String,
      count: Number
    }]
  },
  tags: [String],
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateCategory: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    data: mongoose.Schema.Types.Mixed,
    createdAt: Date
  }]
}, {
  timestamps: true
});

// Indexes
surveySchema.index({ creator: 1, createdAt: -1 });
surveySchema.index({ status: 1 });
surveySchema.index({ 'distribution.publicUrl': 1 });
surveySchema.index({ tags: 1 });
surveySchema.index({ isTemplate: 1, isPublic: 1 });

// Virtual for response count
surveySchema.virtual('responseCount').get(function() {
  return this.analytics.totalResponses;
});

// Virtual for completion rate
surveySchema.virtual('completionRatePercentage').get(function() {
  return this.analytics.totalViews > 0 
    ? Math.round((this.analytics.totalResponses / this.analytics.totalViews) * 100)
    : 0;
});

// Pre-save middleware to generate public URL
surveySchema.pre('save', function(next) {
  if (this.isNew && !this.distribution.publicUrl) {
    this.distribution.publicUrl = `/survey/${this._id}`;
  }
  next();
});

// Method to publish survey
surveySchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

// Method to pause survey
surveySchema.methods.pause = function() {
  this.status = 'paused';
  return this.save();
};

// Method to close survey
surveySchema.methods.close = function() {
  this.status = 'closed';
  this.closedAt = new Date();
  return this.save();
};

// Method to duplicate survey
surveySchema.methods.duplicate = function(newCreator) {
  const duplicated = new this.constructor({
    ...this.toObject(),
    _id: undefined,
    creator: newCreator,
    status: 'draft',
    'analytics.totalViews': 0,
    'analytics.totalResponses': 0,
    'analytics.completionRate': 0,
    'analytics.averageTime': 0,
    'analytics.dropOffPoints': [],
    'analytics.deviceStats': { desktop: 0, mobile: 0, tablet: 0 },
    'analytics.browserStats': { chrome: 0, firefox: 0, safari: 0, edge: 0 },
    'analytics.locationStats': [],
    'distribution.publicUrl': undefined,
    'distribution.embedCode': undefined,
    'distribution.qrCode': undefined,
    'distribution.emailCampaigns': [],
    createdAt: undefined,
    updatedAt: undefined
  });
  
  duplicated.title = `${duplicated.title} (Copy)`;
  return duplicated.save();
};

// Method to get question by ID
surveySchema.methods.getQuestionById = function(questionId) {
  return this.questions.id(questionId);
};

// Method to add question
surveySchema.methods.addQuestion = function(questionData) {
  const maxOrder = Math.max(...this.questions.map(q => q.order), 0);
  questionData.order = maxOrder + 1;
  this.questions.push(questionData);
  return this.save();
};

// Method to update question
surveySchema.methods.updateQuestion = function(questionId, updates) {
  const question = this.questions.id(questionId);
  if (question) {
    Object.assign(question, updates);
    return this.save();
  }
  throw new Error('Question not found');
};

// Method to delete question
surveySchema.methods.deleteQuestion = function(questionId) {
  this.questions = this.questions.filter(q => q._id.toString() !== questionId);
  // Reorder remaining questions
  this.questions.forEach((question, index) => {
    question.order = index + 1;
  });
  return this.save();
};

// Method to reorder questions
surveySchema.methods.reorderQuestions = function(questionIds) {
  questionIds.forEach((questionId, index) => {
    const question = this.questions.id(questionId);
    if (question) {
      question.order = index + 1;
    }
  });
  this.questions.sort((a, b) => a.order - b.order);
  return this.save();
};

// Static method to find published surveys
surveySchema.statics.findPublished = function() {
  return this.find({ status: 'published' });
};

// Static method to find by creator
surveySchema.statics.findByCreator = function(creatorId) {
  return this.find({ creator: creatorId }).sort({ createdAt: -1 });
};

// Static method to find templates
surveySchema.statics.findTemplates = function(category = null) {
  const query = { isTemplate: true, isPublic: true };
  if (category) {
    query.templateCategory = category;
  }
  return this.find(query);
};

module.exports = mongoose.model('Survey', surveySchema); 