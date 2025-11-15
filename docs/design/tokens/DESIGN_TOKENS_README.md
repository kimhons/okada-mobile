# Okada Platform Design Tokens

## Overview

This directory contains the complete design system tokens for the Okada e-commerce platform, extracted from the design system documentation and provided in multiple formats for easy integration into your development workflow.

---

## 📦 Available Formats

### 1. JSON (`design-tokens.json`)
**Best for**: Configuration files, design tools, documentation

```json
{
  "colors": {
    "brand": {
      "primary": {
        "value": "#2D8659",
        "description": "Okada Green - Primary brand color"
      }
    }
  }
}
```

**Usage**:
- Import into Figma, Sketch, or other design tools
- Use as configuration for Tailwind CSS or other CSS frameworks
- Reference in documentation

### 2. CSS Variables (`design-tokens.css`)
**Best for**: Web applications (React, Vue, Angular, vanilla JS)

```css
:root {
  --color-primary: #2D8659;
  --color-secondary: #FF8C42;
  --spacing-4: 16px;
}
```

**Usage**:
```css
/* Import in your main CSS file */
@import './design-tokens.css';

/* Use in your styles */
.button-primary {
  background-color: var(--color-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
}
```

**Utility Classes Available**:
```html
<h1 class="text-h1 text-primary">Welcome to Okada</h1>
<div class="bg-white p-4 rounded-lg shadow-md">
  <p class="text-body text-medium">Product description</p>
</div>
```

### 3. TypeScript/JavaScript (`design-tokens.ts`)
**Best for**: React Native, React, TypeScript projects

```typescript
import { colors, typography, spacing } from './design-tokens';

// React Native
<View style={{ backgroundColor: colors.brand.primary }}>
  <Text style={{ fontSize: typography.fontSize.h1.value }}>Hello</Text>
</View>

// React with styled-components
const Button = styled.button`
  background-color: ${colors.brand.primary};
  padding: ${spacing[4]}px;
  border-radius: ${borderRadius.md}px;
`;
```

**Helper Functions Available**:
```typescript
import { formatCurrency, formatPhoneNumber, calculateVAT } from './design-tokens';

formatCurrency(10000); // "10,000 FCFA"
formatPhoneNumber("650123456"); // "+237 650 123 456"
calculateVAT(10000); // 1925
calculateTotalWithVAT(10000); // 11925
```

---

## 🎨 Design Token Categories

### Colors
- **Brand Colors**: Primary (Okada Green), Secondary (Orange Accent)
- **Semantic Colors**: Success, Warning, Error, Info
- **Neutral Colors**: White, Black, Gray scale (50-900)
- **Badge Colors**: Status badges, Role badges
- **Localization Colors**: MTN (yellow), Orange Money (orange), Cameroon flag colors

### Typography
- **Font Family**: Inter (Sans-serif)
- **Font Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)
- **Font Sizes**: H1-H4, Body Large, Body, Body Small, Caption
- **Line Heights**: Optimized for readability (1.5x ratio)

### Spacing
- **Base Unit**: 4px
- **Scale**: 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px), 12 (48px), 16 (64px)

### Border Radius
- **Scale**: None, SM (4px), MD (8px), LG (12px), XL (16px), Full (9999px)

### Shadows
- **Scale**: None, SM, MD, LG, XL, 2XL
- **Native Shadows**: Optimized for React Native (iOS/Android)

### Animation
- **Duration**: Fast (150ms), Medium (300ms), Slow (500ms), Celebration (1000ms)
- **Easing**: Standard, Decelerate, Accelerate

### Components
- **Buttons**: Primary, Secondary, Destructive
- **Inputs**: Default, Focus, Error, Disabled states
- **Cards**: Standard, Elevated
- **Navigation**: Bottom Bar, Sidebar

---

## 🚀 Quick Start

### React Native

```typescript
// 1. Copy design-tokens.ts to your project
// 2. Import and use

import { colors, spacing, typography, components } from './design-tokens';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    padding: spacing[4],
  },
  title: {
    fontSize: typography.fontSize.h1.value,
    fontWeight: typography.fontWeight.bold,
    color: colors.brand.primary,
  },
  button: {
    ...components.button.primary,
  },
});
```

