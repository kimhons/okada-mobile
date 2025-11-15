# Okada Platform Design System

## Overview

This document outlines the complete design system for the Okada e-commerce platform, covering all 233 high-fidelity mockups across Customer App, Seller App, Rider App, and Admin Dashboard.

---

## Brand Identity

### Logo
- **Primary Logo**: Orange circle with motorcycle rider icon + "Okada" wordmark
- **Color**: Okada Green (#2D8659) and Orange accent
- **Usage**: App headers, splash screens, marketing materials

### Brand Colors

#### Primary Colors
- **Okada Green**: `#2D8659` (Primary brand color)
  - Used for: Primary buttons, active states, success messages, branding
- **Orange Accent**: `#FF8C42` (Secondary brand color)
  - Used for: Logo, highlights, warnings, call-to-action elements

#### Neutral Colors
- **Dark Gray**: `#1A1A1A` (Text, headers)
- **Medium Gray**: `#6B7280` (Secondary text)
- **Light Gray**: `#F3F4F6` (Backgrounds, cards)
- **White**: `#FFFFFF` (Primary background)

#### Semantic Colors
- **Success Green**: `#10B981` (Completed, verified, active)
- **Warning Yellow**: `#F59E0B` (Pending, caution)
- **Error Red**: `#EF4444` (Failed, rejected, errors)
- **Info Blue**: `#3B82F6` (Information, links)

### Typography

#### Font Family
- **Primary**: Inter (Sans-serif)
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

#### Type Scale
- **H1**: 32px / Bold / Line height 40px
- **H2**: 24px / Bold / Line height 32px
- **H3**: 20px / Semibold / Line height 28px
- **H4**: 18px / Semibold / Line height 24px
- **Body Large**: 16px / Regular / Line height 24px
- **Body**: 14px / Regular / Line height 20px
- **Body Small**: 12px / Regular / Line height 16px
- **Caption**: 10px / Medium / Line height 14px

---

## Components

### Buttons

#### Primary Button
- **Background**: Okada Green (#2D8659)
- **Text**: White, 16px, Semibold
- **Padding**: 16px 24px
- **Border Radius**: 8px
- **States**:
  - Hover: Darker green (#236B47)
  - Active: Even darker (#1A5235)
  - Disabled: Gray (#D1D5DB), 50% opacity

#### Secondary Button
- **Background**: White
- **Border**: 2px solid Okada Green
- **Text**: Okada Green, 16px, Semibold
- **Padding**: 16px 24px
- **Border Radius**: 8px

#### Destructive Button
- **Background**: Error Red (#EF4444)
- **Text**: White, 16px, Semibold
- **Padding**: 16px 24px
- **Border Radius**: 8px

### Input Fields

#### Text Input
- **Border**: 1px solid #D1D5DB
- **Border Radius**: 8px
- **Padding**: 12px 16px
- **Font**: 14px Regular
- **States**:
  - Focus: 2px solid Okada Green, shadow
  - Error: 2px solid Error Red
  - Disabled: Gray background, 50% opacity

#### Dropdown
- **Same as Text Input** + chevron icon on right

#### Search Bar
- **Same as Text Input** + search icon on left

### Cards

#### Standard Card
- **Background**: White
- **Border**: 1px solid #E5E7EB
- **Border Radius**: 12px
- **Padding**: 16px
- **Shadow**: 0px 1px 3px rgba(0, 0, 0, 0.1)

#### Elevated Card
- **Same as Standard Card**
- **Shadow**: 0px 4px 6px rgba(0, 0, 0, 0.1)

### Badges

#### Status Badges
- **Completed/Active**: Green background, white text
- **Pending**: Yellow background, dark text
- **Cancelled/Failed**: Red background, white text
- **Processing**: Blue background, white text

#### Role Badges
- **Customer**: Light green background, green text
- **Seller**: Light yellow background, yellow text
- **Rider**: Light blue background, blue text
- **Admin**: Light purple background, purple text

### Navigation

#### Bottom Navigation (Mobile Apps)
- **Height**: 64px
- **Background**: White
- **Icons**: 24x24px
- **Active State**: Okada Green icon + label
- **Inactive State**: Gray icon + label

#### Sidebar (Admin Dashboard)
- **Width**: 240px
- **Background**: Dark gray (#1F2937)
- **Active Item**: Okada Green background
- **Hover**: Lighter gray background

---

## Iconography

### Icon Style
- **Style**: Outline (2px stroke)
- **Sizes**: 16px, 20px, 24px, 32px
- **Color**: Inherits from parent or Medium Gray

### Key Icons
- **Home**: House outline
- **Search**: Magnifying glass
- **Cart**: Shopping cart
- **User**: Person outline
- **Settings**: Gear
- **Notifications**: Bell
- **Camera**: Camera outline (for Quality Verification!)
- **Money**: Currency/wallet icons (MTN/Orange Money logos)
- **Location**: Pin/marker
- **Star**: Rating star (filled or outline)

---

## Spacing System

### Base Unit: 4px

- **XXS**: 4px
- **XS**: 8px
- **S**: 12px
- **M**: 16px
- **L**: 24px
- **XL**: 32px
- **XXL**: 48px
- **XXXL**: 64px

---

## Grid System

### Mobile Apps (375px - 428px)
- **Columns**: 4
- **Gutter**: 16px
- **Margin**: 16px

### Tablet (768px - 1024px)
- **Columns**: 8
- **Gutter**: 24px
- **Margin**: 32px

### Desktop/Admin Dashboard (1280px+)
- **Columns**: 12
- **Gutter**: 24px
- **Margin**: 48px

---

## Key Differentiators in Design

### 1. Quality Verification Photos (PRIMARY DIFFERENTIATOR!)

#### Visual Treatment
- **Camera Interface**: Grid overlay, flash toggle, gallery access
- **Photo Review**: 3-photo grid with quality indicators
- **Approval State**: Elegant waiting screen with clock icon
- **Impact Metrics**: Displayed prominently in analytics (4.9★ vs 4.2★)

#### Design Principles
- Make photo capture **easy and intuitive**
- Provide **real-time feedback** on photo quality
- Show **clear value** to customers (higher satisfaction, fewer returns)
- Celebrate **success** when photos are approved

### 2. MTN/Orange Money Integration

#### Visual Treatment
- **MTN Logo**: Yellow background with "MTN" text
- **Orange Money Logo**: Orange/black with "Orange Money" text
- **Phone Numbers**: Always show +237 country code
- **Currency**: Always display FCFA (not XAF)

#### Design Principles
- Make mobile money the **default** payment method
- Show **logos prominently** for easy recognition
- Display **transaction fees** transparently
- Provide **instant confirmation** of payments

### 3. Bilingual Support (English/French)

#### Visual Treatment
- **Language Toggle**: English/French switch in settings
- **Flag Icons**: UK flag for English, French flag for French
- **Translation Preview**: Show sample text in selected language

#### Design Principles
- Make language switching **seamless**
- Provide **100% translation coverage** for core features
- Respect **regional preferences** (Douala more English, Yaoundé more French)
- Show **bilingual content** in marketing materials

### 4. Cameroon Localization

#### Visual Treatment
- **Maps**: Show Douala, Yaoundé, Bamenda with accurate geography
- **Names**: Use authentic Cameroonian names throughout
- **Phone Numbers**: +237 format
- **Addresses**: Real Douala/Yaoundé street names
- **Currency**: FCFA everywhere
- **Tax**: 19.25% VAT

#### Design Principles
- Make the platform feel **locally relevant**
- Use **real locations** that users recognize
- Show **cultural understanding** through naming and imagery
- Provide **local payment methods** (MTN/Orange Money)

---

## Responsive Breakpoints

- **Mobile**: 375px - 428px (Primary target for Customer/Seller/Rider apps)
- **Tablet**: 768px - 1024px
- **Desktop**: 1280px+ (Admin Dashboard)

---

## Accessibility

### Color Contrast
- **Text on White**: Minimum 4.5:1 ratio
- **Text on Okada Green**: White text for maximum contrast
- **Interactive Elements**: Minimum 3:1 ratio

### Touch Targets
- **Minimum Size**: 44x44px (iOS) / 48x48px (Android)
- **Spacing**: Minimum 8px between targets

### Typography
- **Minimum Size**: 12px for body text
- **Line Height**: 1.5x font size for readability

---

## Animation & Motion

### Timing
- **Fast**: 150ms (Hover, focus)
- **Medium**: 300ms (Page transitions, modals)
- **Slow**: 500ms (Complex animations, celebrations)

### Easing
- **Standard**: cubic-bezier(0.4, 0.0, 0.2, 1)
- **Decelerate**: cubic-bezier(0.0, 0.0, 0.2, 1)
- **Accelerate**: cubic-bezier(0.4, 0.0, 1, 1)

### Key Animations
- **Page Transitions**: Slide from right (300ms)
- **Modal Appearance**: Fade + scale (300ms)
- **Success Celebrations**: Confetti animation (1000ms)
- **Loading States**: Skeleton screens + pulse animation

---

## Platform-Specific Guidelines

### Customer App (30 screens)
- **Focus**: Easy product discovery, seamless checkout, quality assurance
- **Key Screens**: Home, Product Detail, Cart, Checkout, Quality Photo Review
- **Navigation**: Bottom tab bar (Home, Categories, Cart, Orders, Profile)

### Seller App (65 screens)
- **Focus**: Product management, order fulfillment, analytics, AI photo tools
- **Key Screens**: Dashboard, Product List, Add Product, AI Photo Tools, Orders
- **Navigation**: Bottom tab bar + hamburger menu for settings

### Rider App (60 screens)
- **Focus**: Order acceptance, navigation, quality photo capture, earnings
- **Key Screens**: Dashboard, Available Orders, Active Delivery, Photo Capture, Earnings
- **Navigation**: Bottom tab bar + quick actions

### Admin Dashboard (78 screens)
- **Focus**: Platform management, analytics, user oversight, quality review
- **Key Screens**: Dashboard Home, Orders Overview, Quality Verification Review, Analytics
- **Navigation**: Left sidebar + top header

---

## File Naming Convention

### Screen Files
- Format: `{app}_{screen_number}_{screen_name}.png`
- Examples:
  - `customer_app/01_splash_screen.png`
  - `seller_app/11_ai_photo_tools.png`
  - `rider_app/11_quality_verification_photo.png`
  - `admin_dashboard/16_quality_verification_review.png`

### Assets
- Format: `{category}_{name}_{variant}.{ext}`
- Examples:
  - `icons_home_active.svg`
  - `logos_okada_primary.svg`
  - `illustrations_onboarding_1.png`

---

## Design Tokens (for Development)

```json
{
  "colors": {
    "primary": "#2D8659",
    "secondary": "#FF8C42",
    "success": "#10B981",
    "warning": "#F59E0B",
    "error": "#EF4444",
    "info": "#3B82F6",
    "gray": {
      "50": "#F9FAFB",
      "100": "#F3F4F6",
      "200": "#E5E7EB",
      "300": "#D1D5DB",
      "400": "#9CA3AF",
      "500": "#6B7280",
      "600": "#4B5563",
      "700": "#374151",
      "800": "#1F2937",
      "900": "#111827"
    }
  },
  "spacing": {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "6": "24px",
    "8": "32px",
    "12": "48px",
    "16": "64px"
  },
  "borderRadius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "md": "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    "lg": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    "xl": "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
  }
}
```

---

## Next Steps for Development

### Phase 1: Core Infrastructure
1. Set up design tokens in codebase
2. Create reusable component library
3. Implement navigation structure
4. Set up API integration (MTN/Orange Money, Maps)

### Phase 2: Key Differentiators
1. **Quality Verification Photos** (PRIORITY 1!)
   - Camera interface with grid overlay
   - Photo upload and review system
   - Admin approval workflow
   - Impact analytics
2. **MTN/Orange Money Integration**
   - Payment gateway setup
   - Transaction processing
   - Withdrawal system
3. **Bilingual Support**
   - Translation infrastructure
   - Language switching
   - Content management

### Phase 3: Platform Launch
1. Customer App (MVP features)
2. Seller App (product management + orders)
3. Rider App (delivery + photo capture)
4. Admin Dashboard (monitoring + quality review)

---

## Success Metrics

### Quality Verification Photos
- **Target**: 90%+ photo submission rate
- **Target**: 4.8+ customer satisfaction rating
- **Target**: <5% return rate

### Mobile Money Adoption
- **Target**: 80%+ transactions via MTN/Orange Money
- **Target**: <2% failed transaction rate

### Bilingual Usage
- **Target**: 30%+ French language usage
- **Target**: 100% translation coverage for core features

### Platform Growth
- **Target**: 10,000 users in 6 months
- **Target**: 25% market share in Douala/Yaoundé
- **Target**: 30 min average delivery time

---

**Design System Version**: 1.0  
**Last Updated**: April 2024  
**Platform**: Okada E-Commerce  
**Market**: Cameroon (Douala, Yaoundé, Bamenda)
