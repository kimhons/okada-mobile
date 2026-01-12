/// Comprehensive API models for Okada Platform

// ============ USER MODELS ============

class User {
  final int id;
  final String openId;
  final String? name;
  final String? email;
  final String? phone;
  final String? avatar;
  final String role;
  final DateTime createdAt;
  final DateTime? lastSignedIn;

  const User({
    required this.id,
    required this.openId,
    this.name,
    this.email,
    this.phone,
    this.avatar,
    required this.role,
    required this.createdAt,
    this.lastSignedIn,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as int,
        openId: json['openId'] as String,
        name: json['name'] as String?,
        email: json['email'] as String?,
        phone: json['phone'] as String?,
        avatar: json['avatar'] as String?,
        role: json['role'] as String? ?? 'user',
        createdAt: DateTime.parse(json['createdAt'] as String),
        lastSignedIn: json['lastSignedIn'] != null
            ? DateTime.parse(json['lastSignedIn'] as String)
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'openId': openId,
        'name': name,
        'email': email,
        'phone': phone,
        'avatar': avatar,
        'role': role,
        'createdAt': createdAt.toIso8601String(),
        'lastSignedIn': lastSignedIn?.toIso8601String(),
      };

  User copyWith({
    int? id,
    String? openId,
    String? name,
    String? email,
    String? phone,
    String? avatar,
    String? role,
    DateTime? createdAt,
    DateTime? lastSignedIn,
  }) =>
      User(
        id: id ?? this.id,
        openId: openId ?? this.openId,
        name: name ?? this.name,
        email: email ?? this.email,
        phone: phone ?? this.phone,
        avatar: avatar ?? this.avatar,
        role: role ?? this.role,
        createdAt: createdAt ?? this.createdAt,
        lastSignedIn: lastSignedIn ?? this.lastSignedIn,
      );
}

// ============ PRODUCT MODELS ============

class Product {
  final int id;
  final String name;
  final String? description;
  final double price;
  final double? originalPrice;
  final String? image;
  final List<String> images;
  final int categoryId;
  final String? categoryName;
  final int? storeId;
  final String? storeName;
  final double rating;
  final int reviewCount;
  final int stock;
  final bool isAvailable;
  final bool isFeatured;
  final Map<String, dynamic>? attributes;
  final List<String>? allergens;
  final DateTime createdAt;

  const Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.originalPrice,
    this.image,
    this.images = const [],
    required this.categoryId,
    this.categoryName,
    this.storeId,
    this.storeName,
    this.rating = 0,
    this.reviewCount = 0,
    this.stock = 0,
    this.isAvailable = true,
    this.isFeatured = false,
    this.attributes,
    this.allergens,
    required this.createdAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id'] as int,
        name: json['name'] as String,
        description: json['description'] as String?,
        price: (json['price'] as num).toDouble(),
        originalPrice: (json['originalPrice'] as num?)?.toDouble(),
        image: json['image'] as String?,
        images: (json['images'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        categoryId: json['categoryId'] as int,
        categoryName: json['categoryName'] as String?,
        storeId: json['storeId'] as int?,
        storeName: json['storeName'] as String?,
        rating: (json['rating'] as num?)?.toDouble() ?? 0,
        reviewCount: json['reviewCount'] as int? ?? 0,
        stock: json['stock'] as int? ?? 0,
        isAvailable: json['isAvailable'] as bool? ?? true,
        isFeatured: json['isFeatured'] as bool? ?? false,
        attributes: json['attributes'] as Map<String, dynamic>?,
        allergens: (json['allergens'] as List<dynamic>?)
            ?.map((e) => e as String)
            .toList(),
        createdAt: DateTime.parse(json['createdAt'] as String),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'price': price,
        'originalPrice': originalPrice,
        'image': image,
        'images': images,
        'categoryId': categoryId,
        'categoryName': categoryName,
        'storeId': storeId,
        'storeName': storeName,
        'rating': rating,
        'reviewCount': reviewCount,
        'stock': stock,
        'isAvailable': isAvailable,
        'isFeatured': isFeatured,
        'attributes': attributes,
        'allergens': allergens,
        'createdAt': createdAt.toIso8601String(),
      };

  double? get discountPercentage {
    if (originalPrice == null || originalPrice! <= price) return null;
    return ((originalPrice! - price) / originalPrice! * 100);
  }
}

class Category {
  final int id;
  final String name;
  final String? description;
  final String? image;
  final String? icon;
  final int? parentId;
  final int productCount;
  final int sortOrder;
  final bool isActive;

