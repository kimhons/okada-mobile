import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:okada_shared/ui/theme/colors.dart';
import 'package:okada_shared/ui/theme/spacing.dart';
import 'package:okada_shared/ui/theme/typography.dart';
import '../../providers/order_provider.dart';

/// Quality Verification Photos Screen
/// Matches mockup: 05_quality_verification.png
/// 
/// This is Okada's KEY DIFFERENTIATOR!
/// Customers can review photos taken by the rider to verify product quality
/// before accepting the delivery.
class QualityVerificationScreen extends ConsumerStatefulWidget {
  final String orderId;
  final List<String> photoUrls;
  final Map<String, dynamic>? orderDetails;

  const QualityVerificationScreen({
    super.key,
    required this.orderId,
    required this.photoUrls,
    this.orderDetails,
  });

  @override
  ConsumerState<QualityVerificationScreen> createState() =>
      _QualityVerificationScreenState();
}

class _QualityVerificationScreenState
    extends ConsumerState<QualityVerificationScreen> {
  int _selectedPhotoIndex = 0;
  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
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
          'Order #${widget.orderId}',
          style: OkadaTypography.bodyLarge.copyWith(
            color: OkadaColors.textSecondary,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Title
            Padding(
              padding: EdgeInsets.all(OkadaSpacing.lg),
              child: Text(
                'Verify Your Items',
                style: OkadaTypography.h1.copyWith(
                  color: OkadaColors.textPrimary,
                  fontWeight: FontWeight.bold,
                  fontSize: 40,
                ),
                textAlign: TextAlign.center,
              ),
            ),

            SizedBox(height: OkadaSpacing.md),

            // Main Photo Display
            Expanded(
              child: GestureDetector(
                onTap: () => _showFullScreenPhoto(context, _selectedPhotoIndex),
                child: Container(
                  margin: EdgeInsets.symmetric(horizontal: OkadaSpacing.lg),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 20,
                        offset: Offset(0, 10),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: widget.photoUrls.isNotEmpty
                        ? Image.network(
                            widget.photoUrls[_selectedPhotoIndex],
                            fit: BoxFit.cover,
                            width: double.infinity,
                            errorBuilder: (context, error, stackTrace) {
                              return _buildPhotoPlaceholder();
                            },
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return Center(
                                child: CircularProgressIndicator(
                                  value: loadingProgress.expectedTotalBytes != null
                                      ? loadingProgress.cumulativeBytesLoaded /
                                          loadingProgress.expectedTotalBytes!
                                      : null,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    OkadaColors.primary,
                                  ),
                                ),
                              );
                            },
                          )
                        : _buildPhotoPlaceholder(),
                  ),
                ),
              ),
            ),

            SizedBox(height: OkadaSpacing.lg),

            // Photo Thumbnails (if multiple photos)
            if (widget.photoUrls.length > 1) ...[
              Container(
                height: 80,
                padding: EdgeInsets.symmetric(horizontal: OkadaSpacing.lg),
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: widget.photoUrls.length,
                  separatorBuilder: (context, index) =>
                      SizedBox(width: OkadaSpacing.sm),
                  itemBuilder: (context, index) {
                    final isSelected = index == _selectedPhotoIndex;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedPhotoIndex = index),
                      child: Container(
                        width: 80,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected
                                ? OkadaColors.primary
                                : OkadaColors.border,
                            width: isSelected ? 3 : 1,
                          ),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            widget.photoUrls[index],
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                color: OkadaColors.backgroundLight,
                                child: Icon(
                                  Icons.image_outlined,
                                  color: OkadaColors.textSecondary,
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              SizedBox(height: OkadaSpacing.lg),
            ],

            // Photo Counter
            if (widget.photoUrls.length > 1)
              Text(
                '${_selectedPhotoIndex + 1} of ${widget.photoUrls.length}',
                style: OkadaTypography.bodyMedium.copyWith(
                  color: OkadaColors.textSecondary,
                ),
              ),

            SizedBox(height: OkadaSpacing.xl),

            // Action Buttons
            Padding(
              padding: EdgeInsets.all(OkadaSpacing.lg),
              child: Column(
                children: [
                  // Approve Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _isProcessing ? null : _approveOrder,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: OkadaColors.success,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor:
                            OkadaColors.success.withOpacity(0.5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: _isProcessing
                          ? SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.white,
                                ),
                              ),
                            )
                          : Text(
                              'Approve',
                              style: OkadaTypography.h4.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),

                  SizedBox(height: OkadaSpacing.md),

                  // Reject Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _isProcessing ? null : _rejectOrder,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: OkadaColors.error,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor:
                            OkadaColors.error.withOpacity(0.5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: Text(
                        'Reject',
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
          ],
        ),
      ),
    );
  }

  Widget _buildPhotoPlaceholder() {
    return Container(
      color: OkadaColors.backgroundLight,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.image_outlined,
              size: 80,
              color: OkadaColors.textSecondary.withOpacity(0.3),
            ),
            SizedBox(height: OkadaSpacing.md),
            Text(
              'Photo not available',
              style: OkadaTypography.bodyMedium.copyWith(
                color: OkadaColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showFullScreenPhoto(BuildContext context, int index) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => _FullScreenPhotoViewer(
          photoUrls: widget.photoUrls,
          initialIndex: index,
        ),
      ),
    );
  }

  Future<void> _approveOrder() async {
    setState(() => _isProcessing = true);

    try {
      // Call API to approve order
      await ref.read(orderProvider.notifier).approveQualityVerification(
        widget.orderId,
      );

      if (mounted) {
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Order approved! Delivery will be completed.'),
            backgroundColor: OkadaColors.success,
            duration: Duration(seconds: 3),
          ),
        );

        // Navigate back or to order tracking
        Navigator.of(context).pop(true); // Return true to indicate approval
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to approve order. Please try again.'),
            backgroundColor: OkadaColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  Future<void> _rejectOrder() async {
    // Show rejection reason dialog
    final reason = await _showRejectionDialog();
    if (reason == null) return;

    setState(() => _isProcessing = true);

    try {
      // Call API to reject order
      await ref.read(orderProvider.notifier).rejectQualityVerification(
        widget.orderId,
        reason: reason,
      );

      if (mounted) {
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Order rejected. Rider will return the items.'),
            backgroundColor: OkadaColors.warning,
            duration: Duration(seconds: 3),
          ),
        );

        // Navigate back
        Navigator.of(context).pop(false); // Return false to indicate rejection
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to reject order. Please try again.'),
            backgroundColor: OkadaColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  Future<String?> _showRejectionDialog() async {
    final reasons = [
      'Poor quality',
      'Wrong items',
      'Damaged packaging',
      'Items look old/expired',
      'Other',
    ];

    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Reason for Rejection',
          style: OkadaTypography.h3.copyWith(
            color: OkadaColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: reasons.map((reason) {
            return ListTile(
              title: Text(reason),
              onTap: () => Navigator.of(context).pop(reason),
            );
          }).toList(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('Cancel'),
          ),
        ],
      ),
    );
  }
}

