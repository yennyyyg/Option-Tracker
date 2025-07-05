const mongoose = require('mongoose');

const brokerageAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  accountId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  broker: {
    type: String,
    required: true,
  },
  totalValue: {
    type: Number,
    default: 0,
  },
  buyingPower: {
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
  accountType: {
    type: String,
    enum: ['individual', 'ira', 'roth_ira', 'margin', '401k'],
    default: 'individual',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSyncAt: {
    type: Date,
    default: Date.now,
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
brokerageAccountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const BrokerageAccount = mongoose.model('BrokerageAccount', brokerageAccountSchema);

module.exports = BrokerageAccount;