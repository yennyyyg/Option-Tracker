const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  userId: {
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
  shares: {
    type: Number,
    default: 0,
  },
  averageCost: {
    type: Number,
    default: 0,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  marketValue: {
    type: Number,
    required: true,
  },
  unrealizedPnL: {
    type: Number,
    default: 0,
  },
  dayChange: {
    type: Number,
    default: 0,
  },
  dayChangePercent: {
    type: Number,
    default: 0,
  },
  lastPrice: {
    type: Number,
    required: true,
  },
  strategyType: {
    type: String,
    enum: ['covered_call', 'cash_secured_put', 'iron_condor', 'naked_option', 'stock_only'],
    default: 'stock_only',
  },
  accountId: {
    type: String,
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  broker: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    enum: ['manual', 'plaid', 'import'],
    default: 'manual',
  },
  institutionName: {
    type: String,
    default: '',
  },
  plaidAccountId: {
    type: String,
    default: '',
  },
  plaidSecurityId: {
    type: String,
    default: '',
  },
  costBasis: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  versionKey: false,
});

// Update the updatedAt field before saving
positionSchema.pre('save', function(next) {
  console.log(`Position: Pre-save hook for position ${this.symbol} (${this.userId})`);
  this.updatedAt = Date.now();
  
  // Calculate market value if not provided
  if (!this.marketValue && this.shares && this.currentPrice) {
    this.marketValue = this.shares * this.currentPrice;
    console.log(`Position: Calculated market value for ${this.symbol}: ${this.marketValue}`);
  }
  
  // Calculate unrealized P&L if not provided
  if (this.marketValue && this.costBasis) {
    this.unrealizedPnL = this.marketValue - this.costBasis;
    console.log(`Position: Calculated unrealized P&L for ${this.symbol}: ${this.unrealizedPnL}`);
  }
  
  next();
});

// Add compound index for efficient queries
positionSchema.index({ userId: 1, symbol: 1 });
positionSchema.index({ userId: 1, source: 1 });
positionSchema.index({ userId: 1, plaidAccountId: 1 });

const Position = mongoose.model('Position', positionSchema);

module.exports = Position;