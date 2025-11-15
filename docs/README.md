# Okada Mobile Apps Documentation

Welcome to the documentation for the Okada Flutter mobile applications. This repository contains design specifications, mockups, and technical documentation for all three mobile apps.

---

## 📱 Mobile Applications

This repository contains three Flutter applications:

1. **Customer App** (30 screens) - For end-users to browse products, place orders, and track deliveries
2. **Seller App** (65 screens) - For vendors to manage products, process orders, and track sales
3. **Rider App** (60 screens) - For delivery riders to accept orders, navigate routes, and complete deliveries

**Total: 160 mobile screens**

---

## 📚 Documentation Structure

### 🎨 [Design](./design/)
Complete design system, mockups, and design tokens for all mobile apps.

#### Design System Documentation
- **[DESIGN_SYSTEM.md](./design/DESIGN_SYSTEM.md)** - Complete design system specifications
- **[SCREEN_INDEX.md](./design/SCREEN_INDEX.md)** - Index of all 160 mobile screens with descriptions

#### [Design Tokens](./design/tokens/)
Design tokens optimized for Flutter development:
- **[design-tokens.json](./design/tokens/design-tokens.json)** - JSON format (17 KB)
- **[design-tokens.css](./design/tokens/design-tokens.css)** - CSS variables (14 KB)
- **[design-tokens.ts](./design/tokens/design-tokens.ts)** - TypeScript/JavaScript (14 KB) - Convert to Dart
- **[DESIGN_TOKENS_README.md](./design/tokens/DESIGN_TOKENS_README.md)** - Usage guide

#### [Mockups](./design/mockups/)
High-fidelity mockups for all mobile applications (160 PNG files):
- **[customer_app/](./design/mockups/customer_app/)** - 35 screens
- **[seller_app/](./design/mockups/seller_app/)** - 65 screens
- **[rider_app/](./design/mockups/rider_app/)** - 60 screens

### 📱 [Apps](./apps/)
App-specific technical specifications and feature documentation.

- **[customer/](./apps/customer/)** - Customer app specifications (119 KB)
- **[seller/](./apps/seller/)** - Seller app specifications (21 KB)
- **[rider/](./apps/rider/)** - Rider app specifications (14 KB)

---

## 🚀 Quick Start for Flutter Developers

### 1. Set Up Flutter Environment

```bash
# Verify Flutter installation
flutter doctor

# Clone the repository
git clone https://github.com/YOUR_USERNAME/okada-mobile.git
cd okada-mobile
```

### 2. Review Design System

1. Read [DESIGN_SYSTEM.md](./design/DESIGN_SYSTEM.md) for complete design specifications
2. Check [SCREEN_INDEX.md](./design/SCREEN_INDEX.md) for all screen details
3. View mockups in [design/mockups/](./design/mockups/)

### 3. Convert Design Tokens to Dart

The design tokens need to be converted from TypeScript to Dart constants:

```dart
// lib/shared/ui/theme/colors.dart
class OkadaColors {
  static const Color primary = Color(0xFF2D8659); // Okada Green
  static const Color secondary = Color(0xFFFF8C42); // Orange Accent
  
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
  
  // Gray scale
  static const Color gray50 = Color(0xFFF9FAFB);
  static const Color gray100 = Color(0xFFF3F4F6);
  // ... add all gray shades
}

// lib/shared/ui/theme/typography.dart
class OkadaTypography {
  static const TextStyle h1 = TextStyle(
    fontSize: 32,
    height: 1.25, // 40px line height / 32px font size
    fontWeight: FontWeight.w700,
    fontFamily: 'Inter',
  );
  
  static const TextStyle body = TextStyle(
    fontSize: 14,
    height: 1.43, // 20px / 14px
    fontWeight: FontWeight.w400,
    fontFamily: 'Inter',
  );
  // ... add all typography styles
}

// lib/shared/ui/theme/spacing.dart
class OkadaSpacing {
  static const double spacing0 = 0;
  static const double spacing1 = 4;
  static const double spacing2 = 8;
  static const double spacing3 = 12;
  static const double spacing4 = 16; // Base unit
  static const double spacing6 = 24;
  static const double spacing8 = 32;
  static const double spacing12 = 48;
  static const double spacing16 = 64;
}
```

### 4. Create Flutter Theme

```dart
// lib/shared/ui/theme/theme.dart
import 'package:flutter/material.dart';
import 'colors.dart';
import 'typography.dart';

ThemeData okadaTheme() {
  return ThemeData(
    primaryColor: OkadaColors.primary,
    colorScheme: ColorScheme.light(
      primary: OkadaColors.primary,
      secondary: OkadaColors.secondary,
      error: OkadaColors.error,
    ),
    textTheme: TextTheme(
      displayLarge: OkadaTypography.h1,
      displayMedium: OkadaTypography.h2,
      bodyLarge: OkadaTypography.bodyLarge,
      bodyMedium: OkadaTypography.body,
    ),
    fontFamily: 'Inter',
  );
}
```

### 5. Implement Screens

Reference the mockups and implement screens using Clean Architecture:

```
lib/
├── features/
│   ├── customer/
│   │   ├── presentation/
│   │   │   ├── screens/
│   │   │   │   ├── home_screen.dart
│   │   │   │   ├── product_detail_screen.dart
│   │   │   │   └── ...
│   │   │   └── widgets/
│   │   ├── domain/
│   │   └── data/
│   ├── seller/
│   └── rider/
└── shared/
    ├── ui/
    │   ├── theme/
    │   └── widgets/
    └── core/
```

---

## 🎯 Key Features to Implement

### 1. Quality Verification Photos (KEY DIFFERENTIATOR!)

