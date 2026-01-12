import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';

/// MTN Mobile Money API Configuration
class MtnMomoConfig {
  final String baseUrl;
  final String subscriptionKey;
  final String apiUserId;
  final String apiKey;
  final String environment; // 'sandbox' or 'production'
  final String currency;
  final String callbackUrl;

  const MtnMomoConfig({
    required this.baseUrl,
    required this.subscriptionKey,
    required this.apiUserId,
    required this.apiKey,
    this.environment = 'sandbox',
    this.currency = 'XAF',
    required this.callbackUrl,
  });

  /// Sandbox configuration for testing
  factory MtnMomoConfig.sandbox({
    required String subscriptionKey,
    required String apiUserId,
    required String apiKey,
    required String callbackUrl,
  }) {
    return MtnMomoConfig(
      baseUrl: 'https://sandbox.momodeveloper.mtn.com',
      subscriptionKey: subscriptionKey,
      apiUserId: apiUserId,
      apiKey: apiKey,
      environment: 'sandbox',
      callbackUrl: callbackUrl,
    );
  }

  /// Production configuration
  factory MtnMomoConfig.production({
    required String subscriptionKey,
    required String apiUserId,
    required String apiKey,
    required String callbackUrl,
  }) {
    return MtnMomoConfig(
      baseUrl: 'https://momodeveloper.mtn.com',
      subscriptionKey: subscriptionKey,
      apiUserId: apiUserId,
      apiKey: apiKey,
      environment: 'production',
      callbackUrl: callbackUrl,
    );
  }
}

/// MTN MoMo Payment Request
class MtnPaymentRequest {
  final String externalId;
  final double amount;
  final String currency;
  final String payerPhone;
  final String payerMessage;
  final String payeeNote;

  MtnPaymentRequest({
    required this.externalId,
    required this.amount,
    this.currency = 'XAF',
    required this.payerPhone,
    required this.payerMessage,
    required this.payeeNote,
  });

  Map<String, dynamic> toJson() => {
    'amount': amount.toStringAsFixed(0),
    'currency': currency,
    'externalId': externalId,
    'payer': {
      'partyIdType': 'MSISDN',
      'partyId': _formatPhoneNumber(payerPhone),
    },
    'payerMessage': payerMessage,
    'payeeNote': payeeNote,
  };

  String _formatPhoneNumber(String phone) {
    // Remove any non-digit characters
    String cleaned = phone.replaceAll(RegExp(r'[^\d]'), '');
    
    // Add country code if not present (Cameroon: 237)
    if (cleaned.length == 9) {
      cleaned = '237$cleaned';
    }
    
    return cleaned;
  }
}

/// MTN MoMo Payment Response
class MtnPaymentResponse {
  final String referenceId;
  final String status;
  final String? reason;
  final String? financialTransactionId;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  MtnPaymentResponse({
    required this.referenceId,
    required this.status,
    this.reason,
    this.financialTransactionId,
    this.createdAt,
    this.updatedAt,
  });

  factory MtnPaymentResponse.fromJson(Map<String, dynamic> json) {
    return MtnPaymentResponse(
      referenceId: json['referenceId'] ?? json['externalId'] ?? '',
      status: json['status'] ?? 'UNKNOWN',
      reason: json['reason'],
      financialTransactionId: json['financialTransactionId'],
      createdAt: json['createdAt'] != null 
          ? DateTime.tryParse(json['createdAt']) 
          : null,
      updatedAt: json['updatedAt'] != null 
          ? DateTime.tryParse(json['updatedAt']) 
          : null,
    );
  }

  bool get isSuccessful => status == 'SUCCESSFUL';
  bool get isPending => status == 'PENDING';
  bool get isFailed => status == 'FAILED';
}

/// MTN MoMo Account Balance
class MtnAccountBalance {
  final double availableBalance;
  final String currency;

  MtnAccountBalance({
    required this.availableBalance,
    required this.currency,
  });

  factory MtnAccountBalance.fromJson(Map<String, dynamic> json) {
    return MtnAccountBalance(
      availableBalance: double.tryParse(json['availableBalance']?.toString() ?? '0') ?? 0,
      currency: json['currency'] ?? 'XAF',
    );
  }
}

/// MTN MoMo Account Holder Info
class MtnAccountHolder {
  final String name;
  final String phone;
  final bool isActive;

  MtnAccountHolder({
    required this.name,
    required this.phone,
    required this.isActive,
  });

  factory MtnAccountHolder.fromJson(Map<String, dynamic> json) {
    return MtnAccountHolder(
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      isActive: json['status'] == 'ACTIVE',
    );
  }
}

