import '../client/api_client.dart';
import '../models/api_models.dart';
import 'package:okada_core/okada_core.dart';

/// Earnings and payout service for rider mobile app
class RiderEarningsService {
  final OkadaApiClient _client;

  RiderEarningsService(this._client);

  /// Get earnings summary
  Future<RiderEarnings> getEarningsSummary() async {
    try {
      final response = await _client.get(ApiConstants.riderEarnings);
      return RiderEarnings.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Get earnings history
  Future<PaginatedList<EarningEntry>> getEarningsHistory({
    int page = 1,
    int pageSize = 20,
    DateTime? fromDate,
    DateTime? toDate,
  }) async {
    try {
      final response = await _client.get(
        '${ApiConstants.riderEarnings}/history',
        queryParameters: {
          'page': page,
          'pageSize': pageSize,
          if (fromDate != null) 'fromDate': fromDate.toIso8601String(),
          if (toDate != null) 'toDate': toDate.toIso8601String(),
        },
      );
      return PaginatedList.fromJson(response.data, EarningEntry.fromJson);
    } catch (e) {
      rethrow;
    }
  }

  /// Get daily earnings breakdown
  Future<Map<String, dynamic>> getDailyEarnings(DateTime date) async {
    try {
      final response = await _client.get(
        '${ApiConstants.riderEarnings}/daily',
        queryParameters: {
          'date': date.toIso8601String().split('T')[0],
        },
      );
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }

  /// Get weekly earnings breakdown
  Future<Map<String, dynamic>> getWeeklyEarnings({DateTime? weekStart}) async {
    try {
      final response = await _client.get(
        '${ApiConstants.riderEarnings}/weekly',
        queryParameters: {
          if (weekStart != null) 'weekStart': weekStart.toIso8601String().split('T')[0],
        },
      );
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }

  /// Get monthly earnings breakdown
  Future<Map<String, dynamic>> getMonthlyEarnings({int? year, int? month}) async {
    try {
      final response = await _client.get(
        '${ApiConstants.riderEarnings}/monthly',
        queryParameters: {
          if (year != null) 'year': year,
          if (month != null) 'month': month,
        },
      );
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }

  /// Get payout methods
  Future<List<PaymentMethod>> getPayoutMethods() async {
    try {
      final response = await _client.get(ApiConstants.riderPayouts);
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((e) => PaymentMethod.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Add payout method
  Future<PaymentMethod> addPayoutMethod({
    required String type,
    required String phone,
    String? name,
  }) async {
    try {
      final response = await _client.post(
        ApiConstants.riderPayouts,
        data: {
          'type': type,
          'phone': phone,
          if (name != null) 'name': name,
        },
      );
      return PaymentMethod.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Remove payout method
  Future<void> removePayoutMethod(int methodId) async {
    try {
      await _client.delete('${ApiConstants.riderPayouts}/$methodId');
    } catch (e) {
      rethrow;
    }
  }

  /// Set default payout method
  Future<void> setDefaultPayoutMethod(int methodId) async {
    try {
      await _client.patch(
        '${ApiConstants.riderPayouts}/$methodId/default',
      );
    } catch (e) {
      rethrow;
    }
  }

  /// Request payout
  Future<Transaction> requestPayout({
    required double amount,
    required int payoutMethodId,
  }) async {
    try {
      final response = await _client.post(
        '${ApiConstants.riderPayouts}/request',
        data: {
          'amount': amount,
          'payoutMethodId': payoutMethodId,
        },
      );
      return Transaction.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Get payout history
  Future<PaginatedList<Transaction>> getPayoutHistory({
    int page = 1,
    int pageSize = 10,
  }) async {
    try {
      final response = await _client.get(
        '${ApiConstants.riderPayouts}/history',
        queryParameters: {
          'page': page,
          'pageSize': pageSize,
        },
      );
      return PaginatedList.fromJson(response.data, Transaction.fromJson);
    } catch (e) {
      rethrow;
    }
  }

  /// Get active bonuses and incentives
  Future<List<Map<String, dynamic>>> getActiveBonuses() async {
    try {
      final response = await _client.get('${ApiConstants.riderEarnings}/bonuses');
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((e) => e as Map<String, dynamic>).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Get goals and progress
  Future<Map<String, dynamic>> getGoals() async {
    try {
      final response = await _client.get('${ApiConstants.riderEarnings}/goals');
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }
}
