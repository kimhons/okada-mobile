import '../../client/api_client.dart';
import '../../models/api_models.dart';
import 'package:okada_core/okada_core.dart';
import 'mtn_momo_service.dart';
import 'orange_money_service.dart';

/// Unified payment result
class PaymentResult {
  final String transactionId;
  final String provider;
  final PaymentStatus status;
  final double amount;
  final String currency;
  final String? message;
  final DateTime timestamp;

  const PaymentResult({
    required this.transactionId,
    required this.provider,
    required this.status,
    required this.amount,
    required this.currency,
    this.message,
    required this.timestamp,
  });

  bool get isSuccessful => status == PaymentStatus.successful;
  bool get isPending => status == PaymentStatus.pending || 
                        status == PaymentStatus.processing;
  bool get isFailed => status == PaymentStatus.failed || 
                       status == PaymentStatus.cancelled ||
                       status == PaymentStatus.timeout;
}

/// Payment status enum
enum PaymentStatus {
  pending,
  processing,
  successful,
  failed,
  cancelled,
  timeout,
}

/// Payment provider enum
enum PaymentProvider {
  mtnMomo,
  orangeMoney,
  cash,
  card,
  wallet,
}

/// Unified payment service
class PaymentService {
  final OkadaApiClient _client;
  late final MtnMomoService _mtnMomoService;
  late final OrangeMoneyService _orangeMoneyService;

  PaymentService(this._client) {
    _mtnMomoService = MtnMomoService(_client);
    _orangeMoneyService = OrangeMoneyService(_client);
  }

  /// Get MTN MoMo service
  MtnMomoService get mtnMomo => _mtnMomoService;

  /// Get Orange Money service
  OrangeMoneyService get orangeMoney => _orangeMoneyService;

  /// Detect payment provider from phone number
  PaymentProvider? detectProvider(String phone) {
    if (_mtnMomoService.isValidMtnNumber(phone)) {
      return PaymentProvider.mtnMomo;
    }
    if (_orangeMoneyService.isValidOrangeNumber(phone)) {
      return PaymentProvider.orangeMoney;
    }
    return null;
  }

  /// Process payment with auto-detected provider
  Future<PaymentResult> processPayment({
    required String phone,
    required double amount,
    required String description,
    int? orderId,
    Duration? timeout,
    void Function(PaymentResult)? onStatusUpdate,
  }) async {
    final provider = detectProvider(phone);
    
    if (provider == null) {
      return PaymentResult(
        transactionId: '',
        provider: 'unknown',
        status: PaymentStatus.failed,
        amount: amount,
        currency: 'XAF',
        message: 'Numéro de téléphone non reconnu. Utilisez un numéro MTN ou Orange.',
        timestamp: DateTime.now(),
      );
    }

    if (provider == PaymentProvider.mtnMomo) {
      final result = await _mtnMomoService.processPayment(
        phone: phone,
        amount: amount,
        description: description,
        orderId: orderId,
        timeout: timeout,
        onStatusUpdate: onStatusUpdate != null
            ? (r) => onStatusUpdate(_convertMomoResult(r))
            : null,
      );
      return _convertMomoResult(result);
    } else {
      final result = await _orangeMoneyService.processPayment(
        phone: phone,
        amount: amount,
        description: description,
        orderId: orderId,
        timeout: timeout,
        onStatusUpdate: onStatusUpdate != null
            ? (r) => onStatusUpdate(_convertOrangeResult(r))
            : null,
      );
      return _convertOrangeResult(result);
    }
  }

