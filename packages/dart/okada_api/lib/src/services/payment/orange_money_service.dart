import 'dart:async';
import '../../client/api_client.dart';
import '../../models/api_models.dart';
import 'package:okada_core/okada_core.dart';

/// Orange Money payment status
enum OrangePaymentStatus {
  pending,
  processing,
  successful,
  failed,
  cancelled,
  timeout,
}

/// Orange Money payment result
class OrangePaymentResult {
  final String transactionId;
  final OrangePaymentStatus status;
  final double amount;
  final String currency;
  final String? message;
  final String? externalId;
  final String? payToken;
  final DateTime timestamp;

  const OrangePaymentResult({
    required this.transactionId,
    required this.status,
    required this.amount,
    required this.currency,
    this.message,
    this.externalId,
    this.payToken,
    required this.timestamp,
  });

  factory OrangePaymentResult.fromJson(Map<String, dynamic> json) {
    final statusString = json['status'] as String;
    final status = OrangePaymentStatus.values.firstWhere(
      (e) => e.name == statusString.toLowerCase(),
      orElse: () => OrangePaymentStatus.pending,
    );
    
    return OrangePaymentResult(
      transactionId: json['transactionId'] as String,
      status: status,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'XAF',
      message: json['message'] as String?,
      externalId: json['externalId'] as String?,
      payToken: json['payToken'] as String?,
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'transactionId': transactionId,
        'status': status.name,
        'amount': amount,
        'currency': currency,
        'message': message,
        'externalId': externalId,
        'payToken': payToken,
        'timestamp': timestamp.toIso8601String(),
      };

  bool get isSuccessful => status == OrangePaymentStatus.successful;
  bool get isPending => status == OrangePaymentStatus.pending || 
                        status == OrangePaymentStatus.processing;
  bool get isFailed => status == OrangePaymentStatus.failed || 
                       status == OrangePaymentStatus.cancelled ||
                       status == OrangePaymentStatus.timeout;
}

/// Orange Money payment service
class OrangeMoneyService {
  final OkadaApiClient _client;
  
  // Polling configuration
  static const Duration _pollInterval = Duration(seconds: 3);
  static const Duration _maxPollDuration = Duration(minutes: 5);

  OrangeMoneyService(this._client);

