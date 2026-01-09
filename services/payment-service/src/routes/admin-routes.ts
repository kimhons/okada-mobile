/**
 * Admin Routes
 * Express routes for administrative operations
 */

import { Router } from 'express';
import { requireAdmin } from '@/middleware/auth';
import { PaymentController } from '@/controllers/payment-controller';

const router = Router();
const paymentController = new PaymentController();

// All admin routes require admin role
router.use(requireAdmin);

// Health check with detailed information
router.get('/health', paymentController.healthCheck);

export default router;