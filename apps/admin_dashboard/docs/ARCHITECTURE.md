# Okada Platform Architecture

## Overview

The Okada Platform is a comprehensive delivery management system built as a **monorepo** combining:
- **Flutter** mobile applications (Customer & Rider apps)
- **React** web applications (Admin Dashboard & Seller Portal)
- **Node.js** backend microservices

## Repository Structure

```
okada-mobile/
│
├── apps/                              # All Applications
│   │
│   ├── customer_app/                  # Flutter - Customer Mobile App
│   │   ├── android/
│   │   ├── ios/
│   │   ├── lib/
│   │   │   ├── core/                  # App-specific core
│   │   │   ├── features/              # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── home/
│   │   │   │   ├── orders/
│   │   │   │   ├── tracking/
│   │   │   │   └── profile/
│   │   │   └── main.dart
│   │   ├── test/
│   │   └── pubspec.yaml
│   │
│   ├── rider_app/                     # Flutter - Rider Mobile App
│   │   ├── android/
│   │   ├── ios/
│   │   ├── lib/
│   │   │   ├── core/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── deliveries/
│   │   │   │   ├── earnings/
│   │   │   │   ├── navigation/
│   │   │   │   └── profile/
│   │   │   └── main.dart
│   │   ├── test/
│   │   └── pubspec.yaml
│   │
│   ├── admin_web/                     # React - Admin Dashboard
│   │   ├── client/
│   │   ├── server/
│   │   ├── drizzle/
│   │   └── package.json
│   │
│   └── seller_web/                    # React - Seller Portal
│       ├── client/
│       ├── server/
│       └── package.json
│
├── packages/                          # Shared Packages
│   │
│   ├── dart/                          # Dart/Flutter Packages
│   │   ├── okada_core/                # Core utilities, constants
│   │   ├── okada_api/                 # API client & models
│   │   ├── okada_ui/                  # Shared UI components
│   │   └── okada_localization/        # i18n (French/English)
│   │
│   └── node/                          # Node.js Packages
│       ├── shared-types/              # TypeScript types
│       ├── shared-utils/              # Common utilities
│       └── api-client/                # JS/TS API client
│
├── services/                          # Backend Microservices
│   ├── api-gateway/                   # API Gateway (Kong/Express)
│   ├── auth-service/                  # Authentication
│   ├── user-service/                  # User Management
│   ├── order-service/                 # Order Management
│   ├── rider-service/                 # Rider Management
│   ├── payment-service/               # Payments (MTN/Orange Money)
│   ├── notification-service/          # Push/SMS/Email
│   ├── delivery-service/              # Routing & Tracking
│   └── analytics-service/             # Reporting
│
├── infrastructure/                    # Infrastructure as Code
│   ├── docker/
│   ├── kubernetes/
│   ├── terraform/
│   └── firebase/                      # Firebase config for Flutter
│
├── docs/                              # Documentation
│   ├── api/
│   ├── architecture/
│   ├── flutter/
│   └── deployment/
│
├── tools/                             # Development Tools
│   ├── scripts/
│   └── generators/
│
├── melos.yaml                         # Dart/Flutter monorepo tool
├── pnpm-workspace.yaml                # Node.js workspace config
├── package.json                       # Root package.json
└── README.md
```

## Technology Stack

### Mobile Apps (Flutter)
| Technology | Purpose |
|------------|---------|
| Flutter 3.x | Cross-platform UI framework |
| Dart 3.x | Programming language |
| Riverpod | State management |
| Go Router | Navigation |
| Dio | HTTP client |
| Hive/Isar | Local storage |
| Firebase | Push notifications, analytics |
| Google Maps | Maps & navigation |
| flutter_bloc | Business logic (alternative) |

### Web Apps (React)
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| tRPC | Type-safe APIs |
| Drizzle ORM | Database ORM |

### Backend Services (Node.js)
| Technology | Purpose |
|------------|---------|
| Node.js 22 | Runtime |
| Express/Fastify | HTTP server |
| tRPC | API layer |
| MySQL/TiDB | Primary database |
| Redis | Caching, queues |
| Socket.io | Real-time |

## Flutter App Architecture

### Feature-First Structure
Each Flutter app follows a feature-first architecture with clean separation:

