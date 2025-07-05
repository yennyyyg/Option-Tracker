const SystemMetric = require('../models/SystemMetric');
const UserSession = require('../models/UserSession');
const os = require('os');

// Performance tracking middleware
const trackPerformance = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Log performance metric
    console.log(`Performance: ${req.method} ${req.path} - ${responseTime}ms - Status: ${res.statusCode}`);
    
    // Save response time metric
    const metric = new SystemMetric({
      metricType: 'response_time',
      value: responseTime,
      endpoint: `${req.method} ${req.path}`,
      statusCode: res.statusCode
    });
    
    metric.save().catch(err => {
      console.error('Error saving response time metric:', err);
    });
    
    // Save error rate metric if error occurred
    if (res.statusCode >= 400) {
      const errorMetric = new SystemMetric({
        metricType: 'error_rate',
        value: 1,
        endpoint: `${req.method} ${req.path}`,
        statusCode: res.statusCode
      });
      
      errorMetric.save().catch(err => {
        console.error('Error saving error rate metric:', err);
      });
    }
    
    originalEnd.apply(this, args);
  };
  
  next();
};

// User engagement tracking middleware
const trackUserEngagement = async (req, res, next) => {
  if (req.user && req.user.id) {
    const sessionId = req.headers['x-session-id'] || `session_${req.user.id}_${Date.now()}`;
    
    try {
      // Find or create user session
      let session = await UserSession.findOne({ 
        sessionId: sessionId,
        isActive: true 
      });
      
      if (!session) {
        session = new UserSession({
          userId: req.user.id,
          sessionId: sessionId,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        });
        console.log(`Analytics: New session created for user ${req.user.id}`);
      }
      
      // Track page view for GET requests
      if (req.method === 'GET' && !req.path.startsWith('/api/')) {
        session.pageViews.push({
          page: req.path,
          timestamp: new Date()
        });
      }
      
      // Track API interactions
      if (req.path.startsWith('/api/')) {
        session.interactions.push({
          type: 'api_call',
          target: `${req.method} ${req.path}`,
          timestamp: new Date()
        });
      }
      
      await session.save();
      req.sessionId = sessionId;
    } catch (error) {
      console.error('Error tracking user engagement:', error);
    }
  }
  
  next();
};

// System resource monitoring (called periodically)
const collectSystemMetrics = async () => {
  try {
    // CPU usage
    const cpuUsage = os.loadavg()[0]; // 1-minute load average
    await new SystemMetric({
      metricType: 'cpu_usage',
      value: cpuUsage
    }).save();
    
    // Memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    await new SystemMetric({
      metricType: 'memory_usage',
      value: memoryUsage
    }).save();
    
    // System load
    const systemLoad = os.loadavg()[0];
    await new SystemMetric({
      metricType: 'system_load',
      value: systemLoad
    }).save();
    
    console.log(`System metrics collected - CPU: ${cpuUsage.toFixed(2)}, Memory: ${memoryUsage.toFixed(2)}%`);
  } catch (error) {
    console.error('Error collecting system metrics:', error);
  }
};

// Start system metrics collection
const startSystemMetricsCollection = () => {
  // Collect metrics every 5 minutes
  setInterval(collectSystemMetrics, 5 * 60 * 1000);
  
  // Collect initial metrics
  collectSystemMetrics();
  
  console.log('System metrics collection started');
};

module.exports = {
  trackPerformance,
  trackUserEngagement,
  collectSystemMetrics,
  startSystemMetricsCollection
};