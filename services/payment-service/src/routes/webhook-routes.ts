/**
 * Webhook Routes
 * Express routes for payment provider webhooks
 */

import { Router } from 'express';
import { PaymentController } from '@/controllers/payment-controller';

const router = Router();
const paymentController = new PaymentController();

// MTN Mobile Money webhook
router.post('/mtn', paymentController.handleMTNWebhook);

// Orange Money webhook
router.post('/orange', paymentController.handleOrangeWebhook);

export default router;