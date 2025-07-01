const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'web-development',
      'mobile-development',
      'design',
      'writing',
      'marketing',
      'data-science',
      'ai-ml',
      'consulting',
      'translation',
      'other'
    ]
  },
  skills: [{
    type: String,
    trim: true
  }],
  budget: {
    type: {
      type: String,
      enum: ['fixed', 'hourly'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    minAmount: Number,
    maxAmount: Number
  },
  duration: {
    type: String,
    enum: ['less-than-1-week', '1-to-2-weeks', '2-to-4-weeks', '1-to-3-months', '3-to-6-months', 'more-than-6-months'],
    required: true
  },
  experience: {
    type: String,
    enum: ['entry', 'intermediate', 'expert'],
    required: true
  },
  projectType: {
    type: String,
    enum: ['one-time', 'ongoing', 'recurring'],
    default: 'one-time'
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  location: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
    default: 'remote'
  },
  timezone: String,
  deadline: Date,
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    amount: Number,
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  proposals: [{
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    coverLetter: String,
    proposedAmount: Number,
    estimatedDuration: String,
    attachments: [{
      filename: String,
      url: String
    }],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  hiredFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  hiredAt: Date,
  completedAt: Date,
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for search functionality
projectSchema.index({
  title: 'text',
  description: 'text',
  skills: 'text',
  tags: 'text'
});

// Update applications count when proposal is added/removed
projectSchema.methods.updateApplicationsCount = function() {
  this.applications = this.proposals.length;
  return this.save();
};

// Get project with populated data
projectSchema.methods.getPopulatedProject = function() {
  return this.populate([
    { path: 'client', select: 'name avatar rating' },
    { path: 'hiredFreelancer', select: 'name avatar rating' },
    { path: 'proposals.freelancer', select: 'name avatar rating hourlyRate' }
  ]);
};

// Check if project is still open for proposals
projectSchema.methods.isOpenForProposals = function() {
  return this.status === 'open' && 
         (!this.deadline || new Date() < this.deadline) &&
         this.visibility !== 'private';
};

module.exports = mongoose.model('Project', projectSchema); 