```
lib/
├── core/                      # App-wide utilities
│   ├── constants/
│   ├── extensions/
│   ├── theme/
│   ├── router/
│   └── di/                    # Dependency injection
│
├── features/                  # Feature modules
│   └── orders/
│       ├── data/              # Data layer
│       │   ├── datasources/
│       │   ├── models/
│       │   └── repositories/
│       ├── domain/            # Business logic
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── usecases/
│       └── presentation/      # UI layer
│           ├── providers/
│           ├── screens/
│           └── widgets/
│
└── main.dart
```

### State Management (Riverpod)
```dart
// Example: Order provider
@riverpod
class OrderNotifier extends _$OrderNotifier {
  @override
  Future<List<Order>> build() async {
    return ref.read(orderRepositoryProvider).getOrders();
  }

  Future<void> placeOrder(OrderRequest request) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => 
      ref.read(orderRepositoryProvider).createOrder(request)
    );
  }
}
```

## Microservices Architecture

### Service Communication

```
┌─────────────────────────────────────────────────────────────────┐
│                     Mobile Apps (Flutter)                        │
│              Customer App          Rider App                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                               │
│                    (Kong / Express)                              │
│         - Rate Limiting  - Auth Validation  - Routing           │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Auth Service │   │ Order Service │   │ User Service  │
│   Port: 8001  │   │  Port: 8004   │   │  Port: 8002   │
└───────────────┘   └───────────────┘   └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   Message Queue   │
                    │  (Redis Streams)  │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Rider Service │   │Payment Service│   │ Notification  │
│  Port: 8003   │   │  Port: 8005   │   │  Port: 8006   │
└───────────────┘   └───────────────┘   └───────────────┘
```

### Service Ports & Responsibilities

| Service | Port | Database | Responsibilities |
|---------|------|----------|------------------|
| api-gateway | 8000 | - | Routing, rate limiting, auth |
| auth-service | 8001 | MySQL | JWT, OAuth, sessions |
| user-service | 8002 | MySQL | Profiles, verification |
| rider-service | 8003 | MySQL | Riders, availability, assignments |
| order-service | 8004 | MySQL | Orders, cart, history |
| payment-service | 8005 | MySQL | MTN/Orange Money, payouts |
| notification-service | 8006 | Redis | Push, SMS, email |
| delivery-service | 8007 | MySQL+Redis | Routes, tracking, zones |
| analytics-service | 8008 | ClickHouse | Reports, metrics |

## Shared Dart Packages

### okada_core
Core utilities shared across Flutter apps:
```dart
// Constants
class AppConstants {
  static const String currency = 'FCFA';
  static const String countryCode = '+237';
}

// Extensions
extension CurrencyFormat on num {
  String toFCFA() => '${toStringAsFixed(0)} FCFA';
}
```

### okada_api
API client and data models:
```dart
class OkadaApiClient {
  final Dio _dio;
  
  Future<List<Order>> getOrders() async {
    final response = await _dio.get('/orders');
    return (response.data as List)
        .map((json) => Order.fromJson(json))
        .toList();
  }
}
```

### okada_ui
Shared UI components:
```dart
class OkadaButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final ButtonVariant variant;
  
  // Consistent button styling across apps
}

class OkadaCard extends StatelessWidget {
  // Consistent card styling
}
```

### okada_localization
Internationalization (French/English):
```dart
// Generated from ARB files
class AppLocalizations {
  String get orderPlaced => _localizedValues['order_placed']!;
  String get deliveryInProgress => _localizedValues['delivery_in_progress']!;
}
```

## Data Flow

### Order Lifecycle (Flutter → Services)

```
Customer App                    Services                         Rider App
     │                             │                                │
     │  1. Browse Products         │                                │
     │  (Local + API cache)        │                                │
     │                             │                                │
     │  2. Add to Cart             │                                │
     │  (Local state)              │                                │
     │                             │                                │
     │  3. Place Order             │                                │
     ├────────────────────────────►│                                │
     │                             │  4. Validate & Process         │
     │                             │  (order-service)               │
     │                             │                                │
     │                             │  5. Process Payment            │
     │                             │  (payment-service)             │
     │                             │                                │
     │                             │  6. Find Rider                 │
     │                             │  (rider-service)               │
     │                             │                                │
     │                             │  7. Push Notification          │
     │                             ├──────────────────────────────►│
     │                             │  (notification-service)        │
     │                             │                                │
     │  8. Order Confirmed         │  9. New Order Alert            │
     │◄────────────────────────────┤◄──────────────────────────────┤
     │  (WebSocket)                │                                │
     │                             │                                │
     │                             │  10. Rider Accepts             │
     │                             │◄──────────────────────────────┤
     │                             │                                │
     │  11. Real-time Tracking     │  12. Location Updates          │
     │◄────────────────────────────┼──────────────────────────────►│
     │  (WebSocket + Maps)         │  (delivery-service)            │
```

