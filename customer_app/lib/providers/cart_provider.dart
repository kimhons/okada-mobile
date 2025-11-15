import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Cart Item Model
class CartItem {
  final String id;
  final String name;
  final double price;
  final String? imageUrl;
  final String? seller;
  int quantity;

  CartItem({
    required this.id,
    required this.name,
    required this.price,
    this.imageUrl,
    this.seller,
    this.quantity = 1,
  });

  double get total => price * quantity;

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'price': price,
    'image_url': imageUrl,
    'seller': seller,
    'quantity': quantity,
  };

  factory CartItem.fromJson(Map<String, dynamic> json) => CartItem(
    id: json['id'] as String,
    name: json['name'] as String,
    price: (json['price'] as num).toDouble(),
    imageUrl: json['image_url'] as String?,
    seller: json['seller'] as String?,
    quantity: json['quantity'] as int? ?? 1,
  );
}

/// Cart State
class CartState {
  final List<CartItem> items;
  final double deliveryFee;

  CartState({
    this.items = const [],
    this.deliveryFee = 1500.0, // Default delivery fee in FCFA
  });

  double get subtotal => items.fold(0, (sum, item) => sum + item.total);
  
  double get total => subtotal + deliveryFee;

  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);

  CartState copyWith({
    List<CartItem>? items,
    double? deliveryFee,
  }) {
    return CartState(
      items: items ?? this.items,
      deliveryFee: deliveryFee ?? this.deliveryFee,
    );
  }
}

/// Cart Notifier
class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(CartState());

  /// Add item to cart
  void addItem(Map<String, dynamic> product, {int quantity = 1}) {
    final productId = product['id']?.toString() ?? '';
    final existingIndex = state.items.indexWhere((item) => item.id == productId);

    if (existingIndex >= 0) {
      // Update quantity of existing item
      final updatedItems = [...state.items];
      updatedItems[existingIndex].quantity += quantity;
      state = state.copyWith(items: updatedItems);
    } else {
      // Add new item
      final seller = product['seller'] as Map<String, dynamic>?;
      final newItem = CartItem(
        id: productId,
        name: product['name'] as String? ?? 'Product',
        price: (product['price'] as num?)?.toDouble() ?? 0.0,
        imageUrl: product['image_url'] as String?,
        seller: seller?['name'] as String?,
        quantity: quantity,
      );
      state = state.copyWith(items: [...state.items, newItem]);
    }
  }

  /// Update item quantity
  void updateQuantity(String productId, int quantity) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    final updatedItems = state.items.map((item) {
      if (item.id == productId) {
        item.quantity = quantity;
      }
      return item;
    }).toList();

    state = state.copyWith(items: updatedItems);
  }

  /// Increment item quantity
  void incrementQuantity(String productId) {
    final updatedItems = state.items.map((item) {
      if (item.id == productId) {
        item.quantity++;
      }
      return item;
    }).toList();

    state = state.copyWith(items: updatedItems);
  }

  /// Decrement item quantity
  void decrementQuantity(String productId) {
    final item = state.items.firstWhere((item) => item.id == productId);
    if (item.quantity > 1) {
      final updatedItems = state.items.map((item) {
        if (item.id == productId) {
          item.quantity--;
        }
        return item;
      }).toList();
      state = state.copyWith(items: updatedItems);
    } else {
      removeItem(productId);
    }
  }

  /// Remove item from cart
  void removeItem(String productId) {
    final updatedItems = state.items.where((item) => item.id != productId).toList();
    state = state.copyWith(items: updatedItems);
  }

  /// Clear cart
  void clear() {
    state = CartState();
  }

  /// Update delivery fee
  void updateDeliveryFee(double fee) {
    state = state.copyWith(deliveryFee: fee);
  }
}

/// Cart Provider
final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});

/// Cart item count provider (for badge)
final cartItemCountProvider = Provider<int>((ref) {
  return ref.watch(cartProvider).itemCount;
});

/// Cart total provider
final cartTotalProvider = Provider<double>((ref) {
  return ref.watch(cartProvider).total;
});

