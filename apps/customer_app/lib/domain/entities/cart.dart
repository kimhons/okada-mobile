import 'package:equatable/equatable.dart';
import 'product.dart';

class Cart extends Equatable {
  final String id;
  final String? userId;
  final List<CartItem> items;
  final double subtotal;
  final double deliveryFee;
  final double discount;
  final double total;
  final String currency;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Cart({
    required this.id,
    this.userId,
    required this.items,
    required this.subtotal,
    this.deliveryFee = 0.0,
    this.discount = 0.0,
    required this.total,
    this.currency = 'XAF',
    required this.createdAt,
    required this.updatedAt,
  });

  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);

  bool get isEmpty => items.isEmpty;

  bool get isNotEmpty => items.isNotEmpty;

  double get totalWeight => items.fold(0.0, (sum, item) => sum + (item.weight * item.quantity));

  List<String> get productIds => items.map((item) => item.product.id).toList();

  CartItem? getItem(String productId) {
    try {
      return items.firstWhere((item) => item.product.id == productId);
    } catch (e) {
      return null;
    }
  }

  bool hasProduct(String productId) {
    return items.any((item) => item.product.id == productId);
  }

  int getProductQuantity(String productId) {
    final item = getItem(productId);
    return item?.quantity ?? 0;
  }

  String get formattedSubtotal => '${subtotal.toStringAsFixed(0)} $currency';

  String get formattedDeliveryFee => '${deliveryFee.toStringAsFixed(0)} $currency';

  String get formattedDiscount => '${discount.toStringAsFixed(0)} $currency';

  String get formattedTotal => '${total.toStringAsFixed(0)} $currency';

  Cart copyWith({
    String? id,
    String? userId,
    List<CartItem>? items,
    double? subtotal,
    double? deliveryFee,
    double? discount,
    double? total,
    String? currency,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Cart(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      items: items ?? this.items,
      subtotal: subtotal ?? this.subtotal,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      discount: discount ?? this.discount,
      total: total ?? this.total,
      currency: currency ?? this.currency,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // Helper methods for cart operations
  Cart addItem(Product product, {int quantity = 1}) {
    final existingItemIndex = items.indexWhere((item) => item.product.id == product.id);

    List<CartItem> updatedItems;
    if (existingItemIndex >= 0) {
      // Update existing item
      final existingItem = items[existingItemIndex];
      final updatedItem = existingItem.copyWith(
        quantity: existingItem.quantity + quantity,
        updatedAt: DateTime.now(),
      );
      updatedItems = [...items];
      updatedItems[existingItemIndex] = updatedItem;
    } else {
      // Add new item
      final newItem = CartItem(
        id: '${id}_${product.id}',
        product: product,
        quantity: quantity,
        price: product.price,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      updatedItems = [...items, newItem];
    }

    return _recalculateCart(updatedItems);
  }

  Cart updateItemQuantity(String productId, int quantity) {
    if (quantity <= 0) {
      return removeItem(productId);
    }

    final updatedItems = items.map((item) {
      if (item.product.id == productId) {
        return item.copyWith(
          quantity: quantity,
          updatedAt: DateTime.now(),
        );
      }
      return item;
    }).toList();

    return _recalculateCart(updatedItems);
  }

  Cart removeItem(String productId) {
    final updatedItems = items.where((item) => item.product.id != productId).toList();
    return _recalculateCart(updatedItems);
  }

  Cart clear() {
    return copyWith(
      items: [],
      subtotal: 0.0,
      total: 0.0,
      updatedAt: DateTime.now(),
    );
  }

  Cart _recalculateCart(List<CartItem> newItems) {
    final newSubtotal = newItems.fold(0.0, (sum, item) => sum + item.totalPrice);
    final newTotal = newSubtotal + deliveryFee - discount;

    return copyWith(
      items: newItems,
      subtotal: newSubtotal,
      total: newTotal,
      updatedAt: DateTime.now(),
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        items,
        subtotal,
        deliveryFee,
        discount,
        total,
        currency,
        createdAt,
        updatedAt,
      ];
}

class CartItem extends Equatable {
  final String id;
  final Product product;
  final int quantity;
  final double price; // Price at the time of adding to cart
  final Map<String, dynamic>? selectedOptions; // For product variants
  final DateTime createdAt;
  final DateTime updatedAt;

  const CartItem({
    required this.id,
    required this.product,
    required this.quantity,
    required this.price,
    this.selectedOptions,
    required this.createdAt,
    required this.updatedAt,
  });

  double get totalPrice => price * quantity;

  double get weight => product.attributes['weight']?.toDouble() ?? 0.0;

  bool get isAvailable => product.isAvailable && product.stockQuantity >= quantity;

  String get formattedPrice => '${price.toStringAsFixed(0)} ${product.currency}';

  String get formattedTotalPrice => '${totalPrice.toStringAsFixed(0)} ${product.currency}';

  CartItem copyWith({
    String? id,
    Product? product,
    int? quantity,
    double? price,
    Map<String, dynamic>? selectedOptions,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return CartItem(
      id: id ?? this.id,
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
      price: price ?? this.price,
      selectedOptions: selectedOptions ?? this.selectedOptions,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        product,
        quantity,
        price,
        selectedOptions,
        createdAt,
        updatedAt,
      ];
}

class CartSummary extends Equatable {
  final int itemCount;
  final double subtotal;
  final double deliveryFee;
  final double discount;
  final double total;
  final String currency;
  final List<CartDiscount> appliedDiscounts;

  const CartSummary({
    required this.itemCount,
    required this.subtotal,
    this.deliveryFee = 0.0,
    this.discount = 0.0,
    required this.total,
    this.currency = 'XAF',
    this.appliedDiscounts = const [],
  });

  String get formattedSubtotal => '${subtotal.toStringAsFixed(0)} $currency';

  String get formattedDeliveryFee => '${deliveryFee.toStringAsFixed(0)} $currency';

  String get formattedDiscount => '${discount.toStringAsFixed(0)} $currency';

  String get formattedTotal => '${total.toStringAsFixed(0)} $currency';

  CartSummary copyWith({
    int? itemCount,
    double? subtotal,
    double? deliveryFee,
    double? discount,
    double? total,
    String? currency,
    List<CartDiscount>? appliedDiscounts,
  }) {
    return CartSummary(
      itemCount: itemCount ?? this.itemCount,
      subtotal: subtotal ?? this.subtotal,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      discount: discount ?? this.discount,
      total: total ?? this.total,
      currency: currency ?? this.currency,
      appliedDiscounts: appliedDiscounts ?? this.appliedDiscounts,
    );
  }

  @override
  List<Object?> get props => [
        itemCount,
        subtotal,
        deliveryFee,
        discount,
        total,
        currency,
        appliedDiscounts,
      ];
}

class CartDiscount extends Equatable {
  final String id;
  final String code;
  final String name;
  final String description;
  final double amount;
  final DiscountType type;
  final DateTime? expiresAt;

  const CartDiscount({
    required this.id,
    required this.code,
    required this.name,
    required this.description,
    required this.amount,
    required this.type,
    this.expiresAt,
  });

  bool get isExpired => expiresAt != null && DateTime.now().isAfter(expiresAt!);

  String get formattedAmount {
    switch (type) {
      case DiscountType.percentage:
        return '${amount.toStringAsFixed(0)}%';
      case DiscountType.fixed:
        return '${amount.toStringAsFixed(0)} XAF';
    }
  }

  CartDiscount copyWith({
    String? id,
    String? code,
    String? name,
    String? description,
    double? amount,
    DiscountType? type,
    DateTime? expiresAt,
  }) {
    return CartDiscount(
      id: id ?? this.id,
      code: code ?? this.code,
      name: name ?? this.name,
      description: description ?? this.description,
      amount: amount ?? this.amount,
      type: type ?? this.type,
      expiresAt: expiresAt ?? this.expiresAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        code,
        name,
        description,
        amount,
        type,
        expiresAt,
      ];
}

enum DiscountType {
  percentage,
  fixed,
}

// Factory class for creating cart instances
class CartFactory {
  static Cart createEmpty({String? userId}) {
    final now = DateTime.now();
    return Cart(
      id: 'cart_${now.millisecondsSinceEpoch}',
      userId: userId,
      items: [],
      subtotal: 0.0,
      total: 0.0,
      createdAt: now,
      updatedAt: now,
    );
  }

  static Cart fromItems(List<CartItem> items, {String? userId}) {
    final now = DateTime.now();
    final subtotal = items.fold(0.0, (sum, item) => sum + item.totalPrice);

    return Cart(
      id: 'cart_${now.millisecondsSinceEpoch}',
      userId: userId,
      items: items,
      subtotal: subtotal,
      total: subtotal,
      createdAt: now,
      updatedAt: now,
    );
  }
}