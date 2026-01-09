import 'package:flutter/material.dart';

/// Okada Platform Color System
/// 
/// Based on the Okada brand guidelines with primary green (#22C55E),
/// secondary blue (#3B82F6), and accent orange (#F97316).
/// Optimized for Cameroon market with high contrast for outdoor visibility.
abstract class OkadaColors {
  OkadaColors._();

  // ============================================
  // PRIMARY COLORS - Green (Brand Identity)
  // ============================================
  
  /// Primary green - Main brand color
  static const Color primary = Color(0xFF22C55E);
  
  /// Primary green shades
  static const Color primary50 = Color(0xFFF0FDF4);
  static const Color primary100 = Color(0xFFDCFCE7);
  static const Color primary200 = Color(0xFFBBF7D0);
  static const Color primary300 = Color(0xFF86EFAC);
  static const Color primary400 = Color(0xFF4ADE80);
  static const Color primary500 = Color(0xFF22C55E); // Main
  static const Color primary600 = Color(0xFF16A34A);
  static const Color primary700 = Color(0xFF15803D);
  static const Color primary800 = Color(0xFF166534);
  static const Color primary900 = Color(0xFF14532D);
  static const Color primary950 = Color(0xFF052E16);

  // ============================================
  // SECONDARY COLORS - Blue (Trust & Reliability)
  // ============================================
  
  /// Secondary blue - Supporting brand color
  static const Color secondary = Color(0xFF3B82F6);
  
  /// Secondary blue shades
  static const Color secondary50 = Color(0xFFEFF6FF);
  static const Color secondary100 = Color(0xFFDBEAFE);
  static const Color secondary200 = Color(0xFFBFDBFE);
  static const Color secondary300 = Color(0xFF93C5FD);
  static const Color secondary400 = Color(0xFF60A5FA);
  static const Color secondary500 = Color(0xFF3B82F6); // Main
  static const Color secondary600 = Color(0xFF2563EB);
  static const Color secondary700 = Color(0xFF1D4ED8);
  static const Color secondary800 = Color(0xFF1E40AF);
  static const Color secondary900 = Color(0xFF1E3A8A);
  static const Color secondary950 = Color(0xFF172554);

  // ============================================
  // ACCENT COLORS - Orange (Energy & Action)
  // ============================================
  
  /// Accent orange - Call to action, promotions
  static const Color accent = Color(0xFFF97316);
  
  /// Accent orange shades
  static const Color accent50 = Color(0xFFFFF7ED);
  static const Color accent100 = Color(0xFFFFEDD5);
  static const Color accent200 = Color(0xFFFED7AA);
  static const Color accent300 = Color(0xFFFDBA74);
  static const Color accent400 = Color(0xFFFB923C);
  static const Color accent500 = Color(0xFFF97316); // Main
  static const Color accent600 = Color(0xFFEA580C);
  static const Color accent700 = Color(0xFFC2410C);
  static const Color accent800 = Color(0xFF9A3412);
  static const Color accent900 = Color(0xFF7C2D12);
  static const Color accent950 = Color(0xFF431407);

  // ============================================
  // SEMANTIC COLORS
  // ============================================
  
  /// Success - Order completed, payment successful
  static const Color success = Color(0xFF22C55E);
  static const Color successLight = Color(0xFFDCFCE7);
  static const Color successDark = Color(0xFF15803D);
  
  /// Warning - Low stock, delivery delay
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color warningDark = Color(0xFFB45309);
  
  /// Error - Payment failed, out of stock
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color errorDark = Color(0xFFB91C1C);
  
  /// Info - Tips, notifications
  static const Color info = Color(0xFF3B82F6);
  static const Color infoLight = Color(0xFFDBEAFE);
  static const Color infoDark = Color(0xFF1D4ED8);

  // ============================================
  // NEUTRAL COLORS
  // ============================================
  
  /// Neutral gray scale
  static const Color neutral50 = Color(0xFFFAFAFA);
  static const Color neutral100 = Color(0xFFF5F5F5);
  static const Color neutral200 = Color(0xFFE5E5E5);
  static const Color neutral300 = Color(0xFFD4D4D4);
  static const Color neutral400 = Color(0xFFA3A3A3);
  static const Color neutral500 = Color(0xFF737373);
  static const Color neutral600 = Color(0xFF525252);
  static const Color neutral700 = Color(0xFF404040);
  static const Color neutral800 = Color(0xFF262626);
  static const Color neutral900 = Color(0xFF171717);
  static const Color neutral950 = Color(0xFF0A0A0A);