/// MTN Mobile Money Integration Service
class MtnMomoService {
  final MtnMomoConfig config;
  final Dio _dio;
  String? _accessToken;
  DateTime? _tokenExpiry;

  MtnMomoService({required this.config}) : _dio = Dio() {
    _dio.options.baseUrl = config.baseUrl;
    _dio.options.headers = {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
    };

    // Add interceptor for logging
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
    ));
  }

  /// Get access token for API calls
  Future<String> _getAccessToken() async {
    // Return cached token if still valid
    if (_accessToken != null && _tokenExpiry != null && DateTime.now().isBefore(_tokenExpiry!)) {
      return _accessToken!;
    }

    try {
      final credentials = base64Encode(utf8.encode('${config.apiUserId}:${config.apiKey}'));
      
      final response = await _dio.post(
        '/collection/token/',
        options: Options(
          headers: {
            'Authorization': 'Basic $credentials',
          },
        ),
      );

      _accessToken = response.data['access_token'];
      final expiresIn = response.data['expires_in'] ?? 3600;
      _tokenExpiry = DateTime.now().add(Duration(seconds: expiresIn - 60));

      return _accessToken!;
    } catch (e) {
      throw MtnMomoException('Failed to get access token: $e');
    }
  }

  /// Request payment from a customer
  Future<String> requestPayment(MtnPaymentRequest request) async {
    try {
      final token = await _getAccessToken();
      final referenceId = _generateUuid();

      await _dio.post(
        '/collection/v1_0/requesttopay',
        data: request.toJson(),
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'X-Reference-Id': referenceId,
            'X-Target-Environment': config.environment,
            'X-Callback-Url': config.callbackUrl,
          },
        ),
      );

      return referenceId;
    } on DioException catch (e) {
      throw MtnMomoException(
        'Payment request failed: ${e.response?.data ?? e.message}',
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// Check payment status
  Future<MtnPaymentResponse> getPaymentStatus(String referenceId) async {
    try {
      final token = await _getAccessToken();

      final response = await _dio.get(
        '/collection/v1_0/requesttopay/$referenceId',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'X-Target-Environment': config.environment,
          },
        ),
      );

      return MtnPaymentResponse.fromJson({
        ...response.data,
        'referenceId': referenceId,
      });
    } on DioException catch (e) {
      throw MtnMomoException(
        'Failed to get payment status: ${e.response?.data ?? e.message}',
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// Get account balance
  Future<MtnAccountBalance> getAccountBalance() async {
    try {
      final token = await _getAccessToken();

      final response = await _dio.get(
        '/collection/v1_0/account/balance',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'X-Target-Environment': config.environment,
          },
        ),
      );

      return MtnAccountBalance.fromJson(response.data);
    } on DioException catch (e) {
      throw MtnMomoException(
        'Failed to get account balance: ${e.response?.data ?? e.message}',
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// Check if account holder is active
  Future<bool> isAccountHolderActive(String phoneNumber) async {
    try {
      final token = await _getAccessToken();
      final formattedPhone = _formatPhoneNumber(phoneNumber);

      final response = await _dio.get(
        '/collection/v1_0/accountholder/msisdn/$formattedPhone/active',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'X-Target-Environment': config.environment,
          },
        ),
      );

      return response.data['result'] == true;
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return false;
      }
      throw MtnMomoException(
        'Failed to check account holder: ${e.response?.data ?? e.message}',
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// Get account holder info
  Future<MtnAccountHolder?> getAccountHolderInfo(String phoneNumber) async {
    try {
      final token = await _getAccessToken();
      final formattedPhone = _formatPhoneNumber(phoneNumber);

      final response = await _dio.get(
        '/collection/v1_0/accountholder/msisdn/$formattedPhone/basicuserinfo',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'X-Target-Environment': config.environment,
          },
        ),
      );

      return MtnAccountHolder.fromJson({
        ...response.data,
        'phone': formattedPhone,
      });
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return null;
      }
      throw MtnMomoException(
        'Failed to get account holder info: ${e.response?.data ?? e.message}',
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// Transfer money (disbursement)
  Future<String> transfer({
    required double amount,
    required String recipientPhone,
    required String externalId,
    String? payerMessage,
    String? payeeNote,
  }) async {
    try {
      final token = await _getAccessToken();
      final referenceId = _generateUuid();

      await _dio.post(
        '/disbursement/v1_0/transfer',
        data: {
          'amount': amount.toStringAsFixed(0),
          'currency': config.currency,
          'externalId': externalId,
          'payee': {
            'partyIdType': 'MSISDN',
            'partyId': _formatPhoneNumber(recipientPhone),
          },
          if (payerMessage != null) 'payerMessage': payerMessage,
          if (payeeNote != null) 'payeeNote': payeeNote,
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'X-Reference-Id': referenceId,
            'X-Target-Environment': config.environment,
            'X-Callback-Url': config.callbackUrl,
          },
        ),
      );

      return referenceId;
    } on DioException catch (e) {
      throw MtnMomoException(
        'Transfer failed: ${e.response?.data ?? e.message}',
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// Get transfer status
  Future<MtnPaymentResponse> getTransferStatus(String referenceId) async {
    try {
      final token = await _getAccessToken();

      final response = await _dio.get(
        '/disbursement/v1_0/transfer/$referenceId',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'X-Target-Environment': config.environment,
          },
        ),
      );

      return MtnPaymentResponse.fromJson({
        ...response.data,
        'referenceId': referenceId,
      });
    } on DioException catch (e) {
      throw MtnMomoException(
        'Failed to get transfer status: ${e.response?.data ?? e.message}',
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// Poll payment status until completion or timeout
  Future<MtnPaymentResponse> pollPaymentStatus(
    String referenceId, {
    Duration timeout = const Duration(minutes: 2),
    Duration interval = const Duration(seconds: 5),
  }) async {
    final endTime = DateTime.now().add(timeout);

    while (DateTime.now().isBefore(endTime)) {
      final status = await getPaymentStatus(referenceId);
      
      if (status.isSuccessful || status.isFailed) {
        return status;
      }

      await Future.delayed(interval);
    }

    throw MtnMomoException('Payment status polling timed out');
  }

  String _formatPhoneNumber(String phone) {
    String cleaned = phone.replaceAll(RegExp(r'[^\d]'), '');
    if (cleaned.length == 9) {
      cleaned = '237$cleaned';
    }
    return cleaned;
  }

  String _generateUuid() {
    // Simple UUID v4 generation
    final random = DateTime.now().millisecondsSinceEpoch;
    return '${_hex(random)}-${_hex(random ~/ 2)}-4${_hex(random ~/ 3).substring(1)}-${_hex(random ~/ 4)}-${_hex(random ~/ 5)}${_hex(random ~/ 6)}';
  }

  String _hex(int value) {
    return value.toRadixString(16).padLeft(4, '0').substring(0, 4);
  }
}

/// MTN MoMo Exception
class MtnMomoException implements Exception {
  final String message;
  final int? statusCode;

  MtnMomoException(this.message, {this.statusCode});

  @override
  String toString() => 'MtnMomoException: $message (status: $statusCode)';
}

/// Payment status polling result
enum PaymentPollResult {
  successful,
  failed,
  timeout,
  cancelled,
}

/// High-level payment flow helper
class MtnPaymentFlow {
  final MtnMomoService _service;
  
  MtnPaymentFlow(this._service);

  /// Complete payment flow with status polling
  Future<PaymentFlowResult> processPayment({
    required double amount,
    required String phoneNumber,
    required String orderId,
    String? description,
    Duration timeout = const Duration(minutes: 2),
    void Function(String status)? onStatusChange,
  }) async {
    try {
      // Validate phone number
      final isActive = await _service.isAccountHolderActive(phoneNumber);
      if (!isActive) {
        return PaymentFlowResult(
          success: false,
          error: 'Le numéro de téléphone n\'est pas enregistré sur MTN Mobile Money',
        );
      }

      onStatusChange?.call('INITIATING');

      // Request payment
      final referenceId = await _service.requestPayment(MtnPaymentRequest(
        externalId: orderId,
        amount: amount,
        payerPhone: phoneNumber,
        payerMessage: description ?? 'Paiement Okada #$orderId',
        payeeNote: 'Commande Okada #$orderId',
      ));

      onStatusChange?.call('PENDING');

      // Poll for status
      final result = await _service.pollPaymentStatus(
        referenceId,
        timeout: timeout,
      );

      onStatusChange?.call(result.status);

      return PaymentFlowResult(
        success: result.isSuccessful,
        referenceId: referenceId,
        transactionId: result.financialTransactionId,
        status: result.status,
        error: result.isFailed ? result.reason : null,
      );
    } on MtnMomoException catch (e) {
      return PaymentFlowResult(
        success: false,
        error: e.message,
      );
    } catch (e) {
      return PaymentFlowResult(
        success: false,
        error: 'Une erreur inattendue s\'est produite: $e',
      );
    }
  }
}

/// Payment flow result
class PaymentFlowResult {
  final bool success;
  final String? referenceId;
  final String? transactionId;
  final String? status;
  final String? error;

  PaymentFlowResult({
    required this.success,
    this.referenceId,
    this.transactionId,
    this.status,
    this.error,
  });
}
