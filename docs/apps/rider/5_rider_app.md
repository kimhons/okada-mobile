# Flutter Rider App Implementation Checklist with AI Features

## Overview
This document provides a comprehensive implementation checklist for developing the Okada rider app using Flutter with integrated AI capabilities. The app will connect to the central AI Brain for intelligent features while maintaining optimal performance on low-end devices common in Cameroon.

## Branding Guidelines
- **Primary Color (Green)**: `#007A5E` (Cameroon flag green)
- **Secondary Color (Red)**: `#CE1126` (Cameroon flag red)
- **Accent Color (Yellow)**: `#FCD116` (Cameroon flag yellow)
- **Text on Dark**: `#FFFFFF`
- **Text on Light**: `#333333`

## Project Setup

### 1. Initialize Flutter Project
```bash
flutter create --org cm.okada --project-name okada_rider --platforms android,ios -a kotlin -i swift okada_rider
cd okada_rider
```

### 2. Configure Project Structure
```
lib/
├── api/                  # API service connections
├── blocs/                # Business Logic Components
├── config/               # Configuration files
├── constants/            # App constants
├── data/                 # Data models and repositories
├── di/                   # Dependency injection
├── features/             # Feature modules
├── l10n/                 # Localization
├── services/             # Services including AI services
├── theme/                # App theme
├── utils/                # Utility functions
└── widgets/              # Reusable widgets
```

### 3. Add Essential Dependencies
Update `pubspec.yaml` with:

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  # State Management
  flutter_bloc: ^8.1.3
  equatable: ^2.0.5
  # Networking
  dio: ^5.3.2
  connectivity_plus: ^4.0.2
  # Local Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  shared_preferences: ^2.2.1
  # Location Services
  geolocator: ^10.0.1
  google_maps_flutter: ^2.5.0
  # UI Components
  flutter_svg: ^2.0.7
  cached_network_image: ^3.2.3
  shimmer: ^3.0.0
  # AI Integration
  tflite_flutter: ^0.10.1
  # Firebase Services
  firebase_core: ^2.15.1
  firebase_messaging: ^14.6.7
  firebase_analytics: ^10.4.5
  # Utils
  intl: ^0.18.1
  logger: ^2.0.1
  package_info_plus: ^4.1.0
  url_launcher: ^6.1.14
  # Audio
  just_audio: ^0.9.35
  # Biometrics
  local_auth: ^2.1.7
  # Permissions
  permission_handler: ^10.4.5

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.3
  build_runner: ^2.4.6
  hive_generator: ^2.0.1
  flutter_launcher_icons: ^0.13.1
  flutter_native_splash: ^2.3.2
```

## Core Implementation

### 1. Theme Configuration
Create `lib/theme/app_theme.dart`:

```dart
import 'package:flutter/material.dart';

class AppTheme {
  static const primaryColor = Color(0xFF007A5E); // Green
  static const secondaryColor = Color(0xFFCE1126); // Red
  static const accentColor = Color(0xFFFCD116); // Yellow
  
  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: primaryColor,
      colorScheme: ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: accentColor,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      // Add more theme configurations
    );
  }
  
  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      primaryColor: primaryColor,
      colorScheme: ColorScheme.dark(
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: accentColor,
      ),
      // Add more dark theme configurations
    );
  }
}
```

### 2. Localization Setup
Create `lib/l10n/app_localizations.dart` for English and French support.

### 3. API Service Configuration
Create `lib/api/api_service.dart` with Dio configuration and interceptors.

### 4. AI Service Integration
Create `lib/services/ai_service.dart` to connect with the AI Brain:

```dart
import 'package:dio/dio.dart';

class AIService {
  final Dio _dio;
  
  AIService(this._dio);
  
  // Route optimization
  Future<List<Map<String, dynamic>>> getOptimizedRoute(
    double startLat, 
    double startLng,
    double endLat,
    double endLng,
    {List<Map<String, dynamic>>? waypoints}
  ) async {
    try {
      final response = await _dio.post('/ai/route-optimization', data: {
        'start': {'lat': startLat, 'lng': startLng},
        'end': {'lat': endLat, 'lng': endLng},
        'waypoints': waypoints ?? [],
      });
      
      return List<Map<String, dynamic>>.from(response.data['route']);
    } catch (e) {
      // Fallback to local calculation if AI service is unavailable
      return _calculateBasicRoute(startLat, startLng, endLat, endLng, waypoints);
    }
  }
  
