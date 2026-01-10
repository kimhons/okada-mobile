import 'package:flutter/material.dart';
import '../theme/okada_design_system.dart';

/// Search Screen (Screen 3.3)
/// 
/// Product search with suggestions and results.
/// Based on the Okada UI design specifications.
class SearchScreen extends StatefulWidget {
  const SearchScreen({
    super.key,
    this.recentSearches = const [],
    this.popularSearches = const [],
    this.onSearch,
    this.onRecentSearchTap,
    this.onPopularSearchTap,
    this.onClearRecentSearches,
    this.onBackTap,
  });

  final List<String> recentSearches;
  final List<String> popularSearches;
  final void Function(String query)? onSearch;
  final void Function(String query)? onRecentSearchTap;
  final void Function(String query)? onPopularSearchTap;
  final VoidCallback? onClearRecentSearches;
  final VoidCallback? onBackTap;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _showSuggestions = true;

  @override
  void initState() {
    super.initState();
    // Auto-focus the search field
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _performSearch() {
    final query = _searchController.text.trim();
    if (query.isNotEmpty) {
      widget.onSearch?.call(query);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OkadaDesignSystem.marketWhite,
      appBar: AppBar(
        backgroundColor: OkadaDesignSystem.pureWhite,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back,
            color: OkadaDesignSystem.marketSoil,
          ),
          onPressed: widget.onBackTap,
        ),
        title: _buildSearchField(),
        titleSpacing: 0,
      ),
      body: _showSuggestions ? _buildSuggestions() : _buildResults(),
    );
  }

  Widget _buildSearchField() {
    return Container(
      height: 44,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        color: OkadaDesignSystem.softClay,
        borderRadius: BorderRadius.circular(12),
      ),
      child: TextField(
        controller: _searchController,
        focusNode: _focusNode,
        onSubmitted: (_) => _performSearch(),
        onChanged: (value) {
          setState(() {
            _showSuggestions = value.isEmpty;
          });
        },
        decoration: InputDecoration(
          hintText: 'Search for products...',
          hintStyle: TextStyle(
            color: OkadaDesignSystem.basketGray,
            fontSize: 16,
          ),
          prefixIcon: Icon(
            Icons.search,
            color: OkadaDesignSystem.basketGray,
          ),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: Icon(
                    Icons.clear,
                    color: OkadaDesignSystem.basketGray,
                  ),
                  onPressed: () {
                    _searchController.clear();
                    setState(() {
                      _showSuggestions = true;
                    });
                  },
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 12,
          ),
        ),
        textInputAction: TextInputAction.search,
      ),
    );
  }

  Widget _buildSuggestions() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Recent Searches
          if (widget.recentSearches.isNotEmpty) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Recent Searches',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: OkadaDesignSystem.marketSoil,
                  ),
                ),
                TextButton(
                  onPressed: widget.onClearRecentSearches,
                  child: const Text(
                    'Clear',
                    style: TextStyle(
                      color: OkadaDesignSystem.okadaGreen,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: widget.recentSearches.map((search) {
                return _SearchChip(
                  label: search,
                  icon: Icons.history,
                  onTap: () => widget.onRecentSearchTap?.call(search),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
          ],
          
          // Popular Searches
          if (widget.popularSearches.isNotEmpty) ...[
            const Text(
              'Popular Searches',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: OkadaDesignSystem.marketSoil,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: widget.popularSearches.map((search) {
                return _SearchChip(
                  label: search,
                  icon: Icons.trending_up,
                  onTap: () => widget.onPopularSearchTap?.call(search),
                );
              }).toList(),
            ),
          ],
          
          // Quick Categories
          const SizedBox(height: 24),
          const Text(
            'Browse Categories',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: OkadaDesignSystem.marketSoil,
            ),
          ),
          const SizedBox(height: 12),
          _buildQuickCategories(),
        ],
      ),
    );
  }

  Widget _buildQuickCategories() {
    final categories = [
      ('Fresh Produce', Icons.eco, OkadaDesignSystem.palmGreen),
      ('Meat & Fish', Icons.set_meal, OkadaDesignSystem.okadaRed),
      ('Beverages', Icons.local_drink, const Color(0xFF8B5CF6)),
      ('Household', Icons.cleaning_services, OkadaDesignSystem.okadaYellow),
    ];
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: categories.map((cat) {
        return Expanded(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: OkadaDesignSystem.pureWhite,
              borderRadius: BorderRadius.circular(12),
              boxShadow: OkadaDesignSystem.shadowSmall,
            ),
            child: Column(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: cat.$3.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    cat.$2,
                    color: cat.$3,
                    size: 20,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  cat.$1,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: OkadaDesignSystem.marketSoil,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildResults() {
    // This would show search results
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search,
            size: 64,
            color: OkadaDesignSystem.basketGray,
          ),
          const SizedBox(height: 16),
          Text(
            'Searching for "${_searchController.text}"',
            style: TextStyle(
              fontSize: 16,
              color: OkadaDesignSystem.basketGray,
            ),
          ),
        ],
      ),
    );
  }
}

