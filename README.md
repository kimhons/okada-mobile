# Okada Platform

<div align="center">

![Okada Logo](https://files.manuscdn.com/user_upload_by_module/web_dev_logo/310419663028725899/dYVUkyjXjvOUyuhF.png)

**Quick Commerce & Delivery Platform for Cameroon**

[![Flutter](https://img.shields.io/badge/Flutter-3.16+-02569B?logo=flutter)](https://flutter.dev)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Documentation](docs/) • [Getting Started](#getting-started) • [Architecture](#architecture) • [Contributing](CONTRIBUTING.md)

</div>

---

## Overview

Okada is a comprehensive quick commerce and delivery platform designed specifically for Cameroon's unique market conditions. The platform connects customers with local merchants and riders for fast, reliable deliveries.

### Key Features

- **10-Minute Delivery**: Optimized logistics for ultra-fast delivery
- **Multi-Vendor Marketplace**: Support for groceries, restaurants, pharmacies, and more
- **Real-Time Tracking**: Live GPS tracking for all deliveries
- **Mobile Money Integration**: MTN MoMo and Orange Money support
- **AI-Powered Optimization**: Demand prediction and route optimization
- **Offline-First Design**: Works reliably in low-connectivity areas

---

## Repository Structure

```
okada-mobile/
├── apps/                          # Application frontends
│   ├── customer_app/              # Flutter - Customer mobile app
│   ├── rider_app/                 # Flutter - Rider/driver mobile app
│   ├── admin_dashboard/           # React - Admin web dashboard
│   └── merchant_portal/           # React - Merchant/seller web portal
│
├── services/                      # Backend microservices
│   ├── api-gateway/               # Kong/Express API gateway
│   ├── auth-service/              # Authentication & authorization
│   ├── user-service/              # User management
│   ├── order-service/             # Order processing
│   ├── product-service/           # Product catalog
│   ├── payment-service/           # Payment processing
│   ├── notification-service/      # Push notifications & SMS
│   └── shared/                    # Shared utilities & types
│
├── ai/                            # AI/ML services
│   ├── models/                    # ML models (demand, routing, fraud)
│   ├── services/                  # Inference & training services
│   └── data/                      # Training data & pipelines
│
├── packages/                      # Shared packages
│   ├── dart/                      # Shared Dart packages
│   └── node/                      # Shared Node.js packages
│
├── infrastructure/                # Infrastructure as Code
│   ├── docker/                    # Docker configurations
│   ├── kubernetes/                # K8s manifests
│   └── terraform/                 # Cloud infrastructure
│
└── docs/                          # Documentation
    ├── architecture/              # System architecture
    ├── api/                       # API documentation
    └── user-journeys/             # User flow documentation
```

---

## Technology Stack

### Mobile Apps (Flutter)
| Component | Technology |
|-----------|------------|
| Framework | Flutter 3.16+ |
| State Management | Riverpod |
| Navigation | GoRouter |
| Local Storage | Hive + Secure Storage |
| Maps | Google Maps Flutter |
| Push Notifications | Firebase Cloud Messaging |

### Web Applications (React)
| Component | Technology |
|-----------|------------|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS 4 |
| API Layer | tRPC |
| Database ORM | Drizzle |
| Authentication | Manus OAuth |

### Backend Services (Node.js)
| Component | Technology |
|-----------|------------|
| Runtime | Node.js 22 |
| Framework | Express + tRPC |
| Database | MySQL/TiDB |
| Cache | Redis |
| Message Queue | RabbitMQ |
| Search | Elasticsearch |

### AI/ML (Python)
| Component | Technology |
|-----------|------------|
| Framework | PyTorch / TensorFlow |
| API | FastAPI |
| ML Ops | MLflow |
| Data Processing | Pandas / NumPy |

---

## Getting Started

### Prerequisites

- **Flutter**: 3.16+ with Dart 3.2+
- **Node.js**: 22.0+
- **Python**: 3.11+
- **Docker**: 24.0+
- **pnpm**: 9.0+

### Quick Start

```bash
# Clone the repository
git clone https://github.com/kimhons/okada-mobile.git
cd okada-mobile

# Install dependencies
pnpm install                    # Node.js packages
cd apps/customer_app && flutter pub get   # Flutter packages

# Start development servers
pnpm dev                        # Start admin dashboard
cd apps/customer_app && flutter run       # Run customer app
```

### Environment Setup

1. Copy environment templates:
```bash
cp apps/admin_dashboard/.env.example apps/admin_dashboard/.env
cp services/api-gateway/.env.example services/api-gateway/.env
```

2. Configure required variables (see [Environment Variables](#environment-variables))

3. Start infrastructure:
```bash
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d
```

---

## Applications

### Customer App (`apps/customer_app`)
Mobile app for customers to browse products, place orders, and track deliveries.

**Key Screens:**
- Home & Discovery
- Product Search & Categories
- Cart & Checkout
- Order Tracking
- Profile & Addresses

### Rider App (`apps/rider_app`)
Mobile app for delivery riders to accept and complete deliveries.

**Key Screens:**
- Available Orders
- Active Delivery Navigation
- Earnings Dashboard
- Performance Stats

### Admin Dashboard (`apps/admin_dashboard`)
Web application for platform administrators to manage operations.

**Key Features:**
- Real-time Analytics Dashboard
- Order Management
- User & Rider Management
- Financial Reports
- System Configuration

### Merchant Portal (`apps/merchant_portal`)
Web application for merchants to manage their stores and products.

**Key Features:**
- Product Catalog Management
- Order Processing
- Inventory Management
- Sales Analytics

---

## Services

### API Gateway (`services/api-gateway`)
Central entry point for all API requests with rate limiting, authentication, and routing.

### Auth Service (`services/auth-service`)
Handles user authentication, JWT tokens, and OAuth integrations.

### Order Service (`services/order-service`)
Manages order lifecycle from creation to delivery completion.

### Payment Service (`services/payment-service`)
Integrates with MTN MoMo, Orange Money, and card payments.

### Notification Service (`services/notification-service`)
Sends push notifications, SMS, and email communications.

---

## AI/ML Components

### Demand Prediction
Forecasts order volume by location and time for inventory optimization.

### Route Optimization
Calculates optimal delivery routes considering traffic and multiple stops.

### Fraud Detection
Identifies suspicious transactions and account behavior.

### Dynamic Pricing
Adjusts delivery fees based on demand, distance, and availability.

---

## Development

### Running Tests

```bash
# All tests
pnpm test

# Specific app
pnpm --filter @okada/admin-dashboard test

# Flutter tests
cd apps/customer_app && flutter test
```

### Code Quality

```bash
# Linting
pnpm lint

# Type checking
pnpm check

# Format code
pnpm format
```

### Database Migrations

```bash
# Generate migration
pnpm --filter @okada/admin-dashboard db:push

# View database
pnpm --filter @okada/admin-dashboard db:studio
```

---

## Deployment

### Docker

```bash
# Build all images
docker-compose build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Mobile Apps

```bash
# Android APK
cd apps/customer_app && flutter build apk --release

# iOS
cd apps/customer_app && flutter build ios --release
```

---

## Environment Variables

### Admin Dashboard
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Session signing secret |
| `VITE_APP_ID` | OAuth application ID |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key |

### Services
| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection string |
| `RABBITMQ_URL` | RabbitMQ connection string |
| `MTN_MOMO_API_KEY` | MTN Mobile Money API key |
| `ORANGE_MONEY_API_KEY` | Orange Money API key |

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/kimhons/okada-mobile/issues)
- **Email**: support@okada.cm

---

<div align="center">
Made with ❤️ for Cameroon
</div>
