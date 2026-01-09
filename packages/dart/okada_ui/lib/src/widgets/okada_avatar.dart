import 'package:flutter/material.dart';
import '../theme/okada_colors.dart';
import '../theme/okada_typography.dart';

enum OkadaAvatarSize { xs, sm, md, lg, xl }

/// Okada Platform Avatar Widget
class OkadaAvatar extends StatelessWidget {
  final String? imageUrl;
  final String? name;
  final OkadaAvatarSize size;
  final Color? backgroundColor;
  final VoidCallback? onTap;
  final bool showOnlineIndicator;
  final bool isOnline;

  const OkadaAvatar({
    super.key,
    this.imageUrl,
    this.name,
    this.size = OkadaAvatarSize.md,
    this.backgroundColor,
    this.onTap,
    this.showOnlineIndicator = false,
    this.isOnline = false,
  });

  @override
  Widget build(BuildContext context) {
    final dimension = _getDimension();
    
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        children: [
          Container(
            width: dimension,
            height: dimension,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: backgroundColor ?? OkadaColors.primary100,
              image: imageUrl != null ? DecorationImage(
                image: NetworkImage(imageUrl!),
                fit: BoxFit.cover,
                onError: (_, __) {},
              ) : null,
            ),
            child: imageUrl == null ? Center(child: _buildInitials()) : null,
          ),
          if (showOnlineIndicator)
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                width: dimension * 0.3,
                height: dimension * 0.3,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isOnline ? OkadaColors.riderOnline : OkadaColors.riderOffline,
                  border: Border.all(color: Colors.white, width: 2),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildInitials() {
    if (name == null || name!.isEmpty) {
      return Icon(Icons.person, size: _getDimension() * 0.5, color: OkadaColors.primary);
    }
    
    final initials = name!.split(' ')
        .take(2)
        .map((word) => word.isNotEmpty ? word[0].toUpperCase() : '')
        .join();
    
    return Text(
      initials,
      style: _getTextStyle().copyWith(color: OkadaColors.primary700),
    );
  }

  double _getDimension() {
    switch (size) {
      case OkadaAvatarSize.xs: return 24;
      case OkadaAvatarSize.sm: return 32;
      case OkadaAvatarSize.md: return 40;
      case OkadaAvatarSize.lg: return 56;
      case OkadaAvatarSize.xl: return 80;
    }
  }

  TextStyle _getTextStyle() {
    switch (size) {
      case OkadaAvatarSize.xs: return OkadaTypography.labelSmall;
      case OkadaAvatarSize.sm: return OkadaTypography.labelMedium;
      case OkadaAvatarSize.md: return OkadaTypography.titleSmall;
      case OkadaAvatarSize.lg: return OkadaTypography.titleMedium;
      case OkadaAvatarSize.xl: return OkadaTypography.headlineSmall;
    }
  }
}
