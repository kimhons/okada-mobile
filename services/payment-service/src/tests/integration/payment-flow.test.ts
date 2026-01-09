/**
 * Payment Flow Integration Tests
 * End-to-end integration tests for payment workflows
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';
import nock from 'nock';
import paymentService from '@/index';
import { createMockJWTPayload, createMockPaymentRequest, TEST_CONSTANTS } from '../setup';

describe('Payment Flow Integration Tests', () => {
  const app = paymentService.getApp();
  let authToken: string;

  beforeEach(() => {
    // Create a valid JWT token for testing
    const payload = createMockJWTPayload();
    authToken = jwt.sign(payload, process.env.JWT_SECRET || 'test-secret');

    // Clean up nock interceptors
    nock.cleanAll();

    // Mock MTN authentication
    nock('https://sandbox.momodeveloper.mtn.com')
      .post('/collection/token/')
      .reply(200, {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600
      })
      .persist();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Complete MTN Mobile Money Payment Flow', () => {
    it('should process complete payment flow successfully', async () => {
      const paymentRequest = createMockPaymentRequest({
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: TEST_CONSTANTS.PROVIDERS.MTN,
        amount: TEST_CONSTANTS.AMOUNTS.VALID
      });

      // Mock MTN request to pay
      nock('https://sandbox.momodeveloper.mtn.com')
        .post('/collection/v1_0/requesttopay')
        .reply(202, {});

      // Step 1: Initiate payment
      const paymentResponse = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentRequest)
        .expect(200);

      expect(paymentResponse.body.success).toBe(true);
      expect(paymentResponse.body.data).toMatchObject({
        status: 'pending',
        amount: paymentRequest.amount,
        provider: paymentRequest.provider,
        ussdCode: '*126#'
      });

      const transactionId = paymentResponse.body.data.transactionId;

      // Mock MTN status check
      nock('https://sandbox.momodeveloper.mtn.com')
        .get(`/collection/v1_0/requesttopay/${transactionId}`)
        .reply(200, {
          status: 'SUCCESSFUL',
          amount: paymentRequest.amount.toString(),
          currency: 'XAF'
        });

      // Step 2: Check payment status
      const statusResponse = await request(app)
        .get(`/api/payments/status/${transactionId}`)
        .query({ provider: TEST_CONSTANTS.PROVIDERS.MTN })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(statusResponse.body.success).toBe(true);
      expect(statusResponse.body.data.status).toBe('completed');
    });

    it('should handle payment failure correctly', async () => {
      const paymentRequest = createMockPaymentRequest({
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: TEST_CONSTANTS.PROVIDERS.MTN
      });

      // Mock MTN API failure
      nock('https://sandbox.momodeveloper.mtn.com')
        .post('/collection/v1_0/requesttopay')
        .reply(400, { error: 'Insufficient funds' });

      const response = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentRequest)
        .expect(502);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PROVIDER_ERROR');
    });
  });

  describe('Authentication and Authorization', () => {
    it('should reject requests without authorization token', async () => {
      const paymentRequest = createMockPaymentRequest();

      const response = await request(app)
        .post('/api/payments/process')
        .send(paymentRequest)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    it('should reject requests with invalid token', async () => {
      const paymentRequest = createMockPaymentRequest();

      const response = await request(app)
        .post('/api/payments/process')
        .set('Authorization', 'Bearer invalid-token')
        .send(paymentRequest)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should reject requests with expired token', async () => {
      const expiredPayload = createMockJWTPayload({
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      });
      const expiredToken = jwt.sign(expiredPayload, process.env.JWT_SECRET || 'test-secret');

      const paymentRequest = createMockPaymentRequest();

      const response = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send(paymentRequest)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TOKEN_EXPIRED');
    });
  });

  describe('Input Validation', () => {
    it('should validate required fields', async () => {
      const invalidRequest = {
        // Missing required fields
        amount: 'invalid-amount'
      };

      const response = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate amount limits', async () => {
      const invalidRequest = createMockPaymentRequest({
        amount: TEST_CONSTANTS.AMOUNTS.INVALID // Below minimum
      });

      const response = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate phone number format', async () => {
      const invalidRequest = createMockPaymentRequest({
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.INVALID
      });

      const response = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Fraud Detection Integration', () => {
    it('should block high-risk transactions', async () => {
      const highRiskRequest = createMockPaymentRequest({
        amount: 2000000, // Very high amount
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: TEST_CONSTANTS.PROVIDERS.ORANGE // Operator mismatch
      });

      const response = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .set('User-Agent', 'bot-user-agent') // Suspicious user agent
        .send(highRiskRequest)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FRAUD_DETECTED');
    });
  });

  describe('Payment Methods Endpoint', () => {
    it('should return available payment methods', async () => {
      const response = await request(app)
        .get('/api/payments/methods')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
          amount: TEST_CONSTANTS.AMOUNTS.VALID
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);

      const mtnMethod = response.body.data.find(
        (method: any) => method.provider === 'mtn_mobile_money'
      );
      expect(mtnMethod).toBeDefined();
      expect(mtnMethod.available).toBe(true);
    });

    it('should filter methods based on phone number compatibility', async () => {
      const response = await request(app)
        .get('/api/payments/methods')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.ORANGE,
          amount: TEST_CONSTANTS.AMOUNTS.VALID
        })
        .expect(200);

      const mtnMethod = response.body.data.find(
        (method: any) => method.provider === 'mtn_mobile_money'
      );
      const orangeMethod = response.body.data.find(
        (method: any) => method.provider === 'orange_money'
      );

      expect(mtnMethod.available).toBe(false);
      expect(orangeMethod.available).toBe(true);
    });
  });

  describe('Health Check Endpoint', () => {
    it('should return health status', async () => {
      // Mock provider health checks
      nock('https://api.orange.com')
        .post('/orange-money-webpay/cm/v1/token')
        .reply(200, {
          access_token: 'test-token',
          token_type: 'Bearer',
          expires_in: 3600
        });

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'payment-service',
        uptime: expect.any(Number)
      });
    });
  });

  describe('USSD Payment Flow', () => {
    it('should initiate USSD payment session', async () => {
      const ussdRequest = createMockPaymentRequest({
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: TEST_CONSTANTS.PROVIDERS.MTN
      });

      const response = await request(app)
        .post('/api/payments/ussd/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ussdRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        status: 'pending',
        ussdCode: '*126#',
        message: expect.stringContaining('USSD')
      });

      const sessionId = response.body.data.externalTransactionId;
      expect(sessionId).toBeDefined();
    });

    it('should process USSD input', async () => {
      // First initiate USSD session
      const ussdRequest = createMockPaymentRequest({
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: TEST_CONSTANTS.PROVIDERS.MTN
      });

      const initResponse = await request(app)
        .post('/api/payments/ussd/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ussdRequest)
        .expect(200);

      const sessionId = initResponse.body.data.externalTransactionId;

      // Then process input
      const inputResponse = await request(app)
        .post(`/api/payments/ussd/${sessionId}/input`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ input: '1' })
        .expect(200);

      expect(inputResponse.body.success).toBe(true);
      expect(inputResponse.body.data).toMatchObject({
        message: expect.any(String),
        endSession: expect.any(Boolean)
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle internal server errors gracefully', async () => {
      // Mock an internal error by making the MTN authentication fail unexpectedly
      nock.cleanAll();
      nock('https://sandbox.momodeveloper.mtn.com')
        .post('/collection/token/')
        .replyWithError('Unexpected error');

      const paymentRequest = createMockPaymentRequest({
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: TEST_CONSTANTS.PROVIDERS.MTN
      });

      const response = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentRequest)
        .expect(502);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PROVIDER_ERROR');
      expect(response.body.meta.requestId).toBeDefined();
    });

    it('should include correlation ID in all responses', async () => {
      const paymentRequest = createMockPaymentRequest();

      const response = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Request-ID', 'test-correlation-id')
        .send(paymentRequest);

      expect(response.headers['x-request-id']).toBe('test-correlation-id');
      expect(response.body.meta.requestId).toBe('test-correlation-id');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const paymentRequest = createMockPaymentRequest();

      // Make multiple requests quickly to trigger rate limiting
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/payments/process')
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentRequest)
      );

      const responses = await Promise.all(requests);

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});