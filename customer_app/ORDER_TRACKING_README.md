# Order Tracking Screen - Implementation Guide

## Overview

This document provides a quick start guide for the frontend team to begin implementing the Order Tracking screen for Sprint 1.

## What's Included

### 📦 Core Files Generated

1. **Models** (`lib/models/tracking_data.dart`)
   - `TrackingData` - Main tracking data model
   - `Location` - GPS coordinates with address
   - `RiderInfo` - Rider details and current location
   - `OrderStatusStep` - Timeline step model
   - `OrderStatus` & `OrderStepStatus` enums

2. **Provider** (`lib/providers/order_tracking_provider.dart`)
   - `OrderTrackingState` - Immutable state class
   - `OrderTrackingNotifier` - State management with Riverpod
   - WebSocket integration for real-time updates
   - API integration for initial data fetch
   - Delay handling and compensation logic

3. **Services** (`lib/services/tracking_websocket_service.dart`)
   - WebSocket connection management
   - Automatic reconnection with exponential backoff
   - Event handling (location_update, delivery_delayed, compensation_applied)
   - Error handling and connection status

4. **Screen** (`lib/screens/order/order_tracking_screen.dart`)
   - Main tracking screen with map and details
   - Draggable bottom sheet for order info
   - Delay warning banner integration
   - Order cancellation flow
   - Delay options modal

5. **Widgets**
   - `OrderStatusTimeline` - Vertical timeline with status indicators
   - `RiderInfoCard` - Rider details with call button
   - `DelayWarningBanner` - Yellow warning for delays
   - `OrderTrackingMap` - Google Maps with markers and route

## Quick Start

### Step 1: Install Dependencies

```bash
cd customer_app
flutter pub add flutter_riverpod google_maps_flutter web_socket_channel url_launcher
flutter pub get
```

See `DEPENDENCIES.md` for full installation instructions including platform-specific configuration.

### Step 2: Configure Google Maps

1. Get API key from Google Cloud Console
2. Add to `android/app/src/main/AndroidManifest.xml`
3. Add to `ios/Runner/AppDelegate.swift`

### Step 3: Update Configuration

**In `tracking_websocket_service.dart` (line 52):**
```dart
final wsUrl = 'wss://api.okada.cm/v1/tracking/$orderId';
// Replace with your actual WebSocket URL
```

**In `order_tracking_provider.dart` (line 205):**
```dart
final apiClientProvider = Provider<OkadaApiClient>((ref) {
  return OkadaApiClient(); // Use your existing API client
});
```

### Step 4: Add Navigation

Add navigation to the tracking screen from your order list:

```dart
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => OrderTrackingScreen(
      orderId: order.id,
    ),
  ),
);
```

### Step 5: Test with Mock Data

Create a test file to verify the UI works:

```dart
// test/order_tracking_test.dart
void main() {
  testWidgets('OrderTrackingScreen renders', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          home: OrderTrackingScreen(orderId: 'TEST-123'),
        ),
      ),
    );
    
    expect(find.text('Order Tracking'), findsOneWidget);
  });
}
```

## Features Implemented

### ✅ Sprint 1 Features (Ready to Use)

- [x] **Real-time Map Display** - Google Maps with pickup, delivery, and rider markers
- [x] **Order Status Timeline** - Vertical timeline with visual indicators
- [x] **Rider Information Card** - Photo, name, rating, and call button
- [x] **WebSocket Integration** - Real-time location updates
- [x] **State Management** - Riverpod provider with proper error handling
- [x] **Loading States** - Loading, error, and empty state UI
- [x] **Draggable Bottom Sheet** - Smooth, draggable order details panel
- [x] **Map Controls** - Center on rider, fit all markers
- [x] **Connection Indicator** - Visual WebSocket connection status

### 🔄 Sprint 2 Features (Partially Implemented)

