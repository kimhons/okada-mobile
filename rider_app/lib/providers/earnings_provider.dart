import 'package:flutter/foundation.dart';
import 'package:shared/api/okada_api_client.dart';

class EarningsProvider with ChangeNotifier {
  final OkadaApiClient _apiClient;

  EarningsProvider(this._apiClient);

  // State
  Map<String, dynamic>? _earnings;
  List<Map<String, dynamic>> _history = [];
  bool _isLoading = false;
  String? _error;

  // Getters
  Map<String, dynamic>? get earnings => _earnings;
  List<Map<String, dynamic>> get history => _history;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Fetch earnings summary
  Future<void> fetchEarnings({String period = 'month'}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: Call API to fetch earnings
      // final data = await _apiClient.getRiderEarnings(period);
      
      // Mock data
      _earnings = {
        'total': 125000,
        'deliveries': 45,
        'averagePerDelivery': 2778,
        'bonuses': 5000,
        'tips': 3000,
        'weeklyData': [
          {'day': 'Mon', 'amount': 15000},
          {'day': 'Tue', 'amount': 18000},
          {'day': 'Wed', 'amount': 22000},
          {'day': 'Thu', 'amount': 25000},
          {'day': 'Fri', 'amount': 20000},
          {'day': 'Sat', 'amount': 17000},
        ],
      };
    } catch (e) {
      _error = 'Failed to fetch earnings: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch earnings history
  Future<void> fetchEarningsHistory() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: Call API to fetch earnings history
      // final data = await _apiClient.getRiderEarningsHistory();
      
      // Mock data
      _history = [
        {
          'date': '2024-01-15',
          'amount': 25000,
          'deliveries': 8,
          'bonuses': 1000,
          'tips': 500,
        },
        {
          'date': '2024-01-14',
          'amount': 22000,
          'deliveries': 7,
          'bonuses': 800,
          'tips': 400,
        },
      ];
    } catch (e) {
      _error = 'Failed to fetch earnings history: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Request withdrawal
  Future<bool> requestWithdrawal({
    required double amount,
    required String paymentMethod,
    required String phoneNumber,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: Call API to request withdrawal
      // await _apiClient.requestWithdrawal(amount, paymentMethod, phoneNumber);
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Failed to request withdrawal: $e';
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

