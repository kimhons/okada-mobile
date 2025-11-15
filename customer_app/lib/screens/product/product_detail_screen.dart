import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:okada_shared/ui/theme/colors.dart';
import 'package:okada_shared/ui/theme/spacing.dart';
import 'package:okada_shared/ui/theme/typography.dart';
import 'package:okada_shared/ui/constants/cameroon_constants.dart';
import '../../providers/cart_provider.dart';

/// Product Detail Screen
/// Matches mockup: 02_product_detail.png
class ProductDetailScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> product;

  const ProductDetailScreen({
    super.key,
    required this.product,
  });

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  int _quantity = 1;

  @override
  Widget build(BuildContext context) {
    final name = widget.product['name'] as String? ?? 'Product';
    final price = widget.product['price'] as num? ?? 0;
    final pricePerUnit = widget.product['price_per_unit'] as String? ?? 'FCFA/kg';
    final description = widget.product['description'] as String? ?? 
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore';
    final seller = widget.product['seller'] as Map<String, dynamic>? ?? 
        {'name': 'Green Market', 'logo': '🏪'};
    final imageUrl = widget.product['image_url'] as String?;
    final images = widget.product['images'] as List<dynamic>?;
    
    // Get first image URL
    String? displayImage = imageUrl;
    if (displayImage == null && images != null && images.isNotEmpty) {
      final firstImage = images.first as Map<String, dynamic>;
      displayImage = firstImage['url'] as String?;
    }

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          // Product Image
          SliverAppBar(
            expandedHeight: 400,
            pinned: true,
            backgroundColor: OkadaColors.backgroundLight,
            leading: Container(
              margin: EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: Icon(Icons.arrow_back, color: OkadaColors.textPrimary),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ),
            actions: [
              Container(
                margin: EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: Icon(Icons.favorite_border, color: OkadaColors.textPrimary),
                  onPressed: () {
                    // TODO: Add to favorites
                  },
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: displayImage != null
                  ? Image.network(
                      displayImage,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return _buildPlaceholder();
                      },
                    )
                  : _buildPlaceholder(),
            ),
          ),

          // Product Info
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.all(OkadaSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Name
                  Text(
                    name,
                    style: OkadaTypography.h2.copyWith(
                      color: OkadaColors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  SizedBox(height: OkadaSpacing.sm),

                  // Price
                  Text(
                    '${CameroonConstants.formatCurrency(price.toDouble())}/$pricePerUnit',
                    style: OkadaTypography.h3.copyWith(
                      color: OkadaColors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  SizedBox(height: OkadaSpacing.lg),

                  // Seller Info
                  Container(
                    padding: EdgeInsets.all(OkadaSpacing.md),
                    decoration: BoxDecoration(
                      color: OkadaColors.backgroundLight,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Center(
                            child: Text(
                              seller['logo'] as String? ?? '🏪',
                              style: TextStyle(fontSize: 24),
                            ),
                          ),
                        ),
                        SizedBox(width: OkadaSpacing.md),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Sold by',
                              style: OkadaTypography.bodySmall.copyWith(
                                color: OkadaColors.textSecondary,
                              ),
                            ),
                            Text(
                              seller['name'] as String? ?? 'Green Market',
                              style: OkadaTypography.h4.copyWith(
                                color: OkadaColors.textPrimary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        Spacer(),
                        Icon(
                          Icons.arrow_forward_ios,
                          size: 16,
                          color: OkadaColors.textSecondary,
                        ),
                      ],
                    ),
                  ),

                  SizedBox(height: OkadaSpacing.xl),

                  // Description
                  Text(
                    'Description',
                    style: OkadaTypography.h3.copyWith(
                      color: OkadaColors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  SizedBox(height: OkadaSpacing.sm),

                  Text(
                    description,
                    style: OkadaTypography.bodyMedium.copyWith(
                      color: OkadaColors.textSecondary,
                      height: 1.6,
                    ),
                  ),

                  SizedBox(height: OkadaSpacing.xxl),

                  // Quantity Selector
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: OkadaColors.border,
                            width: 1,
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            _buildQuantityButton(
                              icon: Icons.remove,
                              onPressed: _quantity > 1
                                  ? () => setState(() => _quantity--)
                                  : null,
                            ),
                            Container(
                              width: 60,
                              alignment: Alignment.center,
                              child: Text(
                                '$_quantity',
                                style: OkadaTypography.h4.copyWith(
                                  color: OkadaColors.textPrimary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            _buildQuantityButton(
                              icon: Icons.add,
                              onPressed: () => setState(() => _quantity++),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: OkadaSpacing.xl),
                ],
              ),
            ),
          ),
        ],
      ),

      // Add to Cart Button (Fixed at bottom)
      bottomNavigationBar: Container(
        padding: EdgeInsets.all(OkadaSpacing.lg),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          child: SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: () => _addToCart(),
              style: ElevatedButton.styleFrom(
                backgroundColor: OkadaColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: Text(
                'Add to Cart',
                style: OkadaTypography.h4.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: OkadaColors.backgroundLight,
      child: Center(
        child: Icon(
          Icons.image_outlined,
          size: 100,
          color: OkadaColors.textSecondary.withOpacity(0.3),
        ),
      ),
    );
  }

  Widget _buildQuantityButton({
    required IconData icon,
    required VoidCallback? onPressed,
  }) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: 48,
        height: 48,
        alignment: Alignment.center,
        child: Icon(
          icon,
          color: onPressed != null
              ? OkadaColors.textPrimary
              : OkadaColors.textSecondary.withOpacity(0.3),
        ),
      ),
    );
  }

  void _addToCart() {
    // Add to cart with quantity
    ref.read(cartProvider.notifier).addItem(
      widget.product,
      quantity: _quantity,
    );

    // Show success message
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Added $_quantity item(s) to cart'),
        backgroundColor: OkadaColors.success,
        duration: Duration(seconds: 2),
        action: SnackBarAction(
          label: 'View Cart',
          textColor: Colors.white,
          onPressed: () {
            Navigator.of(context).pushNamed('/cart');
          },
        ),
      ),
    );
  }
}