  const Category({
    required this.id,
    required this.name,
    this.description,
    this.image,
    this.icon,
    this.parentId,
    this.productCount = 0,
    this.sortOrder = 0,
    this.isActive = true,
  });

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        id: json['id'] as int,
        name: json['name'] as String,
        description: json['description'] as String?,
        image: json['image'] as String?,
        icon: json['icon'] as String?,
        parentId: json['parentId'] as int?,
        productCount: json['productCount'] as int? ?? 0,
        sortOrder: json['sortOrder'] as int? ?? 0,
        isActive: json['isActive'] as bool? ?? true,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'image': image,
        'icon': icon,
        'parentId': parentId,
        'productCount': productCount,
        'sortOrder': sortOrder,
        'isActive': isActive,
      };
}

// ============ STORE MODELS ============

class Store {
  final int id;
  final String name;
  final String? description;
  final String? image;
  final String? logo;
  final String? address;
  final double? latitude;
  final double? longitude;
  final String? phone;
  final double rating;
  final int reviewCount;
  final bool isOpen;
  final String? openingHours;
  final double? deliveryFee;
  final int? minOrderAmount;
  final int? avgDeliveryTime;
  final List<String>? categories;
  final double? distance;

  const Store({
    required this.id,
    required this.name,
    this.description,
    this.image,
    this.logo,
    this.address,
    this.latitude,
    this.longitude,
    this.phone,
    this.rating = 0,
    this.reviewCount = 0,
    this.isOpen = true,
    this.openingHours,
    this.deliveryFee,
    this.minOrderAmount,
    this.avgDeliveryTime,
    this.categories,
    this.distance,
  });

  factory Store.fromJson(Map<String, dynamic> json) => Store(
        id: json['id'] as int,
        name: json['name'] as String,
        description: json['description'] as String?,
        image: json['image'] as String?,
        logo: json['logo'] as String?,
        address: json['address'] as String?,
        latitude: (json['latitude'] as num?)?.toDouble(),
        longitude: (json['longitude'] as num?)?.toDouble(),
        phone: json['phone'] as String?,
        rating: (json['rating'] as num?)?.toDouble() ?? 0,
        reviewCount: json['reviewCount'] as int? ?? 0,
        isOpen: json['isOpen'] as bool? ?? true,
        openingHours: json['openingHours'] as String?,
        deliveryFee: (json['deliveryFee'] as num?)?.toDouble(),
        minOrderAmount: json['minOrderAmount'] as int?,
        avgDeliveryTime: json['avgDeliveryTime'] as int?,
        categories: (json['categories'] as List<dynamic>?)
            ?.map((e) => e as String)
            .toList(),
        distance: (json['distance'] as num?)?.toDouble(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'image': image,
        'logo': logo,
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
        'phone': phone,
        'rating': rating,
        'reviewCount': reviewCount,
        'isOpen': isOpen,
        'openingHours': openingHours,
        'deliveryFee': deliveryFee,
        'minOrderAmount': minOrderAmount,
        'avgDeliveryTime': avgDeliveryTime,
        'categories': categories,
        'distance': distance,
      };
}

// ============ ORDER MODELS ============

class Order {
  final int id;
  final String orderNumber;
  final int userId;
  final int? riderId;
  final String status;
  final double subtotal;
  final double deliveryFee;
  final double? discount;
  final double total;
  final String paymentMethod;
  final String paymentStatus;
  final DeliveryAddress deliveryAddress;
  final List<OrderItem> items;
  final String? notes;
  final DateTime? scheduledAt;
  final DateTime? estimatedDelivery;
  final DateTime? pickedUpAt;
  final DateTime? deliveredAt;
  final DateTime createdAt;
  final Rider? rider;
  final OrderTracking? tracking;

