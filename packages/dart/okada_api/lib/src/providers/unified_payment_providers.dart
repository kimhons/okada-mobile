import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/payment/mtn_momo_integration.dart';
import '../services/payment/orange_money_integration.dart';

// ============ Payment Method Enum ============

enum PaymentMethod {
  mtnMomo,
  orangeMoney,
  wallet,
  cash,
}

extension PaymentMethodExtension on PaymentMethod {
  String get displayName {
    switch (this) {
      case PaymentMethod.mtnMomo:
        return 'MTN Mobile Money';
      case PaymentMethod.orangeMoney:
        return 'Orange Money';
      case PaymentMethod.wallet:
        return 'Portefeuille Okada';
      case PaymentMethod.cash:
        return 'Espèces';
    }
  }

  String get code {
    switch (this) {
      case PaymentMethod.mtnMomo:
        return 'mtn_momo';
      case PaymentMethod.orangeMoney:
        return 'orange_money';
      case PaymentMethod.wallet:
        return 'wallet';
      case PaymentMethod.cash:
        return 'cash';
    }
  }

  String get icon {
    switch (this) {
      case PaymentMethod.mtnMomo:
        return 'assets/icons/mtn_momo.png';
      case PaymentMethod.orangeMoney:
        return 'assets/icons/orange_money.png';
      case PaymentMethod.wallet:
        return 'assets/icons/wallet.png';
      case PaymentMethod.cash:
        return 'assets/icons/cash.png';
    }
  }

  bool get requiresPhone {
    switch (this) {
      case PaymentMethod.mtnMomo:
      case PaymentMethod.orangeMoney:
        return true;
      case PaymentMethod.wallet:
      case PaymentMethod.cash:
        return false;
    }
  }
}

// ============ Payment State ============

enum PaymentStatus {
  idle,
  validating,
  initiating,
  pending,
  processing,
  successful,
  failed,
  cancelled,
  timeout,
}

class PaymentState {
  final PaymentStatus status;
  final PaymentMethod? method;
  final String? phoneNumber;
  final double? amount;
  final String? orderId;
  final String? referenceId;
  final String? transactionId;
  final String? paymentUrl;
  final String? error;
  final DateTime? startedAt;
  final DateTime? completedAt;

  PaymentState({
    this.status = PaymentStatus.idle,
    this.method,
    this.phoneNumber,
    this.amount,
    this.orderId,
    this.referenceId,
    this.transactionId,
    this.paymentUrl,
    this.error,
    this.startedAt,
    this.completedAt,
  });

  PaymentState copyWith({
    PaymentStatus? status,
    PaymentMethod? method,
    String? phoneNumber,
    double? amount,
    String? orderId,
    String? referenceId,
    String? transactionId,
    String? paymentUrl,
    String? error,
    DateTime? startedAt,
    DateTime? completedAt,
  }) {
    return PaymentState(
      status: status ?? this.status,
      method: method ?? this.method,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      amount: amount ?? this.amount,
      orderId: orderId ?? this.orderId,
      referenceId: referenceId ?? this.referenceId,
      transactionId: transactionId ?? this.transactionId,
      paymentUrl: paymentUrl ?? this.paymentUrl,
      error: error,
      startedAt: startedAt ?? this.startedAt,
      completedAt: completedAt ?? this.completedAt,
    );
  }

  bool get isProcessing => status == PaymentStatus.validating ||
      status == PaymentStatus.initiating ||
      status == PaymentStatus.pending ||
      status == PaymentStatus.processing;

  bool get isComplete => status == PaymentStatus.successful ||
      status == PaymentStatus.failed ||
      status == PaymentStatus.cancelled ||
      status == PaymentStatus.timeout;

  String get statusMessage {
    switch (status) {
      case PaymentStatus.idle:
        return 'Prêt pour le paiement';
      case PaymentStatus.validating:
        return 'Validation du numéro...';
      case PaymentStatus.initiating:
        return 'Initialisation du paiement...';
      case PaymentStatus.pending:
        return 'En attente de confirmation...';
      case PaymentStatus.processing:
        return 'Traitement en cours...';
      case PaymentStatus.successful:
        return 'Paiement réussi!';
      case PaymentStatus.failed:
        return 'Paiement échoué';
      case PaymentStatus.cancelled:
        return 'Paiement annulé';
      case PaymentStatus.timeout:
        return 'Délai d\'attente dépassé';
    }
  }
}

