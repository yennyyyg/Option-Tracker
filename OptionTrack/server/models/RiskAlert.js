const mongoose = require('mongoose');

const riskAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alertType: {
    type: String,
    required: true,
    enum: ['assignment_risk', 'margin_usage', 'expiration_reminder', 'profit_target', 'loss_limit', 'volatility_change']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  symbol: {
    type: String,
    trim: true
  },
  strike: {
    type: Number
  },
  expiration: {
    type: Date
  },
  threshold: {
    type: Number
  },
  currentValue: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  triggeredAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
riskAlertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
riskAlertSchema.index({ user: 1, createdAt: -1 });
riskAlertSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('RiskAlert', riskAlertSchema);