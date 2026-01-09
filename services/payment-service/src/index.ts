/**
 * Okada Payment Service Entry Point
 * Production-ready payment service for Cameroon market
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import slowDown from 'express-slow-down';
import hpp from 'hpp';
import 'express-async-errors';

import { config } from '@/config';
import { logger, loggerStream } from '@/utils/logger';
import { PaymentController } from '@/controllers/payment-controller';
import paymentRoutes from '@/routes/payment-routes';
import webhookRoutes from '@/routes/webhook-routes';
import adminRoutes from '@/routes/admin-routes';
import { errorHandler } from '@/middleware/error-handler';
import { requestLogger } from '@/middleware/request-logger';
import { authMiddleware } from '@/middleware/auth';

class PaymentServiceApp {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.isDevelopment()
        ? ['http://localhost:3000', 'http://localhost:3001']
        : ['https://merchant.okada.cm', 'https://app.okada.cm'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Fingerprint', 'X-Request-ID']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.security.rateLimiting.windowMs,
      max: config.security.rateLimiting.maxRequests,
      message: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests from this IP, please try again later.'
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health';
      }
    });
    this.app.use(limiter);

    // Slow down repeated requests
    const speedLimiter = slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 5, // Allow 5 requests per windowMs without delay
      delayMs: 500, // Add 500ms delay per request after delayAfter
      maxDelayMs: 20000, // Maximum delay of 20 seconds
      skip: (req) => req.path === '/health'
    });
    this.app.use(speedLimiter);

    // Body parsing
    this.app.use(express.json({
      limit: '10mb',
      verify: (req: any, res, buf) => {
        // Store raw body for webhook signature verification
        if (req.originalUrl.includes('/webhooks/')) {
          req.rawBody = buf;
        }
      }
    }));
    this.app.use(express.urlencoded({ extended: true }));

    // Security sanitization
    this.app.use(mongoSanitize());
    this.app.use(hpp());

    // Compression
    this.app.use(compression());

    // HTTP request logging
    if (config.isDevelopment()) {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', { stream: loggerStream }));
    }

    // Request logging and correlation ID
    this.app.use(requestLogger);

    // Trust proxy for accurate IP addresses
    this.app.set('trust proxy', 1);
  }

  /**
   * Setup application routes
   */
  private setupRoutes(): void {
    // Health check endpoint (no auth required)
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        service: config.server.serviceName,
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // API routes with authentication
    this.app.use('/api/payments', authMiddleware, paymentRoutes);

    // Webhook routes (no auth, uses signature verification)
    this.app.use('/api/webhooks', webhookRoutes);

    // Admin routes (requires admin auth)
    this.app.use('/api/admin', authMiddleware, adminRoutes);

    // API documentation route
    this.app.get('/api/docs', (req, res) => {
      res.json({
        service: 'Okada Payment Service',
        version: '1.0.0',
        description: 'Production-ready payment service for Cameroon market',
        endpoints: {
          payments: '/api/payments',
          webhooks: '/api/webhooks',
          admin: '/api/admin',
          health: '/health'
        },
        providers: ['MTN Mobile Money', 'Orange Money', 'Cash'],
        features: [
          'Real-time payment processing',
          'Fraud detection',
          'USSD fallback',
          'Transaction reconciliation',
          'Settlement reports',
          'Webhook notifications'
        ]
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.originalUrl} not found`
        },
        meta: {
          timestamp: new Date(),
          requestId: req.get('X-Request-ID')
        }
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.app.use(errorHandler);

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.gracefulShutdown('UNHANDLED_REJECTION');
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received');
      this.gracefulShutdown('SIGTERM');
    });

    // Handle SIGINT
    process.on('SIGINT', () => {
      logger.info('SIGINT received');
      this.gracefulShutdown('SIGINT');
    });
  }

  /**
   * Start the server
   */
  public start(): void {
    const port = config.server.port;

    this.server = this.app.listen(port, () => {
      logger.info(`Payment Service started successfully`, {
        port,
        environment: config.server.env,
        version: process.env.npm_package_version || '1.0.0',
        nodeVersion: process.version,
        pid: process.pid
      });

      // Log configuration summary
      logger.info('Service configuration:', {
        fraudDetectionEnabled: config.fraudDetection.enabled,
        cemacComplianceEnabled: config.cameroon.cemacCompliance.enabled,
        providersEnabled: {
          mtn: config.payment.providers.mtn_mobile_money?.enabled,
          orange: config.payment.providers.orange_money?.enabled,
          cash: config.payment.providers.cash?.enabled
        }
      });
    });

    this.server.timeout = 30000; // 30 seconds timeout
    this.server.keepAliveTimeout = 65000; // 65 seconds
    this.server.headersTimeout = 66000; // 66 seconds
  }

  /**
   * Graceful shutdown
   */
  private gracefulShutdown(signal: string): void {
    logger.info(`Graceful shutdown initiated by ${signal}`);

    if (this.server) {
      this.server.close((error?: Error) => {
        if (error) {
          logger.error('Error during server shutdown:', error);
          process.exit(1);
        }

        logger.info('Server shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown - server did not close in time');
        process.exit(1);
      }, 30000);
    } else {
      process.exit(0);
    }
  }

  /**
   * Get Express app instance
   */
  public getApp(): express.Application {
    return this.app;
  }
}

// Create and start the application
const paymentService = new PaymentServiceApp();

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  paymentService.start();
}

export default paymentService;