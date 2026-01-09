# Okada Platform UI Branding Guide

> **IMPORTANT NOTE: This UI branding guide is designed to enhance and build upon the existing Okada platform design, not replace it.** All design specifications, color palettes, typography guidelines, and UI components should be considered as additions or refinements to the current design system. Always preserve existing design elements (particularly the motorcycle delivery rider logo), build upon the established visual language, maintain consistency with existing interfaces, and implement cultural elements in a way that enhances rather than disrupts the user experience.

## Executive Summary

The Okada platform UI branding guide establishes a comprehensive design system that combines modern interface design principles with Cameroonian cultural elements. This guide ensures a cohesive, accessible, and culturally relevant user experience across all platform touchpoints: the customer mobile app, rider mobile app, and merchant web platform.

The design system is built on four core principles:
1. **Cultural Authenticity**: Incorporating Cameroonian visual traditions, particularly Ndop cloth patterns and market aesthetics
2. **Visual Communication Priority**: Emphasizing visual cues over text to accommodate varying literacy levels
3. **Progressive Complexity**: Revealing features gradually to avoid overwhelming users with limited technical experience
4. **Offline-First Design**: Ensuring functionality in areas with intermittent connectivity

This guide provides detailed specifications for colors, typography, UI components, and cultural integration patterns to create a platform that resonates with Cameroonian users while maintaining modern usability standards.

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [UI Components](#ui-components)
5. [Cultural Elements](#cultural-elements)
6. [Platform-Specific Guidelines](#platform-specific-guidelines)
7. [Accessibility Considerations](#accessibility-considerations)
8. [Implementation Resources](#implementation-resources)

## Brand Identity

### Brand Story

Okada represents the bridge between traditional Cameroonian market culture and modern convenience. The name "Okada" refers to motorcycle taxis common in West Africa, symbolizing quick, reliable transportation—a perfect metaphor for our quick commerce platform.

The brand embodies the vibrant energy of Cameroonian markets while providing the reliability and convenience of modern technology. It honors local traditions while embracing innovation.

### Logo

The Okada logo represents the core concept of the platform through a distinctive motorcycle delivery icon:

- **Primary Logo**: The wordmark "OKADA" in clean, modern typography (Montserrat Bold) in white against Okada Green (#007A5E), paired with a motorcycle delivery rider icon in Okada Yellow (#FCD116)
- **Icon**: A simplified motorcycle delivery rider silhouette in Okada Yellow (#FCD116), representing the platform's quick commerce delivery service
- **Clear Space**: Maintain padding around the logo equal to the height of the "O" in OKADA
- **Minimum Size**: 24px height for digital applications to ensure legibility
- **Variations**: 
  - Full logo (icon + wordmark) for primary applications
  - Icon-only for app icons and small-space applications
  - Wordmark-only for certain horizontal applications

The motorcycle icon in the logo carries significant meaning:
- Directly represents the "Okada" name (referring to motorcycle taxis common in West Africa)
- Symbolizes speed, reliability, and accessibility
- Communicates the delivery service aspect of the platform
- Uses the yellow from Cameroon's flag, reinforcing the local connection

### Brand Voice

The Okada brand voice is:
- **Friendly but Professional**: Approachable without being overly casual
- **Clear and Direct**: Simple language that avoids technical jargon
- **Culturally Relevant**: Uses local references and expressions familiar to Cameroonians
- **Visually Supported**: Always pairs text with supporting visuals

## Color Palette

The Okada color palette draws inspiration from the Cameroon flag (green, red, yellow), traditional Ndop cloth (indigo blue and white), and local market aesthetics.

### Primary Colors

| Color Name | Hex Code | RGB | Description |
|------------|----------|-----|-------------|
| **Okada Green** | `#007A5E` | rgb(0, 122, 94) | Primary brand color, derived from Cameroon flag green |
| **Okada Red** | `#CE1126` | rgb(206, 17, 38) | Secondary brand color, derived from Cameroon flag red |
| **Okada Yellow** | `#FCD116` | rgb(252, 209, 22) | Accent color, derived from Cameroon flag yellow |

### Secondary Colors

| Color Name | Hex Code | RGB | Description |
|------------|----------|-----|-------------|
| **Ndop Blue** | `#1A3263` | rgb(26, 50, 99) | Inspired by traditional Ndop cloth |
| **Market White** | `#F7F3E9` | rgb(247, 243, 233) | Background color inspired by local textiles |

### Accent Colors

| Color Name | Hex Code | RGB | Description |
|------------|----------|-----|-------------|
| **Plantain Yellow** | `#FFE566` | rgb(255, 229, 102) | Highlights and calls to action |
| **Chili Red** | `#E63946` | rgb(230, 57, 70) | Notifications and alerts |
| **Palm Green** | `#2A9D8F` | rgb(42, 157, 143) | Success states and secondary actions |
| **Textile Blue** | `#457B9D` | rgb(69, 123, 157) | Information and secondary elements |

### Neutral Colors

| Color Name | Hex Code | RGB | Description |
|------------|----------|-----|-------------|
| **Market Soil** | `#5C4033` | rgb(92, 64, 51) | Primary text color |
| **Basket Gray** | `#8D99AE` | rgb(141, 153, 174) | Secondary text and disabled states |
| **Soft Clay** | `#E9ECEF` | rgb(233, 236, 239) | Backgrounds and dividers |
| **Pure White** | `#FFFFFF` | rgb(255, 255, 255) | Text on dark backgrounds |

### Color Usage Guidelines

#### Functional Color Coding

- **Green** (#007A5E or #2A9D8F): Success, confirmation, available, in stock
- **Yellow** (#FCD116 or #FFE566): Warning, pending, low stock, caution
- **Red** (#CE1126 or #E63946): Error, alert, unavailable, out of stock

#### Background Colors

- **Primary Background**: Market White (#F7F3E9)
- **Secondary Background**: Pure White (#FFFFFF)
- **Accent Background**: Soft Clay (#E9ECEF)
- **Dark Background**: Okada Green (#007A5E)

#### Text Colors

- **Primary Text on Light**: Market Soil (#5C4033)
- **Secondary Text on Light**: Basket Gray (#8D99AE)
- **Primary Text on Dark**: Pure White (#FFFFFF)
- **Secondary Text on Dark**: Soft Clay (#E9ECEF)

## Typography

Typography for the Okada platform prioritizes readability on low-resolution devices while incorporating elements of Cameroonian visual culture.

### Primary Typefaces

#### For Mobile Applications

| Font Name | Usage | Characteristics |
|-----------|-------|-----------------|
| **Noto Sans** | Primary font for all UI elements | Excellent readability, supports French and English |
| **Roboto** | Alternative primary font | Good fallback with similar metrics |

#### For Web Platform

| Font Name | Usage | Characteristics |
|-----------|-------|-----------------|
| **Inter** | Primary font for all UI elements | Modern, highly readable at small sizes |
| **Open Sans** | Alternative primary font | Excellent readability across devices |

### Display Typeface

| Font Name | Usage | Characteristics |
|-----------|-------|-----------------|
| **Adinkra Sans** | Headings and brand elements | Inspired by West African symbols |
| **Montserrat** | Alternative display font | Bold, geometric alternative |

### Typography Scale

| Element | Mobile Size | Web Size | Weight | Case |
|---------|-------------|----------|--------|------|
| H1 (Page Title) | 24px | 32px | Bold (700) | Sentence case |
| H2 (Section Title) | 20px | 24px | Bold (700) | Sentence case |
| H3 (Subsection) | 18px | 20px | Semibold (600) | Sentence case |
| Body | 16px | 16px | Regular (400) | Sentence case |
| Small/Caption | 14px | 14px | Regular (400) | Sentence case |
| Button | 16px | 16px | Medium (500) | ALL CAPS |
| Navigation | 16px | 14px | Medium (500) | Sentence case |

### Typography Guidelines

#### Readability
- Maintain minimum text size of 16px for body text on mobile
- Use adequate line height (1.5 for body text, 1.2 for headings)
- Ensure sufficient contrast between text and background
- Avoid justified text alignment which can create uneven spacing

#### Localization
- Support both French and English with appropriate character sets
- Allow text to expand by 20-30% for French translations
- Use universal icons alongside text for key functions

#### Cultural Integration
- Apply **Adinkra Sans** for key headings to reinforce cultural identity
- Incorporate traditional Cameroonian symbols as decorative elements in headings
- Use a slightly increased line height to accommodate diacritical marks in French

## UI Components

### Navigation Components

#### Primary Navigation Bar

The primary navigation bar incorporates elements of Cameroonian market organization, where different product categories are grouped in specific areas.

**Design Specifications:**
- Background: **Okada Green** (`#007A5E`)
- Text: **Pure White** (`#FFFFFF`)
- Icons: Simple, culturally relevant silhouettes in white
- Active state: Underline in **Okada Yellow** (`#FCD116`)
- Pattern: Subtle Ndop-inspired border pattern along bottom edge

**Cultural Integration:**
- Navigation icons inspired by market category symbols
- Spatial organization mimics typical market layout
- Section dividers use simplified Ndop pattern elements

#### Tab Navigation

Tab navigation for sub-sections incorporates the horizontal organization often seen in Cameroonian textile patterns.

**Design Specifications:**
- Background: **Market White** (`#F7F3E9`)
- Text: **Market Soil** (`#5C4033`) for inactive, **Okada Green** for active
- Active indicator: Bottom border in **Okada Green** with small Ndop pattern element
- Spacing: Equal width tabs with adequate padding

### Content Components

#### Cards

Cards are designed to resemble market stalls, with clear boundaries and visual hierarchy.

**Design Specifications:**
- Background: **Pure White** (`#FFFFFF`)
- Border: Subtle shadow or 1px border in light gray
- Corner radius: 8px
- Internal padding: 16px
- Header: Optional **Ndop Blue** (`#1A3263`) top border or accent

**Cultural Integration:**
- Card layouts inspired by market stall organization
- Optional decorative elements from Ndop patterns in corners
- Visual hierarchy mimics product display in markets

**Variations:**
1. **Product Card**
   - Large image area (60% of card height)
   - Prominent price display with **Okada Yellow** highlight
   - Action buttons with market-inspired icons

2. **Information Card**
   - Icon or small image (30% of card height)
   - More text content with clear hierarchy
   - Optional action button at bottom

3. **Status Card**
   - Color-coded left border (green for success, yellow for pending, red for alert)
   - Status icon matching border color
   - Concise information with next steps

#### Lists

Lists are designed to reflect the organized rows of products in Cameroonian markets.

**Design Specifications:**
- Item height: 72dp minimum for touchability
- Dividers: 1px line in **Soft Clay** (`#E9ECEF`)
- Leading element: Icon or thumbnail image
- Typography: Primary text in **Market Soil**, secondary in **Basket Gray**

**Cultural Integration:**
- List organization mimics market display techniques
- Category headers with simplified Ndop pattern backgrounds
- Swipe actions with market-relevant icons

### Input Components

#### Text Fields

Text fields are designed to be approachable and clearly indicate their purpose, with visual cues that transcend language barriers.

**Design Specifications:**
- Background: **Pure White** with 1px border in **Basket Gray**
- Label: Floating label in **Market Soil**
- Text: 16px **Noto Sans** in **Market Soil**
- Focus state: Border changes to **Okada Green** with subtle shadow
- Error state: Border changes to **Chili Red** with error message

**Cultural Integration:**
- Field icons inspired by market signage
- Helper text uses familiar market terminology
- Visual cues (like currency symbols) positioned according to local conventions

#### Buttons

Buttons are designed to be highly visible and communicate their purpose through shape, color, and iconography.

**Design Specifications:**

1. **Primary Button**
   - Background: **Okada Green**
   - Text: **Pure White** in 16px **Noto Sans** Medium, ALL CAPS
   - Height: 48dp
   - Corner radius: 24dp (pill-shaped)
   - Icon: Optional leading icon in white
   - States: Normal, Pressed (darker), Disabled (desaturated)

2. **Secondary Button**
   - Background: Transparent
   - Text: **Okada Green** in 16px **Noto Sans** Medium, ALL CAPS
   - Border: 1px solid **Okada Green**
   - Height: 48dp
   - Corner radius: 24dp
   - States: Normal, Pressed (light green background), Disabled (gray text and border)

3. **Text Button**
   - Background: Transparent
   - Text: **Okada Green** in 16px **Noto Sans** Medium
   - Height: 36dp
   - States: Normal, Pressed (light background), Disabled (gray text)

**Cultural Integration:**
- Button shapes inspired by calabash forms in local markets
- Important action buttons include subtle Ndop-inspired patterns
- Icon buttons use culturally familiar symbols

### Feedback Components

#### Dialogs

Dialogs are designed to resemble market interactions, with clear exchange of information and decision points.

**Design Specifications:**
- Background: **Pure White**
- Border: Subtle shadow
- Title: 20px **Adinkra Sans** in **Market Soil**
- Content: 16px **Noto Sans** in **Market Soil**
- Buttons: Aligned to the right, primary action in **Okada Green**
- Overlay: Semi-transparent black background (60% opacity)

**Cultural Integration:**
- Dialog headers incorporate simplified Ndop patterns
- Confirmation dialogs use market transaction metaphors
- Warning dialogs use culturally appropriate caution symbols

#### Toast Messages

Toast messages provide brief feedback using visual metaphors from market communications.

**Design Specifications:**
- Background: Semi-transparent dark background (80% opacity)
- Text: **Pure White** in 14px **Noto Sans**
- Icon: Optional leading icon in white
- Duration: 3 seconds by default
- Position: Bottom of screen, 16dp from bottom edge

**Cultural Integration:**
- Success messages incorporate green elements
- Error messages use culturally appropriate warning symbols
- Icons derived from market communication gestures

## Cultural Elements

### Ndop-Inspired Patterns

A library of simplified Ndop-inspired patterns for use as decorative elements throughout the interface.

**Design Specifications:**
- Color: Primarily **Ndop Blue** on light backgrounds, white on dark backgrounds
- Complexity: Simplified for digital reproduction
- Scale: Adaptable to different component sizes
- Opacity: Subtle application (15-30% opacity) for backgrounds

**Usage Guidelines:**
- Use as section dividers
- Apply as subtle background elements
- Incorporate in headers and footers
- Use as loading animations

### Cultural Symbols

A library of simplified Cameroonian symbols with meanings relevant to e-commerce and delivery.

**Symbol Set:**
1. **Crocodile** (Adaptability) - Used for features that work offline/online
2. **Linked Hearts** (Agreement) - Used for transaction confirmations
3. **Spider** (Wisdom) - Used for help and information
4. **Sun** (Energy/Life) - Used for status indicators
5. **Calabash** (Abundance) - Used for cart and inventory

**Design Specifications:**
- Style: Simplified line drawings
- Color: Adaptable to context (usually **Market Soil** or **Okada Green**)
- Size: Scalable vector format
- Background: Optional circular background in brand colors

### Market-Inspired Layouts

Grid systems and layout patterns inspired by Cameroonian market organization.

**Design Specifications:**
1. **Product Grid**
   - Organization: Categories in rows, products in columns
   - Hierarchy: Category headers with distinctive background
   - Spacing: Dense but organized with clear boundaries

2. **Status Dashboard**
   - Organization: Important information central, supporting details peripheral
   - Hierarchy: Color and size indicate importance
   - Inspiration: Market stall arrangement

3. **Navigation Flow**
   - Organization: Frequent tasks accessible with minimal navigation
   - Hierarchy: Primary actions prominent, secondary actions nested
   - Inspiration: Market foot traffic patterns

## Platform-Specific Guidelines

### Customer Mobile App

The customer mobile app prioritizes visual browsing, simple ordering, and clear status updates.

**Key Design Principles:**
- Large, clear product images with minimal text
- Prominent price display in CFA francs
- Simple add-to-cart functionality
- Visual order tracking
- Offline mode with clear indicators

**Cultural Integration:**
- Ndop patterns frame the home screen
- Category organization reflects local market layout
- Product descriptions use local terminology

**Example Screens:**
1. **Home Screen**: Categories displayed as colorful cards with icons against Market White background, framed by Ndop-inspired patterns
2. **Product Category Screen**: Grid of product images with clear pricing in yellow highlight buttons
3. **Checkout Screen**: Visual order summary with product images and prominent payment options (MTN Mobile Money, Orange Money)

### Rider Mobile App

The rider app focuses on clear delivery information, simple navigation, and earnings tracking.

**Key Design Principles:**
- Prominent display of pickup and delivery locations
- Clear earnings information
- Simple accept/decline interface
- Map-based navigation with landmark references
- Offline functionality for areas with poor connectivity

**Cultural Integration:**
- Ndop Blue patterns frame the interface
- Location references use local landmarks
- Earnings displayed prominently in CFA francs

**Example Screens:**
1. **Home Screen**: Available deliveries with clear pickup/delivery locations and earnings, framed by Ndop Blue patterns
2. **Delivery Details Screen**: Order contents with images, map with pickup location, and prominent accept/decline buttons
3. **Earnings Screen**: Daily and weekly earnings with simple visualizations in brand colors

### Merchant Web Platform

The merchant platform provides comprehensive business management with an emphasis on visual data presentation and simplified workflows.

**Key Design Principles:**
- Dashboard-based interface with key metrics
- Visual inventory management
- Simplified order processing
- Clear status indicators
- Responsive design for various screen sizes

**Cultural Integration:**
- Ndop patterns as subtle background elements
- Data visualizations using brand colors
- Product organization reflecting market categories

**Example Screens:**
1. **Dashboard**: Sales overview with line charts in brand colors, recent orders, and inventory alerts
2. **Orders Screen**: Order list with customer details, product thumbnails, and color-coded status indicators
3. **Inventory Screen**: Product grid with images, stock levels, and quick edit functionality

## Accessibility Considerations

### Visual Accessibility

Components are designed to be accessible to users with various visual abilities.

**Design Specifications:**
- Color contrast: Minimum 4.5:1 for normal text, 3:1 for large text
- Text scaling: All components support text scaling up to 200%
- Screen readers: All components include appropriate ARIA labels
- Focus indicators: Clear visual focus states for keyboard navigation

**Implementation Guidelines:**
- Never rely solely on color to convey information
- Provide text alternatives for all non-text content
- Ensure all interactive elements are keyboard accessible
- Maintain readability when text size is increased

### Cognitive Accessibility

Components are designed to minimize cognitive load and support users with limited technical experience.

**Design Specifications:**
- Instructions: Clear, concise, and reinforced with visual cues
- Error prevention: Confirmation for destructive actions
- Memory demands: Minimize need to remember information between screens
- Consistency: Maintain predictable patterns throughout the interface

**Implementation Guidelines:**
- Use familiar mental models based on market experiences
- Provide clear feedback for all actions
- Allow users to reverse actions when possible
- Use progressive disclosure to manage complexity

### Network Accessibility

The platform is designed to function in areas with limited or intermittent connectivity.

**Design Specifications:**
- Offline indicators: Clear visual cues for cached content
- Sync status: Progress indicators for synchronization
- Data usage: Options to control media loading
- Error recovery: Graceful handling of connection failures

**Implementation Guidelines:**
- Cache critical functionality and content
- Implement background synchronization
- Provide text-only alternatives for data-heavy components
- Prioritize loading of essential interactive elements

## Implementation Resources

### Design Assets

All design assets are available in the Okada Design System repository:

- Color palette (Adobe, Figma, Sketch)
- Typography styles and font files
- UI component library
- Icon set with cultural symbols
- Ndop pattern library
- Screen templates

### Code Resources

Implementation resources for developers:

#### Flutter Implementation

```dart
final ThemeData okadaTheme = ThemeData(
  primaryColor: const Color(0xFF007A5E), // Okada Green
  colorScheme: ColorScheme(
    primary: const Color(0xFF007A5E), // Okada Green
    secondary: const Color(0xFFCE1126), // Okada Red
    surface: Colors.white,
    background: const Color(0xFFF7F3E9), // Market White
    error: const Color(0xFFE63946), // Chili Red
    onPrimary: Colors.white,
    onSecondary: Colors.white,
    onSurface: const Color(0xFF5C4033), // Market Soil
    onBackground: const Color(0xFF5C4033), // Market Soil
    onError: Colors.white,
    brightness: Brightness.light,
  ),
  textTheme: TextTheme(
    headline1: TextStyle(
      fontFamily: 'AdinkraSans',
      fontSize: 24,
      fontWeight: FontWeight.bold,
      color: const Color(0xFF5C4033), // Market Soil
    ),
    // Additional text styles...
  ),
  // Additional theme properties...
);
```

#### Web Implementation (CSS Variables)

```css
:root {
  --okada-green: #007A5E;
  --okada-red: #CE1126;
  --okada-yellow: #FCD116;
  --ndop-blue: #1A3263;
  --market-white: #F7F3E9;
  --market-soil: #5C4033;
  --basket-gray: #8D99AE;
  --soft-clay: #E9ECEF;
  
  --font-primary: 'Inter', sans-serif;
  --font-display: 'Adinkra Sans', 'Montserrat', sans-serif;
  
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 24px;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### Quality Assurance Checklist

To ensure consistent implementation of the design system, all components should be evaluated against the following criteria:

1. **Visual Consistency**
   - Colors match the defined palette
   - Typography follows the type scale
   - Spacing adheres to the spacing system
   - Cultural elements are appropriately integrated

2. **Functional Consistency**
   - Components behave predictably across contexts
   - Interactions follow established patterns
   - States (hover, active, disabled) are consistently styled
   - Animations and transitions are cohesive

3. **Accessibility Compliance**
   - Color contrast meets WCAG AA standards
   - Interactive elements are keyboard accessible
   - Screen reader support is implemented
   - Text scales appropriately

4. **Cultural Relevance**
   - Cultural elements are used respectfully and appropriately
   - Metaphors are meaningful to the target audience
   - Language and terminology are locally relevant
   - Visual hierarchy reflects local cultural norms

5. **Technical Performance**
   - Components render efficiently
   - Animations are smooth and non-disruptive
   - Assets are optimized for size
   - Components function in offline mode

## Conclusion

The Okada UI branding guide establishes a comprehensive design system that honors Cameroonian cultural heritage while ensuring usability and accessibility for all users. By following these guidelines, the Okada platform will provide a cohesive, intuitive, and culturally relevant experience across all touchpoints.

The design system is not static but should evolve based on user feedback and changing market needs. Regular evaluation and refinement will ensure the platform continues to meet the needs of Cameroonian users while maintaining its distinctive cultural identity.
