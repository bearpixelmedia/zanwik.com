const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  terms: {
    type: String,
    required: true
  },
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
    currency: {
      type: String,
      default: 'USD'
    }
  },
  hourlyRate: {
    type: Number,
    min: 0
  },
  estimatedHours: Number,
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'paused', 'completed', 'cancelled', 'disputed'],
    default: 'draft'
  },
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    amount: Number,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    deliverables: [{
      title: String,
      description: String,
      fileUrl: String,
      submittedAt: Date,
      approvedAt: Date,
      feedback: String
    }]
  }],
  timeTracking: [{
    date: {
      type: Date,
      required: true
    },
    hours: {
      type: Number,
      required: true,
      min: 0
    },
    description: String,
    isApproved: {
      type: Boolean,
      default: false
    },
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  payments: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: ['milestone', 'hourly', 'bonus', 'refund'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    stripePaymentIntentId: String,
    description: String,
    dueDate: Date,
    paidAt: Date,
    milestoneId: mongoose.Schema.Types.ObjectId
  }],
  totalPaid: {
    type: Number,
    default: 0
  },
  totalHours: {
    type: Number,
    default: 0
  },
  platformFee: {
    type: Number,
    default: 0.10 // 10% platform fee
  },
  communication: {
    messages: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      message: {
        type: String,
        required: true
      },
      attachments: [{
        filename: String,
        url: String,
        size: Number
      }],
      isRead: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date,
        default: Date.now
      }
    }],
    lastMessageAt: Date
  },
  files: [{
    filename: String,
    url: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  reviews: {
    clientReview: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      submittedAt: Date
    },
    freelancerReview: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      submittedAt: Date
    }
  },
  disputes: [{
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    description: String,
    evidence: [{
      filename: String,
      url: String,
      description: String
    }],
    status: {
      type: String,
      enum: ['open', 'under-review', 'resolved', 'closed'],
      default: 'open'
    },
    resolution: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate total paid amount
contractSchema.methods.calculateTotalPaid = function() {
  this.totalPaid = this.payments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  return this.save();
};

// Calculate total hours worked
contractSchema.methods.calculateTotalHours = function() {
  this.totalHours = this.timeTracking
    .filter(entry => entry.isApproved)
    .reduce((sum, entry) => sum + entry.hours, 0);
  return this.save();
};

// Get contract with populated data
contractSchema.methods.getPopulatedContract = function() {
  return this.populate([
    { path: 'project', select: 'title description' },
    { path: 'client', select: 'name avatar rating' },
    { path: 'freelancer', select: 'name avatar rating hourlyRate' },
    { path: 'communication.messages.sender', select: 'name avatar' },
    { path: 'files.uploadedBy', select: 'name' },
    { path: 'disputes.raisedBy', select: 'name' },
    { path: 'disputes.resolvedBy', select: 'name' }
  ]);
};

// Check if contract is active
contractSchema.methods.isActive = function() {
  return this.status === 'active' && this.isActive;
};

// Add message to communication
contractSchema.methods.addMessage = function(senderId, message, attachments = []) {
  this.communication.messages.push({
    sender: senderId,
    message,
    attachments
  });
  this.communication.lastMessageAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Contract', contractSchema); 