/**
 * Payment Routes
 * Express routes for payment operations
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { PaymentController } from '@/controllers/payment-controller';
import { requirePermission } from '@/middleware/auth';

const router = Router();
const paymentController = new PaymentController();

// Validation rules
const paymentValidation = [
  body('orderId').isString().notEmpty().withMessage('Order ID is required'),
  body('customerId').isString().notEmpty().withMessage('Customer ID is required'),
  body('amount').isNumeric().isFloat({ min: 500 }).withMessage('Amount must be at least 500 XAF'),
  body('currency').equals('XAF').withMessage('Only XAF currency is supported'),
  body('provider').isIn(['mtn_mobile_money', 'orange_money', 'cash']).withMessage('Invalid payment provider'),
  body('method').isIn(['mobile_money', 'cash_on_delivery', 'cash_pickup']).withMessage('Invalid payment method'),
  body('description').isString().notEmpty().withMessage('Description is required'),
  body('phoneNumber').optional().isMobilePhone('any').withMessage('Invalid phone number format'),
  body('merchantId').optional().isString(),
  body('callbackUrl').optional().isURL().withMessage('Invalid callback URL'),
  body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date format'),
  body('metadata').optional().isObject()
];

const refundValidation = [
  body('transactionId').isString().notEmpty().withMessage('Transaction ID is required'),
  body('amount').optional().isNumeric().isFloat({ min: 1 }).withMessage('Refund amount must be positive'),
  body('reason').isString().notEmpty().withMessage('Refund reason is required'),
  body('metadata').optional().isObject()
];

const ussdValidation = [
  body('orderId').isString().notEmpty().withMessage('Order ID is required'),
  body('customerId').isString().notEmpty().withMessage('Customer ID is required'),
  body('amount').isNumeric().isFloat({ min: 500 }).withMessage('Amount must be at least 500 XAF'),
  body('currency').equals('XAF').withMessage('Only XAF currency is supported'),
  body('provider').isIn(['mtn_mobile_money', 'orange_money']).withMessage('Invalid USSD provider'),
  body('phoneNumber').isMobilePhone('any').withMessage('Phone number is required for USSD'),
  body('description').isString().notEmpty().withMessage('Description is required')
];

// Payment endpoints
router.post(
  '/process',
  requirePermission('payment:process'),
  paymentValidation,
  paymentController.processPayment
);

router.get(
  '/status/:transactionId',
  requirePermission('payment:read'),
  param('transactionId').isString().notEmpty().withMessage('Transaction ID is required'),
  query('provider').isIn(['mtn_mobile_money', 'orange_money', 'cash']).withMessage('Provider is required'),
  paymentController.getPaymentStatus
);

router.post(
  '/refund',
  requirePermission('payment:refund'),
  refundValidation,
  paymentController.processRefund
);

router.get(
  '/methods',
  requirePermission('payment:read'),
  query('phoneNumber').optional().isMobilePhone('any').withMessage('Invalid phone number format'),
  query('amount').optional().isNumeric().isFloat({ min: 1 }).withMessage('Amount must be positive'),
  paymentController.getPaymentMethods
);

// USSD endpoints
router.post(
  '/ussd/initiate',
  requirePermission('payment:process'),
  ussdValidation,
  paymentController.initiateUSSDPayment
);

router.post(
  '/ussd/:sessionId/input',
  requirePermission('payment:process'),
  param('sessionId').isString().notEmpty().withMessage('Session ID is required'),
  body('input').isString().notEmpty().withMessage('Input is required'),
  paymentController.processUSSDInput
);

export default router;