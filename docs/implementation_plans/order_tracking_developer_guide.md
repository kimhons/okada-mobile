# Order Tracking Screen: Developer Implementation Guide

**Author:** Manus AI
**Date:** November 15, 2025
**Version:** 1.0
**Target Audience:** Frontend & Backend Developers

## 1. Introduction

This guide provides detailed technical specifications and step-by-step instructions for implementing the Order Tracking screen. It is designed to be used alongside the **Implementation Roadmap** and the **UI/UX Mockups**.

## 2. Technical Stack

### Frontend (Flutter)
- **State Management:** Riverpod 2.x
- **Maps:** `google_maps_flutter: ^2.5.0`
- **WebSocket:** `web_socket_channel: ^2.4.0`
- **HTTP Client:** `dio: ^5.4.0` (already in use)
- **URL Launcher:** `url_launcher: ^6.2.0`

### Backend (Laravel)
- **WebSocket Server:** `beyondcode/laravel-websockets: ^1.14`
- **Queue System:** Laravel Queue with Redis
- **Background Jobs:** For delay detection and compensation

## 3. Sprint 1: Core Tracking Experience

### Task FE-01: Create OrderTrackingScreen UI Shell

**File:** `/customer_app/lib/screens/order/order_tracking_screen.dart`

Create the basic screen structure with placeholder widgets.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class OrderTrackingScreen extends ConsumerWidget {
  final String orderId;

  const OrderTrackingScreen({Key? key, required this.orderId}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Order Tracking'),
        backgroundColor: const Color(0xFF2D8659),
      ),
      body: Column(
        children: [
          // Map placeholder (50% of screen)
          Expanded(
            flex: 1,
            child: Container(
              color: Colors.grey[300],
              child: const Center(child: Text('Map will go here')),
            ),
          ),
          // Bottom sheet with order details (50% of screen)
          Expanded(
            flex: 1,
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                children: [
                  // Status Timeline
                  const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Text('Status Timeline'),
                  ),
                  // Rider Info Card
                  const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Text('Rider Info'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

**Acceptance Criteria:**
- Screen renders without errors
- Layout matches mockup proportions (50/50 split)
- Navigation from order list works

### Task FE-02: Implement OrderTrackingProvider

**File:** `/customer_app/lib/providers/order_tracking_provider.dart`

Create a Riverpod provider to manage the tracking state.

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:okada_shared/api/okada_api_client.dart';
import 'package:okada_shared/models/order.dart';

// State classes
class OrderTrackingState {
  final bool isLoading;
  final Order? order;
  final RiderLocation? riderLocation;
  final String? error;
  final bool isDelayed;
  final DateTime? newEstimatedAt;

  OrderTrackingState({
    this.isLoading = false,
    this.order,
    this.riderLocation,
    this.error,
    this.isDelayed = false,
    this.newEstimatedAt,
  });

  OrderTrackingState copyWith({
    bool? isLoading,
    Order? order,
    RiderLocation? riderLocation,
    String? error,
    bool? isDelayed,
    DateTime? newEstimatedAt,
  }) {
    return OrderTrackingState(
      isLoading: isLoading ?? this.isLoading,
      order: order ?? this.order,
      riderLocation: riderLocation ?? this.riderLocation,
      error: error ?? this.error,
      isDelayed: isDelayed ?? this.isDelayed,
      newEstimatedAt: newEstimatedAt ?? this.newEstimatedAt,
    );
  }
}

class RiderLocation {
  final double latitude;
  final double longitude;
  final DateTime timestamp;

  RiderLocation({
    required this.latitude,
    required this.longitude,
    required this.timestamp,
  });
}

// Provider
class OrderTrackingNotifier extends StateNotifier<OrderTrackingState> {
  final OkadaApiClient apiClient;
  final String orderId;

  OrderTrackingNotifier({required this.apiClient, required this.orderId})
      : super(OrderTrackingState(isLoading: true)) {
    _initialize();
  }

  Future<void> _initialize() async {
    try {
      // Fetch initial tracking data
      final response = await apiClient.get('/orders/$orderId/tracking');
      
      // Parse response and update state
      state = state.copyWith(
        isLoading: false,
        order: Order.fromJson(response.data['order']),
        riderLocation: RiderLocation(
          latitude: response.data['rider']['currentLocation']['latitude'],
          longitude: response.data['rider']['currentLocation']['longitude'],
          timestamp: DateTime.now(),
        ),
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void updateRiderLocation(double lat, double lng) {
    state = state.copyWith(
      riderLocation: RiderLocation(
        latitude: lat,
        longitude: lng,
        timestamp: DateTime.now(),
      ),
    );
  }

  void setDelayed(DateTime newEta) {
    state = state.copyWith(isDelayed: true, newEstimatedAt: newEta);
  }
}

// Provider factory
final orderTrackingProvider = StateNotifierProvider.family<OrderTrackingNotifier, OrderTrackingState, String>(
  (ref, orderId) {
    final apiClient = ref.watch(apiClientProvider);
    return OrderTrackingNotifier(apiClient: apiClient, orderId: orderId);
  },
);
```

**Acceptance Criteria:**
- Provider fetches initial data on creation
- State updates correctly
- Error handling works

### Task FE-03: Integrate Google Maps

**Installation:**
```bash
cd customer_app
flutter pub add google_maps_flutter
```

**Implementation:**

```dart
import 'package:google_maps_flutter/google_maps_flutter.dart';

class OrderTrackingMapWidget extends ConsumerStatefulWidget {
  final String orderId;

  const OrderTrackingMapWidget({Key? key, required this.orderId}) : super(key: key);

  @override
  ConsumerState<OrderTrackingMapWidget> createState() => _OrderTrackingMapWidgetState();
}

class _OrderTrackingMapWidgetState extends ConsumerState<OrderTrackingMapWidget> {
  GoogleMapController? _mapController;
  Set<Marker> _markers = {};
  Set<Polyline> _polylines = {};

  @override
  Widget build(BuildContext context) {
    final trackingState = ref.watch(orderTrackingProvider(widget.orderId));

    if (trackingState.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (trackingState.order == null) {
      return const Center(child: Text('No data'));
    }

    // Create markers
    _markers = {
      Marker(
        markerId: const MarkerId('pickup'),
        position: LatLng(
          trackingState.order!.pickupLocation.latitude,
          trackingState.order!.pickupLocation.longitude,
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlack),
      ),
      Marker(
        markerId: const MarkerId('delivery'),
        position: LatLng(
          trackingState.order!.deliveryLocation.latitude,
          trackingState.order!.deliveryLocation.longitude,
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      ),
    };

    if (trackingState.riderLocation != null) {
      _markers.add(
        Marker(
          markerId: const MarkerId('rider'),
          position: LatLng(
            trackingState.riderLocation!.latitude,
            trackingState.riderLocation!.longitude,
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
        ),
      );
    }

    return GoogleMap(
      initialCameraPosition: CameraPosition(
        target: LatLng(
          trackingState.riderLocation?.latitude ?? 3.8480,
          trackingState.riderLocation?.longitude ?? 11.5021,
        ),
        zoom: 14,
      ),
      markers: _markers,
      polylines: _polylines,
      onMapCreated: (controller) {
        _mapController = controller;
      },
    );
  }
}
```

**Acceptance Criteria:**
- Map displays correctly
- All three markers appear
- Map centers on rider location

### Task FE-04: Implement Real-time Location Updates

**File:** `/customer_app/lib/services/tracking_websocket_service.dart`

```dart
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class TrackingWebSocketService {
  WebSocketChannel? _channel;
  final String orderId;
  final Function(double lat, double lng) onLocationUpdate;
  final Function(DateTime newEta, String reason) onDelayNotification;

  TrackingWebSocketService({
    required this.orderId,
    required this.onLocationUpdate,
    required this.onDelayNotification,
  });

  void connect() {
    _channel = WebSocketChannel.connect(
      Uri.parse('wss://api.okada.cm/v1/tracking/$orderId'),
    );

    _channel!.stream.listen(
      (message) {
        final data = jsonDecode(message);
        
        if (data['event'] == 'location_update') {
          onLocationUpdate(
            data['data']['latitude'],
            data['data']['longitude'],
          );
        } else if (data['event'] == 'delivery_delayed') {
          onDelayNotification(
            DateTime.parse(data['data']['newEstimatedAt']),
            data['data']['reason'],
          );
        }
      },
      onError: (error) {
        print('WebSocket error: $error');
      },
      onDone: () {
        print('WebSocket closed');
      },
    );
  }

  void disconnect() {
    _channel?.sink.close();
  }
}
```

**Update OrderTrackingNotifier:**

```dart
class OrderTrackingNotifier extends StateNotifier<OrderTrackingState> {
  // ... existing code ...
  TrackingWebSocketService? _wsService;

  Future<void> _initialize() async {
    // ... existing code ...

    // Connect to WebSocket
    _wsService = TrackingWebSocketService(
      orderId: orderId,
      onLocationUpdate: (lat, lng) {
        updateRiderLocation(lat, lng);
      },
      onDelayNotification: (newEta, reason) {
        setDelayed(newEta);
      },
    );
    _wsService!.connect();
  }

  @override
  void dispose() {
    _wsService?.disconnect();
    super.dispose();
  }
}
```

**Acceptance Criteria:**
- WebSocket connects successfully
- Rider marker updates in real-time
- No memory leaks (dispose works)

### Task FE-05: Implement Order Status Timeline

**File:** `/customer_app/lib/widgets/order_status_timeline.dart`

```dart
import 'package:flutter/material.dart';

class OrderStatusTimeline extends StatelessWidget {
  final List<OrderStatusStep> steps;

  const OrderStatusTimeline({Key? key, required this.steps}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: steps.asMap().entries.map((entry) {
        final index = entry.key;
        final step = entry.value;
        final isLast = index == steps.length - 1;

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                _buildStatusIcon(step.status),
                if (!isLast)
                  Container(
                    width: 2,
                    height: 40,
                    color: step.status == OrderStepStatus.completed
                        ? const Color(0xFF2D8659)
                        : Colors.grey[300],
                  ),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      step.title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: step.status == OrderStepStatus.active
                            ? FontWeight.bold
                            : FontWeight.normal,
                        color: step.status == OrderStepStatus.pending
                            ? Colors.grey
                            : Colors.black,
                      ),
                    ),
                    if (step.timestamp != null)
                      Text(
                        _formatTime(step.timestamp!),
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                  ],
                ),
              ),
            ),
          ],
        );
      }).toList(),
    );
  }

  Widget _buildStatusIcon(OrderStepStatus status) {
    switch (status) {
      case OrderStepStatus.completed:
        return Container(
          width: 24,
          height: 24,
          decoration: const BoxDecoration(
            color: Color(0xFF2D8659),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check, color: Colors.white, size: 16),
        );
      case OrderStepStatus.active:
        return Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: const Color(0xFF2D8659),
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFF2D8659), width: 3),
          ),
        );
      case OrderStepStatus.pending:
        return Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.grey[300]!, width: 2),
          ),
        );
    }
  }

  String _formatTime(DateTime time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }
}

