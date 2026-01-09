import 'package:hive/hive.dart';
import '../../domain/entities/product.dart';

part 'product_model.g.dart';

@HiveType(typeId: 4)
class ProductModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final String description;

  @HiveField(3)
  final String? shortDescription;

  @HiveField(4)
  final double price;

  @HiveField(5)
  final double? originalPrice;

  @HiveField(6)
  final String currency;

  @HiveField(7)
  final List<String> imageUrls;

  @HiveField(8)
  final CategoryModel category;

  @HiveField(9)
  final BrandModel? brand;

  @HiveField(10)
  final int stockQuantity;

  @HiveField(11)
  final bool isAvailable;

  @HiveField(12)
  final bool isFeatured;

  @HiveField(13)
  final double rating;

  @HiveField(14)
  final int reviewCount;

  @HiveField(15)
  final List<String> tags;

  @HiveField(16)
  final Map<String, dynamic> attributes;

  @HiveField(17)
  final DateTime createdAt;

  @HiveField(18)
  final DateTime? updatedAt;

  ProductModel({
    required this.id,
    required this.name,
    required this.description,
    this.shortDescription,
    required this.price,
    this.originalPrice,
    this.currency = 'XAF',
    required this.imageUrls,
    required this.category,
    this.brand,
    required this.stockQuantity,
    required this.isAvailable,
    this.isFeatured = false,
    this.rating = 0.0,
    this.reviewCount = 0,
    required this.tags,
    required this.attributes,
    required this.createdAt,
    this.updatedAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      shortDescription: json['shortDescription'],
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      originalPrice: (json['originalPrice'] as num?)?.toDouble(),
      currency: json['currency'] ?? 'XAF',
      imageUrls: List<String>.from(json['imageUrls'] ?? []),
      category: CategoryModel.fromJson(json['category'] ?? {}),
      brand: json['brand'] != null ? BrandModel.fromJson(json['brand']) : null,
      stockQuantity: json['stockQuantity'] ?? 0,
      isAvailable: json['isAvailable'] ?? false,
      isFeatured: json['isFeatured'] ?? false,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: json['reviewCount'] ?? 0,
      tags: List<String>.from(json['tags'] ?? []),
      attributes: Map<String, dynamic>.from(json['attributes'] ?? {}),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'shortDescription': shortDescription,
      'price': price,
      'originalPrice': originalPrice,
      'currency': currency,
      'imageUrls': imageUrls,
      'category': category.toJson(),
      'brand': brand?.toJson(),
      'stockQuantity': stockQuantity,
      'isAvailable': isAvailable,
      'isFeatured': isFeatured,
      'rating': rating,
      'reviewCount': reviewCount,
      'tags': tags,
      'attributes': attributes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  Product toEntity() {
    return Product(
      id: id,
      name: name,
      description: description,
      shortDescription: shortDescription,
      price: price,
      originalPrice: originalPrice,
      currency: currency,
      imageUrls: imageUrls,
      category: category.toEntity(),
      brand: brand?.toEntity(),
      stockQuantity: stockQuantity,
      isAvailable: isAvailable,
      isFeatured: isFeatured,
      rating: rating,
      reviewCount: reviewCount,
      tags: tags,
      attributes: attributes,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory ProductModel.fromEntity(Product product) {
    return ProductModel(
      id: product.id,
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      originalPrice: product.originalPrice,
      currency: product.currency ?? 'XAF',
      imageUrls: product.imageUrls,
      category: CategoryModel.fromEntity(product.category),
      brand: product.brand != null ? BrandModel.fromEntity(product.brand!) : null,
      stockQuantity: product.stockQuantity,
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured,
      rating: product.rating,
      reviewCount: product.reviewCount,
      tags: product.tags,
      attributes: product.attributes,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    );
  }
}

@HiveType(typeId: 5)
class CategoryModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final String description;

  @HiveField(3)
  final String? imageUrl;

  @HiveField(4)
  final String? iconUrl;

  @HiveField(5)
  final String? parentId;

  @HiveField(6)
  final List<CategoryModel> subcategories;

  @HiveField(7)
  final bool isActive;

  @HiveField(8)
  final int sortOrder;

  @HiveField(9)
  final DateTime createdAt;

  @HiveField(10)
  final DateTime? updatedAt;

  CategoryModel({
    required this.id,
    required this.name,
    required this.description,
    this.imageUrl,
    this.iconUrl,
    this.parentId,
    this.subcategories = const [],
    this.isActive = true,
    this.sortOrder = 0,
    required this.createdAt,
    this.updatedAt,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['imageUrl'],
      iconUrl: json['iconUrl'],
      parentId: json['parentId'],
      subcategories: (json['subcategories'] as List<dynamic>?)
          ?.map((e) => CategoryModel.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      isActive: json['isActive'] ?? true,
      sortOrder: json['sortOrder'] ?? 0,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'iconUrl': iconUrl,
      'parentId': parentId,
      'subcategories': subcategories.map((e) => e.toJson()).toList(),
      'isActive': isActive,
      'sortOrder': sortOrder,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  Category toEntity() {
    return Category(
      id: id,
      name: name,
      description: description,
      imageUrl: imageUrl,
      iconUrl: iconUrl,
      parentId: parentId,
      subcategories: subcategories.map((e) => e.toEntity()).toList(),
      isActive: isActive,
      sortOrder: sortOrder,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory CategoryModel.fromEntity(Category category) {
    return CategoryModel(
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      iconUrl: category.iconUrl,
      parentId: category.parentId,
      subcategories: category.subcategories.map((e) => CategoryModel.fromEntity(e)).toList(),
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    );
  }
}

@HiveType(typeId: 6)
class BrandModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final String description;

  @HiveField(3)
  final String? logoUrl;

  @HiveField(4)
  final String? websiteUrl;

  @HiveField(5)
  final bool isActive;

  @HiveField(6)
  final DateTime createdAt;

  @HiveField(7)
  final DateTime? updatedAt;

  BrandModel({
    required this.id,
    required this.name,
    required this.description,
    this.logoUrl,
    this.websiteUrl,
    this.isActive = true,
    required this.createdAt,
    this.updatedAt,
  });

  factory BrandModel.fromJson(Map<String, dynamic> json) {
    return BrandModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      logoUrl: json['logoUrl'],
      websiteUrl: json['websiteUrl'],
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'logoUrl': logoUrl,
      'websiteUrl': websiteUrl,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  Brand toEntity() {
    return Brand(
      id: id,
      name: name,
      description: description,
      logoUrl: logoUrl,
      websiteUrl: websiteUrl,
      isActive: isActive,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory BrandModel.fromEntity(Brand brand) {
    return BrandModel(
      id: brand.id,
      name: brand.name,
      description: brand.description,
      logoUrl: brand.logoUrl,
      websiteUrl: brand.websiteUrl,
      isActive: brand.isActive,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    );
  }
}

@HiveType(typeId: 7)
class ProductReviewModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String productId;

  @HiveField(2)
  final String userId;

  @HiveField(3)
  final String userName;

  @HiveField(4)
  final String? userAvatarUrl;

  @HiveField(5)
  final double rating;

  @HiveField(6)
  final String? title;

  @HiveField(7)
  final String comment;

  @HiveField(8)
  final List<String> imageUrls;

  @HiveField(9)
  final bool isVerifiedPurchase;

  @HiveField(10)
  final DateTime createdAt;

  @HiveField(11)
  final DateTime? updatedAt;

  ProductReviewModel({
    required this.id,
    required this.productId,
    required this.userId,
    required this.userName,
    this.userAvatarUrl,
    required this.rating,
    this.title,
    required this.comment,
    this.imageUrls = const [],
    this.isVerifiedPurchase = false,
    required this.createdAt,
    this.updatedAt,
  });

  factory ProductReviewModel.fromJson(Map<String, dynamic> json) {
    return ProductReviewModel(
      id: json['id'] ?? '',
      productId: json['productId'] ?? '',
      userId: json['userId'] ?? '',
      userName: json['userName'] ?? '',
      userAvatarUrl: json['userAvatarUrl'],
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      title: json['title'],
      comment: json['comment'] ?? '',
      imageUrls: List<String>.from(json['imageUrls'] ?? []),
      isVerifiedPurchase: json['isVerifiedPurchase'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productId': productId,
      'userId': userId,
      'userName': userName,
      'userAvatarUrl': userAvatarUrl,
      'rating': rating,
      'title': title,
      'comment': comment,
      'imageUrls': imageUrls,
      'isVerifiedPurchase': isVerifiedPurchase,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  ProductReview toEntity() {
    return ProductReview(
      id: id,
      productId: productId,
      userId: userId,
      userName: userName,
      userAvatarUrl: userAvatarUrl,
      rating: rating,
      title: title,
      comment: comment,
      imageUrls: imageUrls,
      isVerifiedPurchase: isVerifiedPurchase,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory ProductReviewModel.fromEntity(ProductReview review) {
    return ProductReviewModel(
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: review.userName,
      userAvatarUrl: review.userAvatarUrl,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      imageUrls: review.imageUrls,
      isVerifiedPurchase: review.isVerifiedPurchase,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    );
  }
}