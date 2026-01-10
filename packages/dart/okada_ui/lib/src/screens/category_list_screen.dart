import 'package:flutter/material.dart';
import '../theme/okada_design_system.dart';

/// Category List Screen (Screen 3.1)
/// 
/// Browse all product categories.
/// Based on the Okada UI design specifications.
/// 
/// Layout:
/// - Header with title and search icon
/// - Category list with full-width cards
class CategoryListScreen extends StatelessWidget {
  const CategoryListScreen({
    super.key,
    required this.categories,
    this.onCategoryTap,
    this.onSearchTap,
    this.onBackTap,
  });

  final List<CategoryListItem> categories;
  final void Function(CategoryListItem)? onCategoryTap;
  final VoidCallback? onSearchTap;
  final VoidCallback? onBackTap;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OkadaDesignSystem.marketWhite,
      appBar: AppBar(
        backgroundColor: OkadaDesignSystem.okadaGreen,
        foregroundColor: OkadaDesignSystem.pureWhite,
        leading: onBackTap != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: onBackTap,
              )
            : null,
        title: const Text(
          'Categories',
          style: TextStyle(
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: onSearchTap,
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          return _CategoryListCard(
            category: category,
            onTap: () => onCategoryTap?.call(category),
          );
        },
      ),
    );
  }
}

/// Category List Item Data
class CategoryListItem {
  const CategoryListItem({
    required this.id,
    required this.name,
    required this.nameFr,
    required this.icon,
    required this.color,
    required this.productCount,
    this.imageUrl,
  });

  final String id;
  final String name;
  final String nameFr;
  final IconData icon;
  final Color color;
  final int productCount;
  final String? imageUrl;

  /// Default categories for Okada platform
  static const List<CategoryListItem> defaultCategories = [
    CategoryListItem(
      id: 'fresh-produce',
      name: 'Fresh Produce',
      nameFr: 'Produits Frais',
      icon: Icons.eco,
      color: Color(0xFF22C55E),
      productCount: 234,
    ),
    CategoryListItem(
      id: 'dairy-eggs',
      name: 'Dairy & Eggs',
      nameFr: 'Produits Laitiers',
      icon: Icons.egg,
      color: Color(0xFF3B82F6),
      productCount: 89,
    ),
    CategoryListItem(
      id: 'meat-fish',
      name: 'Meat & Fish',
      nameFr: 'Viande & Poisson',
      icon: Icons.set_meal,
      color: Color(0xFFEF4444),
      productCount: 156,
    ),
    CategoryListItem(
      id: 'bakery',
      name: 'Bakery',
      nameFr: 'Boulangerie',
      icon: Icons.bakery_dining,
      color: Color(0xFFF97316),
      productCount: 67,
    ),
    CategoryListItem(
      id: 'beverages',
      name: 'Beverages',
      nameFr: 'Boissons',
      icon: Icons.local_drink,
      color: Color(0xFF8B5CF6),
      productCount: 198,
    ),
    CategoryListItem(
      id: 'pantry-staples',
      name: 'Pantry Staples',
      nameFr: 'Épicerie',
      icon: Icons.kitchen,
      color: Color(0xFF92400E),
      productCount: 312,
    ),
    CategoryListItem(
      id: 'household',
      name: 'Household',
      nameFr: 'Ménage',
      icon: Icons.cleaning_services,
      color: Color(0xFFEAB308),
      productCount: 145,
    ),
    CategoryListItem(
      id: 'personal-care',
      name: 'Personal Care',
      nameFr: 'Soins Personnels',
      icon: Icons.spa,
      color: Color(0xFFEC4899),
      productCount: 178,
    ),
    CategoryListItem(
      id: 'baby-kids',
      name: 'Baby & Kids',
      nameFr: 'Bébé & Enfants',
      icon: Icons.child_care,
      color: Color(0xFF06B6D4),
      productCount: 92,
    ),
    CategoryListItem(
      id: 'pet-supplies',
      name: 'Pet Supplies',
      nameFr: 'Animaux',
      icon: Icons.pets,
      color: Color(0xFF10B981),
      productCount: 45,
    ),
  ];
}

class _CategoryListCard extends StatelessWidget {
  const _CategoryListCard({
    required this.category,
    required this.onTap,
  });

  final CategoryListItem category;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: OkadaDesignSystem.pureWhite,
          border: Border(
            bottom: BorderSide(
              color: OkadaDesignSystem.softClay,
              width: 1,
            ),
          ),
        ),
        child: Row(
          children: [
            // Category Icon
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: category.color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                category.icon,
                color: category.color,
                size: 32,
              ),
            ),
            const SizedBox(width: 16),
            
            // Category Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    category.name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: OkadaDesignSystem.marketSoil,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${category.productCount} products',
                    style: TextStyle(
                      fontSize: 14,
                      color: OkadaDesignSystem.basketGray,
                    ),
                  ),
                ],
              ),
            ),
            
            // Chevron
            Icon(
              Icons.chevron_right,
              color: OkadaDesignSystem.basketGray,
              size: 24,
            ),
          ],
        ),
      ),
    );
  }
}

/// Category Detail Screen (Screen 3.2)
/// 
/// Browse products within a specific category.
class CategoryDetailScreen extends StatefulWidget {
  const CategoryDetailScreen({
    super.key,
    required this.category,
    required this.subcategories,
    required this.products,
    this.onBackTap,
    this.onFilterTap,
    this.onSortTap,
    this.onProductTap,
    this.onAddToCart,
    this.onSubcategoryTap,
  });

