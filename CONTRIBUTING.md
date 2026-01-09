# Contributing to Okada Platform

Thank you for your interest in contributing to Okada! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Flutter 3.16+ with Dart 3.2+
- Node.js 22.0+
- Python 3.11+
- Docker 24.0+
- pnpm 9.0+

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/okada-mobile.git
   cd okada-mobile
   ```

2. **Install dependencies**
   ```bash
   # Node.js packages
   pnpm install
   
   # Flutter packages
   cd apps/customer_app && flutter pub get
   cd ../rider_app && flutter pub get
   
   # Python packages
   cd ../../ai && pip install -r requirements.txt
   ```

3. **Start infrastructure**
   ```bash
   docker-compose up -d mysql redis rabbitmq
   ```

4. **Run the application**
   ```bash
   # Admin Dashboard
   pnpm dev:admin
   
   # Customer App
   cd apps/customer_app && flutter run
   ```

## Project Structure

```
okada-mobile/
├── apps/                    # Frontend applications
│   ├── customer_app/        # Flutter customer app
│   ├── rider_app/           # Flutter rider app
│   ├── admin_dashboard/     # React admin dashboard
│   └── merchant_portal/     # React merchant portal
├── services/                # Backend microservices
├── ai/                      # AI/ML services
├── packages/                # Shared packages
├── infrastructure/          # DevOps configurations
└── docs/                    # Documentation
```

## Development Workflow

### Branch Naming

- `feature/` - New features (e.g., `feature/order-tracking`)
- `fix/` - Bug fixes (e.g., `fix/payment-timeout`)
- `docs/` - Documentation (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-service`)
- `test/` - Test additions (e.g., `test/order-service`)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code refactoring
- `test` - Tests
- `chore` - Maintenance

**Examples:**
```
feat(customer-app): add order tracking screen
fix(payment-service): handle timeout errors
docs(api): update authentication endpoints
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Run quality checks**
   ```bash
   # Linting
   pnpm lint
   
   # Tests
   pnpm test
   
   # Flutter
   cd apps/customer_app && flutter analyze && flutter test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature
   ```

6. **Fill out the PR template** with:
   - Description of changes
   - Related issues
   - Screenshots (if UI changes)
   - Testing performed

## Coding Standards

### Flutter/Dart

- Follow [Effective Dart](https://dart.dev/guides/language/effective-dart)
- Use Riverpod for state management
- Implement Clean Architecture (data/domain/presentation)
- Write widget tests for UI components

### TypeScript/Node.js

- Use TypeScript strict mode
- Follow ESLint configuration
- Use tRPC for API endpoints
- Write unit tests with Vitest

### Python

- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Use pytest for testing

## Testing

### Running Tests

```bash
# All Node.js tests
pnpm test

# Specific service
pnpm --filter @okada/auth-service test

# Flutter tests
cd apps/customer_app && flutter test

# Python tests
cd ai && pytest
```

### Test Coverage

- Aim for >80% code coverage
- Write unit tests for business logic
- Write integration tests for API endpoints
- Write widget tests for UI components

## Documentation

- Update README.md for new features
- Add JSDoc/dartdoc comments
- Update API documentation
- Include code examples

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/kimhons/okada-mobile/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kimhons/okada-mobile/discussions)
- **Email**: dev@okada.cm

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to Okada! 🚀
