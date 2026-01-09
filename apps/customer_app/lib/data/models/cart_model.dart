import 'package:hive/hive.dart';
import '../../domain/entities/cart.dart';
import 'product_model.dart';

part 'cart_model.g.dart';

@HiveType(typeId: 8)
class CartModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String? userId;

  @HiveField(2)
  final List<CartItemModel> items;

  @HiveField(3)
  final double subtotal;

  @HiveField(4)
  final double deliveryFee;

  @HiveField(5)
  final double discount;

  @HiveField(6)
  final double total;

  @HiveField(7)
  final String currency;

  @HiveField(8)
  final DateTime createdAt;

  @HiveField(9)
  final DateTime updatedAt;

  CartModel({
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

  factory CartModel.fromJson(Map<String, dynamic> json) {
    return CartModel(
      id: json['id'] ?? '',
      userId: json['userId'],
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => CartItemModel.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      deliveryFee: (json['deliveryFee'] as num?)?.toDouble() ?? 0.0,
      discount: (json['discount'] as num?)?.toDouble() ?? 0.0,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] ?? 'XAF',
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'items': items.map((e) => e.toJson()).toList(),
      'subtotal': subtotal,
      'deliveryFee': deliveryFee,
      'discount': discount,
      'total': total,
      'currency': currency,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Cart toEntity() {
    return Cart(
      id: id,
      userId: userId,
      items: items.map((e) => e.toEntity()).toList(),
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      discount: discount,
      total: total,
      currency: currency,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory CartModel.fromEntity(Cart cart) {
    return CartModel(
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map((e) => CartItemModel.fromEntity(e)).toList(),
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      discount: cart.discount,
      total: cart.total,
      currency: cart.currency,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    );
  }
}

@HiveType(typeId: 9)
class CartItemModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final ProductModel product;

  @HiveField(2)
  final int quantity;

  @HiveField(3)
  final double price;

  @HiveField(4)
  final Map<String, dynamic>? selectedOptions;

  @HiveField(5)
  final DateTime createdAt;

  @HiveField(6)
  final DateTime updatedAt;

  CartItemModel({
    required this.id,
    required this.product,
    required this.quantity,
    required this.price,
    this.selectedOptions,
    required this.createdAt,
    required this.updatedAt,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    return CartItemModel(
      id: json['id'] ?? '',
      product: ProductModel.fromJson(json['product'] ?? {}),
      quantity: json['quantity'] ?? 0,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      selectedOptions: json['selectedOptions'] != null
          ? Map<String, dynamic>.from(json['selectedOptions'])
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product': product.toJson(),
      'quantity': quantity,
      'price': price,
      'selectedOptions': selectedOptions,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  CartItem toEntity() {
    return CartItem(
      id: id,
      product: product.toEntity(),
      quantity: quantity,
      price: price,
      selectedOptions: selectedOptions,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory CartItemModel.fromEntity(CartItem cartItem) {
    return CartItemModel(
      id: cartItem.id,
      product: ProductModel.fromEntity(cartItem.product),
      quantity: cartItem.quantity,
      price: cartItem.price,
      selectedOptions: cartItem.selectedOptions,
      createdAt: cartItem.createdAt,
      updatedAt: cartItem.updatedAt,
    );
  }
}

@HiveType(typeId: 10)
class CartDiscountModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String code;

  @HiveField(2)
  final String name;

  @HiveField(3)
  final String description;

  @HiveField(4)
  final double amount;

  @HiveField(5)
  final int discountType; // DiscountType enum as int

  @HiveField(6)
  final DateTime? expiresAt;

  CartDiscountModel({
    required this.id,
    required this.code,
    required this.name,
    required this.description,
    required this.amount,
    required this.discountType,
    this.expiresAt,
  });

  factory CartDiscountModel.fromJson(Map<String, dynamic> json) {
    return CartDiscountModel(
      id: json['id'] ?? '',
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      discountType: _discountTypeToInt(json['type']),
      expiresAt: json['expiresAt'] != null ? DateTime.parse(json['expiresAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'name': name,
      'description': description,
      'amount': amount,
      'type': _intToDiscountType(discountType),
      'expiresAt': expiresAt?.toIso8601String(),
    };
  }

  CartDiscount toEntity() {
    return CartDiscount(
      id: id,
      code: code,
      name: name,
      description: description,
      amount: amount,
      type: _intToDiscountTypeEnum(discountType),
      expiresAt: expiresAt,
    );
  }

  factory CartDiscountModel.fromEntity(CartDiscount discount) {
    return CartDiscountModel(
      id: discount.id,
      code: discount.code,
      name: discount.name,
      description: discount.description,
      amount: discount.amount,
      discountType: _discountTypeEnumToInt(discount.type),
      expiresAt: discount.expiresAt,
    );
  }

  static int _discountTypeToInt(String? type) {
    switch (type) {
      case 'percentage':
        return 0;
      case 'fixed':
        return 1;
      default:
        return 1;
    }
  }

  static String _intToDiscountType(int type) {
    switch (type) {
      case 0:
        return 'percentage';
      case 1:
        return 'fixed';
      default:
        return 'fixed';
    }
  }

  static DiscountType _intToDiscountTypeEnum(int type) {
    switch (type) {
      case 0:
        return DiscountType.percentage;
      case 1:
        return DiscountType.fixed;
      default:
        return DiscountType.fixed;
    }
  }

  static int _discountTypeEnumToInt(DiscountType type) {
    switch (type) {
      case DiscountType.percentage:
        return 0;
      case DiscountType.fixed:
        return 1;
    }
  }
}