  // ============================================
  // BACKGROUND COLORS
  // ============================================
  
  /// Light theme backgrounds
  static const Color backgroundPrimary = Color(0xFFFFFFFF);
  static const Color backgroundSecondary = Color(0xFFF5F5F5);
  static const Color backgroundTertiary = Color(0xFFE5E5E5);
  
  /// Dark theme backgrounds
  static const Color backgroundPrimaryDark = Color(0xFF121212);
  static const Color backgroundSecondaryDark = Color(0xFF1E1E1E);
  static const Color backgroundTertiaryDark = Color(0xFF2D2D2D);

  // ============================================
  // TEXT COLORS
  // ============================================
  
  /// Light theme text
  static const Color textPrimary = Color(0xFF171717);
  static const Color textSecondary = Color(0xFF525252);
  static const Color textTertiary = Color(0xFF737373);
  static const Color textDisabled = Color(0xFFA3A3A3);
  static const Color textInverse = Color(0xFFFFFFFF);
  
  /// Dark theme text
  static const Color textPrimaryDark = Color(0xFFFAFAFA);
  static const Color textSecondaryDark = Color(0xFFA3A3A3);
  static const Color textTertiaryDark = Color(0xFF737373);
  static const Color textDisabledDark = Color(0xFF525252);

  // ============================================
  // BORDER COLORS
  // ============================================
  
  static const Color borderLight = Color(0xFFE5E5E5);
  static const Color borderMedium = Color(0xFFD4D4D4);
  static const Color borderDark = Color(0xFF404040);
  static const Color borderFocus = Color(0xFF22C55E);

  // ============================================
  // SURFACE COLORS
  // ============================================
  
  /// Card and elevated surface colors
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF5F5F5);
  static const Color surfaceDark = Color(0xFF1E1E1E);
  static const Color surfaceVariantDark = Color(0xFF2D2D2D);

  // ============================================
  // SPECIAL COLORS
  // ============================================
  
  /// MTN Mobile Money yellow
  static const Color mtnYellow = Color(0xFFFFCC00);
  
  /// Orange Money orange
  static const Color orangeMoney = Color(0xFFFF6600);
  
  /// Cash on delivery
  static const Color cashGreen = Color(0xFF10B981);
  
  /// Rider online status
  static const Color riderOnline = Color(0xFF22C55E);
  static const Color riderOffline = Color(0xFF6B7280);
  static const Color riderBusy = Color(0xFFF59E0B);

  // ============================================
  // OVERLAY COLORS
  // ============================================
  
  static const Color overlayLight = Color(0x1A000000); // 10% black
  static const Color overlayMedium = Color(0x4D000000); // 30% black
  static const Color overlayDark = Color(0x80000000); // 50% black
  static const Color overlayHeavy = Color(0xB3000000); // 70% black

  // ============================================
  // SHIMMER COLORS
  // ============================================
  
  static const Color shimmerBase = Color(0xFFE5E5E5);
  static const Color shimmerHighlight = Color(0xFFF5F5F5);
  static const Color shimmerBaseDark = Color(0xFF2D2D2D);
  static const Color shimmerHighlightDark = Color(0xFF404040);

  // ============================================
  // GRADIENT DEFINITIONS
  // ============================================
  
  /// Primary gradient (green)
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary400, primary600],
  );
  
  /// Secondary gradient (blue)
  static const LinearGradient secondaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [secondary400, secondary600],
  );
  
  /// Accent gradient (orange)
  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [accent400, accent600],
  );
  
  /// Success gradient
  static const LinearGradient successGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF4ADE80), Color(0xFF16A34A)],
  );

  // ============================================
  // HELPER METHODS
  // ============================================
  
  /// Get color with opacity
  static Color withOpacity(Color color, double opacity) {
    return color.withOpacity(opacity);
  }
  
  /// Get contrasting text color for a background
  static Color getContrastingTextColor(Color backgroundColor) {
    final luminance = backgroundColor.computeLuminance();
    return luminance > 0.5 ? textPrimary : textInverse;
  }
}