enum OrderStepStatus { completed, active, pending }

class OrderStatusStep {
  final String title;
  final OrderStepStatus status;
  final DateTime? timestamp;

  OrderStatusStep({
    required this.title,
    required this.status,
    this.timestamp,
  });
}
```

**Acceptance Criteria:**
- Timeline renders correctly
- Active step is highlighted
- Completed steps show checkmarks

### Task FE-06: Implement Rider Card & Contact

**File:** `/customer_app/lib/widgets/rider_info_card.dart`

```dart
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class RiderInfoCard extends StatelessWidget {
  final String name;
  final String phone;
  final double rating;
  final String? photoUrl;

  const RiderInfoCard({
    Key? key,
    required this.name,
    required this.phone,
    required this.rating,
    this.photoUrl,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundImage: photoUrl != null ? NetworkImage(photoUrl!) : null,
            child: photoUrl == null ? const Icon(Icons.person) : null,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Row(
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      rating.toStringAsFixed(1),
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ],
            ),
          ),
          ElevatedButton.icon(
            onPressed: () => _makePhoneCall(phone),
            icon: const Icon(Icons.phone),
            label: const Text('Call'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2D8659),
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(scheme: 'tel', path: phoneNumber);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }
}
```

**Acceptance Criteria:**
- Card displays rider info
- Call button launches phone dialer
- Works on both iOS and Android

## 4. Sprint 2: Delayed Delivery Edge Case

### Task BE-03: Implement Delay Detection Logic

**File:** `/backend/app/Services/DelayDetectionService.php`

```php
<?php

