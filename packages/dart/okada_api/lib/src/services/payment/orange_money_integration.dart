import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';

/// Orange Money API Configuration
class OrangeMoneyConfig {
  final String baseUrl;
  final String clientId;
  final String clientSecret;
  final String merchantKey;
  final String environment; // 'sandbox' or 'production'
  final String currency;
  final String callbackUrl;
  final String returnUrl;
  final String cancelUrl;

  const OrangeMoneyConfig({
    required this.baseUrl,
    required this.clientId,
    required this.clientSecret,
    required this.merchantKey,
    this.environment = 'sandbox',
    this.currency = 'XAF',
    required this.callbackUrl,
    required this.returnUrl,
    required this.cancelUrl,
  });

  /// Sandbox configuration for testing
  factory OrangeMoneyConfig.sandbox({
    required String clientId,
    required String clientSecret,
    required String merchantKey,
    required String callbackUrl,
    required String returnUrl,
    required String cancelUrl,
  }) {
    return OrangeMoneyConfig(
      baseUrl: 'https://api.orange.com/orange-money-webpay/dev/v1',
      clientId: clientId,
      clientSecret: clientSecret,
      merchantKey: merchantKey,
      environment: 'sandbox',
      callbackUrl: callbackUrl,
      returnUrl: returnUrl,
      cancelUrl: cancelUrl,
    );
  }

  /// Production configuration
  factory OrangeMoneyConfig.production({
    required String clientId,
    required String clientSecret,
    required String merchantKey,
    required String callbackUrl,
    required String returnUrl,
    required String cancelUrl,
  }) {
    return OrangeMoneyConfig(
      baseUrl: 'https://api.orange.com/orange-money-webpay/cm/v1',
      clientId: clientId,
      clientSecret: clientSecret,
      merchantKey: merchantKey,
      environment: 'production',
      callbackUrl: callbackUrl,
      returnUrl: returnUrl,
      cancelUrl: cancelUrl,
    );
  }
}

/// Orange Money Payment Request
class OrangePaymentRequest {
  final String orderId;
  final double amount;
  final String currency;
  final String description;
  final String? customerPhone;
  final String? customerName;
  final String? customerEmail;
  final Map<String, dynamic>? metadata;

  OrangePaymentRequest({
    required this.orderId,
    required this.amount,
    this.currency = 'XAF',
    required this.description,
    this.customerPhone,
    this.customerName,
    this.customerEmail,
    this.metadata,
  });

  Map<String, dynamic> toJson() => {
    'merchant_key': '', // Will be set by service
    'currency': currency,
    'order_id': orderId,
    'amount': amount.toStringAsFixed(0),
    'return_url': '', // Will be set by service
    'cancel_url': '', // Will be set by service
    'notif_url': '', // Will be set by service
    'lang': 'fr',
    if (customerPhone != null) 'customer_phone': _formatPhoneNumber(customerPhone!),
    if (customerName != null) 'customer_name': customerName,
    if (customerEmail != null) 'customer_email': customerEmail,
    if (metadata != null) 'metadata': jsonEncode(metadata),
  };

  String _formatPhoneNumber(String phone) {
    String cleaned = phone.replaceAll(RegExp(r'[^\d]'), '');
    if (cleaned.length == 9) {
      cleaned = '237$cleaned';
    }
    return cleaned;
  }
}

/// Orange Money Payment Response
class OrangePaymentResponse {
  final String payToken;
  final String paymentUrl;
  final String status;
  final String? transactionId;
  final String? message;
  final DateTime? createdAt;

  OrangePaymentResponse({
    required this.payToken,
    required this.paymentUrl,
    required this.status,
    this.transactionId,
    this.message,
    this.createdAt,
  });

