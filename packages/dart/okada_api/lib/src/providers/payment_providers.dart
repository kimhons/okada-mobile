import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/payment/payment_service.dart';
import '../services/payment/mtn_momo_service.dart';
import '../services/payment/orange_money_service.dart';
import '../models/api_models.dart';
import 'api_providers.dart';

// ============ PAYMENT STATE ============

/// Payment processing state
enum PaymentProcessingState {
  idle,
  initiating,
  awaitingConfirmation,
  processing,
  successful,
  failed,
  cancelled,
  timeout,
}

/// Payment state
class PaymentState {
  final PaymentProcessingState processingState;
  final String? transactionId;
  final String? provider;
  final double? amount;
  final String? message;
  final String? error;
  final DateTime? lastUpdated;

  const PaymentState({
    this.processingState = PaymentProcessingState.idle,
    this.transactionId,
    this.provider,
    this.amount,
    this.message,
    this.error,
    this.lastUpdated,
  });

  PaymentState copyWith({
    PaymentProcessingState? processingState,
    String? transactionId,
    String? provider,
    double? amount,
    String? message,
    String? error,
    DateTime? lastUpdated,
  }) =>
      PaymentState(
        processingState: processingState ?? this.processingState,
        transactionId: transactionId ?? this.transactionId,
        provider: provider ?? this.provider,
        amount: amount ?? this.amount,
        message: message ?? this.message,
        error: error,
        lastUpdated: lastUpdated ?? this.lastUpdated,
      );

  bool get isProcessing =>
      processingState == PaymentProcessingState.initiating ||
      processingState == PaymentProcessingState.awaitingConfirmation ||
      processingState == PaymentProcessingState.processing;

  bool get isComplete =>
      processingState == PaymentProcessingState.successful ||
      processingState == PaymentProcessingState.failed ||
      processingState == PaymentProcessingState.cancelled ||
      processingState == PaymentProcessingState.timeout;

  bool get isSuccessful => processingState == PaymentProcessingState.successful;
}

/// Payment notifier
class PaymentNotifier extends StateNotifier<PaymentState> {
  final PaymentService _paymentService;

  PaymentNotifier(this._paymentService) : super(const PaymentState());

  /// Process payment with auto-detected provider
  Future<PaymentResult> processPayment({
    required String phone,
    required double amount,
    required String description,
    int? orderId,
  }) async {
    state = PaymentState(
      processingState: PaymentProcessingState.initiating,
      amount: amount,
      lastUpdated: DateTime.now(),
    );

    try {
      final result = await _paymentService.processPayment(
        phone: phone,
        amount: amount,
        description: description,
        orderId: orderId,
        onStatusUpdate: (r) {
          state = state.copyWith(
            processingState: _mapStatus(r.status),
            transactionId: r.transactionId,
            provider: r.provider,
            message: r.message,
            lastUpdated: DateTime.now(),
          );
        },
      );

      state = state.copyWith(
        processingState: _mapStatus(result.status),
        transactionId: result.transactionId,
        provider: result.provider,
        message: result.message,
        lastUpdated: DateTime.now(),
      );

      return result;
    } catch (e) {
      state = state.copyWith(
        processingState: PaymentProcessingState.failed,
        error: e.toString(),
        lastUpdated: DateTime.now(),
      );
      rethrow;
    }
  }

  /// Process MTN MoMo payment
  Future<MomoPaymentResult> processMtnPayment({
    required String phone,
    required double amount,
    required String description,
    int? orderId,
  }) async {
    state = PaymentState(
      processingState: PaymentProcessingState.initiating,
      provider: 'mtn_momo',
      amount: amount,
      lastUpdated: DateTime.now(),
    );

    try {
      final result = await _paymentService.mtnMomo.processPayment(
        phone: phone,
        amount: amount,
        description: description,
        orderId: orderId,
        onStatusUpdate: (r) {
          state = state.copyWith(
            processingState: _mapMomoStatus(r.status),
            transactionId: r.transactionId,
            message: r.message,
            lastUpdated: DateTime.now(),
          );
        },
      );

      state = state.copyWith(
        processingState: _mapMomoStatus(result.status),
        transactionId: result.transactionId,
        message: result.message,
        lastUpdated: DateTime.now(),
      );

      return result;
    } catch (e) {
      state = state.copyWith(
        processingState: PaymentProcessingState.failed,
        error: e.toString(),
        lastUpdated: DateTime.now(),
      );
      rethrow;
    }
  }

  /// Process Orange Money payment
  Future<OrangePaymentResult> processOrangePayment({
    required String phone,
    required double amount,
    required String description,
    int? orderId,
  }) async {
    state = PaymentState(
      processingState: PaymentProcessingState.initiating,
      provider: 'orange_money',
      amount: amount,
      lastUpdated: DateTime.now(),
    );

    try {
      final result = await _paymentService.orangeMoney.processPayment(
        phone: phone,
        amount: amount,
        description: description,
        orderId: orderId,
        onStatusUpdate: (r) {
          state = state.copyWith(
            processingState: _mapOrangeStatus(r.status),
            transactionId: r.transactionId,
            message: r.message,
            lastUpdated: DateTime.now(),
          );
        },
      );

      state = state.copyWith(
        processingState: _mapOrangeStatus(result.status),
        transactionId: result.transactionId,
        message: result.message,
        lastUpdated: DateTime.now(),
      );

      return result;
    } catch (e) {
      state = state.copyWith(
        processingState: PaymentProcessingState.failed,
        error: e.toString(),
        lastUpdated: DateTime.now(),
      );
      rethrow;
    }
  }

