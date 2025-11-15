## Okada Mobile - Flutter Setup Guide

Complete guide to set up and run the Okada Flutter mobile apps.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Flutter SDK** 3.0.0 or higher
- **Dart SDK** 3.0.0 or higher
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **VS Code** or **Android Studio** (recommended IDEs)
- **Git** (for version control)

### Installation Links
- Flutter: https://docs.flutter.dev/get-started/install
- Android Studio: https://developer.android.com/studio
- Xcode: https://developer.apple.com/xcode/
- VS Code: https://code.visualstudio.com/

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/kimhons/okada-mobile.git
cd okada-mobile
```

### 2. Verify Flutter Installation

```bash
flutter doctor
```

Ensure all checkmarks are green. Fix any issues before proceeding.

### 3. Install Dependencies

```bash
# Install shared package dependencies
cd shared
flutter pub get

# Install Customer App dependencies
cd ../customer_app
flutter pub get

# Install Seller App dependencies
cd ../seller_app
flutter pub get

# Install Rider App dependencies
cd ../rider_app
flutter pub get
```

### 4. Run an App

```bash
# Run Customer App
cd customer_app
flutter run

# Or run Seller App
cd seller_app
flutter run

# Or run Rider App
cd rider_app
flutter run
```

---

## 📁 Project Structure

```
okada-mobile/
├── shared/                    # Shared package for all apps
│   ├── lib/
│   │   ├── core/             # Core utilities
│   │   │   ├── api/          # API clients
│   │   │   ├── storage/      # Local storage
│   │   │   └── utils/        # Helper functions
│   │   ├── models/           # Data models
│   │   └── ui/               # UI components
│   │       ├── theme/        # Design tokens & theme
│   │       │   ├── colors.dart
│   │       │   ├── typography.dart
│   │       │   ├── spacing.dart
│   │       │   └── theme.dart
│   │       ├── widgets/      # Reusable widgets
│   │       └── constants/    # Constants
│   │           └── cameroon_constants.dart
│   └── pubspec.yaml
│
├── customer_app/             # Customer mobile app
│   ├── lib/
│   │   ├── main.dart
│   │   ├── core/
│   │   └── features/
│   │       ├── home/
│   │       ├── products/
│   │       ├── cart/
│   │       ├── orders/
│   │       └── profile/
│   └── pubspec.yaml
│
├── seller_app/               # Seller mobile app
│   ├── lib/
│   │   ├── main.dart
│   │   ├── core/
│   │   └── features/
│   │       ├── dashboard/
│   │       ├── products/
│   │       ├── orders/
│   │       ├── analytics/
│   │       └── profile/
│   └── pubspec.yaml
│
└── rider_app/                # Rider mobile app
    ├── lib/
    │   ├── main.dart
    │   ├── core/
    │   └── features/
    │       ├── dashboard/
    │       ├── orders/
    │       ├── delivery/      # Quality Verification Photos!
    │       ├── earnings/
    │       └── profile/
    └── pubspec.yaml
```

---

## 🎨 Using Design Tokens

All design tokens have been converted to Dart and are available in the `shared` package.

### Colors

```dart
import 'package:okada_shared/ui/theme/colors.dart';

// Brand colors
Container(color: OkadaColors.primary);        // Okada Green
Container(color: OkadaColors.secondary);      // Orange Accent

// Semantic colors
Container(color: OkadaColors.success);        // Success Green
Container(color: OkadaColors.error);          // Error Red

// Payment methods (Cameroon-specific)
Container(color: OkadaColors.mtnYellow);      // MTN Mobile Money
Container(color: OkadaColors.orangeMoney);    // Orange Money
```

### Typography

```dart
import 'package:okada_shared/ui/theme/typography.dart';

Text('Heading', style: OkadaTypography.h1);
Text('Body text', style: OkadaTypography.bodyMedium);
Text('Button', style: OkadaTypography.buttonMedium);
```

### Spacing

```dart
import 'package:okada_shared/ui/theme/spacing.dart';

Padding(
  padding: EdgeInsets.all(OkadaSpacing.paddingLg),  // 16px
  child: Container(),
);

SizedBox(height: OkadaSpacing.gapMd);  // 12px gap

BorderRadius.circular(OkadaSpacing.radiusLg);  // 12px radius
```

### Complete Theme

```dart
import 'package:okada_shared/ui/theme/theme.dart';

MaterialApp(
  theme: OkadaTheme.lightTheme,  // Complete theme with all tokens
  home: HomePage(),
);
```

### Cameroon Constants

```dart
import 'package:okada_shared/ui/constants/cameroon_constants.dart';

// Currency formatting
String price = CameroonConstants.formatCurrency(15000);  // "15,000 FCFA"

// Phone number formatting
String phone = CameroonConstants.formatPhoneNumber('650123456');  // "+237 6 50 12 34 56"

