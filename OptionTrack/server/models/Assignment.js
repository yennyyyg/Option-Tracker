const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  option: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Option',
    required: true,
    index: true,
  },
  assignmentDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  strike: {
    type: Number,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
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
  premiumKept: {
    type: Number,
    required: true,
    min: 0,
  },
  stockValue: {
    type: Number,
    required: true,
  },
  totalPnL: {
    type: Number,
    default: 0,
  },
  assignmentProbability: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
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
assignmentSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  
  // Calculate total P&L (premium kept + stock value change)
  this.totalPnL = this.premiumKept + (this.stockValue || 0);
  
  next();
});

// Index for efficient queries
assignmentSchema.index({ user: 1, assignmentDate: -1 });
assignmentSchema.index({ symbol: 1, assignmentDate: -1 });
assignmentSchema.index({ status: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;