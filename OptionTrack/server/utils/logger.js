const winston = require('winston');
const path = require('path');

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss:ms'
    }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [
    // Console transport
    new winston.transports.Console(),
    // File transport for errors
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
    logger.info('Logger: Created logs directory');
  } catch (error) {
    console.error('Logger: Failed to create logs directory:', error);
  }
}

// Helper functions for different log levels
const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

const logError = (message, error = null, meta = {}) => {
  if (error) {
    logger.error(`${message}: ${error.message}`, {
      ...meta,
      stack: error.stack,
      error: error.toString()
    });
  } else {
    logger.error(message, meta);
  }
};

const logWarn = (message, meta = {}) => {
  logger.warn(message, meta);
};

const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

const logHttp = (message, meta = {}) => {
  logger.http(message, meta);
};

// Request logging middleware
const logRequest = (req, res, next) => {
  const start = Date.now();
  
  logHttp(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    
    logDebug(`Request body for ${req.method} ${req.url}`, { body: sanitizedBody });
  }

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logHttp(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Auth-specific logging
const logAuthAttempt = (email, success, error = null) => {
  if (success) {
    logInfo(`Auth: Login successful for ${email}`, { email, success: true });
  } else {
    logWarn(`Auth: Login failed for ${email}`, { 
      email, 
      success: false, 
      error: error ? error.message : 'Unknown error' 
    });
  }
};

const logAuthToken = (action, email, tokenType = 'access') => {
  logInfo(`Auth: ${action} ${tokenType} token for ${email}`, { 
    action, 
    email, 
    tokenType 
  });
};

// Database logging
const logDbOperation = (operation, collection, success, error = null, meta = {}) => {
  if (success) {
    logInfo(`DB: ${operation} operation on ${collection} successful`, {
      operation,
      collection,
      success: true,
      ...meta
    });
  } else {
    logError(`DB: ${operation} operation on ${collection} failed`, error, {
      operation,
      collection,
      success: false,
      ...meta
    });
  }
};

// API response logging
const logApiResponse = (endpoint, statusCode, data = null, error = null) => {
  const logData = {
    endpoint,
    statusCode,
    success: statusCode >= 200 && statusCode < 300
  };

  if (error) {
    logError(`API: ${endpoint} responded with error`, error, logData);
  } else {
    logInfo(`API: ${endpoint} responded successfully`, {
      ...logData,
      dataType: data ? typeof data : 'no data'
    });
  }
};

// Performance logging
const logPerformance = (operation, duration, meta = {}) => {
  const level = duration > 1000 ? 'warn' : 'info';
  logger[level](`Performance: ${operation} took ${duration}ms`, {
    operation,
    duration: `${duration}ms`,
    ...meta
  });
};

module.exports = {
  logger,
  logInfo,
  logError,
  logWarn,
  logDebug,
  logHttp,
  logRequest,
  logAuthAttempt,
  logAuthToken,
  logDbOperation,
  logApiResponse,
  logPerformance
};