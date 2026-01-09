/**
 * Okada Payment Service - Configuration
 * Centralized configuration management for all payment providers and services
 */

import dotenv from 'dotenv';
import { CurrencyCode, PaymentProvider } from '@/types';

// Load environment variables
dotenv.config();

interface DatabaseConfig {
  postgresql: {
    url: string;
    options: {
      ssl: boolean;
      connectionTimeoutMillis: number;
      idleTimeoutMillis: number;
      max: number;
      min: number;
    };
  };
  redis: {
    url: string;
    password?: string;
    options: {
      retryDelayOnFailover: number;
      maxRetriesPerRequest: number;
      lazyConnect: boolean;
    };
  };
  mongodb: {
    url: string;
    options: {
      maxPoolSize: number;
      serverSelectionTimeoutMS: number;
      socketTimeoutMS: number;
    };
  };
}

interface ServerConfig {
  port: number;
  env: string;
  serviceName: string;
  logLevel: string;
}

interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

interface MTNConfig {
  baseUrl: string;
  apiUserId: string;
  apiKey: string;
  primaryKey: string;
  secondaryKey: string;
  collectionSubscriptionKey: string;
  disbursementSubscriptionKey: string;
  remittanceSubscriptionKey: string;
  callbackUrl: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

interface OrangeConfig {
  baseUrl: string;
  merchantKey: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  cancelUrl: string;
  notificationUrl: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

interface SMSConfig {
  provider: 'twilio';
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  defaultCountryCode: '+237';
}

interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: {
    email: string;
    name: string;
  };
}

interface SecurityConfig {
  encryptionKey: string;
  hashSaltRounds: number;
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
  };
}

interface FraudDetectionConfig {
  enabled: boolean;
  maxDailyTransactionAmount: number;
  maxSingleTransactionAmount: number;
  suspiciousVelocityThreshold: number;
  riskScoreThreshold: number;
  ipWhitelist: string[];
  blacklistedPhones: string[];
}

interface PaymentConfig {
  defaultCurrency: CurrencyCode;
  transactionTimeoutMs: number;
  maxRetryAttempts: number;
  retryDelayMs: number;
  providers: {
    [PaymentProvider.MTN_MOBILE_MONEY]: {
      enabled: boolean;
      minAmount: number;
      maxAmount: number;
      fees: {
        fixed: number;
        percentage: number;
        maxFee: number;
      };
    };
    [PaymentProvider.ORANGE_MONEY]: {
      enabled: boolean;
      minAmount: number;
      maxAmount: number;
      fees: {
        fixed: number;
        percentage: number;
        maxFee: number;
      };
    };
    [PaymentProvider.CASH]: {
      enabled: boolean;
      minAmount: number;
      maxAmount: number;
      fees: {
        fixed: number;
        percentage: number;
        maxFee: number;
      };
    };
  };
}

interface CameroonConfig {
  cemacCompliance: {
    enabled: boolean;
    transactionLimit: number;
    dailyLimit: number;
    monthlyLimit: number;
    kycThreshold: number;
  };
  taxation: {
    vatRate: number;
    municipalTaxRate: number;
    commissionRate: number;
  };
  settlement: {
    delayHours: number;
    businessDays: number[];
    holidayDates: string[];
  };
  ussd: {
    [PaymentProvider.MTN_MOBILE_MONEY]: {
      code: string;
      timeout: number;
    };
    [PaymentProvider.ORANGE_MONEY]: {
      code: string;
      timeout: number;
    };
  };
}

interface MonitoringConfig {
  enableMetrics: boolean;
  enableTracing: boolean;
  sentryDsn?: string;
  healthCheck: {
    timeoutMs: number;
    intervalMs: number;
  };
}

interface ExternalServicesConfig {
  auditService: {
    url: string;
    timeout: number;
  };
  notificationService: {
    url: string;
    timeout: number;
  };
  userService: {
    url: string;
    timeout: number;
  };
  orderService: {
    url: string;
    timeout: number;
  };
}

interface QueueConfig {
  redis: {
    url: string;
  };
  concurrency: number;
  delayMs: number;
  retryAttempts: number;
  retryDelay: number;
}

interface FileStorageConfig {
  reportsPath: string;
  maxSizeMB: number;
  allowedExtensions: string[];
}

