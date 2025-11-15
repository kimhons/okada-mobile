import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:okada_shared/ui/theme/colors.dart';
import 'package:okada_shared/ui/theme/spacing.dart';
import 'package:okada_shared/ui/theme/typography.dart';
import 'package:okada_shared/ui/constants/cameroon_constants.dart';
import '../../providers/cart_provider.dart';

/// Shopping Cart Screen
/// Matches mockup: 03_cart_screen.png
class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartProvider);
    final cartNotifier = ref.read(cartProvider.notifier);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: OkadaColors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Shopping Cart',
          style: OkadaTypography.h2.copyWith(
            color: OkadaColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: cartState.items.isEmpty
          ? _buildEmptyCart(context)
          : Column(
              children: [
                // Cart Items List
                Expanded(
                  child: ListView.separated(
                    padding: EdgeInsets.all(OkadaSpacing.md),
                    itemCount: cartState.items.length,
                    separatorBuilder: (context, index) => SizedBox(height: OkadaSpacing.md),
                    itemBuilder: (context, index) {
                      final item = cartState.items[index];
                      return _buildCartItem(
                        context,
                        item,
                        onIncrement: () => cartNotifier.incrementQuantity(item.id),
                        onDecrement: () => cartNotifier.decrementQuantity(item.id),
                        onRemove: () => cartNotifier.removeItem(item.id),
                      );
                    },
                  ),
                ),

                // Order Summary
                Container(
                  padding: EdgeInsets.all(OkadaSpacing.lg),
                  decoration: BoxDecoration(
                    color: OkadaColors.backgroundLight,
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(24),
                    ),
                  ),
                  child: SafeArea(
                    child: Column(
                      children: [
                        _buildSummaryRow(
                          'Subtotal',
                          CameroonConstants.formatCurrency(cartState.subtotal),
                        ),
                        SizedBox(height: OkadaSpacing.sm),
                        _buildSummaryRow(
                          'Delivery Fee',
                          CameroonConstants.formatCurrency(cartState.deliveryFee),
                        ),
                        Divider(height: OkadaSpacing.lg * 2),
                        _buildSummaryRow(
                          'Total',
                          CameroonConstants.formatCurrency(cartState.total),
                          isTotal: true,
                        ),
                        SizedBox(height: OkadaSpacing.lg),
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: () => _proceedToCheckout(context),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: OkadaColors.primary,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 0,
                            ),
                            child: Text(
                              'Proceed to Checkout',
                              style: OkadaTypography.h4.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
      bottomNavigationBar: cartState.items.isNotEmpty
          ? null
          : Container(
              padding: EdgeInsets.all(OkadaSpacing.lg),
              child: SafeArea(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Okada Logo
                    Text(
                      'Okada',
                      style: OkadaTypography.h2.copyWith(
                        color: OkadaColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildEmptyCart(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.shopping_cart_outlined,
            size: 120,
            color: OkadaColors.textSecondary.withOpacity(0.3),
          ),
          SizedBox(height: OkadaSpacing.lg),
          Text(
            'Your cart is empty',
            style: OkadaTypography.h3.copyWith(
              color: OkadaColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: OkadaSpacing.sm),
          Text(
            'Add items to get started',
            style: OkadaTypography.bodyMedium.copyWith(
              color: OkadaColors.textSecondary,
            ),
          ),
          SizedBox(height: OkadaSpacing.xl),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(),
            style: ElevatedButton.styleFrom(
              backgroundColor: OkadaColors.primary,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(
                horizontal: OkadaSpacing.xl,
                vertical: OkadaSpacing.md,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(
              'Start Shopping',
              style: OkadaTypography.bodyLarge.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItem(
    BuildContext context,
    CartItem item, {
    required VoidCallback onIncrement,
    required VoidCallback onDecrement,
    required VoidCallback onRemove,
  }) {
    return Container(
      padding: EdgeInsets.all(OkadaSpacing.md),
      decoration: BoxDecoration(
        color: OkadaColors.backgroundLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          // Product Image
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
            ),
            child: item.imageUrl != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      item.imageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return _buildImagePlaceholder();
                      },
                    ),
                  )
                : _buildImagePlaceholder(),
          ),

          SizedBox(width: OkadaSpacing.md),

          // Product Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  style: OkadaTypography.h4.copyWith(
                    color: OkadaColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: OkadaSpacing.xs),
                if (item.seller != null)
                  Text(
                    item.seller!,
                    style: OkadaTypography.bodySmall.copyWith(
                      color: OkadaColors.textSecondary,
                    ),
                  ),
                SizedBox(height: OkadaSpacing.sm),
                // Quantity Controls
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: OkadaColors.border,
                      width: 1,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _buildQuantityButton(
                        icon: Icons.remove,
                        onPressed: onDecrement,
                      ),
                      Container(
                        width: 40,
                        alignment: Alignment.center,
                        child: Text(
                          '${item.quantity}',
                          style: OkadaTypography.bodyLarge.copyWith(
                            color: OkadaColors.textPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      _buildQuantityButton(
                        icon: Icons.add,
                        onPressed: onIncrement,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          SizedBox(width: OkadaSpacing.md),

          // Price
          Text(
            CameroonConstants.formatCurrency(item.total),
            style: OkadaTypography.h4.copyWith(
              color: OkadaColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImagePlaceholder() {
    return Center(
      child: Icon(
        Icons.image_outlined,
        size: 40,
        color: OkadaColors.textSecondary.withOpacity(0.3),
      ),
    );
  }

  Widget _buildQuantityButton({
    required IconData icon,
    required VoidCallback onPressed,
  }) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: 36,
        height: 36,
        alignment: Alignment.center,
        child: Icon(
          icon,
          size: 18,
          color: OkadaColors.textPrimary,
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: (isTotal ? OkadaTypography.h3 : OkadaTypography.bodyLarge).copyWith(
            color: OkadaColors.textPrimary,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          value,
          style: (isTotal ? OkadaTypography.h3 : OkadaTypography.bodyLarge).copyWith(
            color: OkadaColors.textPrimary,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
          ),
        ),
      ],
    );
  }

  void _proceedToCheckout(BuildContext context) {
    // TODO: Navigate to checkout screen
    Navigator.of(context).pushNamed('/checkout');
  }
}

