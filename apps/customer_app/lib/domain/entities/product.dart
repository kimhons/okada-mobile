import 'package:equatable/equatable.dart';

class Product extends Equatable {
  final String id;
  final String name;
  final String description;
  final String? shortDescription;
  final double price;
  final double? originalPrice;
  final String? currency;
  final List<String> imageUrls;
  final Category category;
  final Brand? brand;
  final int stockQuantity;
  final bool isAvailable;
  final bool isFeatured;
  final double rating;
  final int reviewCount;
  final List<String> tags;
  final Map<String, dynamic> attributes;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const Product({
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

  String get mainImageUrl =>
      imageUrls.isNotEmpty ? imageUrls.first : '';

  bool get hasDiscount => originalPrice != null && originalPrice! > price;

  double get discountPercentage {
    if (!hasDiscount) return 0.0;
    return ((originalPrice! - price) / originalPrice!) * 100;
  }

  bool get isOutOfStock => stockQuantity <= 0 || !isAvailable;

  bool get isLowStock => stockQuantity > 0 && stockQuantity <= 5;

  String get formattedPrice => '${price.toStringAsFixed(0)} $currency';

  String get formattedOriginalPrice =>
      originalPrice != null ? '${originalPrice!.toStringAsFixed(0)} $currency' : '';

  String get formattedDiscount =>
      hasDiscount ? '${discountPercentage.toStringAsFixed(0)}% OFF' : '';

  Product copyWith({
    String? id,
    String? name,
    String? description,
    String? shortDescription,
    double? price,
    double? originalPrice,
    String? currency,
    List<String>? imageUrls,
    Category? category,
    Brand? brand,
    int? stockQuantity,
    bool? isAvailable,
    bool? isFeatured,
    double? rating,
    int? reviewCount,
    List<String>? tags,
    Map<String, dynamic>? attributes,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      shortDescription: shortDescription ?? this.shortDescription,
      price: price ?? this.price,
      originalPrice: originalPrice ?? this.originalPrice,
      currency: currency ?? this.currency,
      imageUrls: imageUrls ?? this.imageUrls,
      category: category ?? this.category,
      brand: brand ?? this.brand,
      stockQuantity: stockQuantity ?? this.stockQuantity,
      isAvailable: isAvailable ?? this.isAvailable,
      isFeatured: isFeatured ?? this.isFeatured,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      tags: tags ?? this.tags,
      attributes: attributes ?? this.attributes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        name,
        description,
        shortDescription,
        price,
        originalPrice,
        currency,
        imageUrls,
        category,
        brand,
        stockQuantity,
        isAvailable,
        isFeatured,
        rating,
        reviewCount,
        tags,
        attributes,
        createdAt,
        updatedAt,
      ];
}

class Category extends Equatable {
  final String id;
  final String name;
  final String description;
  final String? imageUrl;
  final String? iconUrl;
  final String? parentId;
  final List<Category> subcategories;
  final bool isActive;
  final int sortOrder;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const Category({
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

  bool get hasSubcategories => subcategories.isNotEmpty;

  bool get isTopLevel => parentId == null;

  Category copyWith({
    String? id,
    String? name,
    String? description,
    String? imageUrl,
    String? iconUrl,
    String? parentId,
    List<Category>? subcategories,
    bool? isActive,
    int? sortOrder,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Category(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      iconUrl: iconUrl ?? this.iconUrl,
      parentId: parentId ?? this.parentId,
      subcategories: subcategories ?? this.subcategories,
      isActive: isActive ?? this.isActive,
      sortOrder: sortOrder ?? this.sortOrder,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        name,
        description,
        imageUrl,
        iconUrl,
        parentId,
        subcategories,
        isActive,
        sortOrder,
        createdAt,
        updatedAt,
      ];
}

class Brand extends Equatable {
  final String id;
  final String name;
  final String description;
  final String? logoUrl;
  final String? websiteUrl;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const Brand({
    required this.id,
    required this.name,
    required this.description,
    this.logoUrl,
    this.websiteUrl,
    this.isActive = true,
    required this.createdAt,
    this.updatedAt,
  });

  Brand copyWith({
    String? id,
    String? name,
    String? description,
    String? logoUrl,
    String? websiteUrl,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Brand(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      logoUrl: logoUrl ?? this.logoUrl,
      websiteUrl: websiteUrl ?? this.websiteUrl,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        name,
        description,
        logoUrl,
        websiteUrl,
        isActive,
        createdAt,
        updatedAt,
      ];
}

class ProductReview extends Equatable {
  final String id;
  final String productId;
  final String userId;
  final String userName;
  final String? userAvatarUrl;
  final double rating;
  final String? title;
  final String comment;
  final List<String> imageUrls;
  final bool isVerifiedPurchase;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const ProductReview({
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

  ProductReview copyWith({
    String? id,
    String? productId,
    String? userId,
    String? userName,
    String? userAvatarUrl,
    double? rating,
    String? title,
    String? comment,
    List<String>? imageUrls,
    bool? isVerifiedPurchase,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ProductReview(
      id: id ?? this.id,
      productId: productId ?? this.productId,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      userAvatarUrl: userAvatarUrl ?? this.userAvatarUrl,
      rating: rating ?? this.rating,
      title: title ?? this.title,
      comment: comment ?? this.comment,
      imageUrls: imageUrls ?? this.imageUrls,
      isVerifiedPurchase: isVerifiedPurchase ?? this.isVerifiedPurchase,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        productId,
        userId,
        userName,
        userAvatarUrl,
        rating,
        title,
        comment,
        imageUrls,
        isVerifiedPurchase,
        createdAt,
        updatedAt,
      ];
}

// Search and filter related classes
class ProductSearchResult extends Equatable {
  final List<Product> products;
  final int totalCount;
  final int page;
  final int pageSize;
  final String? query;
  final List<ProductFilter> appliedFilters;

  const ProductSearchResult({
    required this.products,
    required this.totalCount,
    required this.page,
    required this.pageSize,
    this.query,
    this.appliedFilters = const [],
  });

  bool get hasMore => (page * pageSize) < totalCount;

  int get totalPages => (totalCount / pageSize).ceil();

  ProductSearchResult copyWith({
    List<Product>? products,
    int? totalCount,
    int? page,
    int? pageSize,
    String? query,
    List<ProductFilter>? appliedFilters,
  }) {
    return ProductSearchResult(
      products: products ?? this.products,
      totalCount: totalCount ?? this.totalCount,
      page: page ?? this.page,
      pageSize: pageSize ?? this.pageSize,
      query: query ?? this.query,
      appliedFilters: appliedFilters ?? this.appliedFilters,
    );
  }

  @override
  List<Object?> get props => [
        products,
        totalCount,
        page,
        pageSize,
        query,
        appliedFilters,
      ];
}

class ProductFilter extends Equatable {
  final String key;
  final String label;
  final ProductFilterType type;
  final dynamic value;
  final Map<String, dynamic>? options;

  const ProductFilter({
    required this.key,
    required this.label,
    required this.type,
    required this.value,
    this.options,
  });

  ProductFilter copyWith({
    String? key,
    String? label,
    ProductFilterType? type,
    dynamic value,
    Map<String, dynamic>? options,
  }) {
    return ProductFilter(
      key: key ?? this.key,
      label: label ?? this.label,
      type: type ?? this.type,
      value: value ?? this.value,
      options: options ?? this.options,
    );
  }

  @override
  List<Object?> get props => [key, label, type, value, options];
}

enum ProductFilterType {
  category,
  brand,
  priceRange,
  rating,
  availability,
  discount,
  tag,
}

enum ProductSortBy {
  relevance,
  priceAsc,
  priceDesc,
  rating,
  newest,
  popular,
  nameAsc,
  nameDesc,
}