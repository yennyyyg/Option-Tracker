const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    expirationAlerts: {
      type: Boolean,
      default: true
    },
    assignmentAlerts: {
      type: Boolean,
      default: true
    },
    profitTargetAlerts: {
      type: Boolean,
      default: true
    },
    lossLimitAlerts: {
      type: Boolean,
      default: true
    },
    volatilityAlerts: {
      type: Boolean,
      default: false
    },
    marginAlerts: {
      type: Boolean,
      default: true
    },
    concentrationAlerts: {
      type: Boolean,
      default: true
    },
    greeksAlerts: {
      type: Boolean,
      default: false
    },
    marketEventAlerts: {
      type: Boolean,
      default: true
    },
    quietHoursStart: {
      type: String,
      default: '22:00'
    },
    quietHoursEnd: {
      type: String,
      default: '08:00'
    }
  },
  display: {
    theme: {
      type: String,
      enum: ['dark', 'light', 'system'],
      default: 'dark'
    },
    compactMode: {
      type: Boolean,
      default: false
    },
    showGreeks: {
      type: Boolean,
      default: true
    },
    showProbabilities: {
      type: Boolean,
      default: true
    },
    defaultTimeframe: {
      type: String,
      enum: ['7d', '30d', '90d', '1y'],
      default: '30d'
    },
    defaultSorting: {
      type: String,
      enum: ['expiration', 'symbol', 'profit', 'delta'],
      default: 'expiration'
    },
    rowDensity: {
      type: String,
      enum: ['compact', 'comfortable', 'spacious'],
      default: 'comfortable'
    },
    chartType: {
      type: String,
      enum: ['line', 'bar', 'candlestick'],
      default: 'line'
    }
  },
  trading: {
    defaultExpiration: {
      type: String,
      enum: ['7-14', '30-45', '45-60'],
      default: '30-45'
    },
    defaultDelta: {
      type: String,
      default: '0.30'
    },
    profitTarget: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    maxPositionSize: {
      type: Number,
      default: 10,
      min: 1
    },
    concentrationLimit: {
      type: Number,
      default: 20,
      min: 0,
      max: 100
    },
    marginUsageLimit: {
      type: Number,
      default: 75,
      min: 0,
      max: 100
    },
    commissionRate: {
      type: Number,
      default: 0.65,
      min: 0
    },
    taxLotMethod: {
      type: String,
      enum: ['FIFO', 'LIFO', 'SpecificLot'],
      default: 'FIFO'
    },
    washSaleTracking: {
      type: Boolean,
      default: true
    }
  },
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      default: 60,
      min: 15,
      max: 480
    },
    dataRetention: {
      type: Number,
      default: 365,
      min: 30
    },
    shareData: {
      type: Boolean,
      default: false
    },
    backupEnabled: {
      type: Boolean,
      default: true
    }
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
userPreferenceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('UserPreference', userPreferenceSchema);