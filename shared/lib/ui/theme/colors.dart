import 'package:flutter/material.dart';

/// Okada Platform Design Tokens - Colors
/// Generated from design-tokens.json
/// Version: 1.0.0
/// Last Updated: 2024-04-01

class OkadaColors {
  OkadaColors._(); // Private constructor to prevent instantiation

  // ============================================================================
  // BRAND COLORS
  // ============================================================================

  /// Okada Green - Primary brand color
  /// Usage: Primary buttons, active states, success messages, branding
  static const Color primary = Color(0xFF2D8659);

  /// Okada Green hover state
  static const Color primaryHover = Color(0xFF236B47);

  /// Okada Green active/pressed state
  static const Color primaryActive = Color(0xFF1A5235);

  /// Orange Accent - Secondary brand color
  /// Usage: Logo, highlights, warnings, call-to-action elements
  static const Color secondary = Color(0xFFFF8C42);

  // ============================================================================
  // SEMANTIC COLORS
  // ============================================================================

  /// Success Green
  /// Usage: Completed, verified, active states
  static const Color success = Color(0xFF10B981);

  /// Warning Yellow
  /// Usage: Pending, caution states
  static const Color warning = Color(0xFFF59E0B);

  /// Error Red
  /// Usage: Failed, rejected, error states
  static const Color error = Color(0xFFEF4444);

  /// Info Blue
  /// Usage: Information, links
  static const Color info = Color(0xFF3B82F6);

  // ============================================================================
  // NEUTRAL COLORS
  // ============================================================================

  /// Pure white
  /// Usage: Primary background, text on dark backgrounds
  static const Color white = Color(0xFFFFFFFF);

  /// Pure black
  static const Color black = Color(0xFF000000);

  // Gray scale
  static const Color gray50 = Color(0xFFF9FAFB);
  static const Color gray100 = Color(0xFFF3F4F6);
  static const Color gray200 = Color(0xFFE5E7EB);
  static const Color gray300 = Color(0xFFD1D5DB);
  static const Color gray400 = Color(0xFF9CA3AF);
  static const Color gray500 = Color(0xFF6B7280);
  static const Color gray600 = Color(0xFF4B5563);
  static const Color gray700 = Color(0xFF374151);
  static const Color gray800 = Color(0xFF1F2937);
  static const Color gray900 = Color(0xFF111827);

  // ============================================================================
  // TEXT COLORS
  // ============================================================================

  /// Primary text color (dark gray)
  static const Color textPrimary = Color(0xFF111827);

  /// Secondary text color (medium gray)
  static const Color textSecondary = Color(0xFF6B7280);

  /// Disabled text color (light gray)
  static const Color textDisabled = Color(0xFF9CA3AF);

  /// Text on primary color (white)
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // ============================================================================
  // BACKGROUND COLORS
  // ============================================================================

  /// Primary background (white)
  static const Color backgroundPrimary = Color(0xFFFFFFFF);

  /// Secondary background (very light gray)
  static const Color backgroundSecondary = Color(0xFFF9FAFB);

  /// Tertiary background (light gray)
  static const Color backgroundTertiary = Color(0xFFF3F4F6);

  // ============================================================================
  // BORDER COLORS
  // ============================================================================

  /// Default border color (light gray)
  static const Color borderDefault = Color(0xFFE5E7EB);

  /// Focus border color (primary)
  static const Color borderFocus = Color(0xFF2D8659);

  /// Error border color (error red)
  static const Color borderError = Color(0xFFEF4444);

  // ============================================================================
  // PAYMENT METHOD COLORS (Cameroon-specific)
  // ============================================================================

  /// MTN Mobile Money yellow
  static const Color mtnYellow = Color(0xFFFFCC00);

  /// Orange Money orange
  static const Color orangeMoney = Color(0xFFFF6600);

  // ============================================================================
  // OVERLAY COLORS
  // ============================================================================

  /// Modal overlay (black with 50% opacity)
  static const Color overlayDark = Color(0x80000000);

  /// Light overlay (white with 90% opacity)
  static const Color overlayLight = Color(0xE6FFFFFF);

  // ============================================================================
  // SHADOW COLORS
  // ============================================================================

  /// Shadow color (black with 10% opacity)
  static const Color shadowSm = Color(0x1A000000);

  /// Medium shadow color (black with 15% opacity)
  static const Color shadowMd = Color(0x26000000);

  /// Large shadow color (black with 25% opacity)
  static const Color shadowLg = Color(0x40000000);

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /// Get color by name (useful for dynamic theming)
  static Color? getColorByName(String name) {
    switch (name.toLowerCase()) {
      case 'primary':
        return primary;
      case 'secondary':
        return secondary;
      case 'success':
        return success;
      case 'warning':
        return warning;
      case 'error':
        return error;
      case 'info':
        return info;
      default:
        return null;
    }
  }

  /// Get semantic color with opacity
  static Color withOpacity(Color color, double opacity) {
    return color.withOpacity(opacity);
  }
}