  /// Pay with wallet
  Future<PaymentResult> payWithWallet({
    required double amount,
    required int orderId,
  }) async {
    state = PaymentState(
      processingState: PaymentProcessingState.processing,
      provider: 'wallet',
      amount: amount,
      lastUpdated: DateTime.now(),
    );

    try {
      final result = await _paymentService.payWithWallet(
        amount: amount,
        orderId: orderId,
      );

      state = state.copyWith(
        processingState: _mapStatus(result.status),
        transactionId: result.transactionId,
        message: result.message,
        lastUpdated: DateTime.now(),
      );

      return result;
    } catch (e) {
      state = state.copyWith(
        processingState: PaymentProcessingState.failed,
        error: e.toString(),
        lastUpdated: DateTime.now(),
      );
      rethrow;
    }
  }

  /// Reset payment state
  void reset() {
    state = const PaymentState();
  }

  // Private helpers

  PaymentProcessingState _mapStatus(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.pending:
        return PaymentProcessingState.awaitingConfirmation;
      case PaymentStatus.processing:
        return PaymentProcessingState.processing;
      case PaymentStatus.successful:
        return PaymentProcessingState.successful;
      case PaymentStatus.failed:
        return PaymentProcessingState.failed;
      case PaymentStatus.cancelled:
        return PaymentProcessingState.cancelled;
      case PaymentStatus.timeout:
        return PaymentProcessingState.timeout;
    }
  }

  PaymentProcessingState _mapMomoStatus(MomoPaymentStatus status) {
    switch (status) {
      case MomoPaymentStatus.pending:
        return PaymentProcessingState.awaitingConfirmation;
      case MomoPaymentStatus.processing:
        return PaymentProcessingState.processing;
      case MomoPaymentStatus.successful:
        return PaymentProcessingState.successful;
      case MomoPaymentStatus.failed:
        return PaymentProcessingState.failed;
      case MomoPaymentStatus.cancelled:
        return PaymentProcessingState.cancelled;
      case MomoPaymentStatus.timeout:
        return PaymentProcessingState.timeout;
    }
  }

  PaymentProcessingState _mapOrangeStatus(OrangePaymentStatus status) {
    switch (status) {
      case OrangePaymentStatus.pending:
        return PaymentProcessingState.awaitingConfirmation;
      case OrangePaymentStatus.processing:
        return PaymentProcessingState.processing;
      case OrangePaymentStatus.successful:
        return PaymentProcessingState.successful;
      case OrangePaymentStatus.failed:
        return PaymentProcessingState.failed;
      case OrangePaymentStatus.cancelled:
        return PaymentProcessingState.cancelled;
      case OrangePaymentStatus.timeout:
        return PaymentProcessingState.timeout;
    }
  }
}

/// Payment state provider
final paymentStateProvider =
    StateNotifierProvider<PaymentNotifier, PaymentState>((ref) {
  final paymentService = ref.watch(paymentServiceProvider);
  return PaymentNotifier(paymentService);
});

// ============ CHECKOUT STATE ============

/// Checkout step
enum CheckoutStep {
  cart,
  address,
  payment,
  confirmation,
  processing,
  complete,
}

/// Checkout state
class CheckoutState {
  final CheckoutStep step;
  final DeliveryAddress? deliveryAddress;
  final String? paymentMethod;
  final String? paymentPhone;
  final String? promoCode;
  final double? deliveryFee;
  final double? tip;
  final String? notes;
  final bool isLoading;
  final String? error;

  const CheckoutState({
    this.step = CheckoutStep.cart,
    this.deliveryAddress,
    this.paymentMethod,
    this.paymentPhone,
    this.promoCode,
    this.deliveryFee,
    this.tip,
    this.notes,
    this.isLoading = false,
    this.error,
  });

  CheckoutState copyWith({
    CheckoutStep? step,
    DeliveryAddress? deliveryAddress,
    String? paymentMethod,
    String? paymentPhone,
    String? promoCode,
    double? deliveryFee,
    double? tip,
    String? notes,
    bool? isLoading,
    String? error,
  }) =>
      CheckoutState(
        step: step ?? this.step,
        deliveryAddress: deliveryAddress ?? this.deliveryAddress,
        paymentMethod: paymentMethod ?? this.paymentMethod,
        paymentPhone: paymentPhone ?? this.paymentPhone,
        promoCode: promoCode ?? this.promoCode,
        deliveryFee: deliveryFee ?? this.deliveryFee,
        tip: tip ?? this.tip,
        notes: notes ?? this.notes,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );

