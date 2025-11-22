import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared/api/okada_api_client.dart';

// Checkout state
class CheckoutState {
  final DeliveryAddress? selectedAddress;
  final PaymentMethod? selectedPaymentMethod;
  final bool isProcessing;
  final String? error;
  final String? orderId;

  CheckoutState({
    this.selectedAddress,
    this.selectedPaymentMethod,
    this.isProcessing = false,
    this.error,
    this.orderId,
  });

  CheckoutState copyWith({
    DeliveryAddress? selectedAddress,
    PaymentMethod? selectedPaymentMethod,
    bool? isProcessing,
    String? error,
    String? orderId,
  }) {
    return CheckoutState(
      selectedAddress: selectedAddress ?? this.selectedAddress,
      selectedPaymentMethod:
          selectedPaymentMethod ?? this.selectedPaymentMethod,
      isProcessing: isProcessing ?? this.isProcessing,
      error: error,
      orderId: orderId ?? this.orderId,
    );
  }
}

// Delivery Address model
class DeliveryAddress {
  final String id;
  final String street;
  final String landmark;
  final String city;
  final double? latitude;
  final double? longitude;
  final bool isDefault;

  DeliveryAddress({
    required this.id,
    required this.street,
    required this.landmark,
    required this.city,
    this.latitude,
    this.longitude,
    this.isDefault = false,
  });

  factory DeliveryAddress.fromJson(Map<String, dynamic> json) {
    return DeliveryAddress(
      id: json['id'] as String,
      street: json['street'] as String,
      landmark: json['landmark'] as String,
      city: json['city'] as String,
      latitude: json['latitude'] as double?,
      longitude: json['longitude'] as double?,
      isDefault: json['is_default'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'street': street,
      'landmark': landmark,
      'city': city,
      'latitude': latitude,
      'longitude': longitude,
      'is_default': isDefault,
    };
  }
}

// Payment Method enum
enum PaymentMethod {
  mtnMoney,
  orangeMoney,
  cashOnDelivery,
}

// Checkout provider
class CheckoutNotifier extends StateNotifier<CheckoutState> {
  final OkadaApiClient _apiClient;

  CheckoutNotifier(this._apiClient) : super(CheckoutState());

  // Select delivery address
  void selectAddress(DeliveryAddress address) {
    state = state.copyWith(selectedAddress: address);
  }

  // Select payment method
  void selectPaymentMethod(PaymentMethod method) {
    state = state.copyWith(selectedPaymentMethod: method);
  }

  // Place order
  Future<void> placeOrder({
    required List<String> cartItemIds,
    String? notes,
  }) async {
    if (state.selectedAddress == null) {
      state = state.copyWith(error: 'Please select a delivery address');
      return;
    }

    if (state.selectedPaymentMethod == null) {
      state = state.copyWith(error: 'Please select a payment method');
      return;
    }

    state = state.copyWith(isProcessing: true, error: null);

    try {
      final response = await _apiClient.post(
        '/orders',
        data: {
          'cart_item_ids': cartItemIds,
          'delivery_address_id': state.selectedAddress!.id,
          'payment_method': _getPaymentMethodString(state.selectedPaymentMethod!),
          'notes': notes,
        },
      );

      final orderId = response['order_id'] as String;
      state = state.copyWith(
        isProcessing: false,
        orderId: orderId,
      );
    } catch (e) {
      state = state.copyWith(
        isProcessing: false,
        error: 'Failed to place order: ${e.toString()}',
      );
    }
  }

  // Get user's delivery addresses
  Future<List<DeliveryAddress>> fetchAddresses() async {
    try {
      final response = await _apiClient.get('/users/me/addresses');
      final addresses = (response['addresses'] as List)
          .map((json) => DeliveryAddress.fromJson(json as Map<String, dynamic>))
          .toList();
      
      // Set default address if available
      final defaultAddress = addresses.firstWhere(
        (address) => address.isDefault,
        orElse: () => addresses.first,
      );
      state = state.copyWith(selectedAddress: defaultAddress);
      
      return addresses;
    } catch (e) {
      state = state.copyWith(error: 'Failed to fetch addresses: ${e.toString()}');
      return [];
    }
  }

  // Add new delivery address
  Future<DeliveryAddress?> addAddress({
    required String street,
    required String landmark,
    required String city,
    double? latitude,
    double? longitude,
    bool isDefault = false,
  }) async {
    try {
      final response = await _apiClient.post(
        '/users/me/addresses',
        data: {
          'street': street,
          'landmark': landmark,
          'city': city,
          'latitude': latitude,
          'longitude': longitude,
          'is_default': isDefault,
        },
      );

      final address = DeliveryAddress.fromJson(response['address'] as Map<String, dynamic>);
      
      if (isDefault) {
        state = state.copyWith(selectedAddress: address);
      }
      
      return address;
    } catch (e) {
      state = state.copyWith(error: 'Failed to add address: ${e.toString()}');
      return null;
    }
  }

  // Update delivery address
  Future<bool> updateAddress(DeliveryAddress address) async {
    try {
      await _apiClient.put(
        '/users/me/addresses/${address.id}',
        data: address.toJson(),
      );
      
      if (state.selectedAddress?.id == address.id) {
        state = state.copyWith(selectedAddress: address);
      }
      
      return true;
    } catch (e) {
      state = state.copyWith(error: 'Failed to update address: ${e.toString()}');
      return false;
    }
  }

  // Delete delivery address
  Future<bool> deleteAddress(String addressId) async {
    try {
      await _apiClient.delete('/users/me/addresses/$addressId');
      
      if (state.selectedAddress?.id == addressId) {
        state = state.copyWith(selectedAddress: null);
      }
      
      return true;
    } catch (e) {
      state = state.copyWith(error: 'Failed to delete address: ${e.toString()}');
      return false;
    }
  }

  // Process payment (for MTN/Orange Money)
  Future<bool> processPayment({
    required String orderId,
    required String phoneNumber,
  }) async {
    state = state.copyWith(isProcessing: true, error: null);

    try {
      await _apiClient.post(
        '/payments/mobile-money',
        data: {
          'order_id': orderId,
          'phone_number': phoneNumber,
          'provider': _getPaymentMethodString(state.selectedPaymentMethod!),
        },
      );

      state = state.copyWith(isProcessing: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isProcessing: false,
        error: 'Payment failed: ${e.toString()}',
      );
      return false;
    }
  }

  // Reset checkout state
  void reset() {
    state = CheckoutState();
  }

  // Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }

  // Helper method to convert PaymentMethod enum to string
  String _getPaymentMethodString(PaymentMethod method) {
    switch (method) {
      case PaymentMethod.mtnMoney:
        return 'mtn_money';
      case PaymentMethod.orangeMoney:
        return 'orange_money';
      case PaymentMethod.cashOnDelivery:
        return 'cash_on_delivery';
    }
  }
}

// Provider
final checkoutProvider = StateNotifierProvider<CheckoutNotifier, CheckoutState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CheckoutNotifier(apiClient);
});

// API client provider (placeholder - should be defined in shared library)
final apiClientProvider = Provider<OkadaApiClient>((ref) {
  return OkadaApiClient(baseUrl: 'https://api.okada.cm/v1');
});

