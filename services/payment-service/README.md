# Okada Payment Service

Production-ready payment service designed specifically for the Cameroon market, providing seamless integration with MTN Mobile Money, Orange Money, and cash payment systems.

## 🚀 Features

### Core Payment Features
- **MTN Mobile Money Integration**: Real-time API integration with MTN Mobile Money
- **Orange Money Integration**: Complete Orange Money API implementation
- **Cash Payment Support**: Cash on delivery and pickup code generation
- **Multi-currency Support**: XAF (Central African CFA Franc) with CEMAC compliance
- **USSD Fallback**: Interactive USSD sessions for network-constrained environments

### Security & Compliance
- **Fraud Detection**: AI-powered risk assessment and blocking
- **CEMAC Compliance**: Regulatory compliance for Central African Economic Zone
- **PCI Standards**: Security measures for payment data protection
- **End-to-end Encryption**: Sensitive data encryption and secure storage
- **JWT Authentication**: Secure API access control

### Operations & Reliability
- **Transaction State Machine**: Robust transaction lifecycle management
- **Retry Logic**: Intelligent retry mechanisms for failed transactions
- **Webhook Support**: Real-time status updates via webhooks
- **Settlement Reports**: Automated financial reconciliation
- **Comprehensive Logging**: Structured logging with correlation IDs
- **Health Monitoring**: Service health checks and monitoring

### Cameroon-Specific Optimizations
- **Phone Number Validation**: Cameroon operator detection (MTN, Orange, Camtel, Nexttel)
- **French Language Support**: Bilingual interface (English/French)
- **Local Tax Calculations**: VAT and municipal tax computation
- **Business Day Logic**: Cameroon holiday and business day awareness
- **Regional Compliance**: CEMAC transaction limits and KYC requirements

## 📋 Requirements

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- MongoDB 5+ (optional, for flexible schemas)

## 🛠 Installation

```bash
# Clone the repository
git clone <repository-url>
cd okada_project/backend/payment-service

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit environment variables
nano .env
```

## 🔧 Configuration

### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/okada_payments
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://localhost:27017/okada_payments

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# MTN Mobile Money Configuration
MTN_API_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_API_USER_ID=your-mtn-api-user-id
MTN_API_KEY=your-mtn-api-key
MTN_PRIMARY_KEY=your-mtn-primary-key
MTN_COLLECTION_SUBSCRIPTION_KEY=your-mtn-collection-subscription-key
MTN_CALLBACK_URL=https://your-domain.com/api/webhooks/mtn

# Orange Money Configuration
ORANGE_API_BASE_URL=https://api.orange.com/orange-money-webpay/cm/v1
ORANGE_MERCHANT_KEY=your-orange-merchant-key
ORANGE_CLIENT_ID=your-orange-client-id
ORANGE_CLIENT_SECRET=your-orange-client-secret
ORANGE_CALLBACK_URL=https://your-domain.com/api/payments/orange/callback

# Security Configuration
ENCRYPTION_KEY=your-32-char-encryption-key-here
FRAUD_DETECTION_ENABLED=true
MAX_SINGLE_TRANSACTION_AMOUNT=1000000

# Cameroon-Specific Settings
CEMAC_COMPLIANCE_ENABLED=true
TAX_RATE_PERCENT=19.25
COMMISSION_RATE_PERCENT=2.5
```

## 🚀 Running the Service

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start

# Or with PM2
npm run start:prod
```

### Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
```

## 📊 API Documentation

### Authentication
All API endpoints require JWT authentication:
```bash
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Process Payment
```http
POST /api/payments/process
Content-Type: application/json

{
  "orderId": "order-123",
  "customerId": "customer-456",
  "amount": 10000,
  "currency": "XAF",
  "provider": "mtn_mobile_money",
  "method": "mobile_money",
  "phoneNumber": "+237650123456",
  "description": "Payment for order #123",
  "callbackUrl": "https://your-app.com/webhook"
}
```

#### Check Payment Status
```http
GET /api/payments/status/{transactionId}?provider=mtn_mobile_money
```

#### Process Refund
```http
POST /api/payments/refund
Content-Type: application/json

{
  "transactionId": "txn-123",
  "amount": 5000,
  "reason": "Customer request"
}
```

#### Get Available Payment Methods
```http
GET /api/payments/methods?phoneNumber=+237650123456&amount=10000
```

#### Initiate USSD Payment
```http
POST /api/payments/ussd/initiate
Content-Type: application/json

{
  "orderId": "order-123",
  "customerId": "customer-456",
  "amount": 10000,
  "currency": "XAF",
  "provider": "mtn_mobile_money",
  "phoneNumber": "+237650123456",
  "description": "USSD payment"
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "transactionId": "txn-abc123",
    "status": "pending",
    "amount": 10000,
    "currency": "XAF",
    "provider": "mtn_mobile_money",
    "ussdCode": "*126#",
    "message": "Payment request initiated",
    "expiresAt": "2024-01-01T12:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-01T10:00:00Z",
    "requestId": "req-xyz789"
  }
}
```

## 🔍 Payment Providers

### MTN Mobile Money
- **Supported Methods**: Mobile Money
- **USSD Code**: `*126#`
- **Coverage**: MTN Cameroon subscribers
- **Transaction Limits**: 500 XAF - 1,000,000 XAF
- **Features**: Real-time processing, instant confirmation

