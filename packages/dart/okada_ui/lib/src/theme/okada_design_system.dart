import 'package:flutter/material.dart';

/// Okada Platform Design System
/// 
/// Based on the official Okada UI Branding Guide with colors derived from:
/// - Cameroon flag (green, red, yellow)
/// - Traditional Ndop cloth (indigo blue and white)
/// - Local market aesthetics
/// 
/// This class provides the exact design specifications from the branding guide.
abstract class OkadaDesignSystem {
  OkadaDesignSystem._();

  // ============================================
  // PRIMARY COLORS (From Cameroon Flag)
  // ============================================
  
  /// Okada Green - Primary brand color
  /// Derived from Cameroon flag green, represents hope and vegetation
  static const Color okadaGreen = Color(0xFF007A5E);
  
  /// Okada Red - Secondary brand color
  /// Derived from Cameroon flag red, represents unity
  static const Color okadaRed = Color(0xFFCE1126);
  
  /// Okada Yellow - Accent color
  /// Derived from Cameroon flag yellow, represents sunshine
  static const Color okadaYellow = Color(0xFFFCD116);

  // ============================================
  // SECONDARY COLORS (Cultural Elements)
  // ============================================
  
  /// Ndop Blue - Inspired by traditional Ndop cloth
  static const Color ndopBlue = Color(0xFF1A3263);
  
  /// Market White - Background inspired by local textiles
  static const Color marketWhite = Color(0xFFF7F3E9);

  // ============================================
  // ACCENT COLORS
  // ============================================
  
  /// Plantain Yellow - Highlights and calls to action
  static const Color plantainYellow = Color(0xFFFFE566);
  
  /// Chili Red - Notifications and alerts
  static const Color chiliRed = Color(0xFFE63946);
  
  /// Palm Green - Success states and secondary actions
  static const Color palmGreen = Color(0xFF2A9D8F);
  
  /// Textile Blue - Information and secondary elements
  static const Color textileBlue = Color(0xFF457B9D);

  // ============================================
  // NEUTRAL COLORS
  // ============================================
  
  /// Market Soil - Primary text color
  static const Color marketSoil = Color(0xFF5C4033);
  
  /// Basket Gray - Secondary text and disabled states
  static const Color basketGray = Color(0xFF8D99AE);
  
  /// Soft Clay - Backgrounds and dividers
  static const Color softClay = Color(0xFFE9ECEF);
  
  /// Pure White - Text on dark backgrounds
  static const Color pureWhite = Color(0xFFFFFFFF);

  // ============================================
  // FUNCTIONAL COLOR CODING
  // ============================================
  
  /// Success - Available, in stock, confirmation
  static const Color success = palmGreen;
  
  /// Warning - Pending, low stock, caution
  static const Color warning = okadaYellow;
  
  /// Error - Unavailable, out of stock, alert
  static const Color error = chiliRed;
  
  /// Info - Information, tips
  static const Color info = textileBlue;

  // ============================================
  // BACKGROUND COLORS
  // ============================================
  
  /// Primary Background
  static const Color backgroundPrimary = marketWhite;
  
  /// Secondary Background
  static const Color backgroundSecondary = pureWhite;
  
  /// Accent Background
  static const Color backgroundAccent = softClay;
  
  /// Dark Background
  static const Color backgroundDark = okadaGreen;

  // ============================================
  // TEXT COLORS
  // ============================================
  
  /// Primary Text on Light
  static const Color textPrimaryLight = marketSoil;
  
  /// Secondary Text on Light
  static const Color textSecondaryLight = basketGray;
  
  /// Primary Text on Dark
  static const Color textPrimaryDark = pureWhite;
  
  /// Secondary Text on Dark
  static const Color textSecondaryDark = softClay;

  // ============================================
  // TYPOGRAPHY SCALE (Mobile)
  // ============================================
  
  static const double fontSizeH1Mobile = 24.0;
  static const double fontSizeH2Mobile = 20.0;
  static const double fontSizeH3Mobile = 18.0;
  static const double fontSizeBody = 16.0;
  static const double fontSizeSmall = 14.0;
  static const double fontSizeButton = 16.0;
  static const double fontSizeNavigation = 16.0;

  // ============================================
  // TYPOGRAPHY SCALE (Web)
  // ============================================
  
  static const double fontSizeH1Web = 32.0;
  static const double fontSizeH2Web = 24.0;
  static const double fontSizeH3Web = 20.0;

  // ============================================
  // FONT WEIGHTS
  // ============================================
  
  static const FontWeight fontWeightBold = FontWeight.w700;
  static const FontWeight fontWeightSemibold = FontWeight.w600;
  static const FontWeight fontWeightMedium = FontWeight.w500;
  static const FontWeight fontWeightRegular = FontWeight.w400;

  // ============================================
  // SPACING SYSTEM (8px base unit)
  // ============================================
  
  static const double spacingXs = 4.0;
  static const double spacingSm = 8.0;
  static const double spacingMd = 16.0;
  static const double spacingLg = 24.0;
  static const double spacingXl = 32.0;
  static const double spacing2xl = 48.0;

  // ============================================
  // BORDER RADIUS
  // ============================================
  
  static const double radiusSmall = 4.0;
  static const double radiusMedium = 8.0;
  static const double radiusLarge = 12.0;
  static const double radiusXLarge = 16.0;
  static const double radiusRound = 999.0;

  // ============================================
  // SHADOWS
  // ============================================
  
