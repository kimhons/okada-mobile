import { Pool, PoolConfig } from 'pg';
import mongoose, { ConnectOptions } from 'mongoose';
import Redis from 'ioredis';
import { logger } from '../../../shared/utils/logger';

// PostgreSQL Connection
class PostgreSQLConnection {
  private pool: Pool;
  private static instance: PostgreSQLConnection;

  private constructor() {
    const config: PoolConfig = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'okada_auth',
      user: process.env.POSTGRES_USER || 'okada_user',
      password: process.env.POSTGRES_PASSWORD,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
      maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
    };

    this.pool = new Pool(config);

    // Handle pool errors
    this.pool.on('error', (err) => {
      logger.error('PostgreSQL pool error', err);
    });

    // Handle client connection errors
    this.pool.on('connect', () => {
      logger.info('PostgreSQL client connected');
    });

    // Test connection on startup
    this.testConnection();
  }

  public static getInstance(): PostgreSQLConnection {
    if (!PostgreSQLConnection.instance) {
      PostgreSQLConnection.instance = new PostgreSQLConnection();
    }
    return PostgreSQLConnection.instance;
  }

  private async testConnection(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('PostgreSQL connection established successfully');
    } catch (error) {
      logger.error('Failed to connect to PostgreSQL', error as Error);
      process.exit(1);
    }
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;

      if (duration > 1000) {
        logger.warn('Slow PostgreSQL query detected', {
          query: text,
          duration,
          params: params ? '[REDACTED]' : undefined
        });
      }

      return result;
    } catch (error) {
      logger.error('PostgreSQL query error', error as Error, {
        query: text,
        params: params ? '[REDACTED]' : undefined
      });
      throw error;
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
    logger.info('PostgreSQL connection closed');
  }
}

// MongoDB Connection
class MongoDBConnection {
  private static instance: MongoDBConnection;
  private isConnected: boolean = false;

  private constructor() {
    this.connect();
  }

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  private async connect(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/okada_auth';

      const options: ConnectOptions = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
      };

      mongoose.connection.on('connected', () => {
        this.isConnected = true;
        logger.info('MongoDB connected successfully');
      });

      mongoose.connection.on('error', (error) => {
        this.isConnected = false;
        logger.error('MongoDB connection error', error);
      });

      mongoose.connection.on('disconnected', () => {
        this.isConnected = false;
        logger.warn('MongoDB disconnected');
      });

      // Handle application termination
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed due to application termination');
        process.exit(0);
      });

      await mongoose.connect(mongoUri, options);
    } catch (error) {
      logger.error('Failed to connect to MongoDB', error as Error);
      process.exit(1);
    }
  }

  public isReady(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public async close(): Promise<void> {
    await mongoose.connection.close();
    this.isConnected = false;
    logger.info('MongoDB connection closed');
  }
}

// Redis Connection
class RedisConnection {
  private client: Redis;
  private static instance: RedisConnection;

  private constructor() {
    const redisOptions = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectionName: 'okada-auth-service',
    };

    this.client = new Redis(redisOptions);

    this.client.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    this.client.on('error', (error) => {
      logger.error('Redis connection error', error);
    });

    this.client.on('close', () => {
      logger.warn('Redis connection closed');
    });

    // Test connection
    this.testConnection();
  }

  public static getInstance(): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection();
    }
    return RedisConnection.instance;
  }

  private async testConnection(): Promise<void> {
    try {
      await this.client.connect();
      await this.client.ping();
      logger.info('Redis connection established successfully');
    } catch (error) {
      logger.error('Failed to connect to Redis', error as Error);
      process.exit(1);
    }
  }

  public getClient(): Redis {
    return this.client;
  }

  // Helper methods for common operations
  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis SET error', error as Error, { key });
      throw error;
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error', error as Error, { key });
      throw error;
    }
  }

  public async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL error', error as Error, { key });
      throw error;
    }
  }

  public async exists(key: string): Promise<number> {
    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.error('Redis EXISTS error', error as Error, { key });
      throw error;
    }
  }

  public async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Redis INCR error', error as Error, { key });
      throw error;
    }
  }

  public async expire(key: string, seconds: number): Promise<number> {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      logger.error('Redis EXPIRE error', error as Error, { key, seconds });
      throw error;
    }
  }

  public async close(): Promise<void> {
    await this.client.quit();
    logger.info('Redis connection closed');
  }
}

// Database initialization function
export const initializeDatabases = async (): Promise<void> => {
  logger.info('Initializing database connections...');

  // Initialize all connections
  PostgreSQLConnection.getInstance();
  MongoDBConnection.getInstance();
  RedisConnection.getInstance();

  // Wait a bit for connections to establish
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Verify all connections are ready
  const mongodb = MongoDBConnection.getInstance();
  if (!mongodb.isReady()) {
    throw new Error('MongoDB connection is not ready');
  }

  logger.info('All database connections initialized successfully');
};

// Export singleton instances
export const postgres = PostgreSQLConnection.getInstance();
export const mongodb = MongoDBConnection.getInstance();
export const redis = RedisConnection.getInstance();

// Graceful shutdown
export const closeAllConnections = async (): Promise<void> => {
  logger.info('Closing all database connections...');

  await Promise.all([
    postgres.close(),
    mongodb.close(),
    redis.close()
  ]);

  logger.info('All database connections closed');
};