// VAT calculation
double vat = CameroonConstants.calculateVAT(10000);  // 1,925 FCFA (19.25%)

// Payment methods
String method = CameroonConstants.mtnMobileMoney;  // "MTN Mobile Money"
```

---

## 🔧 Development Workflow

### 1. Feature Development

Follow Clean Architecture principles:

```
features/
└── feature_name/
    ├── data/
    │   ├── models/
    │   ├── repositories/
    │   └── data_sources/
    ├── domain/
    │   ├── entities/
    │   ├── repositories/
    │   └── use_cases/
    └── presentation/
        ├── pages/
        ├── widgets/
        └── providers/
```

### 2. State Management

Using **Riverpod** for state management:

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Define a provider
final counterProvider = StateProvider<int>((ref) => 0);

// Use in widget
class CounterWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);
    return Text('Count: $count');
  }
}
```

### 3. API Integration

Using **Dio** and **Retrofit**:

```dart
import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'api_client.g.dart';

@RestApi(baseUrl: 'https://api.okada.cm')
abstract class ApiClient {
  factory ApiClient(Dio dio) = _ApiClient;

  @GET('/products')
  Future<List<Product>> getProducts();

  @POST('/orders')
  Future<Order> createOrder(@Body() OrderRequest request);
}
```

### 4. Code Generation

Run code generators after creating models:

```bash
# In the app directory
flutter pub run build_runner build --delete-conflicting-outputs

# Or watch for changes
flutter pub run build_runner watch
```

---

## 📱 Running on Devices

### Android

```bash
# List connected devices
flutter devices

# Run on specific device
flutter run -d <device_id>

# Build APK
flutter build apk --release

# Build App Bundle (for Play Store)
flutter build appbundle --release
```

### iOS

```bash
# Run on simulator
flutter run -d "iPhone 14"

# Run on physical device
flutter run -d <device_id>

# Build for App Store
flutter build ipa --release
```

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
flutter test

# Run tests with coverage
flutter test --coverage

# Run specific test file
flutter test test/widget_test.dart
```

### Test Structure

```
test/
├── unit/           # Unit tests
├── widget/         # Widget tests
└── integration/    # Integration tests
```

---

## 🔑 Environment Configuration

### 1. Create Environment Files

```bash
# Customer App
cp customer_app/.env.example customer_app/.env

# Seller App
cp seller_app/.env.example seller_app/.env

# Rider App
cp rider_app/.env.example rider_app/.env
```

### 2. Configure API Endpoints

Edit `.env` files:

```env
API_BASE_URL=https://api.okada.cm
API_KEY=your_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

---

## 🚨 Common Issues & Solutions

### Issue: "Flutter command not found"
**Solution**: Add Flutter to your PATH:
```bash
export PATH="$PATH:`pwd`/flutter/bin"
```

### Issue: "Gradle build failed"
**Solution**: Clean and rebuild:
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter run
```

### Issue: "CocoaPods not installed"
**Solution**: Install CocoaPods (macOS):
```bash
sudo gem install cocoapods
cd ios
pod install
cd ..
flutter run
```

### Issue: "Design tokens not found"
**Solution**: Ensure shared package is properly linked:
```bash
cd shared
flutter pub get
cd ../customer_app
flutter pub get
```

---

## 📚 Additional Resources

### Official Documentation
- Flutter Docs: https://docs.flutter.dev/
- Riverpod Docs: https://riverpod.dev/
- Dio: https://pub.dev/packages/dio
- Retrofit: https://pub.dev/packages/retrofit

### Okada-Specific Docs
- Design System: `/docs/design/DESIGN_SYSTEM.md`
- API Documentation: `/docs/api/` (in backend repo)
- Screen Mockups: `/docs/design/mockups/`

---

## 🎯 Next Steps

1. **Set up Firebase** for push notifications and analytics
2. **Implement authentication** (login/register)
3. **Build first feature**: Quality Verification Photos (Rider App)
4. **Integrate with backend API**
5. **Add offline support** with Hive
6. **Implement MTN/Orange Money** payment integration

---

## 💡 Tips for Development

1. **Use hot reload**: Press `r` in terminal while app is running
2. **Use hot restart**: Press `R` for full restart
3. **Use Flutter DevTools**: Run `flutter pub global activate devtools`
4. **Follow naming conventions**: Use snake_case for files, PascalCase for classes
5. **Write tests**: Aim for 80%+ code coverage
6. **Use linter**: Follow `flutter_lints` recommendations

---

## 📞 Support

For questions or issues:
- Check `/docs/` directory for documentation
- Review mockups in `/docs/design/mockups/`
- Contact development team

---

**Happy coding! 🚀 Let's build the future of e-commerce in Cameroon!** 🇨🇲

