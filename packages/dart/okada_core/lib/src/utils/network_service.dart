import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

/// Network connectivity monitoring service
/// Provides real-time network status updates and connection type information
class NetworkService {
  final Connectivity _connectivity = Connectivity();
  
  StreamSubscription<ConnectivityResult>? _subscription;
  final StreamController<NetworkStatus> _statusController = 
      StreamController<NetworkStatus>.broadcast();
  
  NetworkStatus _currentStatus = NetworkStatus.unknown;
  bool _isInitialized = false;

  /// Stream of network status changes
  Stream<NetworkStatus> get statusStream => _statusController.stream;

  /// Current network status
  NetworkStatus get currentStatus => _currentStatus;

  /// Whether the device is currently connected to the internet
  bool get isConnected => 
      _currentStatus == NetworkStatus.wifi || 
      _currentStatus == NetworkStatus.mobile ||
      _currentStatus == NetworkStatus.ethernet;

  /// Whether the device is on WiFi
  bool get isOnWifi => _currentStatus == NetworkStatus.wifi;

  /// Whether the device is on mobile data
  bool get isOnMobile => _currentStatus == NetworkStatus.mobile;

  /// Initialize the network service and start monitoring
  Future<void> init() async {
    if (_isInitialized) return;

    // Get initial connectivity status
    final result = await _connectivity.checkConnectivity();
    _currentStatus = _mapConnectivityResult(result);
    _statusController.add(_currentStatus);

    // Listen for connectivity changes
    _subscription = _connectivity.onConnectivityChanged.listen((result) {
      final newStatus = _mapConnectivityResult(result);
      if (newStatus != _currentStatus) {
        _currentStatus = newStatus;
        _statusController.add(_currentStatus);
      }
    });

    _isInitialized = true;
  }

  /// Check current connectivity status
  Future<NetworkStatus> checkConnectivity() async {
    final result = await _connectivity.checkConnectivity();
    _currentStatus = _mapConnectivityResult(result);
    return _currentStatus;
  }

  /// Map ConnectivityResult to NetworkStatus
  NetworkStatus _mapConnectivityResult(ConnectivityResult result) {
    switch (result) {
      case ConnectivityResult.wifi:
        return NetworkStatus.wifi;
      case ConnectivityResult.mobile:
        return NetworkStatus.mobile;
      case ConnectivityResult.ethernet:
        return NetworkStatus.ethernet;
      case ConnectivityResult.vpn:
        return NetworkStatus.vpn;
      case ConnectivityResult.bluetooth:
        return NetworkStatus.bluetooth;
      case ConnectivityResult.none:
        return NetworkStatus.offline;
      case ConnectivityResult.other:
        return NetworkStatus.unknown;
    }
  }

  /// Wait for network connection with timeout
  Future<bool> waitForConnection({Duration timeout = const Duration(seconds: 30)}) async {
    if (isConnected) return true;

    final completer = Completer<bool>();
    StreamSubscription<NetworkStatus>? subscription;
    Timer? timer;

    subscription = statusStream.listen((status) {
      if (status == NetworkStatus.wifi || 
          status == NetworkStatus.mobile ||
          status == NetworkStatus.ethernet) {
        timer?.cancel();
        subscription?.cancel();
        if (!completer.isCompleted) {
          completer.complete(true);
        }
      }
    });

    timer = Timer(timeout, () {
      subscription?.cancel();
      if (!completer.isCompleted) {
        completer.complete(false);
      }
    });

    return completer.future;
  }

  /// Execute a function only when connected
  Future<T?> executeWhenConnected<T>(
    Future<T> Function() action, {
    Duration timeout = const Duration(seconds: 30),
  }) async {
    if (isConnected) {
      return await action();
    }

    final connected = await waitForConnection(timeout: timeout);
    if (connected) {
      return await action();
    }

    return null;
  }

  /// Get connection quality estimate based on connection type
  ConnectionQuality getConnectionQuality() {
    switch (_currentStatus) {
      case NetworkStatus.wifi:
      case NetworkStatus.ethernet:
        return ConnectionQuality.excellent;
      case NetworkStatus.mobile:
        return ConnectionQuality.good;
      case NetworkStatus.vpn:
        return ConnectionQuality.moderate;
      case NetworkStatus.bluetooth:
        return ConnectionQuality.poor;
      case NetworkStatus.offline:
      case NetworkStatus.unknown:
        return ConnectionQuality.none;
    }
  }

  /// Get human-readable status description
  String getStatusDescription() {
    switch (_currentStatus) {
      case NetworkStatus.wifi:
        return 'Connected via WiFi';
      case NetworkStatus.mobile:
        return 'Connected via Mobile Data';
      case NetworkStatus.ethernet:
        return 'Connected via Ethernet';
      case NetworkStatus.vpn:
        return 'Connected via VPN';
      case NetworkStatus.bluetooth:
        return 'Connected via Bluetooth';
      case NetworkStatus.offline:
        return 'No internet connection';
      case NetworkStatus.unknown:
        return 'Connection status unknown';
    }
  }

  /// Get status description in French
  String getStatusDescriptionFr() {
    switch (_currentStatus) {
      case NetworkStatus.wifi:
        return 'Connecté via WiFi';
      case NetworkStatus.mobile:
        return 'Connecté via données mobiles';
      case NetworkStatus.ethernet:
        return 'Connecté via Ethernet';
      case NetworkStatus.vpn:
        return 'Connecté via VPN';
      case NetworkStatus.bluetooth:
        return 'Connecté via Bluetooth';
      case NetworkStatus.offline:
        return 'Pas de connexion internet';
      case NetworkStatus.unknown:
        return 'État de connexion inconnu';
    }
  }

  /// Dispose of resources
  void dispose() {
    _subscription?.cancel();
    _statusController.close();
    _isInitialized = false;
  }
}

/// Network connection status
enum NetworkStatus {
  wifi,
  mobile,
  ethernet,
  vpn,
  bluetooth,
  offline,
  unknown,
}

/// Connection quality estimate
enum ConnectionQuality {
  excellent,
  good,
  moderate,
  poor,
  none,
}

/// Extension for NetworkStatus
extension NetworkStatusExtension on NetworkStatus {
  /// Whether this status represents an active connection
  bool get isConnected => 
      this == NetworkStatus.wifi || 
      this == NetworkStatus.mobile ||
      this == NetworkStatus.ethernet;

  /// Icon name for this status
  String get iconName {
    switch (this) {
      case NetworkStatus.wifi:
        return 'wifi';
      case NetworkStatus.mobile:
        return 'signal_cellular_alt';
      case NetworkStatus.ethernet:
        return 'settings_ethernet';
      case NetworkStatus.vpn:
        return 'vpn_lock';
      case NetworkStatus.bluetooth:
        return 'bluetooth';
      case NetworkStatus.offline:
        return 'signal_wifi_off';
      case NetworkStatus.unknown:
        return 'help_outline';
    }
  }
}

/// Extension for ConnectionQuality
extension ConnectionQualityExtension on ConnectionQuality {
  /// Numeric value (0-4) for this quality
  int get value {
    switch (this) {
      case ConnectionQuality.excellent:
        return 4;
      case ConnectionQuality.good:
        return 3;
      case ConnectionQuality.moderate:
        return 2;
      case ConnectionQuality.poor:
        return 1;
      case ConnectionQuality.none:
        return 0;
    }
  }

  /// Whether this quality is sufficient for most operations
  bool get isSufficient => value >= 2;

  /// Whether this quality is good for heavy operations (uploads, video)
  bool get isGoodForHeavyOps => value >= 3;
}