  // Earnings prediction
  Future<Map<String, dynamic>> predictEarnings(
    int completedOrders,
    double averageRating,
    int hoursOnline
  ) async {
    try {
      final response = await _dio.post('/ai/earnings-prediction', data: {
        'completedOrders': completedOrders,
        'averageRating': averageRating,
        'hoursOnline': hoursOnline,
      });
      
      return Map<String, dynamic>.from(response.data);
    } catch (e) {
      // Fallback to basic calculation
      return {
        'predictedEarnings': completedOrders * 500.0, // Basic estimate
        'confidence': 0.7,
      };
    }
  }
  
  // Local fallback for route calculation
  List<Map<String, dynamic>> _calculateBasicRoute(
    double startLat, 
    double startLng,
    double endLat,
    double endLng,
    List<Map<String, dynamic>>? waypoints
  ) {
    // Simple direct route calculation
    return [
      {'lat': startLat, 'lng': startLng},
      {'lat': endLat, 'lng': endLng},
    ];
  }
  
  // Order priority recommendation
  Future<List<Map<String, dynamic>>> getOrderPriorities(
    List<Map<String, dynamic>> availableOrders,
    Map<String, dynamic> riderProfile
  ) async {
    try {
      final response = await _dio.post('/ai/order-priorities', data: {
        'orders': availableOrders,
        'riderProfile': riderProfile,
      });
      
      return List<Map<String, dynamic>>.from(response.data['prioritizedOrders']);
    } catch (e) {
      // Sort by distance as fallback
      availableOrders.sort((a, b) => 
        (a['distance'] as num).compareTo(b['distance'] as num));
      return availableOrders;
    }
  }
}
```

### 5. Local AI Model Integration
Create `lib/services/local_ai_service.dart` for offline AI capabilities:

```dart
import 'package:tflite_flutter/tflite_flutter.dart';

class LocalAIService {
  Interpreter? _routeOptimizer;
  Interpreter? _orderPrioritizer;
  
  Future<void> initialize() async {
    try {
      _routeOptimizer = await Interpreter.fromAsset('assets/models/route_optimizer.tflite');
      _orderPrioritizer = await Interpreter.fromAsset('assets/models/order_prioritizer.tflite');
    } catch (e) {
      print('Failed to load TFLite models: $e');
    }
  }
  
  List<List<double>> optimizeRouteOffline(
    double startLat, 
    double startLng,
    double endLat,
    double endLng
  ) {
    if (_routeOptimizer == null) {
      return [
        [startLat, startLng],
        [endLat, endLng]
      ];
    }
    
    // Input shape: [1, 4] (start_lat, start_lng, end_lat, end_lng)
    var input = [
      [startLat, startLng, endLat, endLng]
    ];
    
    // Output shape depends on model, e.g., [1, 10, 2] for 10 waypoints
    var output = List.generate(
      1, 
      (_) => List.generate(
        10, 
        (_) => List.generate(2, (_) => 0.0)
      )
    );
    
    _routeOptimizer!.run(input, output);
    
    // Convert output to list of coordinates
    List<List<double>> route = [];
    for (var point in output[0]) {
      if (point[0] != 0.0 || point[1] != 0.0) {
        route.add([point[0], point[1]]);
      }
    }
    
    return route;
  }
  