  const Order({
    required this.id,
    required this.orderNumber,
    required this.userId,
    this.riderId,
    required this.status,
    required this.subtotal,
    required this.deliveryFee,
    this.discount,
    required this.total,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.deliveryAddress,
    required this.items,
    this.notes,
    this.scheduledAt,
    this.estimatedDelivery,
    this.pickedUpAt,
    this.deliveredAt,
    required this.createdAt,
    this.rider,
    this.tracking,
  });

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json['id'] as int,
        orderNumber: json['orderNumber'] as String,
        userId: json['userId'] as int,
        riderId: json['riderId'] as int?,
        status: json['status'] as String,
        subtotal: (json['subtotal'] as num).toDouble(),
        deliveryFee: (json['deliveryFee'] as num).toDouble(),
        discount: (json['discount'] as num?)?.toDouble(),
        total: (json['total'] as num).toDouble(),
        paymentMethod: json['paymentMethod'] as String,
        paymentStatus: json['paymentStatus'] as String,
        deliveryAddress:
            DeliveryAddress.fromJson(json['deliveryAddress'] as Map<String, dynamic>),
        items: (json['items'] as List<dynamic>)
            .map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        notes: json['notes'] as String?,
        scheduledAt: json['scheduledAt'] != null
            ? DateTime.parse(json['scheduledAt'] as String)
            : null,
        estimatedDelivery: json['estimatedDelivery'] != null
            ? DateTime.parse(json['estimatedDelivery'] as String)
            : null,
        pickedUpAt: json['pickedUpAt'] != null
            ? DateTime.parse(json['pickedUpAt'] as String)
            : null,
        deliveredAt: json['deliveredAt'] != null
            ? DateTime.parse(json['deliveredAt'] as String)
            : null,
        createdAt: DateTime.parse(json['createdAt'] as String),
        rider: json['rider'] != null
            ? Rider.fromJson(json['rider'] as Map<String, dynamic>)
            : null,
        tracking: json['tracking'] != null
            ? OrderTracking.fromJson(json['tracking'] as Map<String, dynamic>)
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'orderNumber': orderNumber,
        'userId': userId,
        'riderId': riderId,
        'status': status,
        'subtotal': subtotal,
        'deliveryFee': deliveryFee,
        'discount': discount,
        'total': total,
        'paymentMethod': paymentMethod,
        'paymentStatus': paymentStatus,
        'deliveryAddress': deliveryAddress.toJson(),
        'items': items.map((e) => e.toJson()).toList(),
        'notes': notes,
        'scheduledAt': scheduledAt?.toIso8601String(),
        'estimatedDelivery': estimatedDelivery?.toIso8601String(),
        'pickedUpAt': pickedUpAt?.toIso8601String(),
        'deliveredAt': deliveredAt?.toIso8601String(),
        'createdAt': createdAt.toIso8601String(),
        'rider': rider?.toJson(),
        'tracking': tracking?.toJson(),
      };

  bool get isActive => [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'picked_up',
        'in_transit'
      ].contains(status);

  bool get canCancel => ['pending', 'confirmed'].contains(status);

  bool get canTrack => ['picked_up', 'in_transit'].contains(status);
}

class OrderItem {
  final int id;
  final int productId;
  final String productName;
  final String? productImage;
  final int quantity;
  final double unitPrice;
  final double total;
  final String? notes;
  final Map<String, dynamic>? options;

  const OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    this.productImage,
    required this.quantity,
    required this.unitPrice,
    required this.total,
    this.notes,
    this.options,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
        id: json['id'] as int,
        productId: json['productId'] as int,
        productName: json['productName'] as String,
        productImage: json['productImage'] as String?,
        quantity: json['quantity'] as int,
        unitPrice: (json['unitPrice'] as num).toDouble(),
        total: (json['total'] as num).toDouble(),
        notes: json['notes'] as String?,
        options: json['options'] as Map<String, dynamic>?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'productId': productId,
        'productName': productName,
        'productImage': productImage,
        'quantity': quantity,
        'unitPrice': unitPrice,
        'total': total,
        'notes': notes,
        'options': options,
      };
}

class OrderTracking {
  final double? riderLatitude;
  final double? riderLongitude;
  final DateTime? lastUpdated;
  final int? etaMinutes;
  final double? distanceKm;
  final List<TrackingEvent> events;

  const OrderTracking({
    this.riderLatitude,
    this.riderLongitude,
    this.lastUpdated,
    this.etaMinutes,
    this.distanceKm,
    this.events = const [],
  });