namespace App\Services;

use App\Models\Delivery;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DelayDetectionService
{
    public function checkForDelays(): void
    {
        $inTransitDeliveries = Delivery::where('status', 'in_transit')
            ->where('is_delayed', false)
            ->get();

        foreach ($inTransitDeliveries as $delivery) {
            if ($this->isDelayed($delivery)) {
                $this->handleDelay($delivery);
            }
        }
    }

    private function isDelayed(Delivery $delivery): bool
    {
        $now = Carbon::now();
        $estimatedAt = Carbon::parse($delivery->estimated_at);
        
        // Consider delayed if 15+ minutes past ETA
        return $now->diffInMinutes($estimatedAt, false) >= 15;
    }

    private function handleDelay(Delivery $delivery): void
    {
        // Calculate new ETA (add 30 minutes)
        $newEstimatedAt = Carbon::now()->addMinutes(30);
        
        // Update delivery
        $delivery->update([
            'is_delayed' => true,
            'new_estimated_at' => $newEstimatedAt,
            'delay_reason' => 'traffic_congestion', // Could be dynamic
        ]);

        // Broadcast via WebSocket
        broadcast(new DeliveryDelayed($delivery));

        Log::info("Delivery {$delivery->id} marked as delayed");
    }
}
```

**Create Scheduled Job:**

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->call(function () {
        app(DelayDetectionService::class)->checkForDelays();
    })->everyTwoMinutes();
}
```

