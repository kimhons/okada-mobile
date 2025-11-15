import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:okada_shared/ui/theme/colors.dart';
import 'package:okada_shared/ui/theme/spacing.dart';
import 'package:okada_shared/ui/theme/typography.dart';
import 'package:okada_shared/ui/constants/cameroon_constants.dart';
import '../../providers/products_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/product_card.dart';
import '../../widgets/category_card.dart';

/// Home Screen with Product Listing
/// Matches mockup: 05_home_screen.png
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      // Load more when scrolled 80% down
      ref.read(productsProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final productsState = ref.watch(productsProvider);
    final categoriesState = ref.watch(categoriesProvider);

    return Scaffold(
      backgroundColor: OkadaColors.backgroundLight,
      body: RefreshIndicator(
        onRefresh: () => ref.read(productsProvider.notifier).loadProducts(refresh: true),
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // App Bar
            _buildAppBar(),

            // Hero Banner
            SliverToBoxAdapter(
              child: _buildHeroBanner(),
            ),

            // Shop by Category
            SliverToBoxAdapter(
              child: _buildCategoriesSection(categoriesState),
            ),

            // Featured Sellers (placeholder for now)
            SliverToBoxAdapter(
              child: _buildFeaturedSellers(),
            ),

            // Best Selling Products
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(OkadaSpacing.md),
                child: Text(
                  'Best Selling Products',
                  style: OkadaTypography.h3.copyWith(
                    color: OkadaColors.textPrimary,
                  ),
                ),
              ),
            ),

            // Products Grid
            _buildProductsGrid(productsState),

            // Loading indicator
            if (productsState.isLoading && productsState.products.isNotEmpty)
              SliverToBoxAdapter(
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.all(OkadaSpacing.md),
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(OkadaColors.primary),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      floating: true,
      backgroundColor: OkadaColors.primary,
      title: Row(
        children: [
          Icon(Icons.shopping_cart, color: Colors.white),
          SizedBox(width: OkadaSpacing.xs),
          Text(
            'Okada',
            style: OkadaTypography.h3.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: Icon(Icons.search, color: Colors.white),
          onPressed: () {
            // TODO: Navigate to search screen
          },
        ),
        IconButton(
          icon: Icon(Icons.notifications_outlined, color: Colors.white),
          onPressed: () {
            // TODO: Navigate to notifications
          },
        ),
      ],
    );
  }

  Widget _buildHeroBanner() {
    return Container(
      margin: EdgeInsets.all(OkadaSpacing.md),
      height: 180,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          colors: [
            OkadaColors.primary.withOpacity(0.8),
            OkadaColors.primary,
          ],
        ),
        image: DecorationImage(
          image: AssetImage('assets/images/fresh_produce_banner.jpg'),
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(
            OkadaColors.primary.withOpacity(0.3),
            BlendMode.darken,
          ),
        ),
      ),
      child: Padding(
        padding: EdgeInsets.all(OkadaSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Fresh\nProduce',
              style: OkadaTypography.h1.copyWith(
                color: Colors.white,
                fontSize: 36,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: OkadaSpacing.xs),
            Text(
              'Get up to 50% off',
              style: OkadaTypography.h4.copyWith(
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoriesSection(CategoriesState categoriesState) {
    // Mock categories matching the mockup
    final mockCategories = [
      {'id': 1, 'name': 'Groceries', 'icon': Icons.shopping_basket, 'color': Colors.green.shade100},
      {'id': 2, 'name': 'Electronics', 'icon': Icons.phone_android, 'color': Colors.blue.shade100},
      {'id': 3, 'name': 'Fashion', 'icon': Icons.checkroom, 'color': Colors.purple.shade100},
      {'id': 4, 'name': 'Home &\nLiving', 'icon': Icons.chair, 'color': Colors.orange.shade100},
      {'id': 5, 'name': 'Beauty', 'icon': Icons.face, 'color': Colors.pink.shade100},
      {'id': 6, 'name': 'More', 'icon': Icons.more_horiz, 'color': Colors.grey.shade300},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.all(OkadaSpacing.md),
          child: Text(
            'Shop by Category',
            style: OkadaTypography.h3.copyWith(
              color: OkadaColors.textPrimary,
            ),
          ),
        ),
        SizedBox(
          height: 120,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.symmetric(horizontal: OkadaSpacing.md),
            itemCount: mockCategories.length,
            itemBuilder: (context, index) {
              final category = mockCategories[index];
              return CategoryCard(
                name: category['name'] as String,
                icon: category['icon'] as IconData,
                color: category['color'] as Color,
                onTap: () {
                  ref.read(productsProvider.notifier).filterByCategory(
                    category['id'] as int,
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFeaturedSellers() {
    // Mock featured sellers
    final sellers = [
      {'name': 'MakStore', 'logo': '🏪'},
      {'name': 'Electroworld', 'logo': '⚡'},
      {'name': 'BeautyHub', 'logo': '💄'},
      {'name': 'ShopNow', 'logo': '🛍️'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.all(OkadaSpacing.md),
          child: Text(
            'Featured Sellers',
            style: OkadaTypography.h3.copyWith(
              color: OkadaColors.textPrimary,
            ),
          ),
        ),
        SizedBox(
          height: 100,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.symmetric(horizontal: OkadaSpacing.md),
            itemCount: sellers.length,
            itemBuilder: (context, index) {
              final seller = sellers[index];
              return Container(
                width: 80,
                margin: EdgeInsets.only(right: OkadaSpacing.md),
                child: Column(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 8,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Center(
                        child: Text(
                          seller['logo'] as String,
                          style: TextStyle(fontSize: 28),
                        ),
                      ),
                    ),
                    SizedBox(height: OkadaSpacing.xs),
                    Text(
                      seller['name'] as String,
                      style: OkadaTypography.bodySmall.copyWith(
                        color: OkadaColors.textPrimary,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        SizedBox(height: OkadaSpacing.md),
      ],
    );
  }

  Widget _buildProductsGrid(ProductsState productsState) {
    if (productsState.isLoading && productsState.products.isEmpty) {
      return SliverFillRemaining(
        child: Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(OkadaColors.primary),
          ),
        ),
      );
    }

    if (productsState.error != null && productsState.products.isEmpty) {
      return SliverFillRemaining(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: OkadaColors.error),
              SizedBox(height: OkadaSpacing.md),
              Text(
                'Failed to load products',
                style: OkadaTypography.bodyMedium.copyWith(
                  color: OkadaColors.textSecondary,
                ),
              ),
              SizedBox(height: OkadaSpacing.md),
              ElevatedButton(
                onPressed: () {
                  ref.read(productsProvider.notifier).loadProducts(refresh: true);
                },
                child: Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    return SliverPadding(
      padding: EdgeInsets.all(OkadaSpacing.md),
      sliver: SliverGrid(
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.7,
          crossAxisSpacing: OkadaSpacing.md,
          mainAxisSpacing: OkadaSpacing.md,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final product = productsState.products[index];
            return ProductCard(product: product);
          },
          childCount: productsState.products.length,
        ),
      ),
    );
  }

  Widget _buildBottomNav() {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      selectedItemColor: OkadaColors.primary,
      unselectedItemColor: OkadaColors.textSecondary,
      currentIndex: 0,
      items: [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.grid_view),
          label: 'Categories',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.shopping_cart_outlined),
          label: 'Cart',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person_outline),
          label: 'Profile',
        ),
      ],
      onTap: (index) {
        // TODO: Navigate to different screens
      },
    );
  }
}

