import http from 'http';
import { logger } from '../../shared/utils/logger';
import { initializeDatabases } from './config/database';
import { MigrationRunner } from './database/migrations/run';
import {
  handleUncaughtException,
  handleUnhandledRejection,
  handleGracefulShutdown
} from './middleware/errorHandler';
import { cleanupRateLimitData } from './middleware/rateLimiting';
import { VerificationService } from './services/VerificationService';
import { SessionModel } from './models/Session';
import { JWTService } from './services/JWTService';
import app from './app';
import config from './config';
import cron from 'node-cron';

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

// Create HTTP server
const server = http.createServer(app);

// Setup graceful shutdown
handleGracefulShutdown(server);

// Background cleanup tasks
const setupCleanupTasks = (): void => {
  // Cleanup expired verification codes every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const cleaned = await VerificationService.cleanupExpiredCodes();
      if (cleaned > 0) {
        logger.info('Verification codes cleanup completed', { cleaned });
      }
    } catch (error) {
      logger.error('Verification codes cleanup failed', error as Error);
    }
  });

  // Cleanup expired sessions every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      const cleaned = await SessionModel.cleanupExpired();
      if (cleaned > 0) {
        logger.info('Expired sessions cleanup completed', { cleaned });
      }
    } catch (error) {
      logger.error('Session cleanup failed', error as Error);
    }
  });

  // Delete old sessions daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      const deleted = await SessionModel.deleteOldSessions(30); // 30 days
      if (deleted > 0) {
        logger.info('Old sessions deletion completed', { deleted });
      }
    } catch (error) {
      logger.error('Old sessions deletion failed', error as Error);
    }
  });

  // Cleanup rate limit data every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      const cleaned = await cleanupRateLimitData();
      if (cleaned > 0) {
        logger.info('Rate limit data cleanup completed', { cleaned });
      }
    } catch (error) {
      logger.error('Rate limit data cleanup failed', error as Error);
    }
  });

  // Cleanup expired JWT tokens every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const cleaned = await JWTService.cleanupExpiredTokens();
      if (cleaned > 0) {
        logger.info('Expired JWT tokens cleanup completed', { cleaned });
      }
    } catch (error) {
      logger.error('JWT tokens cleanup failed', error as Error);
    }
  });

  // Security monitoring - check for suspicious sessions every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      const suspiciousSessions = await SessionModel.findSuspiciousSessions();
      if (suspiciousSessions.length > 0) {
        logger.security('Suspicious sessions detected during monitoring', {
          count: suspiciousSessions.length,
          sessions: suspiciousSessions.map(s => ({
            userId: s.userId,
            ipAddress: s.ipAddress,
            createdAt: s.createdAt
          }))
        });
      }
    } catch (error) {
      logger.error('Security monitoring failed', error as Error);
    }
  });

  logger.info('Background cleanup tasks scheduled');
};

// Application startup
const startServer = async (): Promise<void> => {
  try {
    logger.info('Starting Okada Auth Service...', {
      environment: config.server.env,
      port: config.server.port,
      version: process.env.npm_package_version || '1.0.0'
    });

    // Initialize database connections
    await initializeDatabases();

    // Run database migrations
    const migrationRunner = new MigrationRunner();
    await migrationRunner.runMigrations();

    // Setup background tasks
    setupCleanupTasks();

    // Start server
    server.listen(config.server.port, () => {
      logger.info('Okada Auth Service started successfully', {
        port: config.server.port,
        environment: config.server.env,
        processId: process.pid
      });

      // Log initial service statistics
      logServiceStatistics();
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof config.server.port === 'string'
        ? 'Pipe ' + config.server.port
        : 'Port ' + config.server.port;

      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
};

// Log service statistics
const logServiceStatistics = async (): Promise<void> => {
  try {
    const [sessionStats, verificationStats] = await Promise.all([
      SessionModel.getSessionStatistics(),
      VerificationService.getVerificationStats(24)
    ]);

    logger.info('Service statistics', {
      sessions: sessionStats,
      verifications: verificationStats,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    });
  } catch (error) {
    logger.warn('Failed to log service statistics', { error: (error as Error).message });
  }
};

// Start the server
startServer().catch((error) => {
  logger.error('Startup failed', error);
  process.exit(1);
});

// Export for testing
export { server, app };
export default app;