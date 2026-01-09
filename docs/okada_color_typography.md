# Okada Platform Color Palette and Typography Guidelines

## Color Palette

The Okada platform's color palette is designed to reflect Cameroon's cultural identity while ensuring accessibility and usability. The palette combines the national colors of Cameroon (green, red, and yellow) with traditional Ndop cloth colors (indigo blue and white) and market-inspired accent colors.

### Primary Colors

| Color Name | Hex Code | RGB | Description |
|------------|----------|-----|-------------|
| **Okada Green** | `#007A5E` | rgb(0, 122, 94) | Primary brand color, derived from Cameroon flag green, represents freshness and reliability |
| **Okada Red** | `#CE1126` | rgb(206, 17, 38) | Secondary brand color, derived from Cameroon flag red, represents energy and urgency |
| **Okada Yellow** | `#FCD116` | rgb(252, 209, 22) | Accent color, derived from Cameroon flag yellow, represents optimism and clarity |

### Secondary Colors

| Color Name | Hex Code | RGB | Description |
|------------|----------|-----|-------------|
| **Ndop Blue** | `#1A3263` | rgb(26, 50, 99) | Inspired by traditional Ndop cloth, represents trust and stability |
| **Market White** | `#F7F3E9` | rgb(247, 243, 233) | Background color inspired by local textiles, provides contrast and readability |

### Accent Colors

| Color Name | Hex Code | RGB | Description |
|------------|----------|-----|-------------|
| **Plantain Yellow** | `#FFE566` | rgb(255, 229, 102) | Inspired by local market produce, used for highlights and calls to action |
| **Chili Red** | `#E63946` | rgb(230, 57, 70) | Brighter variant for notifications and alerts |
| **Palm Green** | `#2A9D8F` | rgb(42, 157, 143) | Lighter variant for success states and secondary actions |
| **Textile Blue** | `#457B9D` | rgb(69, 123, 157) | Lighter blue for secondary elements and information |

### Neutral Colors

| Color Name | Hex Code | RGB | Description |
|------------|----------|-----|-------------|
| **Market Soil** | `#5C4033` | rgb(92, 64, 51) | Dark brown inspired by market grounds, used for text |
| **Basket Gray** | `#8D99AE` | rgb(141, 153, 174) | Medium gray for secondary text and disabled states |
| **Soft Clay** | `#E9ECEF` | rgb(233, 236, 239) | Light gray for backgrounds and dividers |
| **Pure White** | `#FFFFFF` | rgb(255, 255, 255) | White for backgrounds and text on dark colors |

### Color Usage Guidelines

#### Brand Identity
- **Okada Green** should be the dominant color, used for the main navigation bar, primary buttons, and brand elements
- **Okada Red** should be used sparingly for important actions and alerts
- **Okada Yellow** should be used for accents, highlights, and secondary actions

#### Accessibility
- Maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text
- Never use text directly on **Okada Yellow** without sufficient contrast
- Provide alternative visual cues beyond color for important information

#### Cultural Integration
- Incorporate **Ndop Blue** in patterns and decorative elements that echo traditional textiles
- Use **Market White** as the primary background color to enhance readability while maintaining cultural relevance
- Apply accent colors in ways that reflect the vibrant atmosphere of Cameroonian markets

## Typography

Typography for the Okada platform prioritizes readability on low-resolution devices while incorporating elements of Cameroonian visual culture. The system uses a combination of sans-serif fonts for clarity and distinctive display fonts for cultural identity.

### Primary Typefaces

#### For Mobile Applications

| Font Name | Usage | Characteristics |
|-----------|-------|-----------------|
| **Noto Sans** | Primary font for all UI elements | Excellent readability, supports French and English, optimized for screens |
| **Roboto** | Alternative primary font | Good fallback with similar metrics if Noto Sans fails to load |

#### For Web Platform

| Font Name | Usage | Characteristics |
|-----------|-------|-----------------|
| **Inter** | Primary font for all UI elements | Modern, highly readable at small sizes, works well in interfaces |
| **Open Sans** | Alternative primary font | Fallback with excellent readability across devices |

### Display Typeface

| Font Name | Usage | Characteristics |
|-----------|-------|-----------------|
| **Adinkra Sans** | Headings and brand elements | Inspired by West African symbols, provides cultural connection |
| **Montserrat** | Alternative display font | Bold, geometric alternative when Adinkra Sans is not available |

### Typography Scale

The typography scale is designed for readability on small screens and low-resolution devices:

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

#### Accessibility
- Provide text scaling options for users with visual impairments
- Maintain readability when text is enlarged up to 200%
- Avoid using text in images for important information
- Ensure all text can be selected and read by screen readers

## Combined Usage Examples

### Primary Action Button
- Background: **Okada Green** (`#007A5E`)
- Text: **Pure White** (`#FFFFFF`)
- Font: **Noto Sans** or **Inter**, 16px, Medium (500), ALL CAPS
- Border: None
- Hover state: Slightly darker shade of **Okada Green**

### Secondary Action Button
- Background: Transparent
- Text: **Okada Green** (`#007A5E`)
- Font: **Noto Sans** or **Inter**, 16px, Medium (500), ALL CAPS
- Border: 1px solid **Okada Green**
- Hover state: Light green background (10% opacity of **Okada Green**)

### Alert Message
- Background: Light tint of **Chili Red** (15% opacity)
- Text: **Market Soil** (`#5C4033`)
- Font: **Noto Sans** or **Inter**, 16px, Regular (400)
- Border: 1px solid **Chili Red**
- Icon: Alert icon in **Chili Red**

### Page Title
- Text: **Market Soil** (`#5C4033`)
- Font: **Adinkra Sans** or **Montserrat**, 24px (mobile) / 32px (web), Bold (700)
- Optional decorative element: Small Ndop-inspired pattern in **Ndop Blue**

### Navigation Bar
- Background: **Okada Green** (`#007A5E`)
- Text: **Pure White** (`#FFFFFF`)
- Font: **Noto Sans** or **Inter**, 16px (mobile) / 14px (web), Medium (500)
- Active item: Underline in **Okada Yellow**

This color palette and typography system creates a cohesive visual identity that honors Cameroonian cultural heritage while ensuring usability and accessibility for all users, including those with limited technical skills.