/// Full Screen Photo Viewer
class _FullScreenPhotoViewer extends StatefulWidget {
  final List<String> photoUrls;
  final int initialIndex;

  const _FullScreenPhotoViewer({
    required this.photoUrls,
    required this.initialIndex,
  });

  @override
  State<_FullScreenPhotoViewer> createState() => _FullScreenPhotoViewerState();
}

class _FullScreenPhotoViewerState extends State<_FullScreenPhotoViewer> {
  late PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        leading: IconButton(
          icon: Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          '${_currentIndex + 1} of ${widget.photoUrls.length}',
          style: OkadaTypography.bodyLarge.copyWith(
            color: Colors.white,
          ),
        ),
      ),
      body: PageView.builder(
        controller: _pageController,
        itemCount: widget.photoUrls.length,
        onPageChanged: (index) => setState(() => _currentIndex = index),
        itemBuilder: (context, index) {
          return InteractiveViewer(
            minScale: 0.5,
            maxScale: 4.0,
            child: Center(
              child: Image.network(
                widget.photoUrls[index],
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 80,
                          color: Colors.white.withOpacity(0.5),
                        ),
                        SizedBox(height: OkadaSpacing.md),
                        Text(
                          'Failed to load photo',
                          style: OkadaTypography.bodyMedium.copyWith(
                            color: Colors.white.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          );
        },
      ),
    );
  }
}

