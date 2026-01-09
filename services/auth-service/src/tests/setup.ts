import { MongoMemoryServer } from 'mongodb-memory-server';
import { RedisMemoryServer } from 'redis-memory-server';
import { Pool } from 'pg';
import mongoose from 'mongoose';
import Redis from 'ioredis';

// Test database instances
let mongoServer: MongoMemoryServer;
let redisServer: RedisMemoryServer;
let postgresPool: Pool;
let redisClient: Redis;

// Setup before all tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-at-least-64-characters-long-for-security';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-jwt-secret-key-that-is-at-least-64-characters-long-for-security';
  process.env.BCRYPT_ROUNDS = '4'; // Faster for tests
  process.env.OTP_EXPIRY_MINUTES = '1'; // Shorter for tests

  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;

  // Start Redis Memory Server
  redisServer = new RedisMemoryServer();
  const redisHost = await redisServer.getHost();
  const redisPort = await redisServer.getPort();
  process.env.REDIS_HOST = redisHost;
  process.env.REDIS_PORT = redisPort.toString();

  // Setup test PostgreSQL (you might want to use a test database)
  process.env.POSTGRES_HOST = 'localhost';
  process.env.POSTGRES_PORT = '5433'; // Different port for test
  process.env.POSTGRES_DB = 'okada_auth_test';
  process.env.POSTGRES_USER = 'test_user';
  process.env.POSTGRES_PASSWORD = 'test_password';

  // Connect to test databases
  await mongoose.connect(mongoUri);

  redisClient = new Redis({
    host: redisHost,
    port: redisPort,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 1,
  });

  // Note: PostgreSQL setup would need actual test database
  // For now, we'll mock database calls in tests
});

// Cleanup after all tests
afterAll(async () => {
  // Close connections
  await mongoose.connection.close();
  await redisClient.quit();

  // Stop servers
  await mongoServer.stop();
  await redisServer.stop();

  if (postgresPool) {
    await postgresPool.end();
  }
});

// Clean up before each test
beforeEach(async () => {
  // Clear MongoDB collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  // Clear Redis
  await redisClient.flushall();
});

// Export for use in tests
export {
  mongoServer,
  redisServer,
  redisClient
};