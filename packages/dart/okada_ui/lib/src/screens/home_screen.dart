import 'package:flutter/material.dart';
import '../theme/okada_design_system.dart';
import '../widgets/ndop_pattern.dart';

/// Home Screen (Screen 2.1)
/// 
/// Primary landing screen for browsing and discovering products.
/// Based on the Okada UI design specifications.
/// 
/// Layout:
/// - Header with delivery address and notification bell
/// - Search bar
/// - Promotional banner carousel
/// - Category grid
/// - Featured products section
/// - Bottom navigation
class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    required this.deliveryAddress,
    required this.categories,
    required this.promotionalBanners,
    required this.featuredProducts,
    this.unreadNotifications = 0,
    this.onSearchTap,
    this.onAddressTap,
    this.onNotificationTap,
    this.onCategoryTap,
    this.onProductTap,
    this.onBannerTap,
    this.onAddToCart,
  });

  final String deliveryAddress;
  final List<CategoryItem> categories;
  final List<PromotionalBanner> promotionalBanners;
  final List<ProductItem> featuredProducts;
  final int unreadNotifications;
  final VoidCallback? onSearchTap;
  final VoidCallback? onAddressTap;
  final VoidCallback? onNotificationTap;
  final void Function(CategoryItem)? onCategoryTap;
  final void Function(ProductItem)? onProductTap;
  final void Function(PromotionalBanner)? onBannerTap;
  final void Function(ProductItem)? onAddToCart;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final PageController _bannerController = PageController();
  int _currentBannerIndex = 0;

  @override
  void initState() {
    super.initState();
    _startBannerAutoScroll();
  }

  void _startBannerAutoScroll() {
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted && widget.promotionalBanners.isNotEmpty) {
        final nextIndex = (_currentBannerIndex + 1) % widget.promotionalBanners.length;
        _bannerController.animateToPage(
          nextIndex,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
        _startBannerAutoScroll();
      }
    });
  }

  @override
  void dispose() {
    _bannerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OkadaDesignSystem.marketWhite,
      body: CustomScrollView(
        slivers: [
          // Header with Ndop pattern
          _buildHeader(),
          
          // Search Bar
          SliverToBoxAdapter(child: _buildSearchBar()),
          
          // Promotional Banners
          if (widget.promotionalBanners.isNotEmpty)
            SliverToBoxAdapter(child: _buildPromotionalBanners()),
          
          // Category Grid
          SliverToBoxAdapter(child: _buildCategorySection()),
          
          // Featured Products
          SliverToBoxAdapter(child: _buildFeaturedSection()),
          
          // Bottom padding
          const SliverToBoxAdapter(child: SizedBox(height: 80)),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return SliverAppBar(
      floating: true,
      pinned: true,
      expandedHeight: 100,
      backgroundColor: OkadaDesignSystem.okadaGreen,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          children: [
            // Ndop pattern background
            Positioned.fill(
              child: Opacity(
                opacity: 0.1,
                child: NdopPattern(
                  height: 100,
                  patternType: NdopPatternType.interlocking,
                  primaryColor: OkadaDesignSystem.pureWhite,
                  secondaryColor: OkadaDesignSystem.okadaGreen,
                ),
              ),
            ),
            // Content
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    // Delivery Address
                    Expanded(
                      child: GestureDetector(
                        onTap: widget.onAddressTap,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Delivering to',
                              style: TextStyle(
                                fontSize: 12,
                                color: OkadaDesignSystem.pureWhite.withOpacity(0.8),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                Flexible(
                                  child: Text(
                                    widget.deliveryAddress,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: OkadaDesignSystem.pureWhite,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                const Icon(
                                  Icons.keyboard_arrow_down,
                                  color: OkadaDesignSystem.pureWhite,
                                  size: 20,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    
                    // Notification Bell
                    GestureDetector(
                      onTap: widget.onNotificationTap,
                      child: Stack(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: OkadaDesignSystem.pureWhite.withOpacity(0.2),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.notifications_outlined,
                              color: OkadaDesignSystem.pureWhite,
                              size: 24,
                            ),
                          ),
                          if (widget.unreadNotifications > 0)
                            Positioned(
                              right: 4,
                              top: 4,
                              child: Container(
                                width: 16,
                                height: 16,
                                decoration: const BoxDecoration(
                                  color: OkadaDesignSystem.okadaRed,
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Text(
                                    widget.unreadNotifications > 9 
                                        ? '9+' 
                                        : '${widget.unreadNotifications}',
                                    style: const TextStyle(
                                      color: OkadaDesignSystem.pureWhite,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: GestureDetector(
        onTap: widget.onSearchTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: OkadaDesignSystem.pureWhite,
            borderRadius: BorderRadius.circular(12),
            boxShadow: OkadaDesignSystem.shadowSmall,
          ),
          child: Row(
            children: [
              Icon(
                Icons.search,
                color: OkadaDesignSystem.basketGray,
                size: 24,
              ),
              const SizedBox(width: 12),
              Text(
                'Search for products...',
                style: TextStyle(
                  fontSize: 16,
                  color: OkadaDesignSystem.basketGray,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPromotionalBanners() {
    return Column(
      children: [
        SizedBox(
          height: 160,
          child: PageView.builder(
            controller: _bannerController,
            onPageChanged: (index) {
              setState(() => _currentBannerIndex = index);
            },
            itemCount: widget.promotionalBanners.length,
            itemBuilder: (context, index) {
              final banner = widget.promotionalBanners[index];
              return _PromotionalBannerCard(
                banner: banner,
                onTap: () => widget.onBannerTap?.call(banner),
              );
            },
          ),
        ),
        const SizedBox(height: 8),
        // Dot indicators
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            widget.promotionalBanners.length,
            (index) => AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: index == _currentBannerIndex ? 24 : 8,
              height: 8,
              decoration: BoxDecoration(
                color: index == _currentBannerIndex
                    ? OkadaDesignSystem.okadaGreen
                    : OkadaDesignSystem.softClay,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildCategorySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Shop by Category',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: OkadaDesignSystem.marketSoil,
                ),
              ),
              TextButton(
                onPressed: () {},
                child: const Text(
                  'See All',
                  style: TextStyle(
                    color: OkadaDesignSystem.okadaGreen,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 200,
          child: GridView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1,
            ),
            itemCount: widget.categories.length,
            itemBuilder: (context, index) {
              final category = widget.categories[index];
              return _CategoryCard(
                category: category,
                onTap: () => widget.onCategoryTap?.call(category),
              );
            },
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildFeaturedSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Featured Products',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: OkadaDesignSystem.marketSoil,
                ),
              ),
              TextButton(
                onPressed: () {},
                child: const Text(
                  'See All',
                  style: TextStyle(
                    color: OkadaDesignSystem.okadaGreen,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 240,
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: widget.featuredProducts.length,
            itemBuilder: (context, index) {
              final product = widget.featuredProducts[index];
              return Padding(
                padding: const EdgeInsets.only(right: 12),
                child: _ProductCard(
                  product: product,
                  onTap: () => widget.onProductTap?.call(product),
                  onAddToCart: () => widget.onAddToCart?.call(product),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

// Data Models

class CategoryItem {
  const CategoryItem({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
    this.productCount = 0,
  });

  final String id;
  final String name;
  final IconData icon;
  final Color color;
  final int productCount;
}

class PromotionalBanner {
  const PromotionalBanner({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    required this.backgroundColor,
    this.actionUrl,
  });

  final String id;
  final String title;
  final String subtitle;
  final String imageUrl;
  final Color backgroundColor;
  final String? actionUrl;
}

class ProductItem {
  const ProductItem({
    required this.id,
    required this.name,
    required this.price,
    required this.unit,
    required this.imageUrl,
    this.stockStatus = StockStatus.inStock,
    this.discountPercentage,
  });

  final String id;
  final String name;
  final double price;
  final String unit;
  final String imageUrl;
  final StockStatus stockStatus;
  final int? discountPercentage;
}

enum StockStatus {
  inStock,
  lowStock,
  outOfStock,
}

// Component Widgets

class _PromotionalBannerCard extends StatelessWidget {
  const _PromotionalBannerCard({
    required this.banner,
    required this.onTap,
  });

  final PromotionalBanner banner;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: banner.backgroundColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: OkadaDesignSystem.shadowSmall,
        ),
        child: Stack(
          children: [
            // Background pattern
            Positioned.fill(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Opacity(
                  opacity: 0.1,
                  child: NdopPattern(
                    height: 160,
                    patternType: NdopPatternType.dots,
                    primaryColor: OkadaDesignSystem.pureWhite,
                  ),
                ),
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    banner.title,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: OkadaDesignSystem.pureWhite,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    banner.subtitle,
                    style: TextStyle(
                      fontSize: 14,
                      color: OkadaDesignSystem.pureWhite.withOpacity(0.9),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: OkadaDesignSystem.pureWhite,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'Shop Now',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: banner.backgroundColor,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({
    required this.category,
    required this.onTap,
  });

  final CategoryItem category;
  final VoidCallback onTap;

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
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: category.color.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(
                category.icon,
                color: category.color,
                size: 28,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              category.name,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: OkadaDesignSystem.marketSoil,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({
    required this.product,
    required this.onTap,
    required this.onAddToCart,
  });

  final ProductItem product;
  final VoidCallback onTap;
  final VoidCallback onAddToCart;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 160,
        decoration: BoxDecoration(
          color: OkadaDesignSystem.pureWhite,
          borderRadius: BorderRadius.circular(12),
          boxShadow: OkadaDesignSystem.shadowSmall,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            Stack(
              children: [
                Container(
                  height: 120,
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
                // Discount badge
                if (product.discountPercentage != null)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: OkadaDesignSystem.okadaRed,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '-${product.discountPercentage}%',
                        style: const TextStyle(
                          color: OkadaDesignSystem.pureWhite,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            // Product Info
            Padding(
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
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${product.price.toInt()} CFA',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: OkadaDesignSystem.okadaGreen,
                            ),
                          ),
                          Text(
                            '/${product.unit}',
                            style: TextStyle(
                              fontSize: 12,
                              color: OkadaDesignSystem.basketGray,
                            ),
                          ),
                        ],
                      ),
                      // Add to cart button
                      GestureDetector(
                        onTap: product.stockStatus != StockStatus.outOfStock
                            ? onAddToCart
                            : null,
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: product.stockStatus != StockStatus.outOfStock
                                ? OkadaDesignSystem.okadaGreen
                                : OkadaDesignSystem.basketGray,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.add,
                            color: OkadaDesignSystem.pureWhite,
                            size: 20,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  _StockStatusBadge(status: product.stockStatus),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StockStatusBadge extends StatelessWidget {
  const _StockStatusBadge({required this.status});

  final StockStatus status;

  @override
  Widget build(BuildContext context) {
    Color color;
    String text;
    
    switch (status) {
      case StockStatus.inStock:
        color = OkadaDesignSystem.palmGreen;
        text = 'In Stock';
        break;
      case StockStatus.lowStock:
        color = OkadaDesignSystem.okadaYellow;
        text = 'Low Stock';
        break;
      case StockStatus.outOfStock:
        color = OkadaDesignSystem.okadaRed;
        text = 'Out of Stock';
        break;
    }
    
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(
            fontSize: 11,
            color: color,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
