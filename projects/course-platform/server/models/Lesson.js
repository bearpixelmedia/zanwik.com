const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [200, 'Lesson title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Lesson description cannot exceed 1000 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Lesson type is required'],
    enum: ['video', 'text', 'quiz', 'assignment', 'download', 'live']
  },
  order: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  isFree: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  
  // Video content
  video: {
    url: String,
    thumbnail: String,
    duration: Number, // in seconds
    quality: {
      type: String,
      enum: ['360p', '480p', '720p', '1080p', '4k']
    },
    subtitles: [{
      language: String,
      url: String
    }],
    transcript: String,
    allowDownload: {
      type: Boolean,
      default: false
    }
  },
  
  // Text content
  content: {
    type: String,
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  
  // Quiz content
  quiz: {
    questions: [{
      question: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'fill-blank', 'essay'],
        default: 'multiple-choice'
      },
      options: [{
        text: String,
        isCorrect: {
          type: Boolean,
          default: false
        }
      }],
      correctAnswer: String, // for fill-blank and essay
      points: {
        type: Number,
        default: 1
      },
      explanation: String
    }],
    timeLimit: Number, // in minutes
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100
    },
    allowRetake: {
      type: Boolean,
      default: true
    },
    maxAttempts: {
      type: Number,
      default: 3
    }
  },
  
  // Assignment content
  assignment: {
    instructions: String,
    dueDate: Date,
    points: {
      type: Number,
      default: 10
    },
    allowLateSubmission: {
      type: Boolean,
      default: false
    },
    latePenalty: {
      type: Number,
      default: 0 // percentage
    },
    submissionType: {
      type: String,
      enum: ['file', 'text', 'link'],
      default: 'file'
    },
    allowedFileTypes: [String],
    maxFileSize: Number // in MB
  },
  
  // Download content
  download: {
    files: [{
      name: String,
      url: String,
      size: Number, // in bytes
      type: String
    }],
    description: String
  },
  
  // Live session content
  live: {
    startTime: Date,
    endTime: Date,
    meetingUrl: String,
    meetingId: String,
    meetingPassword: String,
    platform: {
      type: String,
      enum: ['zoom', 'teams', 'google-meet', 'custom'],
      default: 'zoom'
    },
    recordingUrl: String,
    isRecorded: {
      type: Boolean,
      default: false
    }
  },
  
  // Resources and attachments
  resources: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  
  // Progress tracking
  stats: {
    views: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    },
    quizAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    }
  },
  
  // Settings
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    allowQuestions: {
      type: Boolean,
      default: true
    },
    requireCompletion: {
      type: Boolean,
      default: true
    },
    showProgress: {
      type: Boolean,
      default: true
    }
  },
  
  // SEO and metadata
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
lessonSchema.index({ course: 1, order: 1 });
lessonSchema.index({ course: 1, type: 1 });
lessonSchema.index({ isPublished: 1 });
lessonSchema.index({ isFree: 1 });
lessonSchema.index({ 'video.url': 1 });

// Virtual for formatted duration
lessonSchema.virtual('formattedDuration').get(function() {
  if (this.type === 'video' && this.video.duration) {
    const hours = Math.floor(this.video.duration / 3600);
    const minutes = Math.floor((this.video.duration % 3600) / 60);
    const seconds = this.video.duration % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  if (this.duration) {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
  
  return '0m';
});

// Virtual for lesson type icon
lessonSchema.virtual('typeIcon').get(function() {
  const icons = {
    video: '🎥',
    text: '📝',
    quiz: '❓',
    assignment: '📋',
    download: '📁',
    live: '🔴'
  };
  return icons[this.type] || '📄';
});

// Virtual for completion status (for enrolled students)
lessonSchema.virtual('isCompleted').get(function() {
  // This will be populated when querying with student context
  return this._completed || false;
});

// Pre-save middleware to update published date
lessonSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Pre-save middleware to calculate duration
lessonSchema.pre('save', function(next) {
  if (this.type === 'video' && this.video.duration) {
    this.duration = Math.ceil(this.video.duration / 60);
  }
  next();
});

// Method to update lesson stats
lessonSchema.methods.updateStats = async function() {
  const LessonProgress = require('./LessonProgress');
  const QuizAttempt = require('./QuizAttempt');
  
  // Count views and completions
  const progress = await LessonProgress.find({ lesson: this._id });
  const views = progress.length;
  const completions = progress.filter(p => p.isCompleted).length;
  
  // Calculate average time spent
  const averageTime = views > 0 
    ? progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / views 
    : 0;
  
  // Calculate quiz stats
  let quizAttempts = 0;
  let averageScore = 0;
  
  if (this.type === 'quiz') {
    const attempts = await QuizAttempt.find({ lesson: this._id });
    quizAttempts = attempts.length;
    averageScore = quizAttempts > 0 
      ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts 
      : 0;
  }
  
  // Update stats
  this.stats.views = views;
  this.stats.completions = completions;
  this.stats.averageTime = Math.round(averageTime);
  this.stats.quizAttempts = quizAttempts;
  this.stats.averageScore = Math.round(averageScore * 10) / 10;
  
  await this.save();
};

// Static method to find course lessons
lessonSchema.statics.findByCourse = function(courseId, options = {}) {
  const query = { course: courseId };
  
  if (options.publishedOnly) {
    query.isPublished = true;
  }
  
  return this.find(query)
    .sort({ order: 1 })
    .populate('course', 'title slug');
};

// Static method to find free lessons
lessonSchema.statics.findFree = function(courseId) {
  return this.find({ 
    course: courseId, 
    isPublished: true, 
    isFree: true 
  }).sort({ order: 1 });
};

// Static method to get lesson with progress
lessonSchema.statics.findWithProgress = function(lessonId, studentId) {
  return this.findById(lessonId).populate({
    path: 'course',
    select: 'title slug instructor'
  }).then(lesson => {
    if (!lesson) return null;
    
    return LessonProgress.findOne({ 
      lesson: lessonId, 
      student: studentId 
    }).then(progress => {
      lesson._completed = progress ? progress.isCompleted : false;
      lesson._progress = progress;
      return lesson;
    });
  });
};

module.exports = mongoose.model('Lesson', lessonSchema); 