  /// Initiate Orange Money payment
  /// Returns transaction ID for tracking
  Future<OrangePaymentResult> initiatePayment({
    required String phone,
    required double amount,
    required String description,
    int? orderId,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      // Validate phone number
      final cleanPhone = _formatPhone(phone);
      if (!_isValidOrangeNumber(cleanPhone)) {
        throw Exception('Numéro Orange invalide');
      }

      final response = await _client.post(
        ApiConstants.paymentOrangeMoney,
        data: {
          'phone': cleanPhone,
          'amount': amount,
          'currency': 'XAF',
          'description': description,
          if (orderId != null) 'orderId': orderId,
          if (metadata != null) 'metadata': metadata,
        },
      );

      return OrangePaymentResult.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Check payment status
  Future<OrangePaymentResult> checkPaymentStatus(String transactionId) async {
    try {
      final response = await _client.get(
        '${ApiConstants.paymentOrangeMoney}/$transactionId/status',
      );
      return OrangePaymentResult.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Wait for payment completion with polling
  /// Returns final payment result
  Future<OrangePaymentResult> waitForPayment(
    String transactionId, {
    Duration? timeout,
    void Function(OrangePaymentResult)? onStatusUpdate,
  }) async {
    final maxDuration = timeout ?? _maxPollDuration;
    final stopwatch = Stopwatch()..start();
    
    while (stopwatch.elapsed < maxDuration) {
      final result = await checkPaymentStatus(transactionId);
      
      onStatusUpdate?.call(result);
      
      if (!result.isPending) {
        return result;
      }
      
      await Future.delayed(_pollInterval);
    }
    
    // Timeout reached
    return OrangePaymentResult(
      transactionId: transactionId,
      status: OrangePaymentStatus.timeout,
      amount: 0,
      currency: 'XAF',
      message: 'Le délai de paiement a expiré',
      timestamp: DateTime.now(),
    );
  }

  /// Initiate payment and wait for completion
  Future<OrangePaymentResult> processPayment({
    required String phone,
    required double amount,
    required String description,
    int? orderId,
    Duration? timeout,
    void Function(OrangePaymentResult)? onStatusUpdate,
  }) async {
    // Initiate payment
    final initResult = await initiatePayment(
      phone: phone,
      amount: amount,
      description: description,
      orderId: orderId,
    );
    
    onStatusUpdate?.call(initResult);
    
    if (initResult.isFailed) {
      return initResult;
    }
    
    // Wait for completion
    return waitForPayment(
      initResult.transactionId,
      timeout: timeout,
      onStatusUpdate: onStatusUpdate,
    );
  }

  /// Cancel pending payment
  Future<bool> cancelPayment(String transactionId) async {
    try {
      await _client.post(
        '${ApiConstants.paymentOrangeMoney}/$transactionId/cancel',
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Request refund
  Future<OrangePaymentResult> requestRefund({
    required String transactionId,
    double? amount,
    String? reason,
  }) async {
    try {
      final response = await _client.post(
        '${ApiConstants.paymentOrangeMoney}/$transactionId/refund',
        data: {
          if (amount != null) 'amount': amount,
          if (reason != null) 'reason': reason,
        },
      );
      return OrangePaymentResult.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Get payment history
  Future<PaginatedList<Transaction>> getPaymentHistory({
    int page = 1,
    int pageSize = 10,
    DateTime? fromDate,
    DateTime? toDate,
  }) async {
    try {
      final response = await _client.get(
        '${ApiConstants.paymentOrangeMoney}/history',
        queryParameters: {
          'page': page,
          'pageSize': pageSize,
          if (fromDate != null) 'fromDate': fromDate.toIso8601String(),
          if (toDate != null) 'toDate': toDate.toIso8601String(),
        },
      );
      return PaginatedList.fromJson(response.data, Transaction.fromJson);
    } catch (e) {
      rethrow;
    }
  }

  /// Validate Orange phone number
  bool isValidOrangeNumber(String phone) {
    return _isValidOrangeNumber(_formatPhone(phone));
  }

  // Private helpers

  String _formatPhone(String phone) {
    // Remove all non-digits
    var cleaned = phone.replaceAll(RegExp(r'[^0-9]'), '');
    
    // Remove country code if present
    if (cleaned.startsWith('237')) {
      cleaned = cleaned.substring(3);
    }
    
    return cleaned;
  }

  bool _isValidOrangeNumber(String phone) {
    // Orange Cameroon numbers start with 69, 655-659
    if (phone.length != 9) return false;
    
    final prefix = phone.substring(0, 2);
    final prefix3 = phone.substring(0, 3);
    
    return prefix == '69' || 
           (prefix3.startsWith('65') && int.parse(prefix3) >= 655 && int.parse(prefix3) <= 659);
  }
}

/// Orange Money payment request builder
class OrangePaymentRequest {
  String? _phone;
  double? _amount;
  String? _description;
  int? _orderId;
  Map<String, dynamic>? _metadata;

  OrangePaymentRequest phone(String phone) {
    _phone = phone;
    return this;
  }

  OrangePaymentRequest amount(double amount) {
    _amount = amount;
    return this;
  }

  OrangePaymentRequest description(String description) {
    _description = description;
    return this;
  }

  OrangePaymentRequest orderId(int orderId) {
    _orderId = orderId;
    return this;
  }

  OrangePaymentRequest metadata(Map<String, dynamic> metadata) {
    _metadata = metadata;
    return this;
  }

  Future<OrangePaymentResult> execute(OrangeMoneyService service) {
    if (_phone == null) throw ArgumentError('Phone is required');
    if (_amount == null) throw ArgumentError('Amount is required');
    if (_description == null) throw ArgumentError('Description is required');

    return service.initiatePayment(
      phone: _phone!,
      amount: _amount!,
      description: _description!,
      orderId: _orderId,
      metadata: _metadata,
    );
  }

  Future<OrangePaymentResult> executeAndWait(
    OrangeMoneyService service, {
    Duration? timeout,
    void Function(OrangePaymentResult)? onStatusUpdate,
  }) {
    if (_phone == null) throw ArgumentError('Phone is required');
    if (_amount == null) throw ArgumentError('Amount is required');
    if (_description == null) throw ArgumentError('Description is required');

    return service.processPayment(
      phone: _phone!,
      amount: _amount!,
      description: _description!,
      orderId: _orderId,
      timeout: timeout,
      onStatusUpdate: onStatusUpdate,
    );
  }
}
