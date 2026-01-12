import 'dart:async';
import '../websocket/websocket_manager.dart';

/// Location data model
class LocationData {
  final double latitude;
  final double longitude;
  final double? altitude;
  final double? accuracy;
  final double? heading;
  final double? speed;
  final DateTime timestamp;

  LocationData({
    required this.latitude,
    required this.longitude,
    this.altitude,
    this.accuracy,
    this.heading,
    this.speed,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  Map<String, dynamic> toJson() => {
    'latitude': latitude,
    'longitude': longitude,
    if (altitude != null) 'altitude': altitude,
    if (accuracy != null) 'accuracy': accuracy,
    if (heading != null) 'heading': heading,
    if (speed != null) 'speed': speed,
    'timestamp': timestamp.toIso8601String(),
  };

  factory LocationData.fromJson(Map<String, dynamic> json) {
    return LocationData(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      altitude: (json['altitude'] as num?)?.toDouble(),
      accuracy: (json['accuracy'] as num?)?.toDouble(),
      heading: (json['heading'] as num?)?.toDouble(),
      speed: (json['speed'] as num?)?.toDouble(),
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'] as String)
          : DateTime.now(),
    );
  }

  double distanceTo(LocationData other) {
    // Haversine formula for distance calculation
    const double earthRadius = 6371; // km
    
    final lat1 = latitude * (3.14159265359 / 180);
    final lat2 = other.latitude * (3.14159265359 / 180);
    final dLat = (other.latitude - latitude) * (3.14159265359 / 180);
    final dLon = (other.longitude - longitude) * (3.14159265359 / 180);

    final a = (dLat / 2).sin() * (dLat / 2).sin() +
        lat1.cos() * lat2.cos() * (dLon / 2).sin() * (dLon / 2).sin();
    final c = 2 * a.sqrt().asin();

    return earthRadius * c;
  }
}

extension _MathExtension on double {
  double sin() => _sin(this);
  double cos() => _cos(this);
  double sqrt() => _sqrt(this);
  double asin() => _asin(this);
}

double _sin(double x) {
  // Taylor series approximation
  double result = x;
  double term = x;
  for (int i = 1; i < 10; i++) {
    term *= -x * x / ((2 * i) * (2 * i + 1));
    result += term;
  }
  return result;
}

double _cos(double x) {
  return _sin(x + 1.5707963267948966);
}

double _sqrt(double x) {
  if (x <= 0) return 0;
  double guess = x / 2;
  for (int i = 0; i < 20; i++) {
    guess = (guess + x / guess) / 2;
  }
  return guess;
}

double _asin(double x) {
  if (x >= 1) return 1.5707963267948966;
  if (x <= -1) return -1.5707963267948966;
  // Newton-Raphson approximation
  double result = x;
  double term = x;
  for (int i = 1; i < 15; i++) {
    term *= x * x * (2 * i - 1) * (2 * i - 1) / ((2 * i) * (2 * i + 1));
    result += term;
  }
  return result;
}

/// Location tracking configuration
class LocationTrackingConfig {
  final Duration updateInterval;
  final double distanceFilter; // meters
  final bool highAccuracy;
  final bool backgroundMode;

  const LocationTrackingConfig({
    this.updateInterval = const Duration(seconds: 5),
    this.distanceFilter = 10,
    this.highAccuracy = true,
    this.backgroundMode = false,
  });
}

/// Location tracking service for riders
class LocationTrackingService {
  static LocationTrackingService? _instance;
  static LocationTrackingService get instance => _instance ??= LocationTrackingService._();

  LocationTrackingService._();

  final WebSocketManager _wsManager = WebSocketManager.instance;
  
  Timer? _updateTimer;
  StreamSubscription? _locationSubscription;
  
  LocationData? _lastLocation;
  int? _activeOrderId;
  bool _isTracking = false;
  LocationTrackingConfig _config = const LocationTrackingConfig();

  final _locationController = StreamController<LocationData>.broadcast();
  final _errorController = StreamController<String>.broadcast();

  Stream<LocationData> get locationStream => _locationController.stream;
  Stream<String> get errorStream => _errorController.stream;
  
  LocationData? get lastLocation => _lastLocation;
  bool get isTracking => _isTracking;

  /// Start location tracking for an order
  Future<void> startTracking({
    required int orderId,
    LocationTrackingConfig? config,
  }) async {
    if (_isTracking) {
      await stopTracking();
    }

    _activeOrderId = orderId;
    _config = config ?? const LocationTrackingConfig();
    _isTracking = true;

    // In a real app, you would use geolocator or location package
    // For now, we'll simulate location updates
    _startLocationUpdates();
  }

  /// Stop location tracking
  Future<void> stopTracking() async {
    _isTracking = false;
    _activeOrderId = null;
    _updateTimer?.cancel();
    _updateTimer = null;
    _locationSubscription?.cancel();
    _locationSubscription = null;
  }

  void _startLocationUpdates() {
    // In a real implementation, this would use the geolocator package
    // to get actual GPS coordinates
    
    _updateTimer = Timer.periodic(_config.updateInterval, (_) {
      _sendLocationUpdate();
    });
  }

  void _sendLocationUpdate() {
    if (!_isTracking || _activeOrderId == null) return;

    // In real app, get actual location from GPS
    // For demo, we'll use simulated movement
    final location = _getSimulatedLocation();
    
    if (location != null) {
      _lastLocation = location;
      _locationController.add(location);

      // Send to WebSocket
      _wsManager.updateRiderLocation(
        orderId: _activeOrderId!,
        latitude: location.latitude,
        longitude: location.longitude,
        heading: location.heading,
        speed: location.speed,
      );
    }
  }

  LocationData? _getSimulatedLocation() {
    // Simulated location for demo purposes
    // In real app, use geolocator package
    final now = DateTime.now();
    final baseLatitude = 4.0511; // Douala
    final baseLongitude = 9.7679;
    
    // Add small random movement
    final latOffset = (now.millisecond % 100) / 100000;
    final lngOffset = (now.second % 60) / 100000;
    
    return LocationData(
      latitude: baseLatitude + latOffset,
      longitude: baseLongitude + lngOffset,
      accuracy: 10,
      heading: (now.second * 6).toDouble(), // 0-360 degrees
      speed: 20 + (now.millisecond % 30).toDouble(), // 20-50 km/h
      timestamp: now,
    );
  }

  /// Update location manually (for testing or when GPS is unavailable)
  void updateLocation(LocationData location) {
    if (!_isTracking || _activeOrderId == null) return;

    _lastLocation = location;
    _locationController.add(location);

    _wsManager.updateRiderLocation(
      orderId: _activeOrderId!,
      latitude: location.latitude,
      longitude: location.longitude,
      heading: location.heading,
      speed: location.speed,
    );
  }

  /// Calculate ETA based on current location and destination
  EtaCalculation calculateEta({
    required LocationData destination,
    double averageSpeedKmh = 30,
  }) {
    if (_lastLocation == null) {
      return EtaCalculation(
        distanceKm: 0,
        estimatedMinutes: 0,
        arrivalTime: DateTime.now(),
      );
    }

    final distanceKm = _lastLocation!.distanceTo(destination);
    final estimatedMinutes = (distanceKm / averageSpeedKmh * 60).round();
    final arrivalTime = DateTime.now().add(Duration(minutes: estimatedMinutes));

    return EtaCalculation(
      distanceKm: distanceKm,
      estimatedMinutes: estimatedMinutes,
      arrivalTime: arrivalTime,
    );
  }

  /// Dispose resources
  void dispose() {
    stopTracking();
    _locationController.close();
    _errorController.close();
  }
}

/// ETA calculation result
class EtaCalculation {
  final double distanceKm;
  final int estimatedMinutes;
  final DateTime arrivalTime;

  EtaCalculation({
    required this.distanceKm,
    required this.estimatedMinutes,
    required this.arrivalTime,
  });

  String get formattedEta {
    if (estimatedMinutes < 60) {
      return '$estimatedMinutes min';
    } else {
      final hours = estimatedMinutes ~/ 60;
      final mins = estimatedMinutes % 60;
      return '${hours}h ${mins}min';
    }
  }

  String get formattedDistance {
    if (distanceKm < 1) {
      return '${(distanceKm * 1000).round()} m';
    } else {
      return '${distanceKm.toStringAsFixed(1)} km';
    }
  }
}

/// Geofence region for delivery zones
class GeofenceRegion {
  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final double radiusMeters;

  GeofenceRegion({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.radiusMeters,
  });

  bool containsLocation(LocationData location) {
    final center = LocationData(latitude: latitude, longitude: longitude);
    final distanceKm = center.distanceTo(location);
    return distanceKm * 1000 <= radiusMeters;
  }
}

/// Geofencing service for delivery zones
class GeofencingService {
  final List<GeofenceRegion> _regions = [];
  final _entryController = StreamController<GeofenceRegion>.broadcast();
  final _exitController = StreamController<GeofenceRegion>.broadcast();
  
  final Set<String> _insideRegions = {};

  Stream<GeofenceRegion> get onRegionEntry => _entryController.stream;
  Stream<GeofenceRegion> get onRegionExit => _exitController.stream;

  void addRegion(GeofenceRegion region) {
    _regions.add(region);
  }

  void removeRegion(String regionId) {
    _regions.removeWhere((r) => r.id == regionId);
    _insideRegions.remove(regionId);
  }

  void clearRegions() {
    _regions.clear();
    _insideRegions.clear();
  }

  void checkLocation(LocationData location) {
    for (final region in _regions) {
      final isInside = region.containsLocation(location);
      final wasInside = _insideRegions.contains(region.id);

      if (isInside && !wasInside) {
        _insideRegions.add(region.id);
        _entryController.add(region);
      } else if (!isInside && wasInside) {
        _insideRegions.remove(region.id);
        _exitController.add(region);
      }
    }
  }

  void dispose() {
    _entryController.close();
    _exitController.close();
  }
}