  /// Get saved payment methods
  Future<List<PaymentMethod>> getPaymentMethods() async {
    try {
      final response = await _client.get(ApiConstants.customerPayments);
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((e) => PaymentMethod.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Add payment method
  Future<PaymentMethod> addPaymentMethod({
    required String type,
    required String phone,
    String? name,
  }) async {
    try {
      final response = await _client.post(
        ApiConstants.customerPayments,
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

  /// Remove payment method
  Future<void> removePaymentMethod(int methodId) async {
    try {
      await _client.delete('${ApiConstants.customerPayments}/$methodId');
    } catch (e) {
      rethrow;
    }
  }

  /// Set default payment method
  Future<void> setDefaultPaymentMethod(int methodId) async {
    try {
      await _client.patch('${ApiConstants.customerPayments}/$methodId/default');
    } catch (e) {
      rethrow;
    }
  }

  /// Get transaction history
  Future<PaginatedList<Transaction>> getTransactionHistory({
    int page = 1,
    int pageSize = 10,
    String? type,
    DateTime? fromDate,
    DateTime? toDate,
  }) async {
    try {
      final response = await _client.get(
        ApiConstants.paymentHistory,
        queryParameters: {
          'page': page,
          'pageSize': pageSize,
          if (type != null) 'type': type,
          if (fromDate != null) 'fromDate': fromDate.toIso8601String(),
          if (toDate != null) 'toDate': toDate.toIso8601String(),
        },
      );
      return PaginatedList.fromJson(response.data, Transaction.fromJson);
    } catch (e) {
      rethrow;
    }
  }

  /// Verify payment
  Future<PaymentResult> verifyPayment(String transactionId) async {
    try {
      final response = await _client.get(
        '${ApiConstants.paymentVerify}/$transactionId',
      );
      
      final data = response.data as Map<String, dynamic>;
      final statusString = data['status'] as String;
      final status = PaymentStatus.values.firstWhere(
        (e) => e.name == statusString.toLowerCase(),
        orElse: () => PaymentStatus.pending,
      );
      
      return PaymentResult(
        transactionId: transactionId,
        provider: data['provider'] as String? ?? 'unknown',
        status: status,
        amount: (data['amount'] as num).toDouble(),
        currency: data['currency'] as String? ?? 'XAF',
        message: data['message'] as String?,
        timestamp: data['timestamp'] != null
            ? DateTime.parse(data['timestamp'] as String)
            : DateTime.now(),
      );
    } catch (e) {
      rethrow;
    }
  }

  /// Get wallet balance
  Future<double> getWalletBalance() async {
    try {
      final response = await _client.get(ApiConstants.customerWallet);
      return (response.data['balance'] as num).toDouble();
    } catch (e) {
      rethrow;
    }
  }

  /// Top up wallet
  Future<PaymentResult> topUpWallet({
    required String phone,
    required double amount,
  }) async {
    return processPayment(
      phone: phone,
      amount: amount,
      description: 'Recharge portefeuille Okada',
    );
  }

  /// Pay with wallet
  Future<PaymentResult> payWithWallet({
    required double amount,
    required int orderId,
  }) async {
    try {
      final response = await _client.post(
        '${ApiConstants.customerWallet}/pay',
        data: {
          'amount': amount,
          'orderId': orderId,
        },
      );
      
      final data = response.data as Map<String, dynamic>;
      return PaymentResult(
        transactionId: data['transactionId'] as String,
        provider: 'wallet',
        status: PaymentStatus.successful,
        amount: amount,
        currency: 'XAF',
        timestamp: DateTime.now(),
      );
    } catch (e) {
      rethrow;
    }
  }

  // Private helpers

  PaymentResult _convertMomoResult(MomoPaymentResult result) {
    return PaymentResult(
      transactionId: result.transactionId,
      provider: 'mtn_momo',
      status: _convertMomoStatus(result.status),
      amount: result.amount,
      currency: result.currency,
      message: result.message,
      timestamp: result.timestamp,
    );
  }

  PaymentResult _convertOrangeResult(OrangePaymentResult result) {
    return PaymentResult(
      transactionId: result.transactionId,
      provider: 'orange_money',
      status: _convertOrangeStatus(result.status),
      amount: result.amount,
      currency: result.currency,
      message: result.message,
      timestamp: result.timestamp,
    );
  }

  PaymentStatus _convertMomoStatus(MomoPaymentStatus status) {
    switch (status) {
      case MomoPaymentStatus.pending:
        return PaymentStatus.pending;
      case MomoPaymentStatus.processing:
        return PaymentStatus.processing;
      case MomoPaymentStatus.successful:
        return PaymentStatus.successful;
      case MomoPaymentStatus.failed:
        return PaymentStatus.failed;
      case MomoPaymentStatus.cancelled:
        return PaymentStatus.cancelled;
      case MomoPaymentStatus.timeout:
        return PaymentStatus.timeout;
    }
  }

  PaymentStatus _convertOrangeStatus(OrangePaymentStatus status) {
    switch (status) {
      case OrangePaymentStatus.pending:
        return PaymentStatus.pending;
      case OrangePaymentStatus.processing:
        return PaymentStatus.processing;
      case OrangePaymentStatus.successful:
        return PaymentStatus.successful;
      case OrangePaymentStatus.failed:
        return PaymentStatus.failed;
      case OrangePaymentStatus.cancelled:
        return PaymentStatus.cancelled;
      case OrangePaymentStatus.timeout:
        return PaymentStatus.timeout;
    }
  }
}
