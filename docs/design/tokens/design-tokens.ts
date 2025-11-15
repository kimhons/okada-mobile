/**
 * Okada Platform Design Tokens - TypeScript/JavaScript
 * Version: 1.0.0
 * Last Updated: April 2024
 * 
 * Usage (React Native / React):
 * import { colors, typography, spacing } from './design-tokens';
 * 
 * Example:
 * <View style={{ backgroundColor: colors.brand.primary }}>
 *   <Text style={{ fontSize: typography.fontSize.h1.value }}>Hello</Text>
 * </View>
 */

export const designTokens = {
  name: "Okada Platform Design Tokens",
  version: "1.0.0",
  description: "Complete design system tokens for Okada e-commerce platform (Cameroon market)",
  lastUpdated: "2024-04-01",
};

// ========================================
// COLORS
// ========================================

export const colors = {
  brand: {
    primary: "#2D8659",
    primaryHover: "#236B47",
    primaryActive: "#1A5235",
    secondary: "#FF8C42",
  },
  semantic: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  neutral: {
    white: "#FFFFFF",
    black: "#000000",
    gray: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
    darkText: "#1A1A1A",
    mediumText: "#6B7280",
  },
  badges: {
    status: {
      completed: {
        background: "#10B981",
        text: "#FFFFFF",
      },
      pending: {
        background: "#F59E0B",
        text: "#1A1A1A",
      },
      cancelled: {
        background: "#EF4444",
        text: "#FFFFFF",
      },
      processing: {
        background: "#3B82F6",
        text: "#FFFFFF",
      },
    },
    roles: {
      customer: {
        background: "#D1FAE5",
        text: "#10B981",
      },
      seller: {
        background: "#FEF3C7",
        text: "#F59E0B",
      },
      rider: {
        background: "#DBEAFE",
        text: "#3B82F6",
      },
      admin: {
        background: "#E9D5FF",
        text: "#9333EA",
      },
    },
  },
  localization: {
    mtn: "#FFCC00",
    orange: "#FF6600",
    cameroon: {
      green: "#007A5E",
      red: "#CE1126",
      yellow: "#FCD116",
    },
  },
} as const;

// ========================================
// TYPOGRAPHY
// ========================================

export const typography = {
  fontFamily: {
    primary: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontSize: {
    h1: {
      value: 32,
      lineHeight: 40,
      fontWeight: 700,
    },
    h2: {
      value: 24,
      lineHeight: 32,
      fontWeight: 700,
    },
    h3: {
      value: 20,
      lineHeight: 28,
      fontWeight: 600,
    },
    h4: {
      value: 18,
      lineHeight: 24,
      fontWeight: 600,
    },
    bodyLarge: {
      value: 16,
      lineHeight: 24,
      fontWeight: 400,
    },
    body: {
      value: 14,
      lineHeight: 20,
      fontWeight: 400,
    },
    bodySmall: {
      value: 12,
      lineHeight: 16,
      fontWeight: 400,
    },
    caption: {
      value: 10,
      lineHeight: 14,
      fontWeight: 500,
    },
  },
  letterSpacing: {
    tight: -0.02,
    normal: 0,
    wide: 0.02,
  },
} as const;

// ========================================
// SPACING
// ========================================

export const spacing = {
  0: 0,
  1: 4,   // XXS
  2: 8,   // XS
  3: 12,  // S
  4: 16,  // M - Base unit
  6: 24,  // L
  8: 32,  // XL
  12: 48, // XXL
  16: 64, // XXXL
} as const;

// ========================================
// BORDER RADIUS
// ========================================

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ========================================
// SHADOWS
// ========================================

export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  lg: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  xl: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  "2xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
} as const;

// React Native shadow tokens (iOS)
export const shadowsNative = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  xl: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  "2xl": {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
} as const;

// ========================================
// BORDERS
// ========================================

