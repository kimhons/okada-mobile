/**
 * Test Setup
 * Global test configuration and setup for payment service tests
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import { RedisMemoryServer } from 'redis-memory-server';

// Global test variables
let mongoServer: MongoMemoryServer;
let redisServer: RedisMemoryServer;

// Setup before all tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URL = mongoUri;

  // Start in-memory Redis
  redisServer = new RedisMemoryServer();
  const redisHost = await redisServer.getHost();
  const redisPort = await redisServer.getPort();
  process.env.REDIS_URL = `redis://${redisHost}:${redisPort}`;

  // Set test-specific environment variables
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters';
  process.env.MTN_API_USER_ID = 'test-mtn-user-id';
  process.env.MTN_API_KEY = 'test-mtn-api-key';
  process.env.MTN_PRIMARY_KEY = 'test-mtn-primary-key';
  process.env.ORANGE_MERCHANT_KEY = 'test-orange-merchant-key';
  process.env.ORANGE_CLIENT_ID = 'test-orange-client-id';
  process.env.ORANGE_CLIENT_SECRET = 'test-orange-client-secret';
  process.env.FRAUD_DETECTION_ENABLED = 'true';
  process.env.CEMAC_COMPLIANCE_ENABLED = 'true';

  // Suppress console logs during tests
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

// Cleanup after all tests
afterAll(async () => {
  // Stop in-memory servers
  if (mongoServer) {
    await mongoServer.stop();
  }

  if (redisServer) {
    await redisServer.stop();
  }

  // Restore console
  jest.restoreAllMocks();
});

// Clear all mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});

// Global test helpers
export const createMockPaymentRequest = (overrides = {}) => ({
  orderId: 'test-order-123',
  customerId: 'test-customer-456',
  amount: 10000,
  currency: 'XAF',
  provider: 'mtn_mobile_money',
  method: 'mobile_money',
  description: 'Test payment',
  phoneNumber: '+237650123456',
  merchantId: 'test-merchant-789',
  metadata: { test: true },
  ...overrides
});

export const createMockTransaction = (overrides = {}) => ({
  id: 'test-transaction-123',
  orderId: 'test-order-123',
  customerId: 'test-customer-456',
  type: 'payment',
  status: 'pending',
  amount: 10000,
  currency: 'XAF',
  provider: 'mtn_mobile_money',
  method: 'mobile_money',
  reference: 'OKD-MTN-test-order-123-ref',
  description: 'Test payment',
  phoneNumber: '+237650123456',
  fees: 150,
  taxes: 28,
  commission: 250,
  netAmount: 10428,
  metadata: { test: true },
  retryCount: 0,
  maxRetries: 3,
  webhookAttempts: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockJWTPayload = (overrides = {}) => ({
  userId: 'test-user-123',
  role: 'merchant',
  merchantId: 'test-merchant-789',
  permissions: ['payment:process', 'payment:read', 'payment:refund'],
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  iat: Math.floor(Date.now() / 1000),
  ...overrides
});

export const mockAxiosResponse = (data: any, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {}
});

export const mockAxiosError = (message: string, status = 500, code?: string) => {
  const error = new Error(message) as any;
  error.response = {
    status,
    statusText: 'Error',
    data: { error: message }
  };
  error.code = code;
  return error;
};

// Test constants
export const TEST_CONSTANTS = {
  CAMEROON_PHONE_NUMBERS: {
    MTN: '+237650123456',
    ORANGE: '+237690123456',
    INVALID: '+1234567890'
  },
  AMOUNTS: {
    MIN: 500,
    VALID: 10000,
    MAX: 1000000,
    INVALID: 100
  },
  CURRENCIES: {
    VALID: 'XAF',
    INVALID: 'USD'
  },
  PROVIDERS: {
    MTN: 'mtn_mobile_money',
    ORANGE: 'orange_money',
    CASH: 'cash'
  },
  METHODS: {
    MOBILE_MONEY: 'mobile_money',
    CASH_ON_DELIVERY: 'cash_on_delivery',
    CASH_PICKUP: 'cash_pickup'
  },
  STATUSES: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  }
};

export default {
  createMockPaymentRequest,
  createMockTransaction,
  createMockJWTPayload,
  mockAxiosResponse,
  mockAxiosError,
  TEST_CONSTANTS
};