/**
 * MTN Mobile Money Client Tests
 * Unit tests for MTN Mobile Money API integration
 */

import nock from 'nock';
import { MTNMobileMoneyClient } from '@/providers/mtn/client';
import { PaymentProvider, TransactionStatus, ProviderError, TimeoutError, NetworkError } from '@/types';
import { createMockPaymentRequest, mockAxiosResponse, mockAxiosError, TEST_CONSTANTS } from '../../../setup';

describe('MTNMobileMoneyClient', () => {
  let mtnClient: MTNMobileMoneyClient;
  const baseURL = 'https://sandbox.momodeveloper.mtn.com';

  beforeEach(() => {
    mtnClient = new MTNMobileMoneyClient();

    // Set up environment variables for tests
    process.env.MTN_API_BASE_URL = baseURL;
    process.env.MTN_API_USER_ID = 'test-user-id';
    process.env.MTN_API_KEY = 'test-api-key';
    process.env.MTN_PRIMARY_KEY = 'test-primary-key';
    process.env.MTN_COLLECTION_SUBSCRIPTION_KEY = 'test-subscription-key';

    // Clean up any existing nock interceptors
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('authenticate', () => {
    it('should successfully authenticate and store access token', async () => {
      const tokenResponse = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600
      };

      nock(baseURL)
        .post('/collection/token/')
        .reply(200, tokenResponse);

      await mtnClient.authenticate();

      // Access token should be stored (we can't directly access it, but subsequent requests should work)
      expect(nock.isDone()).toBe(true);
    });

    it('should handle authentication failure', async () => {
      nock(baseURL)
        .post('/collection/token/')
        .reply(401, { error: 'Unauthorized' });

      await expect(mtnClient.authenticate()).rejects.toThrow(ProviderError);
    });

    it('should handle network errors during authentication', async () => {
      nock(baseURL)
        .post('/collection/token/')
        .replyWithError('ECONNREFUSED');

      await expect(mtnClient.authenticate()).rejects.toThrow(ProviderError);
    });
  });

  describe('requestToPay', () => {
    beforeEach(async () => {
      // Mock authentication
      nock(baseURL)
        .post('/collection/token/')
        .reply(200, {
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600
        });
    });

    it('should successfully initiate payment request', async () => {
      const paymentRequest = createMockPaymentRequest({
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: PaymentProvider.MTN_MOBILE_MONEY
      });

      nock(baseURL)
        .post('/collection/v1_0/requesttopay')
        .reply(202, {});

      const response = await mtnClient.requestToPay(paymentRequest);

      expect(response).toMatchObject({
        status: TransactionStatus.PENDING,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        provider: PaymentProvider.MTN_MOBILE_MONEY,
        ussdCode: '*126#'
      });

      expect(response.transactionId).toBeDefined();
      expect(response.message).toContain('MTN Mobile Money prompt');
    });

    it('should handle phone number formatting', async () => {
      const paymentRequest = createMockPaymentRequest({
        phoneNumber: '237650123456', // With country code
        provider: PaymentProvider.MTN_MOBILE_MONEY
      });

      let requestBody: any;
      nock(baseURL)
        .post('/collection/v1_0/requesttopay', (body) => {
          requestBody = body;
          return true;
        })
        .reply(202, {});

      await mtnClient.requestToPay(paymentRequest);

      expect(requestBody.payer.partyId).toBe('650123456'); // Country code removed
    });

    it('should handle API errors', async () => {
      const paymentRequest = createMockPaymentRequest({
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: PaymentProvider.MTN_MOBILE_MONEY
      });

      nock(baseURL)
        .post('/collection/v1_0/requesttopay')
        .reply(400, { error: 'Invalid request' });

      await expect(mtnClient.requestToPay(paymentRequest)).rejects.toThrow(ProviderError);
    });

    it('should handle timeout errors', async () => {
      const paymentRequest = createMockPaymentRequest({
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: PaymentProvider.MTN_MOBILE_MONEY
      });

      nock(baseURL)
        .post('/collection/v1_0/requesttopay')
        .replyWithError({ code: 'ECONNABORTED' });

      await expect(mtnClient.requestToPay(paymentRequest)).rejects.toThrow(TimeoutError);
    });

    it('should handle network connection errors', async () => {
      const paymentRequest = createMockPaymentRequest({
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: PaymentProvider.MTN_MOBILE_MONEY
      });

      nock(baseURL)
        .post('/collection/v1_0/requesttopay')
        .replyWithError({ code: 'ECONNREFUSED' });

      await expect(mtnClient.requestToPay(paymentRequest)).rejects.toThrow(NetworkError);
    });

    it('should reject unexpected response status', async () => {
      const paymentRequest = createMockPaymentRequest({
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: PaymentProvider.MTN_MOBILE_MONEY
      });

      nock(baseURL)
        .post('/collection/v1_0/requesttopay')
        .reply(200, {}); // Should be 202

      await expect(mtnClient.requestToPay(paymentRequest)).rejects.toThrow(ProviderError);
    });
  });

  describe('getTransactionStatus', () => {
    beforeEach(async () => {
      // Mock authentication
      nock(baseURL)
        .post('/collection/token/')
        .reply(200, {
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600
        });
    });

    it('should return correct status for successful transaction', async () => {
      const referenceId = 'test-reference-id';

      nock(baseURL)
        .get(`/collection/v1_0/requesttopay/${referenceId}`)
        .reply(200, {
          status: 'SUCCESSFUL',
          amount: '10000',
          currency: 'XAF'
        });

      const status = await mtnClient.getTransactionStatus(referenceId);

      expect(status).toBe(TransactionStatus.COMPLETED);
    });

    it('should return correct status for pending transaction', async () => {
      const referenceId = 'test-reference-id';

      nock(baseURL)
        .get(`/collection/v1_0/requesttopay/${referenceId}`)
        .reply(200, {
          status: 'PENDING',
          amount: '10000',
          currency: 'XAF'
        });

      const status = await mtnClient.getTransactionStatus(referenceId);

      expect(status).toBe(TransactionStatus.PENDING);
    });

    it('should return failed status for non-existent transaction', async () => {
      const referenceId = 'non-existent-reference';

      nock(baseURL)
        .get(`/collection/v1_0/requesttopay/${referenceId}`)
        .reply(404, { error: 'Transaction not found' });

      const status = await mtnClient.getTransactionStatus(referenceId);

      expect(status).toBe(TransactionStatus.FAILED);
    });

    it('should handle API errors during status check', async () => {
      const referenceId = 'test-reference-id';

      nock(baseURL)
        .get(`/collection/v1_0/requesttopay/${referenceId}`)
        .reply(500, { error: 'Internal server error' });

      await expect(mtnClient.getTransactionStatus(referenceId)).rejects.toThrow(ProviderError);
    });
  });

  describe('getTransactionDetails', () => {
    beforeEach(async () => {
      // Mock authentication
      nock(baseURL)
        .post('/collection/token/')
        .reply(200, {
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600
        });
    });

    it('should return transaction details', async () => {
      const referenceId = 'test-reference-id';
      const expectedDetails = {
        financialTransactionId: 'mtn-txn-123',
        externalId: 'order-123',
        amount: '10000',
        currency: 'XAF',
        status: 'SUCCESSFUL',
        payer: {
          partyIdType: 'MSISDN',
          partyId: '650123456'
        }
      };

      nock(baseURL)
        .get(`/collection/v1_0/requesttopay/${referenceId}`)
        .reply(200, expectedDetails);

      const details = await mtnClient.getTransactionDetails(referenceId);

      expect(details).toEqual(expectedDetails);
    });

    it('should handle errors when fetching transaction details', async () => {
      const referenceId = 'test-reference-id';

      nock(baseURL)
        .get(`/collection/v1_0/requesttopay/${referenceId}`)
        .reply(403, { error: 'Access forbidden' });

      await expect(mtnClient.getTransactionDetails(referenceId)).rejects.toThrow(ProviderError);
    });
  });

  describe('getAccountBalance', () => {
    beforeEach(async () => {
      // Mock authentication
      nock(baseURL)
        .post('/collection/token/')
        .reply(200, {
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600
        });
    });

    it('should return account balance', async () => {
      const expectedBalance = {
        availableBalance: '50000',
        currency: 'XAF'
      };

      nock(baseURL)
        .get('/collection/v1_0/account/balance')
        .reply(200, expectedBalance);

      const balance = await mtnClient.getAccountBalance();

      expect(balance).toEqual(expectedBalance);
    });

    it('should handle errors when fetching balance', async () => {
      nock(baseURL)
        .get('/collection/v1_0/account/balance')
        .reply(401, { error: 'Unauthorized' });

      await expect(mtnClient.getAccountBalance()).rejects.toThrow(ProviderError);
    });
  });

  describe('processRefund', () => {
    beforeEach(async () => {
      // Mock authentication
      nock(baseURL)
        .post('/collection/token/')
        .reply(200, {
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600
        });
    });

    it('should process refund successfully', async () => {
      const refundRequest = {
        transactionId: 'test-transaction-id',
        amount: 5000,
        reason: 'Customer request',
        metadata: {}
      };

      // Mock getting original transaction details
      nock(baseURL)
        .get(`/collection/v1_0/requesttopay/${refundRequest.transactionId}`)
        .reply(200, {
          amount: '10000',
          currency: 'XAF',
          payer: {
            partyIdType: 'MSISDN',
            partyId: '650123456'
          }
        });

      // Mock disbursement API
      nock(baseURL)
        .post('/disbursement/v1_0/transfer')
        .reply(202, {});

      const response = await mtnClient.processRefund(refundRequest);

      expect(response).toMatchObject({
        transactionId: refundRequest.transactionId,
        status: TransactionStatus.PENDING,
        amount: refundRequest.amount,
        provider: PaymentProvider.MTN_MOBILE_MONEY,
        reason: refundRequest.reason
      });

      expect(response.refundId).toBeDefined();
    });

    it('should handle refund API errors', async () => {
      const refundRequest = {
        transactionId: 'test-transaction-id',
        reason: 'Customer request'
      };

      // Mock getting original transaction details
      nock(baseURL)
        .get(`/collection/v1_0/requesttopay/${refundRequest.transactionId}`)
        .reply(200, {
          amount: '10000',
          currency: 'XAF',
          payer: {
            partyIdType: 'MSISDN',
            partyId: '650123456'
          }
        });

      // Mock disbursement API error
      nock(baseURL)
        .post('/disbursement/v1_0/transfer')
        .reply(400, { error: 'Invalid transfer request' });

      await expect(mtnClient.processRefund(refundRequest)).rejects.toThrow(ProviderError);
    });
  });

  describe('validateWebhookSignature', () => {
    it('should validate correct webhook signature', () => {
      const payload = JSON.stringify({ transactionId: 'test', status: 'SUCCESSFUL' });
      const secret = 'webhook-secret';

      // Generate a valid signature
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      const isValid = mtnClient.validateWebhookSignature(payload, expectedSignature);

      expect(isValid).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const payload = JSON.stringify({ transactionId: 'test', status: 'SUCCESSFUL' });
      const invalidSignature = 'invalid-signature';

      const isValid = mtnClient.validateWebhookSignature(payload, invalidSignature);

      expect(isValid).toBe(false);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when service is operational', async () => {
      // Mock authentication
      nock(baseURL)
        .post('/collection/token/')
        .reply(200, {
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600
        });

      // Mock balance check
      nock(baseURL)
        .get('/collection/v1_0/account/balance')
        .reply(200, {
          availableBalance: '50000',
          currency: 'XAF'
        });

      const health = await mtnClient.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.details).toBeUndefined();
    });

    it('should return unhealthy status when service is down', async () => {
      // Mock authentication failure
      nock(baseURL)
        .post('/collection/token/')
        .reply(500, { error: 'Service unavailable' });

      const health = await mtnClient.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.details).toBeDefined();
      expect(health.details.error).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle different HTTP error codes appropriately', async () => {
      const testCases = [
        { status: 400, expectedError: ProviderError },
        { status: 401, expectedError: ProviderError },
        { status: 403, expectedError: ProviderError },
        { status: 404, expectedError: ProviderError },
        { status: 409, expectedError: ProviderError },
        { status: 500, expectedError: ProviderError }
      ];

      for (const testCase of testCases) {
        // Mock authentication
        nock.cleanAll();
        nock(baseURL)
          .post('/collection/token/')
          .reply(200, {
            access_token: 'test-access-token',
            token_type: 'Bearer',
            expires_in: 3600
          });

        nock(baseURL)
          .get('/collection/v1_0/account/balance')
          .reply(testCase.status, { error: 'Test error' });

        await expect(mtnClient.getAccountBalance()).rejects.toThrow(testCase.expectedError);
      }
    });

    it('should mask phone numbers in logs', () => {
      const client = new MTNMobileMoneyClient();
      const maskPhoneNumber = (client as any).maskPhoneNumber;

      expect(maskPhoneNumber('+237650123456')).toBe('**********3456');
      expect(maskPhoneNumber('123')).toBe('123'); // Short numbers unchanged
    });

    it('should format phone numbers correctly', () => {
      const client = new MTNMobileMoneyClient();
      const formatPhoneNumber = (client as any).formatPhoneNumber;

      expect(formatPhoneNumber('+237650123456')).toBe('650123456');
      expect(formatPhoneNumber('237650123456')).toBe('650123456');
      expect(formatPhoneNumber('650123456')).toBe('650123456');
    });
  });
});