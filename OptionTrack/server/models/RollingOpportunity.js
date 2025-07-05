const mongoose = require('mongoose');

const rollingOpportunitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  currentStrike: {
    type: Number,
    required: true,
  },
  currentExpiration: {
    type: Date,
    required: true,
  },
  suggestedStrike: {
    type: Number,
    required: true,
  },
  suggestedExpiration: {
    type: Date,
    required: true,
  },
  strategy: {
    type: String,
    required: true,
    enum: ['covered_call', 'cash_secured_put', 'protective_put', 'naked_put', 'naked_call'],
  },
  contracts: {
    type: Number,
    required: true,
    min: 1,
  },
  currentPremium: {
    type: Number,
    required: true,
  },
  suggestedPremium: {
    type: Number,
    required: true,
  },
  creditReceived: {
    type: Number,
    default: function() {
      return this.suggestedPremium - this.currentPremium;
    }
  },
  profitability: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'executed', 'expired', 'cancelled'],
    default: 'pending',
  },
  daysToExpiration: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  versionKey: false,
});

// Update the updatedAt field before saving
rollingOpportunitySchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }

  // Calculate days to current expiration
  const now = new Date();
  const expiration = new Date(this.currentExpiration);
  this.daysToExpiration = Math.ceil((expiration - now) / (1000 * 60 * 60 * 24));

  // Calculate credit received
  this.creditReceived = this.suggestedPremium - this.currentPremium;

  next();
});

// Index for efficient queries
rollingOpportunitySchema.index({ user: 1, currentExpiration: 1 });
rollingOpportunitySchema.index({ symbol: 1, status: 1 });
rollingOpportunitySchema.index({ status: 1, currentExpiration: 1 });

const RollingOpportunity = mongoose.model('RollingOpportunity', rollingOpportunitySchema);

module.exports = RollingOpportunity;