import 'package:flutter/foundation.dart';
import 'package:shared/api/okada_api_client.dart';

class DeliveryProvider with ChangeNotifier {
  final OkadaApiClient _apiClient;

  DeliveryProvider(this._apiClient);

  // State
  List<Map<String, dynamic>> _availableOrders = [];
  Map<String, dynamic>? _activeDelivery;
  bool _isOnline = false;
  bool _isLoading = false;
  String? _error;

  // Getters
  List<Map<String, dynamic>> get availableOrders => _availableOrders;
  Map<String, dynamic>? get activeDelivery => _activeDelivery;
  bool get isOnline => _isOnline;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasActiveDelivery => _activeDelivery != null;

  // Toggle online/offline status
  Future<void> toggleOnlineStatus() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final newStatus = !_isOnline;
      // TODO: Call API to update rider status
      // await _apiClient.updateRiderStatus(newStatus);
      
      _isOnline = newStatus;
      
      if (_isOnline) {
        // Fetch available orders when going online
        await fetchAvailableOrders();
      }
    } catch (e) {
      _error = 'Failed to update status: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch available orders
  Future<void> fetchAvailableOrders() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: Call API to fetch available orders
      // final orders = await _apiClient.getAvailableOrders();
      
      // Mock data
      _availableOrders = [
        {
          'id': '123456',
          'fee': 1500,
          'pickup': {
            'name': 'Freshmart',
            'address': 'Av. de la Liberté, Douala',
          },
          'delivery': {
            'name': 'Jean Dup...',
            'address': 'Rue Sita Bella, Douala',
          },
          'items': 3,
          'weight': 1.2,
          'distance': 2.5,
          'duration': 15,
        },
        {
          'id': '123457',
          'fee': 2000,
          'pickup': {
            'name': 'SuperMarché',
            'address': 'Rue de la Réunification, Douala',
          },
          'delivery': {
            'name': 'Marie K...',
            'address': 'Boulevard de la Liberté, Douala',
          },
          'items': 5,
          'weight': 2.5,
          'distance': 4.2,
          'duration': 25,
        },
      ];
    } catch (e) {
      _error = 'Failed to fetch orders: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Accept an order
  Future<bool> acceptOrder(String orderId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: Call API to accept order
      // await _apiClient.acceptOrder(orderId);
      
      // Find the order and set as active delivery
      final order = _availableOrders.firstWhere((o) => o['id'] == orderId);
      _activeDelivery = {
        ...order,
        'status': 'accepted',
        'acceptedAt': DateTime.now().toIso8601String(),
      };
      
      // Remove from available orders
      _availableOrders.removeWhere((o) => o['id'] == orderId);
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Failed to accept order: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Decline an order
  Future<void> declineOrder(String orderId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: Call API to decline order
      // await _apiClient.declineOrder(orderId);
      
      // Remove from available orders
      _availableOrders.removeWhere((o) => o['id'] == orderId);
    } catch (e) {
      _error = 'Failed to decline order: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update delivery status
  Future<void> updateDeliveryStatus(String status) async {
    if (_activeDelivery == null) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: Call API to update delivery status
      // await _apiClient.updateDeliveryStatus(_activeDelivery!['id'], status);
      
      _activeDelivery = {
        ..._activeDelivery!,
        'status': status,
        'updatedAt': DateTime.now().toIso8601String(),
      };
    } catch (e) {
      _error = 'Failed to update status: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Upload quality verification photos
  Future<bool> uploadQualityPhotos(String orderId, List<String> photoPaths) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: Call API to upload photos
      // await _apiClient.uploadQualityPhotos(orderId, photoPaths);
      
      if (_activeDelivery != null && _activeDelivery!['id'] == orderId) {
        _activeDelivery = {
          ..._activeDelivery!,
          'qualityPhotos': photoPaths,
          'qualityPhotosUploadedAt': DateTime.now().toIso8601String(),
          'status': 'waiting_approval',
        };
      }
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Failed to upload photos: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Complete delivery
  Future<bool> completeDelivery(String orderId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: Call API to complete delivery
      // await _apiClient.completeDelivery(orderId);
      
      if (_activeDelivery != null && _activeDelivery!['id'] == orderId) {
        _activeDelivery = {
          ..._activeDelivery!,
          'status': 'completed',
          'completedAt': DateTime.now().toIso8601String(),
        };
        
        // Clear active delivery after a delay
        Future.delayed(const Duration(seconds: 2), () {
          _activeDelivery = null;
          notifyListeners();
        });
      }
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Failed to complete delivery: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Update rider location
  Future<void> updateLocation(double latitude, double longitude) async {
    try {
      // TODO: Call API to update rider location
      // await _apiClient.updateRiderLocation(latitude, longitude);
      
      if (_activeDelivery != null) {
        _activeDelivery = {
          ..._activeDelivery!,
          'riderLocation': {
            'latitude': latitude,
            'longitude': longitude,
            'updatedAt': DateTime.now().toIso8601String(),
          },
        };
        notifyListeners();
      }
    } catch (e) {
      // Silent fail for location updates
      debugPrint('Failed to update location: $e');
    }
  }

  // Report issue
  Future<bool> reportIssue(String orderId, String issue, String description) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: Call API to report issue
      // await _apiClient.reportDeliveryIssue(orderId, issue, description);
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Failed to report issue: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}