**Acceptance Criteria:**
- Job runs every 2 minutes
- Delays are detected correctly
- WebSocket event is broadcast

### Task FE-07 & FE-08: Implement Delay Warning UI

**File:** `/customer_app/lib/widgets/delay_warning_banner.dart`

```dart
import 'package:flutter/material.dart';

class DelayWarningBanner extends StatelessWidget {
  final DateTime newEta;
  final String reason;

  const DelayWarningBanner({
    Key? key,
    required this.newEta,
    required this.reason,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final minutesUntilArrival = newEta.difference(DateTime.now()).inMinutes;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFA500),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.warning, color: Colors.white),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Delivery Delayed - New ETA: $minutesUntilArrival minutes',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.9),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: Color(0xFFFFA500)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _getReasonText(reason),
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getReasonText(String reason) {
    switch (reason) {
      case 'traffic_congestion':
        return 'Your order is running late due to traffic congestion';
      case 'weather':
        return 'Delivery delayed due to weather conditions';
      default:
        return 'Your order is running late';
    }
  }
}
```

**Update OrderTrackingScreen:**

```dart
@override
Widget build(BuildContext context, WidgetRef ref) {
  final trackingState = ref.watch(orderTrackingProvider(orderId));

  return Scaffold(
    appBar: AppBar(
      title: const Text('Order Tracking'),
      backgroundColor: const Color(0xFF2D8659),
    ),
    body: Column(
      children: [
        // Show delay banner if delayed
        if (trackingState.isDelayed && trackingState.newEstimatedAt != null)
          Padding(
            padding: const EdgeInsets.all(16),
            child: DelayWarningBanner(
              newEta: trackingState.newEstimatedAt!,
              reason: trackingState.order?.delayReason ?? 'unknown',
            ),
          ),
        // ... rest of the UI
      ],
    ),
  );
}
```

**Acceptance Criteria:**
- Banner appears when delay is detected
- ETA is calculated correctly
- Reason is displayed clearly

## 5. Testing Checklist

### Unit Tests
- [ ] OrderTrackingProvider state transitions
- [ ] RiderLocation updates
- [ ] Delay detection logic

### Widget Tests
- [ ] OrderStatusTimeline renders correctly
- [ ] RiderInfoCard displays all info
- [ ] DelayWarningBanner shows correct ETA

### Integration Tests
- [ ] WebSocket connection and reconnection
- [ ] API endpoint returns correct data
- [ ] Map markers update in real-time

### Manual Testing
- [ ] Complete happy path (Rider Assigned → Delivered)
- [ ] Trigger delay and verify UI updates
- [ ] Test on slow network
- [ ] Test WebSocket disconnection/reconnection

## 6. Performance Considerations

- **Debounce Location Updates:** Limit map updates to once every 5 seconds to prevent UI jank.
- **Optimize Marker Updates:** Use `setState()` only when necessary.
- **Cache Map Tiles:** Configure Google Maps to cache tiles for offline viewing.
- **WebSocket Reconnection:** Implement exponential backoff for reconnection attempts.

## 7. Conclusion

This guide provides all the code and specifications needed to implement the Order Tracking screen. Follow the tasks in order, test thoroughly, and refer to the mockups for visual accuracy.

