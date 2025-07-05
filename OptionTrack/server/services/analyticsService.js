const SystemMetric = require('../models/SystemMetric');
const UserSession = require('../models/UserSession');
const User = require('../models/User');

class AnalyticsService {
  
  // Get performance metrics
  async getPerformanceMetrics(timeRange = '24h') {
    console.log(`Analytics: Fetching performance metrics for ${timeRange}`);
    
    const timeRanges = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const startTime = new Date(Date.now() - (timeRanges[timeRange] || timeRanges['24h']));
    
    try {
      // Average response time
      const responseTimeMetrics = await SystemMetric.aggregate([
        {
          $match: {
            metricType: 'response_time',
            timestamp: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$value' },
            maxResponseTime: { $max: '$value' },
            minResponseTime: { $min: '$value' },
            totalRequests: { $sum: 1 }
          }
        }
      ]);
      
      // Error rate
      const errorMetrics = await SystemMetric.aggregate([
        {
          $match: {
            metricType: 'error_rate',
            timestamp: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: null,
            totalErrors: { $sum: '$value' }
          }
        }
      ]);
      
      // System load
      const systemLoadMetrics = await SystemMetric.aggregate([
        {
          $match: {
            metricType: 'system_load',
            timestamp: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: null,
            avgSystemLoad: { $avg: '$value' },
            maxSystemLoad: { $max: '$value' }
          }
        }
      ]);
      
      const responseTime = responseTimeMetrics[0] || { avgResponseTime: 0, maxResponseTime: 0, minResponseTime: 0, totalRequests: 0 };
      const errors = errorMetrics[0] || { totalErrors: 0 };
      const systemLoad = systemLoadMetrics[0] || { avgSystemLoad: 0, maxSystemLoad: 0 };
      
      const errorRate = responseTime.totalRequests > 0 ? (errors.totalErrors / responseTime.totalRequests) * 100 : 0;
      
      const result = {
        responseTime: {
          average: Math.round(responseTime.avgResponseTime || 0),
          maximum: Math.round(responseTime.maxResponseTime || 0),
          minimum: Math.round(responseTime.minResponseTime || 0)
        },
        errorRate: Math.round(errorRate * 100) / 100,
        systemLoad: {
          average: Math.round((systemLoad.avgSystemLoad || 0) * 100) / 100,
          maximum: Math.round((systemLoad.maxSystemLoad || 0) * 100) / 100
        },
        totalRequests: responseTime.totalRequests,
        totalErrors: errors.totalErrors,
        timeRange: timeRange
      };
      
      console.log('Performance metrics calculated:', result);
      return result;
      
    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      throw new Error('Failed to calculate performance metrics');
    }
  }
  
  // Get user engagement metrics
  async getEngagementMetrics(timeRange = '24h') {
    console.log(`Analytics: Fetching engagement metrics for ${timeRange}`);
    
    const timeRanges = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const startTime = new Date(Date.now() - (timeRanges[timeRange] || timeRanges['24h']));
    
    try {
      // Active users
      const activeUsers = await UserSession.distinct('userId', {
        startTime: { $gte: startTime }
      });
      
      // Session duration
      const sessionMetrics = await UserSession.aggregate([
        {
          $match: {
            startTime: { $gte: startTime },
            duration: { $exists: true, $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            avgSessionDuration: { $avg: '$duration' },
            maxSessionDuration: { $max: '$duration' },
            totalSessions: { $sum: 1 }
          }
        }
      ]);
      
      // Page views
      const pageViewMetrics = await UserSession.aggregate([
        {
          $match: {
            startTime: { $gte: startTime }
          }
        },
        {
          $unwind: '$pageViews'
        },
        {
          $group: {
            _id: '$pageViews.page',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]);
      
      // Interactions
      const interactionMetrics = await UserSession.aggregate([
        {
          $match: {
            startTime: { $gte: startTime }
          }
        },
        {
          $unwind: '$interactions'
        },
        {
          $group: {
            _id: '$interactions.type',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const sessions = sessionMetrics[0] || { avgSessionDuration: 0, maxSessionDuration: 0, totalSessions: 0 };
      
      const result = {
        activeUsers: activeUsers.length,
        totalSessions: sessions.totalSessions,
        averageSessionDuration: Math.round(sessions.avgSessionDuration || 0), // in seconds
        maxSessionDuration: Math.round(sessions.maxSessionDuration || 0),
        topPages: pageViewMetrics.map(page => ({
          page: page._id,
          views: page.count
        })),
        interactionTypes: interactionMetrics.map(interaction => ({
          type: interaction._id,
          count: interaction.count
        })),
        timeRange: timeRange
      };
      
      console.log('Engagement metrics calculated:', result);
      return result;
      
    } catch (error) {
      console.error('Error calculating engagement metrics:', error);
      throw new Error('Failed to calculate engagement metrics');
    }
  }
  
  // Get resource utilization metrics
  async getResourceMetrics(timeRange = '24h') {
    console.log(`Analytics: Fetching resource metrics for ${timeRange}`);
    
    const timeRanges = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const startTime = new Date(Date.now() - (timeRanges[timeRange] || timeRanges['24h']));
    
    try {
      // CPU usage
      const cpuMetrics = await SystemMetric.aggregate([
        {
          $match: {
            metricType: 'cpu_usage',
            timestamp: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: null,
            avgCpuUsage: { $avg: '$value' },
            maxCpuUsage: { $max: '$value' },
            minCpuUsage: { $min: '$value' }
          }
        }
      ]);
      
      // Memory usage
      const memoryMetrics = await SystemMetric.aggregate([
        {
          $match: {
            metricType: 'memory_usage',
            timestamp: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: null,
            avgMemoryUsage: { $avg: '$value' },
            maxMemoryUsage: { $max: '$value' },
            minMemoryUsage: { $min: '$value' }
          }
        }
      ]);
      
      // Storage usage (simulated - in a real app you'd check disk usage)
      const storageUsage = Math.random() * 30 + 45; // Simulated 45-75% usage
      
      const cpu = cpuMetrics[0] || { avgCpuUsage: 0, maxCpuUsage: 0, minCpuUsage: 0 };
      const memory = memoryMetrics[0] || { avgMemoryUsage: 0, maxMemoryUsage: 0, minMemoryUsage: 0 };
      
      const result = {
        cpu: {
          average: Math.round((cpu.avgCpuUsage || 0) * 100) / 100,
          maximum: Math.round((cpu.maxCpuUsage || 0) * 100) / 100,
          minimum: Math.round((cpu.minCpuUsage || 0) * 100) / 100
        },
        memory: {
          average: Math.round((memory.avgMemoryUsage || 0) * 100) / 100,
          maximum: Math.round((memory.maxMemoryUsage || 0) * 100) / 100,
          minimum: Math.round((memory.minMemoryUsage || 0) * 100) / 100
        },
        storage: {
          used: Math.round(storageUsage * 100) / 100,
          available: Math.round((100 - storageUsage) * 100) / 100
        },
        timeRange: timeRange
      };
      
      console.log('Resource metrics calculated:', result);
      return result;
      
    } catch (error) {
      console.error('Error calculating resource metrics:', error);
      throw new Error('Failed to calculate resource metrics');
    }
  }
}

module.exports = new AnalyticsService();