class _SearchChip extends StatelessWidget {
  const _SearchChip({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: OkadaDesignSystem.pureWhite,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: OkadaDesignSystem.softClay),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 16,
              color: OkadaDesignSystem.basketGray,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                color: OkadaDesignSystem.marketSoil,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Search Results Screen
/// 
/// Displays search results with filtering and sorting options.
class SearchResultsScreen extends StatelessWidget {
  const SearchResultsScreen({
    super.key,
    required this.query,
    required this.results,
    this.totalResults = 0,
    this.onBackTap,
    this.onFilterTap,
    this.onSortTap,
    this.onProductTap,
    this.onAddToCart,
  });

  final String query;
  final List<SearchResultProduct> results;
  final int totalResults;
  final VoidCallback? onBackTap;
  final VoidCallback? onFilterTap;
  final VoidCallback? onSortTap;
  final void Function(SearchResultProduct)? onProductTap;
  final void Function(SearchResultProduct)? onAddToCart;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OkadaDesignSystem.marketWhite,
      appBar: AppBar(
        backgroundColor: OkadaDesignSystem.okadaGreen,
        foregroundColor: OkadaDesignSystem.pureWhite,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: onBackTap,
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Results for "$query"',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              '$totalResults products found',
              style: TextStyle(
                fontSize: 12,
                color: OkadaDesignSystem.pureWhite.withOpacity(0.8),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: onFilterTap,
          ),
          IconButton(
            icon: const Icon(Icons.sort),
            onPressed: onSortTap,
          ),
        ],
      ),
      body: results.isEmpty
          ? _buildEmptyState()
          : GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 0.7,
              ),
              itemCount: results.length,
              itemBuilder: (context, index) {
                final product = results[index];
                return _SearchResultCard(
                  product: product,
                  onTap: () => onProductTap?.call(product),
                  onAddToCart: () => onAddToCart?.call(product),
                );
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 64,
            color: OkadaDesignSystem.basketGray,
          ),
          const SizedBox(height: 16),
          Text(
            'No results found for "$query"',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: OkadaDesignSystem.marketSoil,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try a different search term',
            style: TextStyle(
              fontSize: 14,
              color: OkadaDesignSystem.basketGray,
            ),
          ),
        ],
      ),
    );
  }
}

class SearchResultProduct {
  const SearchResultProduct({
    required this.id,
    required this.name,
    required this.price,
    required this.unit,
    this.imageUrl,
    this.category,
    this.isInStock = true,
  });

  final String id;
  final String name;
  final double price;
  final String unit;
  final String? imageUrl;
  final String? category;
  final bool isInStock;
}

class _SearchResultCard extends StatelessWidget {
  const _SearchResultCard({
    required this.product,
    required this.onTap,
    required this.onAddToCart,
  });

  final SearchResultProduct product;
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
                    if (product.category != null)
                      Text(
                        product.category!,
                        style: TextStyle(
                          fontSize: 10,
                          color: OkadaDesignSystem.basketGray,
                        ),
                      ),
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
                        Text(
                          '${product.price.toInt()} CFA/${product.unit}',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: OkadaDesignSystem.okadaGreen,
                          ),
                        ),
                        GestureDetector(
                          onTap: product.isInStock ? onAddToCart : null,
                          child: Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: product.isInStock
                                  ? OkadaDesignSystem.okadaGreen
                                  : OkadaDesignSystem.basketGray,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.add,
                              color: OkadaDesignSystem.pureWhite,
                              size: 16,
                            ),
                          ),
                        ),
                      ],
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
}