export const borders = {
  width: {
    none: 0,
    thin: 1,
    medium: 2,
    thick: 4,
  },
  color: {
    default: "#E5E7EB",
    light: "#D1D5DB",
    dark: "#9CA3AF",
    primary: "#2D8659",
    error: "#EF4444",
  },
} as const;

// ========================================
// OPACITY
// ========================================

export const opacity = {
  0: 0,
  10: 0.1,
  20: 0.2,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  80: 0.8,
  90: 0.9,
  100: 1,
} as const;

// ========================================
// ANIMATION
// ========================================

export const animation = {
  duration: {
    fast: 150,
    medium: 300,
    slow: 500,
    celebration: 1000,
  },
  easing: {
    standard: "cubic-bezier(0.4, 0.0, 0.2, 1)",
    decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)",
    accelerate: "cubic-bezier(0.4, 0.0, 1, 1)",
  },
} as const;

// ========================================
// BREAKPOINTS
// ========================================

export const breakpoints = {
  mobile: {
    min: 375,
    max: 428,
  },
  tablet: {
    min: 768,
    max: 1024,
  },
  desktop: {
    min: 1280,
  },
} as const;

// ========================================
// GRID
// ========================================

export const grid = {
  mobile: {
    columns: 4,
    gutter: 16,
    margin: 16,
  },
  tablet: {
    columns: 8,
    gutter: 24,
    margin: 32,
  },
  desktop: {
    columns: 12,
    gutter: 24,
    margin: 48,
  },
} as const;

// ========================================
// COMPONENTS
// ========================================

export const components = {
  button: {
    primary: {
      background: colors.brand.primary,
      backgroundHover: colors.brand.primaryHover,
      backgroundActive: colors.brand.primaryActive,
      backgroundDisabled: colors.neutral.gray[300],
      text: colors.neutral.white,
      fontSize: 16,
      fontWeight: typography.fontWeight.semibold,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: borderRadius.md,
      opacityDisabled: opacity[50],
    },
    secondary: {
      background: colors.neutral.white,
      borderWidth: 2,
      borderColor: colors.brand.primary,
      text: colors.brand.primary,
      fontSize: 16,
      fontWeight: typography.fontWeight.semibold,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: borderRadius.md,
    },
    destructive: {
      background: colors.semantic.error,
      text: colors.neutral.white,
      fontSize: 16,
      fontWeight: typography.fontWeight.semibold,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: borderRadius.md,
    },
  },
  input: {
    default: {
      borderWidth: 1,
      borderColor: colors.neutral.gray[300],
      borderRadius: borderRadius.md,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: typography.fontSize.body.value,
      fontWeight: typography.fontWeight.regular,
    },
    focus: {
      borderWidth: 2,
      borderColor: colors.brand.primary,
    },
    error: {
      borderWidth: 2,
      borderColor: colors.semantic.error,
    },
    disabled: {
      backgroundColor: colors.neutral.gray[100],
      opacity: opacity[50],
    },
  },
  card: {
    standard: {
      backgroundColor: colors.neutral.white,
      borderWidth: 1,
      borderColor: colors.neutral.gray[200],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      ...shadowsNative.md,
    },
    elevated: {
      backgroundColor: colors.neutral.white,
      borderWidth: 1,
      borderColor: colors.neutral.gray[200],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      ...shadowsNative.lg,
    },
  },
  navigation: {
    bottomBar: {
      height: 64,
      backgroundColor: colors.neutral.white,
      iconSize: 24,
      activeColor: colors.brand.primary,
      inactiveColor: colors.neutral.gray[500],
    },
    sidebar: {
      width: 240,
      backgroundColor: colors.neutral.gray[800],
      activeBackground: colors.brand.primary,
      hoverBackground: colors.neutral.gray[700],
    },
  },
} as const;

// ========================================
// ICONS
// ========================================

export const icons = {
  sizes: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },
  strokeWidth: {
    thin: 1,
    default: 2,
    thick: 3,
  },
} as const;

// ========================================
// ACCESSIBILITY
// ========================================