### React (Web)

```css
/* 1. Import CSS variables in your main CSS */
@import './design-tokens.css';

/* 2. Use in your components */
.container {
  background-color: var(--color-white);
  padding: var(--spacing-4);
}

.title {
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

/* Or use utility classes */
<div className="bg-white p-4">
  <h1 className="text-h1 text-primary">Title</h1>
</div>
```

### Tailwind CSS

```javascript
// tailwind.config.js
const designTokens = require('./design-tokens.json');

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: designTokens.colors.brand.primary.value,
        secondary: designTokens.colors.brand.secondary.value,
        success: designTokens.colors.semantic.success.value,
        // ... add more colors
      },
      spacing: {
        1: designTokens.spacing['1'].value,
        2: designTokens.spacing['2'].value,
        // ... add more spacing
      },
      borderRadius: {
        sm: designTokens.borderRadius.sm.value,
        md: designTokens.borderRadius.md.value,
        // ... add more radius
      },
    },
  },
};
```

---

## 🌍 Localization Tokens

### Currency (FCFA)
```typescript
import { formatCurrency, localization } from './design-tokens';

// Always use FCFA, not XAF
const price = 10000;
const formatted = formatCurrency(price); // "10,000 FCFA"

// Currency code
localization.currency.code; // "FCFA"
localization.currency.position; // "after"
```

### Phone Numbers (+237)
```typescript
import { formatPhoneNumber } from './design-tokens';

const phone = "650123456";
const formatted = formatPhoneNumber(phone); // "+237 650 123 456"
```

### Tax (VAT 19.25%)
```typescript
import { calculateVAT, calculateTotalWithVAT } from './design-tokens';

const baseAmount = 10000;
const vat = calculateVAT(baseAmount); // 1925
const total = calculateTotalWithVAT(baseAmount); // 11925
```

### Payment Methods
```typescript
import { colors } from './design-tokens';

// MTN Mobile Money
colors.localization.mtn; // "#FFCC00" (yellow)

// Orange Money
colors.localization.orange; // "#FF6600" (orange)
```

---

## 🎯 Key Differentiators

### 1. Quality Verification Photos
The design tokens support the quality verification photo feature with appropriate colors and spacing:

```typescript
// Camera interface
const cameraOverlay = {
  gridColor: colors.neutral.white,
  opacity: opacity[30],
  iconSize: icons.sizes.lg,
};

// Quality indicators
const qualityBadge = {
  good: colors.semantic.success,
  poor: colors.semantic.error,
  medium: colors.semantic.warning,
};
```

### 2. MTN/Orange Money
Dedicated color tokens for mobile money branding:

```typescript
// MTN Mobile Money (Yellow)
backgroundColor: colors.localization.mtn,

// Orange Money (Orange)
backgroundColor: colors.localization.orange,
```

### 3. Bilingual Support
Language preference tokens for regional customization:

```typescript
import { localization } from './design-tokens';

// Douala: 70% English, 30% French
localization.regions.douala.languagePreference.english; // 0.7

// Yaoundé: 60% English, 40% French
localization.regions.yaounde.languagePreference.english; // 0.6

// Bamenda: 85% English, 15% French (Anglophone region)
localization.regions.bamenda.languagePreference.english; // 0.85
```

---

## 📱 Platform-Specific Tokens

### Customer App
```typescript
platformSpecific.customerApp.screens; // 30
platformSpecific.customerApp.navigation; // "bottomTabBar"
platformSpecific.customerApp.tabs; // ["Home", "Categories", "Cart", "Orders", "Profile"]
```

### Seller App
```typescript
platformSpecific.sellerApp.screens; // 65
platformSpecific.sellerApp.tabs; // ["Dashboard", "Products", "Orders", "Analytics", "More"]
```

### Rider App
```typescript
platformSpecific.riderApp.screens; // 60
platformSpecific.riderApp.tabs; // ["Dashboard", "Orders", "Earnings", "Profile"]
```

