# Okada Auth Service

Production-ready authentication service for the Okada Platform, designed specifically for the Cameroonian market with support for French/English localization, XAF currency, and local phone number formats.

## Features

### Core Authentication
- **User Registration** - Email and phone verification with SMS/email OTP
- **JWT Authentication** - Access tokens with refresh token rotation
- **Password Management** - Secure reset with email/SMS OTP options
- **Session Management** - Redis-based session tracking with automatic cleanup
- **Account Security** - Account lockout, rate limiting, and security monitoring

### Role-Based Access Control (RBAC)
- **User Roles**: Admin, Customer, Rider, Merchant, Support
- **Permission-based Access** - Granular resource access control
- **Self-access Controls** - Users can access their own resources

### Cameroon-Specific Features
- **Phone Number Support** - Validates and formats Cameroon phone numbers (+237)
- **Mobile Operators** - Supports MTN, Orange, Camtel, and Nexttel
- **Localization** - French and English language support
- **Currency** - XAF (Central African Franc) support

### Security Features
- **Rate Limiting** - Progressive delays and IP-based limits
- **Account Lockout** - Automatic lockout after failed attempts
- **Security Monitoring** - Suspicious activity detection and alerts
- **GDPR Compliance** - Privacy controls and data processing consent

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with comprehensive middleware
- **Databases**: PostgreSQL (user data), MongoDB (sessions), Redis (caching)
- **Authentication**: JWT with refresh token rotation
- **Validation**: Joi with custom Cameroon-specific validators
- **Notifications**: Email (SMTP) and SMS (Twilio)
- **Testing**: Jest with 98% coverage requirement

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+
- Redis 7+

### Environment Setup

```bash
# Clone and navigate
cd okada_project/backend/auth-service

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### Required Environment Variables

```env
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=okada_auth
POSTGRES_USER=okada_user
POSTGRES_PASSWORD=your_postgres_password

MONGODB_URI=mongodb://localhost:27017/okada_auth
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration (minimum 64 characters)
JWT_SECRET=your_super_secret_jwt_key_here_min_64_chars_for_security_purposes
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here_min_64_chars_for_security

# Notification Services
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Database Setup

```bash
# Run migrations
npm run db:migrate

# Optional: Seed test data
npm run db:seed
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

## API Documentation

### Base URL
```
Production: https://api.okada.cm/v1/auth
Development: http://localhost:3001/api/v1/auth
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+237654321000",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer",
  "language": "fr",
  "termsAccepted": true,
  "privacyPolicyAccepted": true
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "identifier": "user@example.com",  // or phone number
  "password": "SecurePass123!",
  "rememberMe": false
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Verification Endpoints

#### Send Verification Code
```http
POST /auth/verify/send
Content-Type: application/json

{
  "type": "email",  // or "phone"
  "identifier": "user@example.com"
}
```

#### Verify Code
```http
POST /auth/verify/confirm
Content-Type: application/json

{
  "type": "email",
  "identifier": "user@example.com",
  "code": "123456"
}
```

### Password Management

#### Request Password Reset
```http
POST /auth/password/reset-request
Content-Type: application/json

{
  "identifier": "user@example.com"  // or phone number
}
```

#### Reset Password
```http
POST /auth/password/reset
Content-Type: application/json

{
  "token": "reset_token_from_email_or_sms",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

## Error Handling

### Standard Response Format
```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "errors": string[],
  "timestamp": string,
  "requestId": string
}
```

### HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **422** - Validation Error
- **429** - Too Many Requests
- **500** - Internal Server Error

## Security Features

### Rate Limiting
- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- Password Reset: 3 attempts per hour
- OTP Verification: 10 attempts per 10 minutes

### Account Security
- Password Requirements: Minimum 8 characters, uppercase, lowercase, number, special character
- Account Lockout: 5 failed attempts locks account for 30 minutes
- Session Management: Automatic session cleanup and refresh token rotation
- Two-Factor Authentication: TOTP support (optional)

### Cameroon Phone Validation
```javascript
// Valid formats
+237654321000  // MTN
+237612345678  // Orange
+237222123456  // Camtel
+237242123456  // Nexttel

// Invalid formats
+1234567890    // Wrong country code
+237123456789  // Invalid operator prefix
```

## Monitoring & Logging

### Health Check
```http
GET /health
```

### Metrics (if enabled)
```http
GET /metrics
```

### Log Levels
- **error** - Application errors
- **warn** - Warning conditions
- **info** - General information
- **debug** - Debug information

### Security Events
- Failed login attempts
- Account lockouts
- Suspicious activity
- Token reuse detection
- Rate limit violations

## Testing

### Running Tests
```bash
# All tests
npm test

# Unit tests only
npm run test -- --testPathPattern=unit

# Integration tests only
npm run test -- --testPathPattern=integration

# Coverage report
npm run test:coverage
```

### Test Coverage Requirements
- Minimum 98% coverage across all metrics
- Unit tests for all business logic
- Integration tests for API endpoints
- Security testing for authentication flows

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Configuration
- Use environment-specific .env files
- Secure secret management (AWS Secrets Manager, etc.)
- Database connection pooling
- Redis clustering for high availability

## Performance Optimization

### Database Optimization
- Connection pooling configured
- Proper indexing on frequently queried fields
- Query optimization for user lookups
- Automatic cleanup of expired records

### Caching Strategy
- Redis for session storage
- Rate limiting data cached
- JWT token blacklist cached
- Verification codes cached

### Background Tasks
- Expired session cleanup (every 6 hours)
- Old session deletion (daily)
- Rate limit data cleanup (every 6 hours)
- Verification code cleanup (hourly)
- Security monitoring (every 30 minutes)

## Contributing

### Code Style
- TypeScript strict mode enabled
- ESLint configuration enforced
- Prettier for code formatting
- Conventional commits for changelog

### Development Workflow
1. Create feature branch
2. Implement changes with tests
3. Ensure 98% test coverage
4. Run linting and type checking
5. Submit pull request

## Troubleshooting

### Common Issues

#### Database Connection Failed
- Verify PostgreSQL/MongoDB/Redis are running
- Check connection strings in .env
- Ensure database exists and user has permissions

#### JWT Token Issues
- Verify JWT_SECRET is at least 64 characters
- Check token expiration times
- Ensure Redis is accessible for token blacklist

#### SMS/Email Not Sending
- Verify Twilio credentials
- Check SMTP configuration
- Ensure phone numbers are in correct format

#### Rate Limiting Too Aggressive
- Adjust rate limit settings in .env
- Clear Redis rate limit data: `redis-cli FLUSHDB`

### Debugging
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Check service health
curl http://localhost:3001/health

# View logs
tail -f logs/combined.log
```

## Support

For technical support and questions:
- Email: tech.support@okada.cm
- Documentation: https://docs.okada.cm
- GitHub Issues: Create an issue with detailed description

## License

Proprietary - Okada Platform
Copyright (c) 2024 Okada Technologies