## Development Workflow

### Prerequisites
```bash
# Flutter
flutter --version  # 3.x required
dart --version     # 3.x required

# Node.js
node --version     # 22.x required
pnpm --version     # 9.x required

# Tools
melos --version    # For Flutter monorepo
```

### Setup
```bash
# Clone repository
git clone https://github.com/kimhons/okada-mobile.git
cd okada-mobile

# Install Node.js dependencies
pnpm install

# Bootstrap Flutter packages
melos bootstrap

# Setup environment
cp .env.example .env
```

### Running Apps

```bash
# Flutter Customer App
cd apps/customer_app
flutter run

# Flutter Rider App
cd apps/rider_app
flutter run

# Admin Dashboard
cd apps/admin_web
pnpm dev

# All backend services
docker-compose up -d
```

### Melos Commands
```bash
# Bootstrap all packages
melos bootstrap

# Run tests across all packages
melos test

# Generate code (freezed, json_serializable)
melos generate

# Analyze all packages
melos analyze

# Clean all packages
melos clean
```

## CI/CD Pipeline

### Flutter Apps
1. **Lint & Analyze** - `flutter analyze`
2. **Unit Tests** - `flutter test`
3. **Build** - `flutter build apk/ipa`
4. **Deploy** - Firebase App Distribution / Play Store / App Store

### Web Apps
1. **Lint** - `pnpm lint`
2. **Type Check** - `pnpm check`
3. **Unit Tests** - `pnpm test`
4. **Build** - `pnpm build`
5. **Deploy** - Vercel / AWS / GCP

### Backend Services
1. **Lint & Test** - Per service
2. **Build Docker Images**
3. **Push to Registry**
4. **Deploy to Kubernetes**

## Deployment Architecture

```
                    ┌─────────────────────────────────────┐
                    │         CDN (CloudFlare)            │
                    └─────────────────┬───────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
    ┌───────────┐             ┌───────────┐             ┌───────────┐
    │  Admin    │             │  App      │             │  App      │
    │  (Vercel) │             │  Store    │             │  Store    │
    │           │             │  (iOS)    │             │ (Android) │
    └───────────┘             └───────────┘             └───────────┘
          │                           │                           │
          └───────────────────────────┼───────────────────────────┘
                                      │
                    ┌─────────────────┴───────────────────┐
                    │           API Gateway               │
                    │         (AWS API Gateway)           │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────┴───────────────────┐
                    │        Kubernetes Cluster           │
                    │           (EKS / GKE)               │
                    │                                     │
                    │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
                    │  │Auth │ │Order│ │Rider│ │Pay  │  │
                    │  └─────┘ └─────┘ └─────┘ └─────┘  │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────┴───────────────────┐
                    │                                     │
                    ▼                                     ▼
              ┌──────────┐                        ┌──────────┐
              │  MySQL   │                        │  Redis   │
              │ (Aurora) │                        │(ElastiC) │
              └──────────┘                        └──────────┘
```

## Security

### Mobile App Security
- Certificate pinning for API calls
- Secure storage for tokens (flutter_secure_storage)
- Biometric authentication support
- Code obfuscation for release builds

### API Security
- JWT token authentication
- Rate limiting per user/IP
- Input validation & sanitization
- HTTPS/TLS 1.3 everywhere

### Payment Security
- PCI DSS compliance for card data
- Mobile Money API encryption
- Transaction signing
- Fraud detection

## Performance Targets

| Metric | Target |
|--------|--------|
| App Launch Time | < 2s |
| API Response | < 200ms (p95) |
| Order Placement | < 3s end-to-end |
| Real-time Updates | < 100ms |
| Offline Support | Full order history |
| Battery Usage | < 5% per hour active |
