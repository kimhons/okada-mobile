# Okada Platform Development Setup

This document provides step-by-step instructions for setting up the development environment for the Okada platform.

## Prerequisites

Before starting, ensure you have the following installed on your development machine:

- **Git**: Version control system
- **Node.js**: v18.x or later
- **npm**: v9.x or later
- **Flutter**: v3.10.x or later
- **Dart**: v3.0.x or later
- **Docker**: v20.x or later
- **Docker Compose**: v2.x or later
- **Python**: v3.10.x or later (for AI model development)
- **AWS CLI**: v2.x or later (for cloud deployment)

## Development Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/okada/okada-platform.git
cd okada-platform
```

### 2. Backend Services Setup

Navigate to the backend directory and set up the services:

```bash
cd backend

# Install dependencies for all services
npm run install:all

# Set up environment variables
cp .env.example .env
# Edit .env with your local configuration

# Start the development database
docker-compose up -d db redis

# Run database migrations
npm run migrate:dev

# Seed the database with sample data
npm run seed:dev

# Start all backend services in development mode
npm run dev
```

The backend services will be available at:
- API Gateway: http://localhost:4000
- Authentication Service: http://localhost:4001
- User Service: http://localhost:4002
- Product Service: http://localhost:4003
- Order Service: http://localhost:4004
- Payment Service: http://localhost:4005
- Notification Service: http://localhost:4006
- Analytics Service: http://localhost:4007

### 3. AI Brain Setup

Navigate to the AI Brain directory and set up the development environment:

```bash
cd ../ai_brain

# Create and activate a Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your local configuration

# Download pre-trained models
python scripts/download_models.py

# Start the AI Brain development server
python scripts/dev_server.py
```

The AI Brain API will be available at http://localhost:5000

### 4. Customer App Setup

Navigate to the customer app directory and set up the Flutter environment:

```bash
cd ../mobile/customer_app

# Get Flutter dependencies
flutter pub get

# Generate code for JSON serialization and BLoC
flutter pub run build_runner build --delete-conflicting-outputs

# Set up environment variables
cp .env.example .env
# Edit .env with your local configuration

# Run the app in development mode
flutter run
```

### 5. Rider App Setup

Navigate to the rider app directory and set up the Flutter environment:

```bash
cd ../rider_app

# Get Flutter dependencies
flutter pub get

# Generate code for JSON serialization and BLoC
flutter pub run build_runner build --delete-conflicting-outputs

# Set up environment variables
cp .env.example .env
# Edit .env with your local configuration

# Run the app in development mode
flutter run
```

### 6. Merchant Web Platform Setup

Navigate to the web directory and set up the Next.js environment:

```bash
cd ../../web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your local configuration

# Run the development server
npm run dev
```

The merchant web platform will be available at http://localhost:3000

## Development Tools

### API Documentation

The API documentation is available at http://localhost:4000/docs when the backend services are running.

### Database Management

For PostgreSQL database management, you can use pgAdmin or connect directly:

```bash
# Connect to the PostgreSQL database
docker exec -it okada-db psql -U postgres -d okada_dev
```

For MongoDB database management, you can use MongoDB Compass or connect directly:

```bash
# Connect to the MongoDB database
docker exec -it okada-mongodb mongosh
```

### Redis Management

For Redis management, you can use Redis Commander or connect directly:

```bash
# Connect to the Redis instance
docker exec -it okada-redis redis-cli
```

## Testing

### Backend Services Testing

```bash
cd backend

# Run unit tests for all services
npm run test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

### Mobile Apps Testing

```bash
cd mobile/customer_app

# Run unit tests
flutter test

# Run integration tests
flutter test integration_test
```

Repeat the same commands for the rider app.

### Web Platform Testing

```bash
cd web

# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e
```

## Linting and Formatting

### Backend Services

```bash
cd backend

# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Mobile Apps

```bash
cd mobile/customer_app

# Run Flutter linting
flutter analyze

# Format code
flutter format lib
```

Repeat the same commands for the rider app.

### Web Platform

```bash
cd web

# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

## Building for Production

### Backend Services

```bash
cd backend

# Build all services for production
npm run build:all

# Start all services in production mode
npm run start:all
```

### Mobile Apps

```bash
cd mobile/customer_app

# Build Android APK
flutter build apk --release

# Build Android App Bundle
flutter build appbundle --release

# Build iOS IPA (requires macOS)
flutter build ipa --release
```

Repeat the same commands for the rider app.

### Web Platform

```bash
cd web

# Build for production
npm run build

# Start the production server
npm run start
```

## Deployment

Refer to the deployment documentation in `/docs/deployment.md` for detailed instructions on deploying the Okada platform to production environments.

## Troubleshooting

### Common Issues

#### Backend Services

- **Issue**: Services fail to start
  - **Solution**: Check if the required ports are available and not used by other applications

- **Issue**: Database connection errors
  - **Solution**: Verify that the database containers are running and the connection details in `.env` are correct

#### Mobile Apps

- **Issue**: Build errors after Flutter upgrade
  - **Solution**: Run `flutter clean` and then `flutter pub get`

- **Issue**: Generated code conflicts
  - **Solution**: Delete the generated files and run `flutter pub run build_runner build --delete-conflicting-outputs`

#### Web Platform

- **Issue**: API connection errors
  - **Solution**: Check if the backend services are running and the API URL in `.env.local` is correct

- **Issue**: Build errors
  - **Solution**: Clear the Next.js cache by deleting the `.next` directory and rebuilding

### Getting Help

If you encounter any issues not covered in this document, please:

1. Check the project wiki for additional documentation
2. Search for similar issues in the project issue tracker
3. Ask for help in the project's Slack channel
4. Contact the technical lead at tech.lead@okada.cm