  factory OrderTracking.fromJson(Map<String, dynamic> json) => OrderTracking(
        riderLatitude: (json['riderLatitude'] as num?)?.toDouble(),
        riderLongitude: (json['riderLongitude'] as num?)?.toDouble(),
        lastUpdated: json['lastUpdated'] != null
            ? DateTime.parse(json['lastUpdated'] as String)
            : null,
        etaMinutes: json['etaMinutes'] as int?,
        distanceKm: (json['distanceKm'] as num?)?.toDouble(),
        events: (json['events'] as List<dynamic>?)
                ?.map((e) => TrackingEvent.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );

  Map<String, dynamic> toJson() => {
        'riderLatitude': riderLatitude,
        'riderLongitude': riderLongitude,
        'lastUpdated': lastUpdated?.toIso8601String(),
        'etaMinutes': etaMinutes,
        'distanceKm': distanceKm,
        'events': events.map((e) => e.toJson()).toList(),
      };
}

class TrackingEvent {
  final String status;
  final String message;
  final DateTime timestamp;
  final double? latitude;
  final double? longitude;

  const TrackingEvent({
    required this.status,
    required this.message,
    required this.timestamp,
    this.latitude,
    this.longitude,
  });

  factory TrackingEvent.fromJson(Map<String, dynamic> json) => TrackingEvent(
        status: json['status'] as String,
        message: json['message'] as String,
        timestamp: DateTime.parse(json['timestamp'] as String),
        latitude: (json['latitude'] as num?)?.toDouble(),
        longitude: (json['longitude'] as num?)?.toDouble(),
      );

  Map<String, dynamic> toJson() => {
        'status': status,
        'message': message,
        'timestamp': timestamp.toIso8601String(),
        'latitude': latitude,
        'longitude': longitude,
      };
}

// ============ ADDRESS MODELS ============

class DeliveryAddress {
  final int? id;
  final String label;
  final String address;
  final String? additionalInfo;
  final double latitude;
  final double longitude;
  final String? phone;
  final bool isDefault;

  const DeliveryAddress({
    this.id,
    required this.label,
    required this.address,
    this.additionalInfo,
    required this.latitude,
    required this.longitude,
    this.phone,
    this.isDefault = false,
  });

  factory DeliveryAddress.fromJson(Map<String, dynamic> json) => DeliveryAddress(
        id: json['id'] as int?,
        label: json['label'] as String,
        address: json['address'] as String,
        additionalInfo: json['additionalInfo'] as String?,
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
        phone: json['phone'] as String?,
        isDefault: json['isDefault'] as bool? ?? false,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'label': label,
        'address': address,
        'additionalInfo': additionalInfo,
        'latitude': latitude,
        'longitude': longitude,
        'phone': phone,
        'isDefault': isDefault,
      };
}

// ============ RIDER MODELS ============

class Rider {
  final int id;
  final int userId;
  final String name;
  final String? phone;
  final String? avatar;
  final String vehicleType;
  final String? vehiclePlate;
  final double rating;
  final int totalDeliveries;
  final bool isOnline;
  final double? latitude;
  final double? longitude;

  const Rider({
    required this.id,
    required this.userId,
    required this.name,
    this.phone,
    this.avatar,
    required this.vehicleType,
    this.vehiclePlate,
    this.rating = 0,
    this.totalDeliveries = 0,
    this.isOnline = false,
    this.latitude,
    this.longitude,
  });

  factory Rider.fromJson(Map<String, dynamic> json) => Rider(
        id: json['id'] as int,
        userId: json['userId'] as int,
        name: json['name'] as String,
        phone: json['phone'] as String?,
        avatar: json['avatar'] as String?,
        vehicleType: json['vehicleType'] as String,
        vehiclePlate: json['vehiclePlate'] as String?,
        rating: (json['rating'] as num?)?.toDouble() ?? 0,
        totalDeliveries: json['totalDeliveries'] as int? ?? 0,
        isOnline: json['isOnline'] as bool? ?? false,
        latitude: (json['latitude'] as num?)?.toDouble(),
        longitude: (json['longitude'] as num?)?.toDouble(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'userId': userId,
        'name': name,
        'phone': phone,
        'avatar': avatar,
        'vehicleType': vehicleType,
        'vehiclePlate': vehiclePlate,
        'rating': rating,
        'totalDeliveries': totalDeliveries,
        'isOnline': isOnline,
        'latitude': latitude,
        'longitude': longitude,
      };
}

// ============ CART MODELS ============

class Cart {
  final List<CartItem> items;
  final double subtotal;
  final double deliveryFee;
  final double? discount;
  final String? promoCode;
  final double total;

  const Cart({
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    this.discount,
    this.promoCode,
    required this.total,
  });