class Config {
  public readonly server: ServerConfig;
  public readonly database: DatabaseConfig;
  public readonly jwt: JWTConfig;
  public readonly mtn: MTNConfig;
  public readonly orange: OrangeConfig;
  public readonly sms: SMSConfig;
  public readonly email: EmailConfig;
  public readonly security: SecurityConfig;
  public readonly fraudDetection: FraudDetectionConfig;
  public readonly payment: PaymentConfig;
  public readonly cameroon: CameroonConfig;
  public readonly monitoring: MonitoringConfig;
  public readonly externalServices: ExternalServicesConfig;
  public readonly queue: QueueConfig;
  public readonly storage: FileStorageConfig;

  constructor() {
    this.server = {
      port: parseInt(process.env.PORT || '3005', 10),
      env: process.env.NODE_ENV || 'development',
      serviceName: process.env.SERVICE_NAME || 'payment-service',
      logLevel: process.env.LOG_LEVEL || 'debug'
    };

    this.database = {
      postgresql: {
        url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/okada_payments',
        options: {
          ssl: process.env.NODE_ENV === 'production',
          connectionTimeoutMillis: 30000,
          idleTimeoutMillis: 30000,
          max: 20,
          min: 2
        }
      },
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        options: {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        }
      },
      mongodb: {
        url: process.env.MONGODB_URL || 'mongodb://localhost:27017/okada_payments',
        options: {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000
        }
      }
    };

    this.jwt = {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    };

    this.mtn = {
      baseUrl: process.env.MTN_API_BASE_URL || 'https://sandbox.momodeveloper.mtn.com',
      apiUserId: process.env.MTN_API_USER_ID || '',
      apiKey: process.env.MTN_API_KEY || '',
      primaryKey: process.env.MTN_PRIMARY_KEY || '',
      secondaryKey: process.env.MTN_SECONDARY_KEY || '',
      collectionSubscriptionKey: process.env.MTN_COLLECTION_SUBSCRIPTION_KEY || '',
      disbursementSubscriptionKey: process.env.MTN_DISBURSEMENT_SUBSCRIPTION_KEY || '',
      remittanceSubscriptionKey: process.env.MTN_REMITTANCE_SUBSCRIPTION_KEY || '',
      callbackUrl: process.env.MTN_CALLBACK_URL || '',
      webhookSecret: process.env.MTN_WEBHOOK_SECRET || '',
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 2000
    };

    this.orange = {
      baseUrl: process.env.ORANGE_API_BASE_URL || 'https://api.orange.com/orange-money-webpay/cm/v1',
      merchantKey: process.env.ORANGE_MERCHANT_KEY || '',
      clientId: process.env.ORANGE_CLIENT_ID || '',
      clientSecret: process.env.ORANGE_CLIENT_SECRET || '',
      callbackUrl: process.env.ORANGE_CALLBACK_URL || '',
      cancelUrl: process.env.ORANGE_CANCEL_URL || '',
      notificationUrl: process.env.ORANGE_NOTIF_URL || '',
      webhookSecret: process.env.ORANGE_WEBHOOK_SECRET || '',
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 2000
    };

