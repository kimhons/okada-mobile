import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

abstract class NetworkInfo {
  Future<bool> get isConnected;
  Stream<bool> get onConnectivityChanged;
  Future<ConnectivityResult> get connectivityResult;
}

class NetworkInfoImpl implements NetworkInfo {
  final Connectivity _connectivity;
  late final StreamController<bool> _connectivityController;
  bool _isConnected = false;

  NetworkInfoImpl(this._connectivity) {
    _connectivityController = StreamController<bool>.broadcast();
    _initializeConnectivity();
    _listenToConnectivityChanges();
  }

  @override
  Future<bool> get isConnected async {
    return _isConnected;
  }

  @override
  Stream<bool> get onConnectivityChanged => _connectivityController.stream;

  @override
  Future<ConnectivityResult> get connectivityResult async {
    return await _connectivity.checkConnectivity();
  }

  Future<void> _initializeConnectivity() async {
    try {
      final result = await _connectivity.checkConnectivity();
      _updateConnectionStatus(result);
    } catch (e) {
      _isConnected = false;
      _connectivityController.add(false);
    }
  }

  void _listenToConnectivityChanges() {
    _connectivity.onConnectivityChanged.listen(
      (ConnectivityResult result) {
        _updateConnectionStatus(result);
      },
      onError: (error) {
        _isConnected = false;
        _connectivityController.add(false);
      },
    );
  }

  void _updateConnectionStatus(ConnectivityResult result) {
    final wasConnected = _isConnected;
    _isConnected = _isConnectedResult(result);

    if (wasConnected != _isConnected) {
      _connectivityController.add(_isConnected);
    }
  }

  bool _isConnectedResult(ConnectivityResult result) {
    switch (result) {
      case ConnectivityResult.wifi:
      case ConnectivityResult.mobile:
      case ConnectivityResult.ethernet:
        return true;
      case ConnectivityResult.none:
      case ConnectivityResult.bluetooth:
      case ConnectivityResult.vpn:
      case ConnectivityResult.other:
        return false;
    }
  }

  void dispose() {
    _connectivityController.close();
  }
}