  factory Cart.fromJson(Map<String, dynamic> json) => Cart(
        items: (json['items'] as List<dynamic>)
            .map((e) => CartItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        subtotal: (json['subtotal'] as num).toDouble(),
        deliveryFee: (json['deliveryFee'] as num).toDouble(),
        discount: (json['discount'] as num?)?.toDouble(),
        promoCode: json['promoCode'] as String?,
        total: (json['total'] as num).toDouble(),
      );

  Map<String, dynamic> toJson() => {
        'items': items.map((e) => e.toJson()).toList(),
        'subtotal': subtotal,
        'deliveryFee': deliveryFee,
        'discount': discount,
        'promoCode': promoCode,
        'total': total,
      };

  bool get isEmpty => items.isEmpty;
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);

  Cart copyWith({
    List<CartItem>? items,
    double? subtotal,
    double? deliveryFee,
    double? discount,
    String? promoCode,
    double? total,
  }) =>
      Cart(
        items: items ?? this.items,
        subtotal: subtotal ?? this.subtotal,
        deliveryFee: deliveryFee ?? this.deliveryFee,
        discount: discount ?? this.discount,
        promoCode: promoCode ?? this.promoCode,
        total: total ?? this.total,
      );
}

class CartItem {
  final int productId;
  final String productName;
  final String? productImage;
  final double unitPrice;
  final int quantity;
  final double total;
  final String? notes;
  final Map<String, dynamic>? options;

  const CartItem({
    required this.productId,
    required this.productName,
    this.productImage,
    required this.unitPrice,
    required this.quantity,
    required this.total,
    this.notes,
    this.options,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) => CartItem(
        productId: json['productId'] as int,
        productName: json['productName'] as String,
        productImage: json['productImage'] as String?,
        unitPrice: (json['unitPrice'] as num).toDouble(),
        quantity: json['quantity'] as int,
        total: (json['total'] as num).toDouble(),
        notes: json['notes'] as String?,
        options: json['options'] as Map<String, dynamic>?,
      );

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'productName': productName,
        'productImage': productImage,
        'unitPrice': unitPrice,
        'quantity': quantity,
        'total': total,
        'notes': notes,
        'options': options,
      };

  CartItem copyWith({
    int? productId,
    String? productName,
    String? productImage,
    double? unitPrice,
    int? quantity,
    double? total,
    String? notes,
    Map<String, dynamic>? options,
  }) =>
      CartItem(
        productId: productId ?? this.productId,
        productName: productName ?? this.productName,
        productImage: productImage ?? this.productImage,
        unitPrice: unitPrice ?? this.unitPrice,
        quantity: quantity ?? this.quantity,
        total: total ?? this.total,
        notes: notes ?? this.notes,
        options: options ?? this.options,
      );
}

// ============ PAYMENT MODELS ============

class PaymentMethod {
  final int id;
  final String type;
  final String name;
  final String? phone;
  final String? last4;
  final bool isDefault;
  final DateTime createdAt;

  const PaymentMethod({
    required this.id,
    required this.type,
    required this.name,
    this.phone,
    this.last4,
    this.isDefault = false,
    required this.createdAt,
  });

  factory PaymentMethod.fromJson(Map<String, dynamic> json) => PaymentMethod(
        id: json['id'] as int,
        type: json['type'] as String,
        name: json['name'] as String,
        phone: json['phone'] as String?,
        last4: json['last4'] as String?,
        isDefault: json['isDefault'] as bool? ?? false,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'name': name,
        'phone': phone,
        'last4': last4,
        'isDefault': isDefault,
        'createdAt': createdAt.toIso8601String(),
      };
}

class Transaction {
  final int id;
  final String transactionId;
  final String type;
  final double amount;
  final String currency;
  final String status;
  final String? description;
  final String? paymentMethod;
  final int? orderId;
  final DateTime createdAt;