- [x] **Delay Warning Banner** - Yellow warning UI (ready)
- [x] **Delay Options Modal** - Wait, cancel, or contact support (ready)
- [x] **Compensation Banner** - Green success banner for credits (ready)
- [ ] **Backend Delay Detection** - Requires backend implementation
- [ ] **Compensation API** - Requires backend implementation

## API Integration

### Required Endpoint

**GET `/orders/{orderId}/tracking`**

Expected response format:

```json
{
  "orderId": "ORD-12345",
  "status": "in_transit",
  "estimatedAt": "2025-11-15T14:30:00Z",
  "newEstimatedAt": null,
  "delayReason": null,
  "pickupLocation": {
    "latitude": 3.8480,
    "longitude": 11.5021,
    "address": "Market Fresh Store, Yaoundé"
  },
  "deliveryLocation": {
    "latitude": 3.8699,
    "longitude": 11.5213,
    "address": "123 Avenue Kennedy, Yaoundé"
  },
  "rider": {
    "id": "RDR-678",
    "name": "Daniel Okoro",
    "phone": "+237670123456",
    "rating": 4.8,
    "photoUrl": "https://...",
    "currentLocation": {
      "latitude": 3.8550,
      "longitude": 11.5115
    },
    "message": null
  },
  "statusHistory": []
}
```

### WebSocket Events

**Connection:** `wss://api.okada.cm/v1/tracking/{orderId}`

**Events the client handles:**

1. **location_update**
```json
{
  "event": "location_update",
  "data": {
    "latitude": 3.8555,
    "longitude": 11.5120
  }
}
```

2. **delivery_delayed**
```json
{
  "event": "delivery_delayed",
  "data": {
    "newEstimatedAt": "2025-11-15T15:15:00Z",
    "reason": "traffic_congestion"
  }
}
```

3. **compensation_applied**
```json
{
  "event": "compensation_applied",
  "data": {
    "amount": 500
  }
}
```

## Testing Checklist

### Manual Testing

- [ ] Screen loads without errors
- [ ] Map displays with all three markers
- [ ] Bottom sheet is draggable
- [ ] Timeline shows correct status
- [ ] Rider card displays info correctly
- [ ] Call button launches phone dialer
- [ ] WebSocket connection indicator works
- [ ] Loading state appears during fetch
- [ ] Error state shows on API failure
- [ ] Retry button works

### Integration Testing

- [ ] WebSocket connects successfully
- [ ] Location updates move rider marker
- [ ] Delay event shows warning banner
- [ ] Compensation event shows success banner
- [ ] Order cancellation flow works
- [ ] Pull to refresh updates data

## Troubleshooting

### Common Issues

**1. Google Maps not showing**
- Check API key is configured
- Verify Maps SDK is enabled in Google Cloud Console
- Check platform-specific permissions

**2. WebSocket not connecting**
- Verify WebSocket URL is correct
- Check network connectivity
- Look for CORS issues (backend configuration)

**3. Provider not updating**
- Ensure you're using `ConsumerWidget` or `ConsumerStatefulWidget`
- Check `ref.watch()` is used correctly
- Verify provider is not disposed prematurely

**4. Markers not appearing**
- Check latitude/longitude values are valid
- Verify marker icons are loaded
- Ensure map is fully initialized before adding markers

## Next Steps

1. **Complete Sprint 1**
   - Install dependencies
   - Configure Google Maps
   - Test with mock data
   - Connect to backend API
   - Test real-time updates

2. **Backend Coordination**
   - Ensure `/orders/{id}/tracking` endpoint is ready
   - Set up WebSocket server
   - Test WebSocket events

3. **Sprint 2 Preparation**
   - Implement delay detection on backend
   - Create compensation service
   - Test full delay flow end-to-end

## Support

For questions or issues:
1. Check the Developer Implementation Guide
2. Review the mockups in `/docs/design/mockups/`
3. Refer to the Implementation Roadmap
4. Contact the backend team for API issues

---

**Generated by:** Manus AI
**Date:** November 15, 2025
**Version:** 1.0

