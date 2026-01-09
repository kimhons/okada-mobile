# Okada Platform Development Guide for Claude Code

## Project Overview

Okada is an AI-native quick commerce platform designed specifically for the Cameroonian market. The platform consists of three main applications connected to a central AI Brain:

1. **Customer Mobile App**: Flutter-based application for consumers to browse products, place orders, and track deliveries
2. **Rider Mobile App**: Flutter-based application for delivery partners to receive orders, navigate routes, and track earnings
3. **Merchant Web Platform**: Next.js-based web application for dark store operators to manage inventory, process orders, and analyze performance

The platform is designed to be AI-native, with intelligence embedded throughout all components rather than added as an afterthought. The system is optimized for Cameroon's infrastructure challenges, including intermittent connectivity, limited device capabilities, and local payment systems.

## Technology Stack

### Mobile Applications (Customer & Rider Apps)
- **Framework**: Flutter 3.10+
- **Language**: Dart 3.0+
- **State Management**: BLoC pattern with flutter_bloc
- **Local Storage**: Hive and SharedPreferences
- **Networking**: Dio with offline caching
- **Maps & Location**: Google Maps Flutter, Geolocator
- **AI Integration**: TensorFlow Lite for on-device inference

### Merchant Web Platform
- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript 5.0+
- **State Management**: React Query and Jotai
- **UI Components**: Tailwind CSS with custom components
- **Charts & Visualization**: Chart.js with React wrappers
- **API Integration**: Axios with request/response interceptors

### Backend Services
- **Framework**: Node.js with Express.js
- **Language**: TypeScript 5.0+
- **API Design**: RESTful with OpenAPI specification
- **Database**: PostgreSQL for transactional data, MongoDB for flexible schemas
- **Caching**: Redis for session management and caching
- **Authentication**: JWT with refresh token rotation
- **Message Queue**: RabbitMQ for asynchronous processing

### AI Brain
- **Framework**: TensorFlow for model training, TensorFlow Serving for API
- **Model Deployment**: TensorFlow Lite for mobile, ONNX for web
- **Data Pipeline**: Apache Airflow for orchestration
- **Feature Store**: Feast for feature management
- **Monitoring**: Prometheus and Grafana for model monitoring

### Cloud Infrastructure
- **Provider**: AWS (Africa region - Cape Town)
- **Compute**: EC2 with auto-scaling, Lambda for serverless functions
- **Database**: RDS for PostgreSQL, DocumentDB for MongoDB
- **Storage**: S3 for object storage, EBS for block storage
- **CDN**: CloudFront with edge locations
- **Monitoring**: CloudWatch with custom dashboards

## Branding Guidelines

- **Primary Color (Green)**: `#007A5E` (Cameroon flag green)
- **Secondary Color (Red)**: `#CE1126` (Cameroon flag red)
- **Accent Color (Yellow)**: `#FCD116` (Cameroon flag yellow)
- **Text on Dark**: `#FFFFFF`
- **Text on Light**: `#333333`
- **Font Family**: Inter for web, SF Pro Text for iOS, Roboto for Android

## Development Priorities

When developing the Okada platform, prioritize the following aspects:

1. **Offline Functionality**: Ensure critical features work without internet connectivity
2. **Performance Optimization**: Optimize for low-end devices common in Cameroon
3. **Battery Efficiency**: Minimize battery consumption for areas with unreliable electricity
4. **Data Efficiency**: Reduce data usage through compression and smart caching
5. **Localization**: Support both English and French languages
6. **Payment Integration**: Seamless integration with MTN Mobile Money and Orange Money
7. **Cultural Relevance**: Adapt UI/UX for local cultural preferences and practices

## AI Features Implementation

### Customer App AI Features

1. **Personalized Recommendations**
   - Implement collaborative filtering with TensorFlow Lite
   - Cache recommendations for offline browsing
   - Update model when connectivity is available

2. **Smart Search**
   - Implement semantic search with on-device model
   - Support voice search in French and English
   - Provide category suggestions based on search history

3. **Delivery Time Prediction**
   - Use historical data to predict accurate delivery times
   - Account for traffic patterns, weather, and time of day
   - Provide confidence intervals with predictions

### Rider App AI Features

1. **Route Optimization**
   - Implement A* algorithm with traffic-aware heuristics
   - Support offline navigation with downloaded map data
   - Optimize for fuel efficiency and delivery speed

2. **Order Prioritization**
   - Rank orders based on distance, time sensitivity, and value
   - Batch orders for efficient multi-delivery routes
   - Adapt to rider performance patterns

3. **Earnings Prediction**
   - Forecast daily/weekly earnings based on historical data
   - Suggest optimal working hours for maximum earnings
   - Provide incentive recommendations