  const Transaction({
    required this.id,
    required this.transactionId,
    required this.type,
    required this.amount,
    required this.currency,
    required this.status,
    this.description,
    this.paymentMethod,
    this.orderId,
    required this.createdAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) => Transaction(
        id: json['id'] as int,
        transactionId: json['transactionId'] as String,
        type: json['type'] as String,
        amount: (json['amount'] as num).toDouble(),
        currency: json['currency'] as String? ?? 'XAF',
        status: json['status'] as String,
        description: json['description'] as String?,
        paymentMethod: json['paymentMethod'] as String?,
        orderId: json['orderId'] as int?,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'transactionId': transactionId,
        'type': type,
        'amount': amount,
        'currency': currency,
        'status': status,
        'description': description,
        'paymentMethod': paymentMethod,
        'orderId': orderId,
        'createdAt': createdAt.toIso8601String(),
      };
}

// ============ NOTIFICATION MODELS ============

class AppNotification {
  final int id;
  final String title;
  final String body;
  final String type;
  final Map<String, dynamic>? data;
  final bool isRead;
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    this.data,
    this.isRead = false,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
        id: json['id'] as int,
        title: json['title'] as String,
        body: json['body'] as String,
        type: json['type'] as String,
        data: json['data'] as Map<String, dynamic>?,
        isRead: json['isRead'] as bool? ?? false,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'body': body,
        'type': type,
        'data': data,
        'isRead': isRead,
        'createdAt': createdAt.toIso8601String(),
      };
}

// ============ CHAT MODELS ============

class ChatMessage {
  final int id;
  final int orderId;
  final int senderId;
  final String senderType;
  final String message;
  final String? imageUrl;
  final bool isRead;
  final DateTime createdAt;

  const ChatMessage({
    required this.id,
    required this.orderId,
    required this.senderId,
    required this.senderType,
    required this.message,
    this.imageUrl,
    this.isRead = false,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
        id: json['id'] as int,
        orderId: json['orderId'] as int,
        senderId: json['senderId'] as int,
        senderType: json['senderType'] as String,
        message: json['message'] as String,
        imageUrl: json['imageUrl'] as String?,
        isRead: json['isRead'] as bool? ?? false,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'orderId': orderId,
        'senderId': senderId,
        'senderType': senderType,
        'message': message,
        'imageUrl': imageUrl,
        'isRead': isRead,
        'createdAt': createdAt.toIso8601String(),
      };
}

// ============ PROMOTION MODELS ============

class Promotion {
  final int id;
  final String code;
  final String name;
  final String? description;
  final String type;
  final double value;
  final double? minOrderAmount;
  final double? maxDiscount;
  final int? usageLimit;
  final int usageCount;
  final DateTime startDate;
  final DateTime endDate;
  final bool isActive;

  const Promotion({
    required this.id,
    required this.code,
    required this.name,
    this.description,
    required this.type,
    required this.value,
    this.minOrderAmount,
    this.maxDiscount,
    this.usageLimit,
    this.usageCount = 0,
    required this.startDate,
    required this.endDate,
    this.isActive = true,
  });

  factory Promotion.fromJson(Map<String, dynamic> json) => Promotion(
        id: json['id'] as int,
        code: json['code'] as String,
        name: json['name'] as String,
        description: json['description'] as String?,
        type: json['type'] as String,
        value: (json['value'] as num).toDouble(),
        minOrderAmount: (json['minOrderAmount'] as num?)?.toDouble(),
        maxDiscount: (json['maxDiscount'] as num?)?.toDouble(),
        usageLimit: json['usageLimit'] as int?,
        usageCount: json['usageCount'] as int? ?? 0,
        startDate: DateTime.parse(json['startDate'] as String),
        endDate: DateTime.parse(json['endDate'] as String),
        isActive: json['isActive'] as bool? ?? true,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'code': code,
        'name': name,
        'description': description,
        'type': type,
        'value': value,
        'minOrderAmount': minOrderAmount,
        'maxDiscount': maxDiscount,
        'usageLimit': usageLimit,
        'usageCount': usageCount,
        'startDate': startDate.toIso8601String(),
        'endDate': endDate.toIso8601String(),
        'isActive': isActive,
      };

  bool get isValid {
    final now = DateTime.now();
    return isActive && now.isAfter(startDate) && now.isBefore(endDate);
  }
}

// ============ REVIEW MODELS ============

class Review {
  final int id;
  final int userId;
  final String userName;
  final String? userAvatar;
  final int? productId;
  final int? storeId;
  final int? orderId;
  final double rating;
  final String? comment;
  final List<String>? images;
  final String? reply;
  final DateTime? replyAt;
  final DateTime createdAt;