    this.sms = {
      provider: 'twilio',
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
      },
      defaultCountryCode: '+237'
    };

    this.email = {
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      },
      from: {
        email: process.env.FROM_EMAIL || 'noreply@okada.cm',
        name: process.env.FROM_NAME || 'Okada Platform'
      }
    };

    this.security = {
      encryptionKey: process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-here',
      hashSaltRounds: parseInt(process.env.HASH_SALT_ROUNDS || '12', 10),
      rateLimiting: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
      }
    };

    this.fraudDetection = {
      enabled: process.env.FRAUD_DETECTION_ENABLED === 'true',
      maxDailyTransactionAmount: parseInt(process.env.MAX_DAILY_TRANSACTION_AMOUNT || '5000000', 10),
      maxSingleTransactionAmount: parseInt(process.env.MAX_SINGLE_TRANSACTION_AMOUNT || '1000000', 10),
      suspiciousVelocityThreshold: parseInt(process.env.SUSPICIOUS_VELOCITY_THRESHOLD || '10', 10),
      riskScoreThreshold: parseInt(process.env.RISK_SCORE_THRESHOLD || '75', 10),
      ipWhitelist: [],
      blacklistedPhones: []
    };

    this.payment = {
      defaultCurrency: CurrencyCode.XAF,
      transactionTimeoutMs: parseInt(process.env.TRANSACTION_TIMEOUT_MS || '300000', 10),
      maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3', 10),
      retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '5000', 10),
      providers: {
        [PaymentProvider.MTN_MOBILE_MONEY]: {
          enabled: true,
          minAmount: 500, // XAF 500
          maxAmount: 1000000, // XAF 1,000,000
          fees: {
            fixed: 0,
            percentage: 1.5,
            maxFee: 5000
          }
        },
        [PaymentProvider.ORANGE_MONEY]: {
          enabled: true,
          minAmount: 500, // XAF 500
          maxAmount: 1000000, // XAF 1,000,000
          fees: {
            fixed: 0,
            percentage: 1.5,
            maxFee: 5000
          }
        },
        [PaymentProvider.CASH]: {
          enabled: true,
          minAmount: 500, // XAF 500
          maxAmount: 500000, // XAF 500,000
          fees: {
            fixed: 100,
            percentage: 0,
            maxFee: 100
          }
        }
      }
    };

    this.cameroon = {
      cemacCompliance: {
        enabled: process.env.CEMAC_COMPLIANCE_ENABLED === 'true',
        transactionLimit: 5000000, // XAF 5,000,000
        dailyLimit: 2000000, // XAF 2,000,000
        monthlyLimit: 10000000, // XAF 10,000,000
        kycThreshold: 1000000 // XAF 1,000,000
      },
      taxation: {
        vatRate: parseFloat(process.env.TAX_RATE_PERCENT || '19.25') / 100,
        municipalTaxRate: 0.01,
        commissionRate: parseFloat(process.env.COMMISSION_RATE_PERCENT || '2.5') / 100
      },
      settlement: {
        delayHours: parseInt(process.env.SETTLEMENT_DELAY_HOURS || '24', 10),
        businessDays: [1, 2, 3, 4, 5], // Monday to Friday
        holidayDates: ['2024-01-01', '2024-05-01', '2024-05-20', '2024-08-15', '2024-12-25']
      },
      ussd: {
        [PaymentProvider.MTN_MOBILE_MONEY]: {
          code: '*126#',
          timeout: 180000 // 3 minutes
        },
        [PaymentProvider.ORANGE_MONEY]: {
          code: '*150#',
          timeout: 180000 // 3 minutes
        }
      }
    };

    this.monitoring = {
      enableMetrics: process.env.ENABLE_METRICS === 'true',
      enableTracing: process.env.ENABLE_TRACING === 'true',
      sentryDsn: process.env.SENTRY_DSN,
      healthCheck: {
        timeoutMs: parseInt(process.env.HEALTH_CHECK_TIMEOUT_MS || '5000', 10),
        intervalMs: parseInt(process.env.HEALTH_CHECK_INTERVAL_MS || '30000', 10)
      }
    };

    this.externalServices = {
      auditService: {
        url: process.env.AUDIT_SERVICE_URL || 'http://localhost:3007',
        timeout: 5000
      },
      notificationService: {
        url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006',
        timeout: 5000
      },
      userService: {
        url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
        timeout: 5000
      },
      orderService: {
        url: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
        timeout: 5000
      }
    };

    this.queue = {
      redis: {
        url: process.env.BULL_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379'
      },
      concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
      delayMs: parseInt(process.env.QUEUE_DELAY_MS || '1000', 10),
      retryAttempts: 3,
      retryDelay: 5000
    };

    this.storage = {
      reportsPath: process.env.REPORTS_STORAGE_PATH || '/tmp/okada/reports',
      maxSizeMB: parseInt(process.env.MAX_REPORT_SIZE_MB || '10', 10),
      allowedExtensions: ['.pdf', '.xlsx', '.csv']
    };
  }

  public validate(): void {
    const requiredEnvVars = [
      'DATABASE_URL',
      'REDIS_URL',
      'JWT_SECRET',
      'MTN_API_USER_ID',
      'MTN_API_KEY',
      'MTN_PRIMARY_KEY',
      'ORANGE_MERCHANT_KEY',
      'ORANGE_CLIENT_ID',
      'ORANGE_CLIENT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Validate encryption key length
    if (this.security.encryptionKey.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }

    // Validate MTN configuration
    if (this.mtn.environment === 'production' && this.mtn.baseUrl.includes('sandbox')) {
      throw new Error('Production environment cannot use sandbox MTN API URL');
    }

    // Validate Orange configuration
    if (this.orange.environment === 'production' && this.orange.baseUrl.includes('sandbox')) {
      throw new Error('Production environment cannot use sandbox Orange API URL');
    }
  }

  public isDevelopment(): boolean {
    return this.server.env === 'development';
  }

  public isProduction(): boolean {
    return this.server.env === 'production';
  }

  public isTest(): boolean {
    return this.server.env === 'test';
  }
}

// Export singleton instance
export const config = new Config();

// Validate configuration on import
config.validate();

export default config;