### Admin Dashboard
```typescript
platformSpecific.adminDashboard.screens; // 78
platformSpecific.adminDashboard.navigation; // "leftSidebar + topHeader"
```

---

## ♿ Accessibility Tokens

### Touch Targets
```typescript
// iOS minimum touch target
accessibility.touchTarget.ios; // 44px

// Android minimum touch target
accessibility.touchTarget.android; // 48px

// Minimum spacing between targets
accessibility.touchTarget.spacing; // 8px
```

### Contrast Ratios
```typescript
// WCAG AA minimum for text on white
accessibility.contrast.textOnWhite; // 4.5:1

// WCAG AA minimum for interactive elements
accessibility.contrast.interactive; // 3:1
```

---

## 🔧 Development Workflow

### Step 1: Copy Design Tokens
Copy the appropriate file(s) to your project:
- React Native: `design-tokens.ts`
- React Web: `design-tokens.css` + `design-tokens.ts`
- Vue/Angular: `design-tokens.css`
- Other: `design-tokens.json`

### Step 2: Import and Use
```typescript
// React Native
import { colors, spacing, typography } from './design-tokens';

// React Web
import './design-tokens.css';
import { colors } from './design-tokens';
```

### Step 3: Create Components
```typescript
// Button component using design tokens
const PrimaryButton = styled.TouchableOpacity`
  background-color: ${colors.brand.primary};
  padding-vertical: ${components.button.primary.paddingVertical}px;
  padding-horizontal: ${components.button.primary.paddingHorizontal}px;
  border-radius: ${components.button.primary.borderRadius}px;
`;
```

### Step 4: Maintain Consistency
Always use design tokens instead of hardcoded values:

❌ **Don't do this:**
```typescript
<View style={{ backgroundColor: '#2D8659', padding: 16 }}>
```

✅ **Do this:**
```typescript
<View style={{ backgroundColor: colors.brand.primary, padding: spacing[4] }}>
```

---

## 📊 Token Coverage

| Category | Tokens | Coverage |
|----------|--------|----------|
| Colors | 50+ | ✅ Complete |
| Typography | 20+ | ✅ Complete |
| Spacing | 9 | ✅ Complete |
| Border Radius | 6 | ✅ Complete |
| Shadows | 6 | ✅ Complete |
| Components | 15+ | ✅ Complete |
| Localization | 10+ | ✅ Complete |
| Accessibility | 5+ | ✅ Complete |

---

## 🎨 Design System Alignment

These design tokens are extracted from the complete design system documented in `DESIGN_SYSTEM.md`. They represent the exact colors, spacing, typography, and other values used in all 233 high-fidelity mockups.

**Design System Files**:
- `DESIGN_SYSTEM.md` - Complete design system documentation
- `design-tokens.json` - JSON format for tools and configuration
- `design-tokens.css` - CSS variables for web applications
- `design-tokens.ts` - TypeScript/JavaScript for React/React Native
- `DESIGN_TOKENS_README.md` - This file

---

## 📞 Support

For questions about design tokens or the design system:
1. Review `DESIGN_SYSTEM.md` for detailed documentation
2. Check `SCREEN_INDEX.md` for screen-specific examples
3. Refer to the 233 high-fidelity mockups for visual reference

---

## ✅ Checklist for Developers

- [ ] Copy appropriate design token file(s) to your project
- [ ] Import design tokens in your main application file
- [ ] Replace all hardcoded colors with token references
- [ ] Replace all hardcoded spacing with token references
- [ ] Replace all hardcoded typography with token references
- [ ] Use helper functions for currency, phone numbers, and VAT
- [ ] Implement accessibility standards (touch targets, contrast)
- [ ] Test localization tokens (FCFA, +237, VAT 19.25%)
- [ ] Verify MTN/Orange Money branding colors
- [ ] Ensure bilingual support using language tokens

---

**Version**: 1.0.0  
**Last Updated**: April 2024  
**Platform**: Okada E-Commerce  
**Market**: Cameroon (Douala, Yaoundé, Bamenda)

