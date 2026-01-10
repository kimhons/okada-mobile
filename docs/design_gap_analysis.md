# Okada Design Gap Analysis

## Design Specifications Summary

Based on the comprehensive design documents:
- **okada_screen_specifications.md**: 177 screens across 3 apps (42 Customer, 55 Rider, 80 Merchant)
- **Okada Platform UI Branding Guide.md**: Complete design system with colors, typography, components
- **User Journeys & Screen Inventory.md**: Detailed user flows and screen requirements

---

## Design System Constants (From UI Branding Guide)

### Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Okada Green | #007A5E | Primary brand color |
| Okada Red | #CE1126 | Secondary brand, alerts |
| Okada Yellow | #FCD116 | Accent, highlights |
| Ndop Blue | #1A3263 | Traditional patterns |
| Market White | #F7F3E9 | Background |
| Plantain Yellow | #FFE566 | CTAs |
| Chili Red | #E63946 | Notifications |
| Palm Green | #2A9D8F | Success states |
| Textile Blue | #457B9D | Information |
| Market Soil | #5C4033 | Primary text |
| Basket Gray | #8D99AE | Secondary text |
| Soft Clay | #E9ECEF | Dividers |

### Typography

- **Primary Font (Mobile)**: Noto Sans / Roboto
- **Primary Font (Web)**: Inter / Open Sans
- **Display Font**: Adinkra Sans / Montserrat

### Typography Scale

| Element | Mobile | Web | Weight |
|---------|--------|-----|--------|
| H1 | 24px | 32px | Bold (700) |
| H2 | 20px | 24px | Bold (700) |
| H3 | 18px | 20px | Semibold (600) |
| Body | 16px | 16px | Regular (400) |
| Small | 14px | 14px | Regular (400) |
| Button | 16px | 16px | Medium (500) |

---

## Gap Analysis: Sequence 2 vs Design Specs

### Gap 1: Onboarding Screens Not Aligned with Specs

**Design Spec (Screen 1.3-1.5)**:
- 3 onboarding screens: Benefits, Features, Delivery
- Progress dots (1 of 3, 2 of 3, 3 of 3)
- Skip button (top right)
- Large illustration area (60% of screen)
- Ndop pattern border at bottom
- Specific illustrations for each screen

**Current Implementation (OnboardingService)**:
- 5 screens: Welcome, Discover, Delivery, Payment, AI Assistant
- Missing Ndop pattern integration
- Missing specific illustration references
- Missing cultural elements (crocodile, sun, linked hearts symbols)

**Fix Required**: Align OnboardingService with 3-screen spec OR document deviation

### Gap 2: Registration Screen Missing Cameroon-Specific Elements

**Design Spec (Screen 1.6)**:
- Phone format: 6XXXXXXXX (9 digits starting with 6)
- Country code dropdown (+237 pre-selected)
- Password strength indicator (Weak/Medium/Strong)
- Terms checkbox with modal links
- Support for Cameroonian names (hyphens, apostrophes)

**Current Implementation (PhoneAuthService)**:
- ✅ Phone validation for Cameroon
- ✅ Country code support
- ❌ Missing password strength indicator in UI
- ❌ Missing terms checkbox flow
- ❌ Missing name validation for special characters

### Gap 3: Color Constants Not Matching Design System

**Design Spec Colors**:
- Okada Green: #007A5E (not #007A3D as in some places)
- Ndop Blue: #1A3263
- Market White: #F7F3E9

**Current Implementation (okada_ui)**:
- Need to verify color constants match design system exactly

### Gap 4: Missing Cultural Design Elements

**Design Spec Requirements**:
- Ndop-inspired patterns for headers/borders
- Traditional symbols (Crocodile, Sun, Linked Hearts)
- Market-inspired visual elements

**Current Implementation**:
- Cultural elements not yet integrated into UI components

### Gap 5: Language Selection Screen Missing

**Design Spec (Screen 1.2)**:
- Two large language option cards (French/English)
- Cameroon flag icons
- Radio button indicators
- "Continue / Continuer" button

**Current Implementation**:
- Language selection not implemented as dedicated screen

---

## Sequence 3 Screens to Implement (From Screen Inventory)

### Customer App - Home & Navigation (3 screens)
8. Home Screen
9. Main Navigation (Bottom Tab Bar)
10. Notification Center

### Customer App - Product Discovery (7 screens)
11. Category List
12. Category Detail
13. Search Screen
14. Search Results
15. Filter Screen
16. Sort Options
17. Product Detail

### Customer App - Shopping Cart & Checkout (8 screens)
18. Cart Screen
19. Checkout - Delivery Options
20. Checkout - Address Selection
21. Checkout - Payment Selection
22. Payment Processing
23. MTN Money Integration
24. Orange Money Integration
25. Order Confirmation

---

## Action Items

### Priority 1: Design System Alignment
- [ ] Create OkadaDesignSystem class with exact color constants
- [ ] Create OkadaTypography class with exact font specs
- [ ] Create OkadaSpacing class with 8px base unit

### Priority 2: Onboarding Alignment
- [ ] Update OnboardingService to match 3-screen spec OR document 5-screen deviation
- [ ] Add Ndop pattern assets
- [ ] Add cultural symbol assets

### Priority 3: Authentication Alignment
- [ ] Add password strength indicator widget
- [ ] Add terms checkbox with modal flow
- [ ] Add language selection screen

### Priority 4: Sequence 3 Implementation
- [ ] Implement Home Screen with design specs
- [ ] Implement Bottom Navigation with Okada colors
- [ ] Implement Product Discovery flow
- [ ] Implement Cart & Checkout flow

---

## Design Assets Needed

1. **Okada Logo** (SVG): Motorcycle rider icon in Okada Yellow
2. **Ndop Patterns** (SVG): Border patterns, decorative elements
3. **Cultural Symbols** (SVG): Crocodile, Sun, Linked Hearts
4. **Onboarding Illustrations**: Fresh produce, smartphone, motorcycle rider
5. **Category Icons**: Market-inspired silhouettes
