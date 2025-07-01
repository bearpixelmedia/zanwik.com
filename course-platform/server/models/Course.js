const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Course title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [2000, 'Course description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: [
      'programming', 'design', 'business', 'marketing', 'music', 
      'photography', 'health', 'fitness', 'language', 'cooking',
      'art', 'science', 'technology', 'finance', 'education',
      'lifestyle', 'travel', 'gaming', 'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['beginner', 'intermediate', 'advanced', 'all-levels']
  },
  language: {
    type: String,
    default: 'English',
    required: true
  },
  thumbnail: {
    type: String,
    required: [true, 'Course thumbnail is required']
  },
  previewVideo: {
    type: String
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'pending'],
    default: 'draft'
  },
  requirements: [{
    type: String,
    trim: true
  }],
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  targetAudience: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  duration: {
    totalHours: {
      type: Number,
      default: 0
    },
    totalMinutes: {
      type: Number,
      default: 0
    }
  },
  content: {
    totalLessons: {
      type: Number,
      default: 0
    },
    totalVideos: {
      type: Number,
      default: 0
    },
    totalQuizzes: {
      type: Number,
      default: 0
    },
    totalAssignments: {
      type: Number,
      default: 0
    },
    downloadableResources: {
      type: Number,
      default: 0
    }
  },
  stats: {
    enrollments: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    }
  },
  certificate: {
    enabled: {
      type: Boolean,
      default: true
    },
    template: {
      type: String,
      default: 'default'
    },
    requirements: {
      completionRate: {
        type: Number,
        default: 80,
        min: 0,
        max: 100
      },
      minimumScore: {
        type: Number,
        default: 70,
        min: 0,
        max: 100
      }
    }
  },
  settings: {
    allowReviews: {
      type: Boolean,
      default: true
    },
    allowQuestions: {
      type: Boolean,
      default: true
    },
    allowDownloads: {
      type: Boolean,
      default: true
    },
    lifetimeAccess: {
      type: Boolean,
      default: true
    },
    mobileAccess: {
      type: Boolean,
      default: true
    },
    certificateAccess: {
      type: Boolean,
      default: true
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  publishedAt: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
courseSchema.index({ slug: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ 'stats.averageRating': -1 });
courseSchema.index({ 'stats.enrollments': -1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ createdAt: -1 });

// Virtual for formatted duration
courseSchema.virtual('formattedDuration').get(function() {
  const hours = this.duration.totalHours;
  const minutes = this.duration.totalMinutes;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Virtual for formatted price
courseSchema.virtual('formattedPrice').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.price);
});

// Virtual for discount percentage
courseSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for completion rate
courseSchema.virtual('completionRate').get(function() {
  if (this.stats.enrollments === 0) return 0;
  return Math.round((this.stats.completions / this.stats.enrollments) * 100);
});

// Pre-save middleware to generate slug
courseSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Pre-save middleware to update published date
courseSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Method to update course stats
courseSchema.methods.updateStats = async function() {
  const Lesson = require('./Lesson');
  const Enrollment = require('./Enrollment');
  const Review = require('./Review');
  
  // Count lessons and content
  const lessons = await Lesson.find({ course: this._id });
  const totalLessons = lessons.length;
  const totalVideos = lessons.filter(lesson => lesson.type === 'video').length;
  const totalQuizzes = lessons.filter(lesson => lesson.type === 'quiz').length;
  const totalAssignments = lessons.filter(lesson => lesson.type === 'assignment').length;
  
  // Count enrollments and completions
  const enrollments = await Enrollment.find({ course: this._id });
  const totalEnrollments = enrollments.length;
  const totalCompletions = enrollments.filter(enrollment => enrollment.isCompleted).length;
  
  // Calculate average rating
  const reviews = await Review.find({ course: this._id });
  const totalRatings = reviews.length;
  const averageRating = totalRatings > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings 
    : 0;
  
  // Update stats
  this.content.totalLessons = totalLessons;
  this.content.totalVideos = totalVideos;
  this.content.totalQuizzes = totalQuizzes;
  this.content.totalAssignments = totalAssignments;
  this.stats.enrollments = totalEnrollments;
  this.stats.completions = totalCompletions;
  this.stats.averageRating = Math.round(averageRating * 10) / 10;
  this.stats.totalRatings = totalRatings;
  this.stats.totalReviews = totalRatings;
  
  await this.save();
};

// Static method to find published courses
courseSchema.statics.findPublished = function() {
  return this.find({ 
    status: 'published', 
    isPublished: true 
  }).populate('instructor', 'firstName lastName avatar');
};

// Static method to find featured courses
courseSchema.statics.findFeatured = function() {
  return this.find({ 
    status: 'published', 
    isPublished: true, 
    isFeatured: true 
  }).populate('instructor', 'firstName lastName avatar');
};

// Static method to search courses
courseSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    status: 'published',
    isPublished: true,
    ...filters
  };
  
  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }
  
  return this.find(searchQuery).populate('instructor', 'firstName lastName avatar');
};

module.exports = mongoose.model('Course', courseSchema); 