  final CategoryListItem category;
  final List<String> subcategories;
  final List<CategoryProduct> products;
  final VoidCallback? onBackTap;
  final VoidCallback? onFilterTap;
  final VoidCallback? onSortTap;
  final void Function(CategoryProduct)? onProductTap;
  final void Function(CategoryProduct)? onAddToCart;
  final void Function(String)? onSubcategoryTap;

  @override
  State<CategoryDetailScreen> createState() => _CategoryDetailScreenState();
}

class _CategoryDetailScreenState extends State<CategoryDetailScreen> {
  String _selectedSubcategory = 'All';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OkadaDesignSystem.marketWhite,
      appBar: AppBar(
        backgroundColor: OkadaDesignSystem.okadaGreen,
        foregroundColor: OkadaDesignSystem.pureWhite,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: widget.onBackTap,
        ),
        title: Text(
          widget.category.name,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: widget.onFilterTap,
          ),
          IconButton(
            icon: const Icon(Icons.sort),
            onPressed: widget.onSortTap,
          ),
        ],
      ),
      body: Column(
        children: [
          // Subcategory Tabs
          _buildSubcategoryTabs(),
          
          // Product Grid
          Expanded(
            child: _buildProductGrid(),
          ),
        ],
      ),
    );
  }

  Widget _buildSubcategoryTabs() {
    final allSubcategories = ['All', ...widget.subcategories];
    
    return Container(
      height: 48,
      color: OkadaDesignSystem.pureWhite,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: allSubcategories.length,
        itemBuilder: (context, index) {
          final subcategory = allSubcategories[index];
          final isSelected = subcategory == _selectedSubcategory;
          
          return GestureDetector(
            onTap: () {
              setState(() => _selectedSubcategory = subcategory);
              widget.onSubcategoryTap?.call(subcategory);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected 
                    ? OkadaDesignSystem.okadaGreen.withOpacity(0.1)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected 
                      ? OkadaDesignSystem.okadaGreen 
                      : OkadaDesignSystem.softClay,
                ),
              ),
              child: Center(
                child: Text(
                  subcategory,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    color: isSelected 
                        ? OkadaDesignSystem.okadaGreen 
                        : OkadaDesignSystem.basketGray,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildProductGrid() {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        childAspectRatio: 0.7,
      ),
      itemCount: widget.products.length,
      itemBuilder: (context, index) {
        final product = widget.products[index];
        return _CategoryProductCard(
          product: product,
          onTap: () => widget.onProductTap?.call(product),
          onAddToCart: () => widget.onAddToCart?.call(product),
        );
      },
    );
  }
}

/// Category Product Data
class CategoryProduct {
  const CategoryProduct({
    required this.id,
    required this.name,
    required this.price,
    required this.unit,
    this.imageUrl,
    this.stockStatus = ProductStockStatus.inStock,
  });

  final String id;
  final String name;
  final double price;
  final String unit;
  final String? imageUrl;
  final ProductStockStatus stockStatus;
}

enum ProductStockStatus {
  inStock,
  lowStock,
  outOfStock,
}

class _CategoryProductCard extends StatelessWidget {
  const _CategoryProductCard({
    required this.product,
    required this.onTap,
    required this.onAddToCart,
  });

  final CategoryProduct product;
  final VoidCallback onTap;
  final VoidCallback onAddToCart;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: OkadaDesignSystem.pureWhite,
          borderRadius: BorderRadius.circular(12),
          boxShadow: OkadaDesignSystem.shadowSmall,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            Expanded(
              flex: 3,
              child: Container(
                decoration: BoxDecoration(
                  color: OkadaDesignSystem.softClay,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(12),
                  ),
                ),
                child: Center(
                  child: Icon(
                    Icons.image,
                    size: 48,
                    color: OkadaDesignSystem.basketGray,
                  ),
                ),
              ),
            ),
            
            // Product Info
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: OkadaDesignSystem.marketSoil,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const Spacer(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${product.price.toInt()} CFA',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: OkadaDesignSystem.okadaGreen,
                              ),
                            ),
                            Text(
                              '/${product.unit}',
                              style: TextStyle(
                                fontSize: 11,
                                color: OkadaDesignSystem.basketGray,
                              ),
                            ),
                          ],
                        ),
                        GestureDetector(
                          onTap: product.stockStatus != ProductStockStatus.outOfStock
                              ? onAddToCart
                              : null,
                          child: Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: product.stockStatus != ProductStockStatus.outOfStock
                                  ? OkadaDesignSystem.okadaGreen
                                  : OkadaDesignSystem.basketGray,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.add,
                              color: OkadaDesignSystem.pureWhite,
                              size: 18,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    _buildStockStatus(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStockStatus() {
    Color color;
    String text;
    
    switch (product.stockStatus) {
      case ProductStockStatus.inStock:
        color = OkadaDesignSystem.palmGreen;
        text = 'In Stock';
        break;
      case ProductStockStatus.lowStock:
        color = OkadaDesignSystem.okadaYellow;
        text = 'Low Stock';
        break;
      case ProductStockStatus.outOfStock:
        color = OkadaDesignSystem.okadaRed;
        text = 'Out of Stock';
        break;
    }
    
    return Row(
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(
            fontSize: 10,
            color: color,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