  factory OrangePaymentResponse.fromJson(Map<String, dynamic> json) {
    return OrangePaymentResponse(
      payToken: json['pay_token'] ?? json['payToken'] ?? '',
      paymentUrl: json['payment_url'] ?? json['paymentUrl'] ?? '',
      status: json['status'] ?? 'INITIATED',
      transactionId: json['txnid'] ?? json['transactionId'],
      message: json['message'],
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : DateTime.now(),
    );
  }

  bool get isInitiated => status == 'INITIATED';
  bool get isPending => status == 'PENDING';
  bool get isSuccessful => status == 'SUCCESS' || status == 'SUCCESSFUL';
  bool get isFailed => status == 'FAILED' || status == 'EXPIRED';
}

/// Orange Money Transaction Status
class OrangeTransactionStatus {
  final String payToken;
  final String status;
  final String? transactionId;
  final double? amount;
  final String? currency;
  final String? message;
  final DateTime? completedAt;

  OrangeTransactionStatus({
    required this.payToken,
    required this.status,
    this.transactionId,
    this.amount,
    this.currency,
    this.message,
    this.completedAt,
  });

  factory OrangeTransactionStatus.fromJson(Map<String, dynamic> json) {
    return OrangeTransactionStatus(
      payToken: json['pay_token'] ?? json['payToken'] ?? '',
      status: json['status'] ?? 'UNKNOWN',
      transactionId: json['txnid'] ?? json['transactionId'],
      amount: double.tryParse(json['amount']?.toString() ?? '0'),
      currency: json['currency'],
      message: json['message'],
      completedAt: json['completed_at'] != null 
          ? DateTime.tryParse(json['completed_at']) 
          : null,
    );
  }

  bool get isSuccessful => status == 'SUCCESS' || status == 'SUCCESSFUL';
  bool get isPending => status == 'PENDING' || status == 'INITIATED';
  bool get isFailed => status == 'FAILED' || status == 'EXPIRED' || status == 'CANCELLED';
}

/// Orange Money Integration Service
class OrangeMoneyService {
  final OrangeMoneyConfig config;
  final Dio _dio;
  String? _accessToken;
  DateTime? _tokenExpiry;

