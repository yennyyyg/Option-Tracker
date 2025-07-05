const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
    required: false, // Some options might not have underlying positions
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  strategy: {
    type: String,
    required: true,
    enum: ['Covered Call', 'Cash-Secured Put', 'Protective Put', 'Iron Condor', 'Naked Put', 'Naked Call', 'Spread'],
  },
  type: {
    type: String,
    required: true,
    enum: ['call', 'put'],
  },
  strike: {
    type: Number,
    required: true,
  },
  expiration: {
    type: Date,
    required: true,
  },
  contracts: {
    type: Number,
    required: true,
    min: 1,
  },
  premiumCollected: {
    type: Number,
    required: true,
  },
  currentValue: {
    type: Number,
    required: true,
  },
  unrealizedPnL: {
    type: Number,
    default: 0,
  },
  delta: {
    type: Number,
    default: 0,
  },
  theta: {
    type: Number,
    default: 0,
  },
  gamma: {
    type: Number,
    default: 0,
  },
  vega: {
    type: Number,
    default: 0,
  },
  rho: {
    type: Number,
    default: 0,
  },
  assignmentProbability: {
    type: Number,
    default: 0,
    min: 0,
    max: 1,
  },
  daysToExpiration: {
    type: Number,
    default: 0,
  },
  isInTheMoney: {
    type: Boolean,
    default: false,
  },
  lastPrice: {
    type: Number,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: false,
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
optionSchema.pre('save', function(next) {
  console.log(`Option model: Pre-save hook for option ${this.symbol} ${this.strike} ${this.type}`);
  
  try {
    this.updatedAt = Date.now();

    // Calculate days to expiration
    const now = new Date();
    const expiration = new Date(this.expiration);
    this.daysToExpiration = Math.ceil((expiration - now) / (1000 * 60 * 60 * 24));
    console.log(`Option model: Calculated days to expiration: ${this.daysToExpiration}`);

    // Calculate unrealized P&L
    this.unrealizedPnL = this.premiumCollected - this.currentValue;
    console.log(`Option model: Calculated unrealized P&L: ${this.unrealizedPnL}`);

    // Determine if option is in the money
    if (this.currentPrice) {
      if (this.type === 'call') {
        this.isInTheMoney = this.currentPrice > this.strike;
      } else if (this.type === 'put') {
        this.isInTheMoney = this.currentPrice < this.strike;
      }
      console.log(`Option model: Option is ${this.isInTheMoney ? 'in' : 'out of'} the money`);
    }

    // Calculate assignment probability based on days to expiration and moneyness
    if (this.daysToExpiration <= 7 && this.isInTheMoney) {
      this.assignmentProbability = Math.min(0.8, 0.1 + (7 - this.daysToExpiration) * 0.1);
    } else if (this.isInTheMoney) {
      this.assignmentProbability = Math.min(0.5, this.daysToExpiration > 30 ? 0.1 : 0.3);
    } else {
      this.assignmentProbability = Math.max(0.05, this.daysToExpiration <= 7 ? 0.2 : 0.1);
    }
    console.log(`Option model: Calculated assignment probability: ${this.assignmentProbability}`);

    next();
  } catch (error) {
    console.error('Option model: Error in pre-save hook:', error);
    next(error);
  }
});

const Option = mongoose.model('Option', optionSchema);

module.exports = Option;