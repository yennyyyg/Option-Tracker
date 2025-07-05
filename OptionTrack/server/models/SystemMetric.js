const mongoose = require('mongoose');

const systemMetricSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  metricType: {
    type: String,
    enum: ['response_time', 'error_rate', 'system_load', 'cpu_usage', 'memory_usage', 'storage_usage'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  endpoint: {
    type: String,
    required: false // Only for response_time and error_rate metrics
  },
  statusCode: {
    type: Number,
    required: false // Only for error_rate metrics
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient querying
systemMetricSchema.index({ timestamp: -1, metricType: 1 });
systemMetricSchema.index({ endpoint: 1, timestamp: -1 });

module.exports = mongoose.model('SystemMetric', systemMetricSchema);