### Merchant Platform AI Features

1. **Demand Forecasting**
   - Implement time-series forecasting for product demand
   - Account for seasonality, promotions, and external factors
   - Provide confidence intervals for forecasts

2. **Inventory Optimization**
   - Recommend optimal stock levels for each product
   - Suggest product assortment based on local preferences
   - Identify potential stockouts before they occur

3. **Dynamic Pricing**
   - Recommend price adjustments based on demand, competition, and inventory
   - Implement price elasticity modeling
   - Support promotional pricing optimization

## Development Approach

### Phase 1: Foundation (Months 1-2)
- Set up development environments and infrastructure
- Implement core functionality without AI features
- Establish CI/CD pipelines and testing frameworks

### Phase 2: MVP (Months 3-4)
- Implement basic AI features with initial models
- Develop offline functionality and synchronization
- Create minimum viable product for user testing

### Phase 3: Enhanced Features (Months 5-6)
- Implement advanced AI features with refined models
- Optimize performance for target devices
- Add localization and cultural adaptations

### Phase 4: Market Expansion (Months 7-8)
- Scale infrastructure for growth
- Refine AI models with real-world data
- Implement analytics and business intelligence

## Testing Requirements

### Functional Testing
- Test all features in both online and offline modes
- Verify multilingual support (English and French)
- Validate payment processing flows

### Performance Testing
- Test on entry-level Android devices (1GB RAM, Android 6.0+)
- Verify performance under poor network conditions (2G, high latency)
- Measure and optimize battery consumption

### AI Model Testing
- Validate recommendation accuracy with Cameroonian market data
- Test route optimization with local road network data
- Verify demand forecasting accuracy with historical data

## Deployment Strategy

### Mobile Apps
- Implement phased rollout through Play Store internal testing
- Use feature flags for gradual feature enablement
- Set up crash reporting and analytics

### Backend Services
- Deploy with blue-green deployment strategy
- Implement database migration strategy
- Set up monitoring and alerting

### AI Models
- Deploy models with versioning and rollback capability
- Implement A/B testing framework for model comparison
- Set up model performance monitoring

## Cameroon-Specific Adaptations

### Network Considerations
- Implement aggressive caching strategies
- Support SMS fallback for critical notifications
- Optimize API payloads for minimal data usage

### Payment Integration
- Integrate with MTN Mobile Money API
- Support Orange Money transactions
- Implement USSD fallback for payment confirmation

### Cultural Adaptations
- Use local terminology for product categories
- Adapt UI for local shopping preferences
- Support local address formats and landmarks

## Getting Started

1. Set up the development environment following the instructions in `/docs/setup.md`
2. Review the architecture documentation in `/docs/architecture.md`
3. Start with the backend services to establish the API foundation
4. Develop the mobile apps and web platform in parallel
5. Integrate with the AI Brain as features are implemented

## Code Organization

The project follows a modular architecture with clear separation of concerns:

```
okada_project/
├── ai_brain/              # AI model training and serving
├── backend/               # Node.js backend services
│   ├── api-gateway/       # API gateway service
│   ├── auth-service/      # Authentication service
│   ├── user-service/      # User management service
│   ├── product-service/   # Product catalog service
│   ├── order-service/     # Order processing service
│   ├── payment-service/   # Payment processing service
│   └── notification-service/ # Notification service
├── mobile/                # Flutter mobile applications
│   ├── customer_app/      # Customer-facing mobile app
│   └── rider_app/         # Delivery partner mobile app
├── web/                   # Next.js merchant platform
└── docs/                  # Project documentation
```

## Best Practices

1. **Code Quality**
   - Follow the style guides for each language/framework
   - Write unit tests for all business logic
   - Use static analysis tools to catch issues early

2. **Performance**
   - Optimize bundle sizes for mobile apps
   - Implement lazy loading for web components
   - Use efficient data structures and algorithms

3. **Security**
   - Validate all user inputs
   - Implement proper authentication and authorization
   - Follow secure coding practices

4. **Accessibility**
   - Ensure proper contrast ratios
   - Support screen readers
   - Implement proper focus management

5. **Offline Support**
   - Design features with offline-first mindset
   - Implement proper data synchronization
   - Handle conflict resolution gracefully

## Additional Resources

- Flutter documentation: https://docs.flutter.dev/
- Next.js documentation: https://nextjs.org/docs
- Node.js best practices: https://github.com/goldbergyoni/nodebestpractices
- TensorFlow Lite guide: https://www.tensorflow.org/lite/guide

## Contact Information

For any questions or clarifications about the Okada platform development, please contact:

- Project Manager: project.manager@okada.cm
- Technical Lead: tech.lead@okada.cm
- AI Lead: ai.lead@okada.cm
