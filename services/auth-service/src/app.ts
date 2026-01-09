import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import 'express-async-errors';

import { logger } from '../../shared/utils/logger';
import { addRequestId } from '../../shared/utils/response';
import { generalRateLimit } from './middleware/rateLimiting';
import {
  globalErrorHandler,
  notFoundHandler,
  timeoutHandler
} from './middleware/errorHandler';
import routes from './routes';
import config from './config';

// Create Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://app.okada.cm',
      'https://merchant.okada.cm'
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.security('CORS blocked request', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Request-ID'
  ]
}));

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Request ID middleware
app.use(addRequestId);

// Request timeout middleware
app.use(timeoutHandler(30000)); // 30 seconds

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    }
  },
  skip: (req, res) => {
    // Skip health check logs in production
    return config.server.env === 'production' && req.path === '/health';
  }
}));

// Rate limiting
app.use(generalRateLimit);

// API routes
app.use(`/api/${config.server.apiVersion}`, routes);

// Health check endpoint (before 404 handler)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is healthy',
    data: {
      service: 'okada-auth-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.server.env,
      uptime: process.uptime()
    }
  });
});

// Metrics endpoint (if enabled)
if (config.monitoring.metricsEnabled) {
  app.get('/metrics', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        environment: config.server.env,
        timestamp: new Date().toISOString()
      }
    });
  });
}

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, starting graceful shutdown...');
  // Server shutdown will be handled in index.ts
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, starting graceful shutdown...');
  // Server shutdown will be handled in index.ts
});

export default app;