  const Review({
    required this.id,
    required this.userId,
    required this.userName,
    this.userAvatar,
    this.productId,
    this.storeId,
    this.orderId,
    required this.rating,
    this.comment,
    this.images,
    this.reply,
    this.replyAt,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) => Review(
        id: json['id'] as int,
        userId: json['userId'] as int,
        userName: json['userName'] as String,
        userAvatar: json['userAvatar'] as String?,
        productId: json['productId'] as int?,
        storeId: json['storeId'] as int?,
        orderId: json['orderId'] as int?,
        rating: (json['rating'] as num).toDouble(),
        comment: json['comment'] as String?,
        images: (json['images'] as List<dynamic>?)
            ?.map((e) => e as String)
            .toList(),
        reply: json['reply'] as String?,
        replyAt: json['replyAt'] != null
            ? DateTime.parse(json['replyAt'] as String)
            : null,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'userId': userId,
        'userName': userName,
        'userAvatar': userAvatar,
        'productId': productId,
        'storeId': storeId,
        'orderId': orderId,
        'rating': rating,
        'comment': comment,
        'images': images,
        'reply': reply,
        'replyAt': replyAt?.toIso8601String(),
        'createdAt': createdAt.toIso8601String(),
      };
}

// ============ RIDER EARNINGS MODELS ============

class RiderEarnings {
  final double todayEarnings;
  final double weekEarnings;
  final double monthEarnings;
  final double totalEarnings;
  final int todayDeliveries;
  final int weekDeliveries;
  final int monthDeliveries;
  final double pendingPayout;
  final DateTime? lastPayoutDate;
  final List<EarningEntry> recentEarnings;

  const RiderEarnings({
    required this.todayEarnings,
    required this.weekEarnings,
    required this.monthEarnings,
    required this.totalEarnings,
    required this.todayDeliveries,
    required this.weekDeliveries,
    required this.monthDeliveries,
    required this.pendingPayout,
    this.lastPayoutDate,
    this.recentEarnings = const [],
  });

  factory RiderEarnings.fromJson(Map<String, dynamic> json) => RiderEarnings(
        todayEarnings: (json['todayEarnings'] as num).toDouble(),
        weekEarnings: (json['weekEarnings'] as num).toDouble(),
        monthEarnings: (json['monthEarnings'] as num).toDouble(),
        totalEarnings: (json['totalEarnings'] as num).toDouble(),
        todayDeliveries: json['todayDeliveries'] as int,
        weekDeliveries: json['weekDeliveries'] as int,
        monthDeliveries: json['monthDeliveries'] as int,
        pendingPayout: (json['pendingPayout'] as num).toDouble(),
        lastPayoutDate: json['lastPayoutDate'] != null
            ? DateTime.parse(json['lastPayoutDate'] as String)
            : null,
        recentEarnings: (json['recentEarnings'] as List<dynamic>?)
                ?.map((e) => EarningEntry.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );

  Map<String, dynamic> toJson() => {
        'todayEarnings': todayEarnings,
        'weekEarnings': weekEarnings,
        'monthEarnings': monthEarnings,
        'totalEarnings': totalEarnings,
        'todayDeliveries': todayDeliveries,
        'weekDeliveries': weekDeliveries,
        'monthDeliveries': monthDeliveries,
        'pendingPayout': pendingPayout,
        'lastPayoutDate': lastPayoutDate?.toIso8601String(),
        'recentEarnings': recentEarnings.map((e) => e.toJson()).toList(),
      };
}

class EarningEntry {
  final int id;
  final int orderId;
  final String orderNumber;
  final double amount;
  final double? tip;
  final double? bonus;
  final DateTime createdAt;

  const EarningEntry({
    required this.id,
    required this.orderId,
    required this.orderNumber,
    required this.amount,
    this.tip,
    this.bonus,
    required this.createdAt,
  });

  factory EarningEntry.fromJson(Map<String, dynamic> json) => EarningEntry(
        id: json['id'] as int,
        orderId: json['orderId'] as int,
        orderNumber: json['orderNumber'] as String,
        amount: (json['amount'] as num).toDouble(),
        tip: (json['tip'] as num?)?.toDouble(),
        bonus: (json['bonus'] as num?)?.toDouble(),
        createdAt: DateTime.parse(json['createdAt'] as String),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'orderId': orderId,
        'orderNumber': orderNumber,
        'amount': amount,
        'tip': tip,
        'bonus': bonus,
        'createdAt': createdAt.toIso8601String(),
      };

  double get total => amount + (tip ?? 0) + (bonus ?? 0);
}
