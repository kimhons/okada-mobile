import winston from 'winston';

export interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: any;
}

class Logger {
  private logger: winston.Logger;

  constructor() {
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.prettyPrint()
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: {
        service: 'okada-auth-service',
        environment: process.env.NODE_ENV || 'development'
      },
      transports: [
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 10485760, // 10MB
          maxFiles: 5
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 10485760, // 10MB
          maxFiles: 5
        })
      ]
    });

    // Add console transport in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      );
    }
  }

  private formatMessage(message: string, context?: LogContext): any {
    return {
      message,
      ...context,
      timestamp: new Date().toISOString()
    };
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(this.formatMessage(message, context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logger.error(this.formatMessage(message, {
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    }));
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.formatMessage(message, context));
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.formatMessage(message, context));
  }

  // Security-specific logging methods
  security(event: string, context: LogContext): void {
    this.logger.warn(this.formatMessage(`SECURITY: ${event}`, {
      ...context,
      securityEvent: true
    }));
  }

  audit(action: string, context: LogContext): void {
    this.logger.info(this.formatMessage(`AUDIT: ${action}`, {
      ...context,
      auditEvent: true
    }));
  }
}

export const logger = new Logger();
export default logger;