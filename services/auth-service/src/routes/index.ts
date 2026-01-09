import { Router } from 'express';
import { ResponseUtil } from '../../../shared/utils/response';
import authRoutes from './auth';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  ResponseUtil.success(res, {
    service: 'okada-auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  }, 'Service is healthy');
});

// API routes
router.use('/auth', authRoutes);

// 404 handler
router.use('*', (req, res) => {
  ResponseUtil.notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
});

export default router;