  OrangeMoneyService({required this.config}) : _dio = Dio() {
    _dio.options.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add interceptor for logging
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
    ));
  }

  /// Get OAuth access token
  Future<String> _getAccessToken() async {
    // Return cached token if still valid
    if (_accessToken != null && _tokenExpiry != null && DateTime.now().isBefore(_tokenExpiry!)) {
      return _accessToken!;
    }

    try {
      final credentials = base64Encode(utf8.encode('${config.clientId}:${config.clientSecret}'));
      
      final response = await _dio.post(
        'https://api.orange.com/oauth/v3/token',
        data: 'grant_type=client_credentials',
        options: Options(
          headers: {
            'Authorization': 'Basic $credentials',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        ),
      );

      _accessToken = response.data['access_token'];
      final expiresIn = response.data['expires_in'] ?? 3600;
      _tokenExpiry = DateTime.now().add(Duration(seconds: expiresIn - 60));

      return _accessToken!;
    } catch (e) {
      throw OrangeMoneyException('Failed to get access token: $e');
    }
  }

  /// Initialize a web payment
  Future<OrangePaymentResponse> initializePayment(OrangePaymentRequest request) async {
    try {
      final token = await _getAccessToken();

      final payload = {
        ...request.toJson(),
        'merchant_key': config.merchantKey,
        'return_url': config.returnUrl,
        'cancel_url': config.cancelUrl,
        'notif_url': config.callbackUrl,
      };

      final response = await _dio.post(
        '${config.baseUrl}/webpayment',
        data: payload,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      return OrangePaymentResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw OrangeMoneyException(
        'Payment initialization failed: ${e.response?.data ?? e.message}',
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// Check transaction status
  Future<OrangeTransactionStatus> getTransactionStatus(String payToken) async {
    try {
      final token = await _getAccessToken();

      final response = await _dio.post(
        '${config.baseUrl}/transactionstatus',
        data: {
          'pay_token': payToken,
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      return OrangeTransactionStatus.fromJson(response.data);
    } on DioException catch (e) {
      throw OrangeMoneyException(
        'Failed to get transaction status: ${e.response?.data ?? e.message}',
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// Push payment (USSD prompt to customer phone)
  Future<OrangePaymentResponse> pushPayment({
    required String orderId,
    required double amount,
    required String customerPhone,
    required String description,
    String? otp,
  }) async {
    try {
      final token = await _getAccessToken();

      final response = await _dio.post(
        '${config.baseUrl}/mp/push',
        data: {
          'merchant_key': config.merchantKey,
          'currency': config.currency,
          'order_id': orderId,
          'amount': amount.toStringAsFixed(0),
          'subscriber_msisdn': _formatPhoneNumber(customerPhone),
          'description': description,
          if (otp != null) 'otp': otp,
          'notif_url': config.callbackUrl,
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      return OrangePaymentResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw OrangeMoneyException(
        'Push payment failed: ${e.response?.data ?? e.message}',
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// Request OTP for push payment
  Future<bool> requestOtp(String phoneNumber) async {
    try {
      final token = await _getAccessToken();

      await _dio.post(
        '${config.baseUrl}/mp/requestotp',
        data: {
          'merchant_key': config.merchantKey,
          'subscriber_msisdn': _formatPhoneNumber(phoneNumber),
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      return true;
    } on DioException catch (e) {
      throw OrangeMoneyException(
        'OTP request failed: ${e.response?.data ?? e.message}',
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// Poll transaction status until completion or timeout
  Future<OrangeTransactionStatus> pollTransactionStatus(
    String payToken, {
    Duration timeout = const Duration(minutes: 5),
    Duration interval = const Duration(seconds: 5),
  }) async {
    final endTime = DateTime.now().add(timeout);

    while (DateTime.now().isBefore(endTime)) {
      final status = await getTransactionStatus(payToken);
      
      if (status.isSuccessful || status.isFailed) {
        return status;
      }

      await Future.delayed(interval);
    }

    throw OrangeMoneyException('Transaction status polling timed out');
  }

  /// Refund a transaction
  Future<bool> refundTransaction({
    required String transactionId,
    required double amount,
    required String reason,
  }) async {
    try {
      final token = await _getAccessToken();

      await _dio.post(
        '${config.baseUrl}/refund',
        data: {
          'merchant_key': config.merchantKey,
          'txnid': transactionId,
          'amount': amount.toStringAsFixed(0),
          'reason': reason,
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      return true;
    } on DioException catch (e) {
      throw OrangeMoneyException(
        'Refund failed: ${e.response?.data ?? e.message}',
        statusCode: e.response?.statusCode,
      );
    }
  }

  String _formatPhoneNumber(String phone) {
    String cleaned = phone.replaceAll(RegExp(r'[^\d]'), '');
    if (cleaned.length == 9) {
      cleaned = '237$cleaned';
    }
    return cleaned;
  }
}

/// Orange Money Exception
class OrangeMoneyException implements Exception {
  final String message;
  final int? statusCode;

  OrangeMoneyException(this.message, {this.statusCode});

  @override
  String toString() => 'OrangeMoneyException: $message (status: $statusCode)';
}

/// High-level payment flow helper for Orange Money
class OrangePaymentFlow {
  final OrangeMoneyService _service;
  
  OrangePaymentFlow(this._service);

  /// Web payment flow - returns URL for customer to complete payment
  Future<WebPaymentFlowResult> initiateWebPayment({
    required double amount,
    required String orderId,
    String? customerPhone,
    String? customerName,
    String? description,
  }) async {
    try {
      final response = await _service.initializePayment(OrangePaymentRequest(
        orderId: orderId,
        amount: amount,
        description: description ?? 'Paiement Okada #$orderId',
        customerPhone: customerPhone,
        customerName: customerName,
      ));

      return WebPaymentFlowResult(
        success: true,
        payToken: response.payToken,
        paymentUrl: response.paymentUrl,
      );
    } on OrangeMoneyException catch (e) {
      return WebPaymentFlowResult(
        success: false,
        error: e.message,
      );
    } catch (e) {
      return WebPaymentFlowResult(
        success: false,
        error: 'Une erreur inattendue s\'est produite: $e',
      );
    }
  }

  /// Push payment flow - sends USSD prompt to customer
  Future<PushPaymentFlowResult> processPushPayment({
    required double amount,
    required String phoneNumber,
    required String orderId,
    String? description,
    Duration timeout = const Duration(minutes: 2),
    void Function(String status)? onStatusChange,
  }) async {
    try {
      onStatusChange?.call('REQUESTING_OTP');

      // Request OTP first
      await _service.requestOtp(phoneNumber);

      onStatusChange?.call('OTP_SENT');

      // Wait for user to enter OTP and confirm
      // In real implementation, you'd wait for OTP input from user
      await Future.delayed(const Duration(seconds: 2));

      onStatusChange?.call('INITIATING');

      // Initiate push payment
      final response = await _service.pushPayment(
        orderId: orderId,
        amount: amount,
        customerPhone: phoneNumber,
        description: description ?? 'Paiement Okada #$orderId',
      );

      onStatusChange?.call('PENDING');

      // Poll for status
      final status = await _service.pollTransactionStatus(
        response.payToken,
        timeout: timeout,
      );

      onStatusChange?.call(status.status);

      return PushPaymentFlowResult(
        success: status.isSuccessful,
        payToken: response.payToken,
        transactionId: status.transactionId,
        status: status.status,
        error: status.isFailed ? status.message : null,
      );
    } on OrangeMoneyException catch (e) {
      return PushPaymentFlowResult(
        success: false,
        error: e.message,
      );
    } catch (e) {
      return PushPaymentFlowResult(
        success: false,
        error: 'Une erreur inattendue s\'est produite: $e',
      );
    }
  }

  /// Check and wait for web payment completion
  Future<WebPaymentCompletionResult> waitForWebPaymentCompletion({
    required String payToken,
    Duration timeout = const Duration(minutes: 10),
    void Function(String status)? onStatusChange,
  }) async {
    try {
      onStatusChange?.call('WAITING');

      final status = await _service.pollTransactionStatus(
        payToken,
        timeout: timeout,
        interval: const Duration(seconds: 3),
      );

      onStatusChange?.call(status.status);

      return WebPaymentCompletionResult(
        success: status.isSuccessful,
        transactionId: status.transactionId,
        status: status.status,
        amount: status.amount,
        error: status.isFailed ? status.message : null,
      );
    } on OrangeMoneyException catch (e) {
      return WebPaymentCompletionResult(
        success: false,
        error: e.message,
      );
    } catch (e) {
      return WebPaymentCompletionResult(
        success: false,
        error: 'Une erreur inattendue s\'est produite: $e',
      );
    }
  }
}

/// Web payment flow result
class WebPaymentFlowResult {
  final bool success;
  final String? payToken;
  final String? paymentUrl;
  final String? error;

  WebPaymentFlowResult({
    required this.success,
    this.payToken,
    this.paymentUrl,
    this.error,
  });
}

/// Push payment flow result
class PushPaymentFlowResult {
  final bool success;
  final String? payToken;
  final String? transactionId;
  final String? status;
  final String? error;

  PushPaymentFlowResult({
    required this.success,
    this.payToken,
    this.transactionId,
    this.status,
    this.error,
  });
}

/// Web payment completion result
class WebPaymentCompletionResult {
  final bool success;
  final String? transactionId;
  final String? status;
  final double? amount;
  final String? error;

  WebPaymentCompletionResult({
    required this.success,
    this.transactionId,
    this.status,
    this.amount,
    this.error,
  });
}