// ============ Payment Notifier ============

class PaymentNotifier extends StateNotifier<PaymentState> {
  final MtnMomoService? _mtnService;
  final OrangeMoneyService? _orangeService;
  
  Timer? _pollingTimer;
  bool _isCancelled = false;

  PaymentNotifier({
    MtnMomoService? mtnService,
    OrangeMoneyService? orangeService,
  }) : _mtnService = mtnService,
       _orangeService = orangeService,
       super(PaymentState());

  /// Process payment with selected method
  Future<bool> processPayment({
    required PaymentMethod method,
    required double amount,
    required String orderId,
    String? phoneNumber,
    Duration timeout = const Duration(minutes: 2),
  }) async {
    _isCancelled = false;
    
    state = state.copyWith(
      status: PaymentStatus.validating,
      method: method,
      amount: amount,
      orderId: orderId,
      phoneNumber: phoneNumber,
      startedAt: DateTime.now(),
      error: null,
    );

    try {
      switch (method) {
        case PaymentMethod.mtnMomo:
          return await _processMtnPayment(
            amount: amount,
            orderId: orderId,
            phoneNumber: phoneNumber!,
            timeout: timeout,
          );
        case PaymentMethod.orangeMoney:
          return await _processOrangePayment(
            amount: amount,
            orderId: orderId,
            phoneNumber: phoneNumber!,
            timeout: timeout,
          );
        case PaymentMethod.wallet:
          return await _processWalletPayment(
            amount: amount,
            orderId: orderId,
          );
        case PaymentMethod.cash:
          // Cash payment is handled at delivery
          state = state.copyWith(
            status: PaymentStatus.successful,
            completedAt: DateTime.now(),
          );
          return true;
      }
    } catch (e) {
      state = state.copyWith(
        status: PaymentStatus.failed,
        error: e.toString(),
        completedAt: DateTime.now(),
      );
      return false;
    }
  }

  Future<bool> _processMtnPayment({
    required double amount,
    required String orderId,
    required String phoneNumber,
    required Duration timeout,
  }) async {
    if (_mtnService == null) {
      state = state.copyWith(
        status: PaymentStatus.failed,
        error: 'Service MTN Mobile Money non configuré',
      );
      return false;
    }

    try {
      // Validate phone number
      state = state.copyWith(status: PaymentStatus.validating);
      
      final isActive = await _mtnService!.isAccountHolderActive(phoneNumber);
      if (!isActive) {
        state = state.copyWith(
          status: PaymentStatus.failed,
          error: 'Ce numéro n\'est pas enregistré sur MTN Mobile Money',
        );
        return false;
      }

      if (_isCancelled) return false;

      // Initiate payment
      state = state.copyWith(status: PaymentStatus.initiating);
      
      final referenceId = await _mtnService!.requestPayment(MtnPaymentRequest(
        externalId: orderId,
        amount: amount,
        payerPhone: phoneNumber,
        payerMessage: 'Paiement Okada #$orderId',
        payeeNote: 'Commande Okada #$orderId',
      ));

      state = state.copyWith(
        status: PaymentStatus.pending,
        referenceId: referenceId,
      );

      if (_isCancelled) return false;

      // Poll for status
      final result = await _mtnService!.pollPaymentStatus(
        referenceId,
        timeout: timeout,
      );

      if (result.isSuccessful) {
        state = state.copyWith(
          status: PaymentStatus.successful,
          transactionId: result.financialTransactionId,
          completedAt: DateTime.now(),
        );
        return true;
      } else {
        state = state.copyWith(
          status: PaymentStatus.failed,
          error: result.reason ?? 'Paiement refusé',
          completedAt: DateTime.now(),
        );
        return false;
      }
    } on MtnMomoException catch (e) {
      state = state.copyWith(
        status: PaymentStatus.failed,
        error: e.message,
        completedAt: DateTime.now(),
      );
      return false;
    }
  }