  static const List<BoxShadow> shadowSmall = [
    BoxShadow(
      color: Color(0x1A000000),
      blurRadius: 4,
      offset: Offset(0, 2),
    ),
  ];
  
  static const List<BoxShadow> shadowMedium = [
    BoxShadow(
      color: Color(0x1A000000),
      blurRadius: 8,
      offset: Offset(0, 4),
    ),
  ];
  
  static const List<BoxShadow> shadowLarge = [
    BoxShadow(
      color: Color(0x1A000000),
      blurRadius: 16,
      offset: Offset(0, 8),
    ),
  ];

  // ============================================
  // GRADIENTS
  // ============================================
  
  /// Primary gradient using Okada Green
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [okadaGreen, Color(0xFF005A44)],
  );
  
  /// Cameroon flag gradient
  static const LinearGradient cameroonGradient = LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [okadaGreen, okadaRed, okadaYellow],
  );
  
  /// Ndop-inspired gradient
  static const LinearGradient ndopGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [ndopBlue, Color(0xFF2A4A7A)],
  );

  // ============================================
  // PAYMENT PROVIDER COLORS
  // ============================================
  
  /// MTN Mobile Money yellow
  static const Color mtnMobileMoneyYellow = Color(0xFFFFCC00);
  
  /// Orange Money orange
  static const Color orangeMoneyOrange = Color(0xFFFF6600);

  // ============================================
  // CULTURAL SYMBOLS
  // ============================================
  
  /// Crocodile - Represents adaptability (used in onboarding)
  /// Sun - Represents prosperity (used in earnings displays)
  /// Linked Hearts - Represents unity (used in community features)
  
  // Symbol colors
  static const Color symbolCrocodile = ndopBlue;
  static const Color symbolSun = okadaYellow;
  static const Color symbolLinkedHearts = okadaRed;

  // ============================================
  // HELPER METHODS
  // ============================================
  
  /// Get text color based on background luminance
  static Color getTextColorForBackground(Color background) {
    final luminance = background.computeLuminance();
    return luminance > 0.5 ? textPrimaryLight : textPrimaryDark;
  }
  
  /// Create a color with Cameroon flag-inspired tint
  static Color withCameroonTint(Color base, double amount) {
    return Color.lerp(base, okadaGreen, amount) ?? base;
  }

  // ============================================
  // NDOP PATTERN COLORS
  // ============================================
  
  /// Ndop pattern primary color (indigo)
  static const Color ndopPatternPrimary = ndopBlue;
  
  /// Ndop pattern secondary color (white)
  static const Color ndopPatternSecondary = pureWhite;
  
  /// Ndop pattern accent (for highlights)
  static const Color ndopPatternAccent = Color(0xFF3A5A83);
}

/// Extension to convert OkadaDesignSystem colors to Material ColorScheme
extension OkadaColorScheme on OkadaDesignSystem {
  static ColorScheme get lightColorScheme => const ColorScheme.light(
    primary: OkadaDesignSystem.okadaGreen,
    onPrimary: OkadaDesignSystem.pureWhite,
    primaryContainer: OkadaDesignSystem.marketWhite,
    onPrimaryContainer: OkadaDesignSystem.okadaGreen,
    secondary: OkadaDesignSystem.ndopBlue,
    onSecondary: OkadaDesignSystem.pureWhite,
    secondaryContainer: OkadaDesignSystem.softClay,
    onSecondaryContainer: OkadaDesignSystem.ndopBlue,
    tertiary: OkadaDesignSystem.okadaYellow,
    onTertiary: OkadaDesignSystem.marketSoil,
    tertiaryContainer: OkadaDesignSystem.plantainYellow,
    onTertiaryContainer: OkadaDesignSystem.marketSoil,
    error: OkadaDesignSystem.chiliRed,
    onError: OkadaDesignSystem.pureWhite,
    surface: OkadaDesignSystem.pureWhite,
    onSurface: OkadaDesignSystem.marketSoil,
    surfaceContainerHighest: OkadaDesignSystem.softClay,
    onSurfaceVariant: OkadaDesignSystem.basketGray,
    outline: OkadaDesignSystem.basketGray,
    outlineVariant: OkadaDesignSystem.softClay,
  );
  
  static ColorScheme get darkColorScheme => const ColorScheme.dark(
    primary: OkadaDesignSystem.okadaGreen,
    onPrimary: OkadaDesignSystem.pureWhite,
    primaryContainer: Color(0xFF004D3B),
    onPrimaryContainer: OkadaDesignSystem.marketWhite,
    secondary: OkadaDesignSystem.textileBlue,
    onSecondary: OkadaDesignSystem.pureWhite,
    secondaryContainer: OkadaDesignSystem.ndopBlue,
    onSecondaryContainer: OkadaDesignSystem.softClay,
    tertiary: OkadaDesignSystem.okadaYellow,
    onTertiary: OkadaDesignSystem.marketSoil,
    tertiaryContainer: Color(0xFFB39500),
    onTertiaryContainer: OkadaDesignSystem.pureWhite,
    error: OkadaDesignSystem.chiliRed,
    onError: OkadaDesignSystem.pureWhite,
    surface: Color(0xFF1A1A1A),
    onSurface: OkadaDesignSystem.softClay,
    surfaceContainerHighest: Color(0xFF2D2D2D),
    onSurfaceVariant: OkadaDesignSystem.basketGray,
    outline: OkadaDesignSystem.basketGray,
    outlineVariant: Color(0xFF404040),
  );
}