  bool get canProceed {
    switch (step) {
      case CheckoutStep.cart:
        return true;
      case CheckoutStep.address:
        return deliveryAddress != null;
      case CheckoutStep.payment:
        return paymentMethod != null;
      case CheckoutStep.confirmation:
        return true;
      case CheckoutStep.processing:
        return false;
      case CheckoutStep.complete:
        return false;
    }
  }
}

/// Checkout notifier
class CheckoutNotifier extends StateNotifier<CheckoutState> {
  CheckoutNotifier() : super(const CheckoutState());

  void setDeliveryAddress(DeliveryAddress address) {
    state = state.copyWith(deliveryAddress: address);
  }

  void setPaymentMethod(String method, {String? phone}) {
    state = state.copyWith(
      paymentMethod: method,
      paymentPhone: phone,
    );
  }

  void setPromoCode(String? code) {
    state = state.copyWith(promoCode: code);
  }

  void setDeliveryFee(double fee) {
    state = state.copyWith(deliveryFee: fee);
  }

  void setTip(double? tip) {
    state = state.copyWith(tip: tip);
  }

  void setNotes(String? notes) {
    state = state.copyWith(notes: notes);
  }

  void nextStep() {
    if (!state.canProceed) return;
    
    final nextIndex = CheckoutStep.values.indexOf(state.step) + 1;
    if (nextIndex < CheckoutStep.values.length) {
      state = state.copyWith(step: CheckoutStep.values[nextIndex]);
    }
  }

  void previousStep() {
    final prevIndex = CheckoutStep.values.indexOf(state.step) - 1;
    if (prevIndex >= 0) {
      state = state.copyWith(step: CheckoutStep.values[prevIndex]);
    }
  }

  void goToStep(CheckoutStep step) {
    state = state.copyWith(step: step);
  }

  void setLoading(bool loading) {
    state = state.copyWith(isLoading: loading);
  }

  void setError(String? error) {
    state = state.copyWith(error: error);
  }

  void reset() {
    state = const CheckoutState();
  }
}

/// Checkout state provider
final checkoutStateProvider =
    StateNotifierProvider<CheckoutNotifier, CheckoutState>((ref) {
  return CheckoutNotifier();
});

// ============ SAVED ADDRESSES ============

/// Saved addresses state
class SavedAddressesState {
  final List<DeliveryAddress> addresses;
  final DeliveryAddress? defaultAddress;
  final bool isLoading;
  final String? error;

  const SavedAddressesState({
    this.addresses = const [],
    this.defaultAddress,
    this.isLoading = false,
    this.error,
  });

  SavedAddressesState copyWith({
    List<DeliveryAddress>? addresses,
    DeliveryAddress? defaultAddress,
    bool? isLoading,
    String? error,
  }) =>
      SavedAddressesState(
        addresses: addresses ?? this.addresses,
        defaultAddress: defaultAddress ?? this.defaultAddress,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );
}

/// Saved addresses notifier
class SavedAddressesNotifier extends StateNotifier<SavedAddressesState> {
  SavedAddressesNotifier() : super(const SavedAddressesState());

  void setAddresses(List<DeliveryAddress> addresses) {
    final defaultAddr = addresses.firstWhere(
      (a) => a.isDefault,
      orElse: () => addresses.isNotEmpty ? addresses.first : DeliveryAddress.empty(),
    );
    state = state.copyWith(
      addresses: addresses,
      defaultAddress: defaultAddr.id != 0 ? defaultAddr : null,
    );
  }

  void addAddress(DeliveryAddress address) {
    final updatedAddresses = [...state.addresses, address];
    state = state.copyWith(addresses: updatedAddresses);
  }

  void updateAddress(DeliveryAddress address) {
    final updatedAddresses = state.addresses.map((a) {
      return a.id == address.id ? address : a;
    }).toList();
    state = state.copyWith(addresses: updatedAddresses);
  }

  void removeAddress(int addressId) {
    final updatedAddresses = state.addresses.where((a) => a.id != addressId).toList();
    state = state.copyWith(addresses: updatedAddresses);
  }

  void setDefaultAddress(int addressId) {
    final updatedAddresses = state.addresses.map((a) {
      return a.copyWith(isDefault: a.id == addressId);
    }).toList();
    final defaultAddr = updatedAddresses.firstWhere((a) => a.isDefault);
    state = state.copyWith(
      addresses: updatedAddresses,
      defaultAddress: defaultAddr,
    );
  }

  void setLoading(bool loading) {
    state = state.copyWith(isLoading: loading);
  }

  void setError(String? error) {
    state = state.copyWith(error: error);
  }
}

/// Saved addresses provider
final savedAddressesProvider =
    StateNotifierProvider<SavedAddressesNotifier, SavedAddressesState>((ref) {
  return SavedAddressesNotifier();
});

// ============ TRANSACTION HISTORY ============

/// Transaction history provider
final transactionHistoryProvider =
    FutureProvider.family<PaginatedList<Transaction>, ({int page, int pageSize})>(
        (ref, params) async {
  final paymentService = ref.watch(paymentServiceProvider);
  return paymentService.getTransactionHistory(
    page: params.page,
    pageSize: params.pageSize,
  );
});