### Orange Money
- **Supported Methods**: Mobile Money
- **USSD Code**: `*150#`
- **Coverage**: Orange Cameroon subscribers
- **Transaction Limits**: 500 XAF - 1,000,000 XAF
- **Features**: Web payment interface, callback notifications

### Cash Payments
- **Methods**: Cash on Delivery, Cash Pickup
- **Features**: Payment code generation, agent verification
- **Transaction Limits**: 500 XAF - 500,000 XAF
- **Pickup Locations**: Authorized Okada service centers

## 🛡️ Security Features

### Fraud Detection Rules
1. **High Amount Detection**: Flags transactions above configured thresholds
2. **Velocity Checking**: Monitors transaction frequency per customer
3. **Phone Number Analysis**: Validates operator compatibility
4. **Device Fingerprinting**: Tracks device characteristics
5. **Customer Behavior**: Analyzes historical patterns
6. **IP Address Monitoring**: Checks for suspicious locations
7. **Time-based Analysis**: Detects unusual transaction timing

### Data Protection
- All sensitive data encrypted at rest and in transit
- Phone numbers masked in logs
- PCI DSS compliance measures
- GDPR-compliant data handling
- Secure webhook signature validation

## 📊 Monitoring & Operations

### Health Checks
```http
GET /health
```
Returns service health status and provider availability.

### Logging
Structured JSON logging with:
- Correlation IDs for request tracing
- Performance metrics
- Error tracking with stack traces
- Audit logs for compliance
- Fraud detection events

### Metrics
- Transaction success/failure rates
- Provider response times
- Fraud detection statistics
- Settlement processing status
- API endpoint performance

## 🏗️ Architecture

### Service Components
```
├── API Gateway Layer
│   ├── Authentication & Authorization
│   ├── Rate Limiting & Throttling
│   └── Request Validation
├── Business Logic Layer
│   ├── Payment Gateway Service
│   ├── Fraud Detection Service
│   ├── Transaction Manager
│   └── USSD Service
├── Provider Integration Layer
│   ├── MTN Mobile Money Client
│   ├── Orange Money Client
│   └── Cash Payment Processor
└── Data Layer
    ├── PostgreSQL (Transactions)
    ├── Redis (Sessions & Cache)
    └── MongoDB (Flexible Schemas)
```

### Transaction State Machine
```
PENDING → PROCESSING → AWAITING_CONFIRMATION → CONFIRMED → COMPLETED
    ↓         ↓              ↓                    ↓
  FAILED   FAILED        FAILED              REFUNDED
    ↓         ↓              ↓                    ↓
CANCELLED CANCELLED     EXPIRED           PARTIALLY_REFUNDED
```

## 🔌 Webhook Integration

### MTN Mobile Money Webhooks
```http
POST /api/webhooks/mtn
X-Signature: sha256=<signature>
Content-Type: application/json

{
  "transactionId": "txn-123",
  "status": "SUCCESSFUL",
  "amount": "10000",
  "currency": "XAF",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### Orange Money Webhooks
```http
POST /api/webhooks/orange
X-Signature: sha256=<signature>
Content-Type: application/json

{
  "payToken": "pay-456",
  "status": "SUCCESS",
  "amount": 10000,
  "currency": "XAF",
  "transactionId": "orange-txn-789"
}
```

## 🧪 Testing

### Test Coverage Requirements
- **Minimum Coverage**: 98%
- **Unit Tests**: Business logic and utilities
- **Integration Tests**: API endpoints and workflows
- **Provider Tests**: External API mocking with nock
- **Fraud Detection Tests**: Risk assessment scenarios

### Running Tests
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage

# Watch mode during development
npm run test:watch
```

### Test Data
Test constants and mock data available in `src/tests/setup.ts`:
- Mock payment requests and responses
- Cameroon phone numbers for different operators
- Test transaction scenarios
- Authentication tokens

## 🚀 Deployment

### Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  payment-service:
    build: .
    ports:
      - "3005:3005"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
    depends_on:
      - postgres
      - redis
```

### AWS Deployment
Recommended AWS services:
- **ECS Fargate**: Container orchestration
- **RDS PostgreSQL**: Primary database
- **ElastiCache Redis**: Session storage
- **ALB**: Load balancing with health checks
- **CloudWatch**: Logging and monitoring
- **Secrets Manager**: Environment variables

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring and alerting set up
- [ ] Log aggregation configured
- [ ] Backup strategies implemented
- [ ] Provider API credentials verified
- [ ] Rate limiting configured
- [ ] Security scanning completed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- TypeScript with strict mode
- ESLint configuration enforced
- 98% test coverage required
- Conventional commit messages
- API documentation updates

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical support and questions:
- Email: tech.support@okada.cm
- Documentation: https://docs.okada.cm/payments
- Status Page: https://status.okada.cm

## 🗺️ Roadmap

### Version 1.1 (Q2 2024)
- [ ] Cryptocurrency payment support
- [ ] Enhanced analytics dashboard
- [ ] Multi-merchant settlement
- [ ] Advanced fraud ML models

### Version 1.2 (Q3 2024)
- [ ] International payment corridors
- [ ] Bill payment integration
- [ ] Loyalty program support
- [ ] Real-time notifications

### Version 2.0 (Q4 2024)
- [ ] Multi-country expansion
- [ ] Open Banking integration
- [ ] AI-powered customer insights
- [ ] Blockchain settlement option

---

Built with ❤️ for the Cameroon market by the Okada Platform Team