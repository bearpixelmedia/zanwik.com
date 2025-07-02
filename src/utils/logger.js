const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
fs.ensureDirSync(logsDir);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: { service: 'umbrella-dashboard' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Access log file
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'info',
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5,
      tailable: true
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Helper methods for specific log types
logger.logProjectEvent = (projectId, event, details = {}) => {
  logger.info('Project event', {
    projectId,
    event,
    ...details
  });
};

logger.logDeploymentEvent = (projectId, deploymentId, event, details = {}) => {
  logger.info('Deployment event', {
    projectId,
    deploymentId,
    event,
    ...details
  });
};

logger.logUserAction = (userId, action, details = {}) => {
  logger.info('User action', {
    userId,
    action,
    ...details
  });
};

logger.logSecurityEvent = (event, details = {}) => {
  logger.warn('Security event', {
    event,
    ...details
  });
};

logger.logPerformanceEvent = (metric, value, details = {}) => {
  logger.info('Performance metric', {
    metric,
    value,
    ...details
  });
};

logger.logError = (error, context = {}) => {
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    ...context
  });
};

// Middleware for HTTP request logging
logger.logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous'
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP request', logData);
    } else {
      logger.info('HTTP request', logData);
    }
  });
  
  next();
};

// Function to rotate logs
logger.rotateLogs = async () => {
  try {
    const files = await fs.readdir(logsDir);
    const logFiles = files.filter(file => file.endsWith('.log'));
    
    for (const file of logFiles) {
      const filePath = path.join(logsDir, file);
      const stats = await fs.stat(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      if (fileSizeInMB > 20) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const newFileName = `${file.replace('.log', '')}-${timestamp}.log`;
        const newFilePath = path.join(logsDir, newFileName);
        
        await fs.move(filePath, newFilePath);
        logger.info(`Log file rotated: ${file} -> ${newFileName}`);
      }
    }
  } catch (error) {
    logger.error('Error rotating logs:', error);
  }
};

// Function to clean old log files
logger.cleanOldLogs = async (daysToKeep = 30) => {
  try {
    const files = await fs.readdir(logsDir);
    const logFiles = files.filter(file => file.endsWith('.log'));
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    for (const file of logFiles) {
      const filePath = path.join(logsDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < cutoffDate) {
        await fs.remove(filePath);
        logger.info(`Old log file removed: ${file}`);
      }
    }
  } catch (error) {
    logger.error('Error cleaning old logs:', error);
  }
};

// Export the logger
module.exports = logger; 