const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
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
    enum: ['freelancer', 'client', 'admin'],
    default: 'client'
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500
  },
  skills: [{
    type: String,
    trim: true
  }],
  hourlyRate: {
    type: Number,
    min: 0
  },
  portfolio: [{
    title: String,
    description: String,
    imageUrl: String,
    projectUrl: String
  }],
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    default: 'beginner'
  },
  location: {
    country: String,
    city: String,
    timezone: String
  },
  languages: [{
    language: String,
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'fluent', 'native']
    }
  }],
  education: [{
    degree: String,
    institution: String,
    year: Number,
    description: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    year: Number,
    credentialId: String
  }],
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'not-available'],
    default: 'part-time'
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  completedProjects: {
    type: Number,
    default: 0
  },
  stripeAccountId: String,
  stripeCustomerId: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
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

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate average rating
userSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.stripeAccountId;
  delete userObject.stripeCustomerId;
  return userObject;
};

module.exports = mongoose.model('User', userSchema); 