import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared/api/okada_api_client.dart';

// Payment method model
class PaymentMethod {
  final String id;
  final String type; // 'mtn', 'orange', 'cash'
  final String name;
  final String lastFourDigits;
  final bool isDefault;

  PaymentMethod({
    required this.id,
    required this.type,
    required this.name,
    required this.lastFourDigits,
    this.isDefault = false,
  });

  factory PaymentMethod.fromJson(Map<String, dynamic> json) {
    return PaymentMethod(
      id: json['id'] as String,
      type: json['type'] as String,
      name: json['name'] as String,
      lastFourDigits: json['lastFourDigits'] as String,
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'name': name,
      'lastFourDigits': lastFourDigits,
      'isDefault': isDefault,
    };
  }

  PaymentMethod copyWith({
    String? id,
    String? type,
    String? name,
    String? lastFourDigits,
    bool? isDefault,
  }) {
    return PaymentMethod(
      id: id ?? this.id,
      type: type ?? this.type,
      name: name ?? this.name,
      lastFourDigits: lastFourDigits ?? this.lastFourDigits,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}

// Payment methods state
class PaymentMethodsState {
  final List<PaymentMethod> methods;
  final bool isLoading;
  final String? error;

  PaymentMethodsState({
    this.methods = const [],
    this.isLoading = false,
    this.error,
  });

  PaymentMethodsState copyWith({
    List<PaymentMethod>? methods,
    bool? isLoading,
    String? error,
  }) {
    return PaymentMethodsState(
      methods: methods ?? this.methods,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  PaymentMethod? get defaultMethod {
    try {
      return methods.firstWhere((m) => m.isDefault);
    } catch (e) {
      return null;
    }
  }
}

// Payment methods provider
class PaymentMethodsNotifier extends StateNotifier<PaymentMethodsState> {
  final OkadaApiClient _apiClient;

  PaymentMethodsNotifier(this._apiClient) : super(PaymentMethodsState()) {
    loadPaymentMethods();
  }

  Future<void> loadPaymentMethods() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(seconds: 1));

      // Mock payment methods
      final methods = [
        PaymentMethod(
          id: '1',
          type: 'mtn',
          name: 'MTN Mobile Money',
          lastFourDigits: '1234',
          isDefault: true,
        ),
        PaymentMethod(
          id: '2',
          type: 'orange',
          name: 'Orange Money',
          lastFourDigits: '5678',
          isDefault: false,
        ),
      ];

      state = state.copyWith(methods: methods, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load payment methods: $e',
      );
    }
  }

  Future<void> addPaymentMethod({
    required String type,
    required String phoneNumber,
  }) async {
    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(milliseconds: 500));

      final newMethod = PaymentMethod(
        id: DateTime.now().toString(),
        type: type,
        name: type == 'mtn' ? 'MTN Mobile Money' : 'Orange Money',
        lastFourDigits: phoneNumber.substring(phoneNumber.length - 4),
        isDefault: state.methods.isEmpty, // First method is default
      );

      final updatedMethods = [...state.methods, newMethod];
      state = state.copyWith(methods: updatedMethods);
    } catch (e) {
      state = state.copyWith(error: 'Failed to add payment method: $e');
    }
  }

  Future<void> updatePaymentMethod({
    required String methodId,
    required String phoneNumber,
  }) async {
    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(milliseconds: 500));

      final updatedMethods = state.methods.map((m) {
        if (m.id == methodId) {
          return m.copyWith(
            lastFourDigits: phoneNumber.substring(phoneNumber.length - 4),
          );
        }
        return m;
      }).toList();

      state = state.copyWith(methods: updatedMethods);
    } catch (e) {
      state = state.copyWith(error: 'Failed to update payment method: $e');
    }
  }

  Future<void> deletePaymentMethod(String methodId) async {
    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(milliseconds: 500));

      final updatedMethods = state.methods.where((m) => m.id != methodId).toList();
      state = state.copyWith(methods: updatedMethods);
    } catch (e) {
      state = state.copyWith(error: 'Failed to delete payment method: $e');
    }
  }

  Future<void> setDefaultPaymentMethod(String methodId) async {
    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(milliseconds: 500));

      final updatedMethods = state.methods.map((m) {
        return m.copyWith(isDefault: m.id == methodId);
      }).toList();

      state = state.copyWith(methods: updatedMethods);
    } catch (e) {
      state = state.copyWith(error: 'Failed to set default payment method: $e');
    }
  }
}

// Provider instance
final paymentMethodsProvider =
    StateNotifierProvider<PaymentMethodsNotifier, PaymentMethodsState>((ref) {
  final apiClient = ref.watch(okadaApiClientProvider);
  return PaymentMethodsNotifier(apiClient);
});

// Default payment method provider
final defaultPaymentMethodProvider = Provider<PaymentMethod?>((ref) {
  return ref.watch(paymentMethodsProvider).defaultMethod;
});