  // Add more offline AI methods as needed
}
```

## Feature Implementation

### 1. Authentication Module
Create authentication screens and logic:
- Login screen
- OTP verification
- Profile setup
- Biometric authentication

### 2. Home Screen
Create `lib/features/home/home_screen.dart` with:
- Order request cards
- AI-powered order recommendations
- Earnings summary
- Online/Offline toggle
- Performance metrics

### 3. Order Management
Create order management screens:
- Order details screen
- Order acceptance/rejection
- Navigation to pickup
- Order pickup confirmation
- Navigation to delivery
- Delivery confirmation
- Issue reporting

### 4. Navigation and Maps
Implement map functionality:
- Google Maps integration
- AI-optimized route display
- Turn-by-turn navigation
- Offline map caching
- Voice guidance

### 5. Earnings and Analytics
Create earnings screens:
- Daily/weekly/monthly earnings
- AI-powered earnings predictions
- Performance analytics
- Incentive tracking

### 6. Profile and Settings
Implement profile management:
- Personal information
- Vehicle details
- Document verification
- App settings
- Language selection (English/French)
- Notification preferences

### 7. Offline Mode
Implement robust offline functionality:
- Order caching
- Offline navigation
- Data synchronization when back online
- Local AI model execution

## AI Feature Implementation

### 1. Smart Order Recommendation
Implement BLoC for AI-powered order recommendations:

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../services/ai_service.dart';

// Events
abstract class OrderRecommendationEvent extends Equatable {
  @override
  List<Object> get props => [];
}

class FetchOrderRecommendations extends OrderRecommendationEvent {
  final List<Map<String, dynamic>> availableOrders;
  final Map<String, dynamic> riderProfile;
  
  FetchOrderRecommendations(this.availableOrders, this.riderProfile);
  
  @override
  List<Object> get props => [availableOrders, riderProfile];
}

// States
abstract class OrderRecommendationState extends Equatable {
  @override
  List<Object> get props => [];
}

class OrderRecommendationInitial extends OrderRecommendationState {}
class OrderRecommendationLoading extends OrderRecommendationState {}
class OrderRecommendationLoaded extends OrderRecommendationState {
  final List<Map<String, dynamic>> prioritizedOrders;
  
  OrderRecommendationLoaded(this.prioritizedOrders);
  
  @override
  List<Object> get props => [prioritizedOrders];
}
class OrderRecommendationError extends OrderRecommendationState {
  final String message;
  
  OrderRecommendationError(this.message);
  
  @override
  List<Object> get props => [message];
}

// BLoC
class OrderRecommendationBloc extends Bloc<OrderRecommendationEvent, OrderRecommendationState> {
  final AIService aiService;
  
  OrderRecommendationBloc(this.aiService) : super(OrderRecommendationInitial()) {
    on<FetchOrderRecommendations>(_onFetchOrderRecommendations);
  }
  
  Future<void> _onFetchOrderRecommendations(
    FetchOrderRecommendations event,
    Emitter<OrderRecommendationState> emit
  ) async {
    emit(OrderRecommendationLoading());
    
    try {
      final prioritizedOrders = await aiService.getOrderPriorities(
        event.availableOrders,
        event.riderProfile
      );
      
      emit(OrderRecommendationLoaded(prioritizedOrders));
    } catch (e) {
      emit(OrderRecommendationError(e.toString()));
    }
  }
}
```

### 2. Intelligent Route Optimization
Implement route optimization with AI:

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../services/ai_service.dart';
import '../../services/local_ai_service.dart';
import '../../services/connectivity_service.dart';

// Events, States, and BLoC implementation for route optimization
// Similar structure to OrderRecommendationBloc
```

### 3. Earnings Prediction
Implement earnings prediction with AI:

```dart
// Similar BLoC pattern for earnings prediction
```

### 4. Offline AI Capabilities
Implement service to manage offline AI models:

```dart
// Service to download, update, and manage offline AI models
```

## Testing Checklist

### 1. Unit Tests
Create tests for:
- AI service integration
- Local AI model execution
- Data models
- BLoC logic

### 2. Widget Tests
Create tests for:
- UI components
- Screen flows
- User interactions

### 3. Integration Tests
Create tests for:
- End-to-end order flow
- Authentication flow
- Offline functionality

## Deployment Preparation

### 1. App Icons and Splash Screen
Configure app icons with Cameroon flag colors:

```yaml
flutter_icons:
  android: true
  ios: true
  image_path: "assets/icons/app_icon.png"
  adaptive_icon_background: "#007A5E"
  adaptive_icon_foreground: "assets/icons/app_icon_foreground.png"

flutter_native_splash:
  color: "#007A5E"
  image: assets/images/splash.png
  android: true
  ios: true
```

### 2. Performance Optimization
- Implement memory optimization
- Configure image caching
- Optimize startup time
- Reduce app size

### 3. Release Configuration
Create `android/app/build.gradle` configurations for release build.

## Final Checklist

### 1. Pre-Launch Verification
- Verify all AI features work as expected
- Test offline functionality
- Verify localization (English and French)
- Check performance on low-end devices

### 2. Documentation
- Create API documentation
- Document AI model specifications
- Create user manual

### 3. Monitoring Setup
- Configure crash reporting
- Set up analytics
- Prepare for user feedback collection

## Implementation Notes

- Prioritize offline functionality for Cameroon's connectivity challenges
- Ensure the app works efficiently on low-end Android devices
- Optimize battery usage for areas with unreliable electricity
- Implement progressive loading for better user experience
- Use the Cameroon flag colors (green, red, yellow) consistently throughout the UI
