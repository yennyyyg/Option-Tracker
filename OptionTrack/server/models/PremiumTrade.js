const mongoose = require('mongoose');

const premiumTradeSchema = new mongoose.Schema({
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
  strategy: {
    type: String,
    required: true,
    enum: ['Covered Call', 'Cash-Secured Put', 'Protective Put', 'Iron Condor', 'Naked Put', 'Naked Call', 'Credit Spread', 'Debit Spread', 'Straddle', 'Strangle'],
  },
  contractType: {
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
  tradeDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  closeDate: {
    type: Date,
    required: false,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  premium: {
    type: Number,
    required: true,
  },
  outcome: {
    type: String,
    enum: ['expired_worthless', 'closed_early', 'assigned', 'rolled', 'open'],
    default: 'open',
  },
  daysHeld: {
    type: Number,
    default: 0,
  },
  annualizedReturn: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
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
premiumTradeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate days held if trade is closed
  if (this.closeDate && this.tradeDate) {
    const tradeDate = new Date(this.tradeDate);
    const closeDate = new Date(this.closeDate);
    this.daysHeld = Math.ceil((closeDate - tradeDate) / (1000 * 60 * 60 * 24));
    
    // Calculate annualized return (simplified calculation)
    if (this.daysHeld > 0) {
      const dailyReturn = this.premium / (this.strike * this.quantity * 100); // Assuming $100 per contract
      this.annualizedReturn = (dailyReturn * 365 / this.daysHeld) * 100;
    }
  }
  
  next();
});

// Index for efficient queries
premiumTradeSchema.index({ userId: 1, tradeDate: -1 });
premiumTradeSchema.index({ userId: 1, symbol: 1 });
premiumTradeSchema.index({ userId: 1, outcome: 1 });

const PremiumTrade = mongoose.model('PremiumTrade', premiumTradeSchema);

module.exports = PremiumTrade;