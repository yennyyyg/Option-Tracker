const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  endTime: {
    type: Date,
    required: false
  },
  duration: {
    type: Number, // Duration in seconds
    required: false
  },
  pageViews: [{
    page: String,
    timestamp: Date,
    timeSpent: Number // Time spent on page in seconds
  }],
  interactions: [{
    type: String, // 'click', 'form_submit', 'api_call', etc.
    target: String, // Element or endpoint
    timestamp: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Index for efficient querying
userSessionSchema.index({ userId: 1, startTime: -1 });
userSessionSchema.index({ startTime: -1, isActive: 1 });
userSessionSchema.index({ sessionId: 1 });

// Pre-save hook to calculate duration
userSessionSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  next();
});

module.exports = mongoose.model('UserSession', userSessionSchema);