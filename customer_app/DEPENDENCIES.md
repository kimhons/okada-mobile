# Required Dependencies for Order Tracking Feature

Add the following dependencies to your `pubspec.yaml` file:

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_riverpod: ^2.4.9
  
  # Google Maps
  google_maps_flutter: ^2.5.0
  
  # WebSocket
  web_socket_channel: ^2.4.0
  
  # HTTP Client (should already be present)
  dio: ^5.4.0
  
  # URL Launcher (for phone calls)
  url_launcher: ^6.2.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
```

## Installation Instructions

1. Add the dependencies above to your `pubspec.yaml`
2. Run `flutter pub get` to install the packages
3. For iOS, add the following to `ios/Runner/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show delivery tracking</string>
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>tel</string>
</array>
```

4. For Android, add the following to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>

<!-- Add inside <application> tag -->
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY_HERE"/>
```

5. Get a Google Maps API Key:
   - Go to https://console.cloud.google.com/
   - Enable Maps SDK for Android and iOS
   - Create an API key
   - Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual key

## File Structure

After adding all the generated files, your project structure should look like this:

```
customer_app/
├── lib/
│   ├── models/
│   │   └── tracking_data.dart                 (NEW)
│   ├── providers/
│   │   ├── order_tracking_provider.dart       (NEW)
│   │   └── order_provider.dart                (EXISTING)
│   ├── screens/
│   │   └── order/
│   │       ├── order_tracking_screen.dart     (NEW)
│   │       └── quality_verification_screen.dart (EXISTING)
│   ├── services/
│   │   └── tracking_websocket_service.dart    (NEW)
│   └── widgets/
│       ├── order_status_timeline.dart         (NEW)
│       ├── rider_info_card.dart               (NEW)
│       ├── delay_warning_banner.dart          (NEW)
│       └── order_tracking_map.dart            (NEW)
└── pubspec.yaml
```

## Next Steps

1. Install all dependencies
2. Configure Google Maps API key
3. Update the WebSocket URL in `tracking_websocket_service.dart`
4. Update the API client provider in `order_tracking_provider.dart`
5. Add navigation to OrderTrackingScreen from your order list
6. Test the screen with mock data
7. Connect to actual backend API