  Future<bool> _processOrangePayment({
    required double amount,
    required String orderId,
    required String phoneNumber,
    required Duration timeout,
  }) async {
    if (_orangeService == null) {
      state = state.copyWith(
        status: PaymentStatus.failed,
        error: 'Service Orange Money non configuré',
      );
      return false;
    }

    try {
      // Initiate push payment
      state = state.copyWith(status: PaymentStatus.initiating);
      
      final response = await _orangeService!.pushPayment(
        orderId: orderId,
        amount: amount,
        customerPhone: phoneNumber,
        description: 'Paiement Okada #$orderId',
      );

      state = state.copyWith(
        status: PaymentStatus.pending,
        referenceId: response.payToken,
      );

      if (_isCancelled) return false;

      // Poll for status
      final result = await _orangeService!.pollTransactionStatus(
        response.payToken,
        timeout: timeout,
      );

      if (result.isSuccessful) {
        state = state.copyWith(
          status: PaymentStatus.successful,
          transactionId: result.transactionId,
          completedAt: DateTime.now(),
        );
        return true;
      } else {
        state = state.copyWith(
          status: PaymentStatus.failed,
          error: result.message ?? 'Paiement refusé',
          completedAt: DateTime.now(),
        );
        return false;
      }
    } on OrangeMoneyException catch (e) {
      state = state.copyWith(
        status: PaymentStatus.failed,
        error: e.message,
        completedAt: DateTime.now(),
      );
      return false;
    }
  }

  Future<bool> _processWalletPayment({
    required double amount,
    required String orderId,
  }) async {
    // Wallet payment would be processed through the app's internal wallet
    // This is a placeholder for the actual implementation
    state = state.copyWith(status: PaymentStatus.processing);
    
    await Future.delayed(const Duration(seconds: 1));
    
    state = state.copyWith(
      status: PaymentStatus.successful,
      transactionId: 'WALLET_${DateTime.now().millisecondsSinceEpoch}',
      completedAt: DateTime.now(),
    );
    return true;
  }

  /// Initialize web payment (for Orange Money web flow)
  Future<String?> initializeWebPayment({
    required double amount,
    required String orderId,
    String? customerPhone,
    String? customerName,
  }) async {
    if (_orangeService == null) {
      state = state.copyWith(
        status: PaymentStatus.failed,
        error: 'Service Orange Money non configuré',
      );
      return null;
    }

    try {
      state = state.copyWith(
        status: PaymentStatus.initiating,
        method: PaymentMethod.orangeMoney,
        amount: amount,
        orderId: orderId,
        phoneNumber: customerPhone,
        startedAt: DateTime.now(),
      );

      final response = await _orangeService!.initializePayment(OrangePaymentRequest(
        orderId: orderId,
        amount: amount,
        description: 'Paiement Okada #$orderId',
        customerPhone: customerPhone,
        customerName: customerName,
      ));

      state = state.copyWith(
        status: PaymentStatus.pending,
        referenceId: response.payToken,
        paymentUrl: response.paymentUrl,
      );

      return response.paymentUrl;
    } on OrangeMoneyException catch (e) {
      state = state.copyWith(
        status: PaymentStatus.failed,
        error: e.message,
      );
      return null;
    }
  }

  /// Check web payment completion
  Future<bool> checkWebPaymentCompletion({
    Duration timeout = const Duration(minutes: 10),
  }) async {
    if (state.referenceId == null || _orangeService == null) {
      return false;
    }

    try {
      state = state.copyWith(status: PaymentStatus.processing);

      final result = await _orangeService!.pollTransactionStatus(
        state.referenceId!,
        timeout: timeout,
      );

      if (result.isSuccessful) {
        state = state.copyWith(
          status: PaymentStatus.successful,
          transactionId: result.transactionId,
          completedAt: DateTime.now(),
        );
        return true;
      } else {
        state = state.copyWith(
          status: PaymentStatus.failed,
          error: result.message ?? 'Paiement non complété',
          completedAt: DateTime.now(),
        );
        return false;
      }
    } on OrangeMoneyException catch (e) {
      state = state.copyWith(
        status: PaymentStatus.failed,
        error: e.message,
        completedAt: DateTime.now(),
      );
      return false;
    }
  }

  /// Cancel current payment
  void cancelPayment() {
    _isCancelled = true;
    _pollingTimer?.cancel();
    state = state.copyWith(
      status: PaymentStatus.cancelled,
      completedAt: DateTime.now(),
    );
  }

  /// Reset payment state
  void reset() {
    _isCancelled = false;
    _pollingTimer?.cancel();
    state = PaymentState();
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }
}

// ============ Providers ============

/// MTN MoMo service provider
final mtnMomoServiceProvider = Provider<MtnMomoService?>((ref) {
  // Configuration would come from environment/secrets
  // Return null if not configured
  return null;
});

