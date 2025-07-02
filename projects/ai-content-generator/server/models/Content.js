const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['blog-post', 'social-media', 'marketing-copy'],
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    tone: String,
    length: String,
    keywords: [String],
    platform: String,
    postType: String,
    targetAudience: String,
    copyType: String
  },
  wordCount: {
    type: Number,
    default: 0
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true
});

// Calculate word count before saving
contentSchema.pre('save', function(next) {
  if (this.content) {
    this.wordCount = this.content.split(/\s+/).length;
  }
  next();
});

// Index for better query performance
contentSchema.index({ userId: 1, createdAt: -1 });
contentSchema.index({ userId: 1, type: 1 });
contentSchema.index({ userId: 1, isFavorite: 1 });

module.exports = mongoose.model('Content', contentSchema); 