import 'dart:async';
import '../../client/api_client.dart';
import '../../models/api_models.dart';
import 'package:okada_core/okada_core.dart';

/// MTN Mobile Money payment status
enum MomoPaymentStatus {
  pending,
  processing,
  successful,
  failed,
  cancelled,
  timeout,
}

/// MTN Mobile Money payment result
class MomoPaymentResult {
  final String transactionId;
  final MomoPaymentStatus status;
  final double amount;
  final String currency;
  final String? message;
  final String? externalId;
  final DateTime timestamp;

  const MomoPaymentResult({
    required this.transactionId,
    required this.status,
    required this.amount,
    required this.currency,
    this.message,
    this.externalId,
    required this.timestamp,
  });

  factory MomoPaymentResult.fromJson(Map<String, dynamic> json) {
    final statusString = json['status'] as String;
    final status = MomoPaymentStatus.values.firstWhere(
      (e) => e.name == statusString.toLowerCase(),
      orElse: () => MomoPaymentStatus.pending,
    );
    
    return MomoPaymentResult(
      transactionId: json['transactionId'] as String,
      status: status,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'XAF',
      message: json['message'] as String?,
      externalId: json['externalId'] as String?,
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
        'timestamp': timestamp.toIso8601String(),
      };

  bool get isSuccessful => status == MomoPaymentStatus.successful;
  bool get isPending => status == MomoPaymentStatus.pending || 
                        status == MomoPaymentStatus.processing;
  bool get isFailed => status == MomoPaymentStatus.failed || 
                       status == MomoPaymentStatus.cancelled ||
                       status == MomoPaymentStatus.timeout;
}

/// MTN Mobile Money payment service
class MtnMomoService {
  final OkadaApiClient _client;
  
  // Polling configuration
  static const Duration _pollInterval = Duration(seconds: 3);
  static const Duration _maxPollDuration = Duration(minutes: 5);

  MtnMomoService(this._client);

  /// Initiate MTN MoMo payment
  /// Returns transaction ID for tracking
  Future<MomoPaymentResult> initiatePayment({
    required String phone,
    required double amount,
    required String description,
    int? orderId,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      // Validate phone number
      final cleanPhone = _formatPhone(phone);
      if (!_isValidMtnNumber(cleanPhone)) {
        throw Exception('Numéro MTN invalide');
      }

      final response = await _client.post(
        ApiConstants.paymentMtnMomo,
        data: {
          'phone': cleanPhone,
          'amount': amount,
          'currency': 'XAF',
          'description': description,
          if (orderId != null) 'orderId': orderId,
          if (metadata != null) 'metadata': metadata,
        },
      );

      return MomoPaymentResult.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Check payment status
  Future<MomoPaymentResult> checkPaymentStatus(String transactionId) async {
    try {
      final response = await _client.get(
        '${ApiConstants.paymentMtnMomo}/$transactionId/status',
      );
      return MomoPaymentResult.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Wait for payment completion with polling
  /// Returns final payment result
  Future<MomoPaymentResult> waitForPayment(
    String transactionId, {
    Duration? timeout,
    void Function(MomoPaymentResult)? onStatusUpdate,
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
    return MomoPaymentResult(
      transactionId: transactionId,
      status: MomoPaymentStatus.timeout,
      amount: 0,
      currency: 'XAF',
      message: 'Le délai de paiement a expiré',
      timestamp: DateTime.now(),
    );
  }

  /// Initiate payment and wait for completion
  Future<MomoPaymentResult> processPayment({
    required String phone,
    required double amount,
    required String description,
    int? orderId,
    Duration? timeout,
    void Function(MomoPaymentResult)? onStatusUpdate,
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
        '${ApiConstants.paymentMtnMomo}/$transactionId/cancel',
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Request refund
  Future<MomoPaymentResult> requestRefund({
    required String transactionId,
    double? amount,
    String? reason,
  }) async {
    try {
      final response = await _client.post(
        '${ApiConstants.paymentMtnMomo}/$transactionId/refund',
        data: {
          if (amount != null) 'amount': amount,
          if (reason != null) 'reason': reason,
        },
      );
      return MomoPaymentResult.fromJson(response.data);
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
        '${ApiConstants.paymentMtnMomo}/history',
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

  /// Validate MTN phone number
  bool isValidMtnNumber(String phone) {
    return _isValidMtnNumber(_formatPhone(phone));
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

  bool _isValidMtnNumber(String phone) {
    // MTN Cameroon numbers start with 67, 68, 650-654
    if (phone.length != 9) return false;
    
    final prefix = phone.substring(0, 2);
    final prefix3 = phone.substring(0, 3);
    
    return prefix == '67' || 
           prefix == '68' || 
           (prefix3.startsWith('65') && int.parse(prefix3) >= 650 && int.parse(prefix3) <= 654);
  }
}

/// MTN MoMo payment request builder
class MomoPaymentRequest {
  String? _phone;
  double? _amount;
  String? _description;
  int? _orderId;
  Map<String, dynamic>? _metadata;

  MomoPaymentRequest phone(String phone) {
    _phone = phone;
    return this;
  }

  MomoPaymentRequest amount(double amount) {
    _amount = amount;
    return this;
  }

  MomoPaymentRequest description(String description) {
    _description = description;
    return this;
  }

  MomoPaymentRequest orderId(int orderId) {
    _orderId = orderId;
    return this;
  }

  MomoPaymentRequest metadata(Map<String, dynamic> metadata) {
    _metadata = metadata;
    return this;
  }

  Future<MomoPaymentResult> execute(MtnMomoService service) {
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

  Future<MomoPaymentResult> executeAndWait(
    MtnMomoService service, {
    Duration? timeout,
    void Function(MomoPaymentResult)? onStatusUpdate,
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
