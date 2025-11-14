# Okada Mobile - Flutter Apps

This repository contains all three Flutter mobile applications for the Okada platform:

- **Customer App**: For end-users to browse products, place orders, and track deliveries
- **Seller App**: For vendors to manage products, process orders, and track sales
- **Rider App**: For delivery riders to accept orders, navigate routes, and complete deliveries

## Project Structure

```
okada-mobile/
├── customer_app/          # Customer-facing Flutter application
├── seller_app/            # Seller-facing Flutter application
├── rider_app/             # Rider-facing Flutter application
├── shared/                # Shared code, utilities, and packages
│   ├── core/              # Core business logic
│   ├── ui/                # Shared UI components
│   └── models/            # Shared data models
├── docs/                  # Documentation
└── scripts/               # Build and deployment scripts
```

## Technology Stack

- **Framework**: Flutter 3.x
- **Language**: Dart 3.x
- **State Management**: Riverpod
- **Architecture**: Clean Architecture with feature-first organization
- **API Client**: Dio with Retrofit
- **Local Storage**: Hive (offline-first)
- **Maps**: Google Maps Flutter
- **Payments**: MTN Mobile Money & Orange Money SDKs

## Getting Started

### Prerequisites

- Flutter SDK 3.x or higher
- Dart SDK 3.x or higher
- Android Studio / VS Code with Flutter extensions
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/okada-mobile.git
cd okada-mobile
```

2. Install dependencies for each app:
```bash
cd customer_app && flutter pub get
cd ../seller_app && flutter pub get
cd ../rider_app && flutter pub get
```

3. Run the desired app:
```bash
cd customer_app
flutter run
```

## Development Workflow

- **Main Branch**: Production-ready code only
- **Develop Branch**: Integration branch for features
- **Feature Branches**: `feature/app-name/feature-description` (e.g., `feature/customer/checkout-flow`)
- **Bugfix Branches**: `bugfix/app-name/bug-description`

## Code Quality

- All code must pass `flutter analyze` with zero warnings
- All code must be formatted with `dart format`
- Unit test coverage must be above 80%
- Integration tests required for critical user flows

## Design System

This project follows the **Okada Premium Design System**. All UI components must adhere to the design specifications in Figma.

- **Colors**: Okada Green (#007A5E), Market White (#F7F3E9), Ndop Blue (#1A3263)
- **Typography**: Inter (UI), Adinkra Sans (Brand moments)
- **Components**: Reusable components in `shared/ui/`

## Contributing

1. Create a feature branch from `develop`
2. Implement your feature with tests
3. Submit a pull request to `develop`
4. Ensure all CI checks pass
5. Request review from Manus (Architect) or Claude Code (Implementation Lead)

## License

Proprietary - All rights reserved by Okada Platform

## Contact

For questions or support, contact the development team.