export const accessibility = {
  touchTarget: {
    ios: 44,
    android: 48,
    spacing: 8,
  },
  contrast: {
    textOnWhite: 4.5,
    interactive: 3,
  },
  typography: {
    minSize: 12,
    lineHeightRatio: 1.5,
  },
} as const;

// ========================================
// LOCALIZATION
// ========================================

export const localization = {
  currency: {
    code: "FCFA",
    symbol: "FCFA",
    position: "after",
  },
  phoneNumber: {
    countryCode: "+237",
    format: "+237 6XX XXX XXX",
  },
  tax: {
    vat: {
      rate: 0.1925,
      percentage: "19.25%",
    },
  },
  languages: {
    primary: "en",
    secondary: "fr",
  },
  regions: {
    douala: {
      name: "Douala",
      languagePreference: {
        english: 0.7,
        french: 0.3,
      },
    },
    yaounde: {
      name: "Yaoundé",
      languagePreference: {
        english: 0.6,
        french: 0.4,
      },
    },
    bamenda: {
      name: "Bamenda",
      languagePreference: {
        english: 0.85,
        french: 0.15,
      },
    },
  },
} as const;

// ========================================
// PLATFORM SPECIFIC
// ========================================

export const platformSpecific = {
  customerApp: {
    screens: 30,
    navigation: "bottomTabBar",
    tabs: ["Home", "Categories", "Cart", "Orders", "Profile"],
  },
  sellerApp: {
    screens: 65,
    navigation: "bottomTabBar + hamburgerMenu",
    tabs: ["Dashboard", "Products", "Orders", "Analytics", "More"],
  },
  riderApp: {
    screens: 60,
    navigation: "bottomTabBar + quickActions",
    tabs: ["Dashboard", "Orders", "Earnings", "Profile"],
  },
  adminDashboard: {
    screens: 78,
    navigation: "leftSidebar + topHeader",
    sections: [
      "Dashboard",
      "Orders",
      "Users",
      "Riders",
      "Sellers",
      "Products",
      "Analytics",
      "Reports",
      "Settings",
    ],
  },
} as const;

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Format currency in FCFA
 * @param amount - The amount to format
 * @returns Formatted currency string
 * @example formatCurrency(10000) => "10,000 FCFA"
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('en-US')} ${localization.currency.code}`;
};

/**
 * Format phone number in Cameroon format
 * @param phoneNumber - The phone number to format (without country code)
 * @returns Formatted phone number
 * @example formatPhoneNumber("650123456") => "+237 650 123 456"
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `${localization.phoneNumber.countryCode} ${match[1]} ${match[2]} ${match[3]}`;
  }
  return phoneNumber;
};

/**
 * Calculate VAT amount
 * @param amount - The base amount
 * @returns VAT amount
 * @example calculateVAT(10000) => 1925
 */
export const calculateVAT = (amount: number): number => {
  return amount * localization.tax.vat.rate;
};

/**
 * Calculate total with VAT
 * @param amount - The base amount
 * @returns Total amount including VAT
 * @example calculateTotalWithVAT(10000) => 11925
 */
export const calculateTotalWithVAT = (amount: number): number => {
  return amount * (1 + localization.tax.vat.rate);
};

// ========================================
// TYPE EXPORTS
// ========================================

export type Color = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadow = typeof shadows;
export type Border = typeof borders;
export type Opacity = typeof opacity;
export type Animation = typeof animation;
export type Breakpoint = typeof breakpoints;
export type Grid = typeof grid;
export type Component = typeof components;
export type Icon = typeof icons;
export type Accessibility = typeof accessibility;
export type Localization = typeof localization;
export type PlatformSpecific = typeof platformSpecific;

// Default export
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  shadowsNative,
  borders,
  opacity,
  animation,
  breakpoints,
  grid,
  components,
  icons,
  accessibility,
  localization,
  platformSpecific,
  formatCurrency,
  formatPhoneNumber,
  calculateVAT,
  calculateTotalWithVAT,
};

