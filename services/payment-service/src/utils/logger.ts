/**
 * Logger Configuration for Payment Service
 * Winston-based logging with structured output for production environments
 */

import winston from 'winston';
import { config } from '@/config';

// Custom log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};

// Custom colors for log levels
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  trace: 'magenta'
};

winston.addColors(logColors);

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({
    fillExcept: ['message', 'level', 'timestamp', 'service']
  }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({
    format: 'HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = `\n${JSON.stringify(meta, null, 2)}`;
    }
    return `${timestamp} [${service}] ${level}: ${message}${metaStr}`;
  })
);

// Create transports array
const transports: winston.transport[] = [];

// Console transport for development
if (config.isDevelopment()) {
  transports.push(
    new winston.transports.Console({
      level: config.server.logLevel,
      format: consoleFormat
    })
  );
} else {
  // Structured logging for production
  transports.push(
    new winston.transports.Console({
      level: config.server.logLevel,
      format: logFormat
    })
  );
}

// File transports for production
if (config.isProduction()) {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  levels: logLevels,
  level: config.server.logLevel,
  format: logFormat,
  defaultMeta: {
    service: config.server.serviceName,
    version: process.env.npm_package_version || '1.0.0',
    environment: config.server.env,
    pid: process.pid
  },
  transports,
  exitOnError: false
});

// Create a stream object for Morgan HTTP request logging
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim(), { component: 'http' });
  }
};

// Helper functions for structured logging

export const logPaymentRequest = (
  message: string,
  paymentData: {
    orderId: string;
    customerId: string;
    amount: number;
    currency: string;
    provider: string;
    method: string;
  },
  additionalMeta?: Record<string, any>
) => {
  logger.info(message, {
    component: 'payment',
    action: 'request',
    ...paymentData,
    ...additionalMeta
  });
};

export const logPaymentResponse = (
  message: string,
  responseData: {
    transactionId: string;
    status: string;
    provider: string;
    amount: number;
  },
  additionalMeta?: Record<string, any>
) => {
  logger.info(message, {
    component: 'payment',
    action: 'response',
    ...responseData,
    ...additionalMeta
  });
};

export const logFraudDetection = (
  message: string,
  fraudData: {
    transactionId: string;
    riskScore: number;
    riskLevel: string;
    reasons: string[];
  },
  additionalMeta?: Record<string, any>
) => {
  logger.warn(message, {
    component: 'fraud-detection',
    ...fraudData,
    ...additionalMeta
  });
};

export const logProviderError = (
  message: string,
  errorData: {
    provider: string;
    errorCode: string;
    transactionId?: string;
  },
  error: Error,
  additionalMeta?: Record<string, any>
) => {
  logger.error(message, {
    component: 'provider',
    ...errorData,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    ...additionalMeta
  });
};

export const logWebhook = (
  message: string,
  webhookData: {
    provider: string;
    event: string;
    transactionId?: string;
    status?: string;
  },
  additionalMeta?: Record<string, any>
) => {
  logger.info(message, {
    component: 'webhook',
    ...webhookData,
    ...additionalMeta
  });
};

export const logSettlement = (
  message: string,
  settlementData: {
    merchantId: string;
    period: string;
    totalAmount: number;
    transactionCount: number;
  },
  additionalMeta?: Record<string, any>
) => {
  logger.info(message, {
    component: 'settlement',
    ...settlementData,
    ...additionalMeta
  });
};

export const logUSSD = (
  message: string,
  ussdData: {
    sessionId: string;
    phoneNumber: string;
    provider: string;
    step: string;
  },
  additionalMeta?: Record<string, any>
) => {
  logger.info(message, {
    component: 'ussd',
    ...ussdData,
    ...additionalMeta
  });
};

export const logAudit = (
  message: string,
  auditData: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress?: string;
  },
  additionalMeta?: Record<string, any>
) => {
  logger.info(message, {
    component: 'audit',
    ...auditData,
    ...additionalMeta
  });
};

export const logPerformance = (
  message: string,
  performanceData: {
    operation: string;
    duration: number;
    success: boolean;
  },
  additionalMeta?: Record<string, any>
) => {
  logger.debug(message, {
    component: 'performance',
    ...performanceData,
    ...additionalMeta
  });
};

// Error logging with context
export const logError = (
  error: Error,
  context?: {
    component: string;
    operation?: string;
    transactionId?: string;
    userId?: string;
  }
) => {
  logger.error('Error occurred', {
    component: context?.component || 'unknown',
    operation: context?.operation,
    transactionId: context?.transactionId,
    userId: context?.userId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  });
};

// Create child logger for specific components
export const createChildLogger = (component: string, additionalMeta?: Record<string, any>) => {
  return logger.child({
    component,
    ...additionalMeta
  });
};

// Handle uncaught exceptions and unhandled rejections
if (config.isProduction()) {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason,
      promise: promise.toString()
    });
  });
}

export default logger;