/// Orange Money service provider
final orangeMoneyServiceProvider = Provider<OrangeMoneyService?>((ref) {
  // Configuration would come from environment/secrets
  // Return null if not configured
  return null;
});

/// Payment notifier provider
final paymentProvider = StateNotifierProvider<PaymentNotifier, PaymentState>((ref) {
  final mtnService = ref.watch(mtnMomoServiceProvider);
  final orangeService = ref.watch(orangeMoneyServiceProvider);
  
  return PaymentNotifier(
    mtnService: mtnService,
    orangeService: orangeService,
  );
});

/// Available payment methods provider
final availablePaymentMethodsProvider = Provider<List<PaymentMethod>>((ref) {
  final methods = <PaymentMethod>[];
  
  // Always available
  methods.add(PaymentMethod.cash);
  methods.add(PaymentMethod.wallet);
  
  // Check if MTN is configured
  if (ref.watch(mtnMomoServiceProvider) != null) {
    methods.add(PaymentMethod.mtnMomo);
  }
  
  // Check if Orange is configured
  if (ref.watch(orangeMoneyServiceProvider) != null) {
    methods.add(PaymentMethod.orangeMoney);
  }
  
  return methods;
});

/// Selected payment method provider
final selectedPaymentMethodProvider = StateProvider<PaymentMethod?>((ref) => null);

/// Payment phone number provider
final paymentPhoneProvider = StateProvider<String>((ref) => '');

/// Is payment processing provider
final isPaymentProcessingProvider = Provider<bool>((ref) {
  final state = ref.watch(paymentProvider);
  return state.isProcessing;
});

/// Payment status message provider
final paymentStatusMessageProvider = Provider<String>((ref) {
  final state = ref.watch(paymentProvider);
  return state.statusMessage;
});

// ============ Payment History ============

/// Payment transaction model
class PaymentTransaction {
  final String id;
  final String orderId;
  final PaymentMethod method;
  final double amount;
  final String currency;
  final PaymentStatus status;
  final String? transactionId;
  final String? phoneNumber;
  final DateTime createdAt;
  final DateTime? completedAt;

  PaymentTransaction({
    required this.id,
    required this.orderId,
    required this.method,
    required this.amount,
    this.currency = 'XAF',
    required this.status,
    this.transactionId,
    this.phoneNumber,
    required this.createdAt,
    this.completedAt,
  });
}

/// Payment history state
class PaymentHistoryState {
  final List<PaymentTransaction> transactions;
  final bool isLoading;
  final String? error;

  PaymentHistoryState({
    this.transactions = const [],
    this.isLoading = false,
    this.error,
  });

  PaymentHistoryState copyWith({
    List<PaymentTransaction>? transactions,
    bool? isLoading,
    String? error,
  }) {
    return PaymentHistoryState(
      transactions: transactions ?? this.transactions,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Payment history notifier
class PaymentHistoryNotifier extends StateNotifier<PaymentHistoryState> {
  PaymentHistoryNotifier() : super(PaymentHistoryState());

  Future<void> loadHistory() async {
    state = state.copyWith(isLoading: true);
    
    try {
      // In real app, this would fetch from API
      await Future.delayed(const Duration(seconds: 1));
      
      state = state.copyWith(
        isLoading: false,
        transactions: [], // Would be populated from API
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  void addTransaction(PaymentTransaction transaction) {
    state = state.copyWith(
      transactions: [transaction, ...state.transactions],
    );
  }
}

/// Payment history provider
final paymentHistoryProvider = StateNotifierProvider<PaymentHistoryNotifier, PaymentHistoryState>((ref) {
  return PaymentHistoryNotifier();
});

// ============ Wallet Balance ============

/// Wallet balance state
class WalletBalanceState {
  final double balance;
  final bool isLoading;
  final String? error;

  WalletBalanceState({
    this.balance = 0,
    this.isLoading = false,
    this.error,
  });
}

/// Wallet balance provider
final walletBalanceProvider = FutureProvider<double>((ref) async {
  // In real app, this would fetch from API
  await Future.delayed(const Duration(milliseconds: 500));
  return 5000.0; // Demo balance
});

/// Has sufficient wallet balance provider
final hasSufficientBalanceProvider = Provider.family<bool, double>((ref, amount) {
  final balance = ref.watch(walletBalanceProvider);
  return balance.maybeWhen(
    data: (b) => b >= amount,
    orElse: () => false,
  );
});