**Rider App (Screens 11-13):**
- Camera screen with grid overlay for photo guidance
- Photo review with quality indicators
- Waiting for customer approval state

**Customer App (Screen 21):**
- Review 3 verification photos from rider
- Approve/reject functionality
- Quality indicators

**Flutter Packages Needed:**
- `camera` - Camera access
- `image_picker` - Photo selection
- `image` - Image processing
- `path_provider` - File storage

### 2. MTN/Orange Money Integration

**Screens:** Payment selection, transaction processing, withdrawal

**Flutter Packages Needed:**
- Custom integration with MTN Mobile Money API
- Custom integration with Orange Money API
- `http` or `dio` for API calls

**Colors:**
- MTN: `Color(0xFFFFCC00)` (Yellow)
- Orange: `Color(0xFFFF6600)` (Orange)

### 3. Bilingual Support (English/French)

**Screens:** Language settings across all apps

**Flutter Packages Needed:**
- `flutter_localizations`
- `intl`

**Localization Tokens:**
- Douala: 70% English, 30% French
- Yaoundé: 60% English, 40% French
- Bamenda: 85% English, 15% French

### 4. Offline Mode

**Screens:** Offline mode indicator, downloaded maps, cached data

**Flutter Packages Needed:**
- `hive` - Local storage
- `sqflite` - SQLite database
- `connectivity_plus` - Network status

### 5. Real-time Order Tracking

**Screens:** Order tracking with live map, rider location updates

**Flutter Packages Needed:**
- `google_maps_flutter` - Maps integration
- `geolocator` - Location services
- `socket_io_client` - Real-time updates

---

## 📊 Mobile App Statistics

| App | Screens | Key Features |
|-----|---------|--------------|
| **Customer** | 35 | Browse, Order, Track, Review |
| **Seller** | 65 | Products, Orders, Analytics, AI Photos |
| **Rider** | 60 | Accept Orders, Navigate, Quality Photos, Earnings |
| **Total** | **160** | **Complete mobile experience** |

---

## 🛠️ Technology Stack

- **Framework**: Flutter 3.x
- **Language**: Dart 3.x
- **State Management**: Riverpod
- **Architecture**: Clean Architecture (feature-first)
- **API Client**: Dio with Retrofit
- **Local Storage**: Hive (offline-first)
- **Maps**: Google Maps Flutter
- **Payments**: MTN Mobile Money + Orange Money SDKs
- **Camera**: camera package
- **Push Notifications**: Firebase Cloud Messaging

---

## 📦 Recommended Flutter Packages

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_riverpod: ^2.4.0
  
  # API & Networking
  dio: ^5.3.0
  retrofit: ^4.0.0
  
  # Local Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  sqflite: ^2.3.0
  
  # Maps & Location
  google_maps_flutter: ^2.5.0
  geolocator: ^10.1.0
  
  # Camera & Images
  camera: ^0.10.5
  image_picker: ^1.0.4
  image: ^4.1.0
  
  # Real-time
  socket_io_client: ^2.0.3
  
  # Localization
  flutter_localizations:
    sdk: flutter
  intl: ^0.18.1
  
  # UI
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  
  # Utils
  path_provider: ^2.1.1
  connectivity_plus: ^5.0.1
  permission_handler: ^11.0.1
```

---

## 🎨 Design System Implementation Checklist

- [ ] Convert design tokens to Dart constants
- [ ] Create Flutter theme configuration
- [ ] Implement reusable widgets (buttons, inputs, cards)
- [ ] Set up typography system
- [ ] Configure color palette
- [ ] Create component library
- [ ] Implement navigation structure
- [ ] Set up state management (Riverpod)
- [ ] Configure API client (Dio + Retrofit)
- [ ] Set up local storage (Hive)

---

## 🚀 Development Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Initialize Flutter projects (customer_app, seller_app, rider_app)
- [ ] Set up shared package
- [ ] Convert design tokens to Dart
- [ ] Create theme configuration
- [ ] Implement base widgets

### Phase 2: Core Features (Week 3-6)
- [ ] Implement authentication
- [ ] Build product browsing (Customer)
- [ ] Build order management (All apps)
- [ ] Implement Quality Verification Photos (Rider + Customer)
- [ ] Integrate MTN/Orange Money payments

### Phase 3: Advanced Features (Week 7-10)
- [ ] Real-time order tracking
- [ ] Offline mode
- [ ] Push notifications
- [ ] Bilingual support
- [ ] Analytics dashboards

### Phase 4: Polish & Launch (Week 11-12)
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] User acceptance testing
- [ ] App Store submission
- [ ] Google Play submission

---

## 📝 Next Steps

1. **Initialize Flutter Projects**
   ```bash
   flutter create customer_app
   flutter create seller_app
   flutter create rider_app
   ```

2. **Set Up Shared Package**
   ```bash
   mkdir -p shared/lib/{core,ui,models}
   ```

3. **Convert Design Tokens**
   - Create Dart constants from design-tokens.json
   - Implement theme configuration

4. **Start Development**
   - Begin with Customer App home screen
   - Implement Quality Verification Photos feature
   - Build out remaining screens

---

## 🔗 Related Repositories

- **Backend**: [okada-backend](https://github.com/YOUR_USERNAME/okada-backend) (Laravel API)
- **Mobile Apps**: [okada-mobile](https://github.com/YOUR_USERNAME/okada-mobile) (This repo)

---

## 📞 Support

For questions about Flutter development:
1. Check the app-specific documentation in [apps/](./apps/)
2. Review the design system in [design/](./design/)
3. Reference the mockups in [design/mockups/](./design/mockups/)
4. Contact the development team

---

**Ready to build beautiful Flutter apps for Cameroon!** 🚀🇨🇲

