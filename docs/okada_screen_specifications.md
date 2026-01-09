# Okada Platform - Comprehensive Screen Inventory and Specifications

**Document Version**: 1.0  
**Last Updated**: November 2025  
**Author**: Manus AI

---

## Executive Summary

This document provides detailed specifications for all 177 screens across the Okada quick commerce platform. Each screen specification includes layout descriptions, UI components, user interactions, data requirements, and Cameroon-specific adaptations. The specifications are organized by application (Customer App, Rider App, Merchant Platform) and functional area to facilitate development and design consistency.

---

## Design System Foundation

All screens across the Okada platform adhere to a unified design system that ensures consistency and cultural relevance.

### Color Palette

The Okada color system is built around the Cameroon flag colors with additional supporting colors:

| Color Name | Hex Code | Usage | Cultural Significance |
|------------|----------|-------|----------------------|
| Okada Green | #007A3D | Primary brand color, headers, CTAs | Cameroon flag green - represents hope and vegetation |
| Okada Red | #CE1126 | Alerts, errors, important actions | Cameroon flag red - represents unity |
| Okada Yellow | #FCD116 | Accents, highlights, logo | Cameroon flag yellow - represents sunshine |
| Ndop Blue | #1E3A8A | Secondary elements, patterns | Traditional Ndop cloth |
| Market Orange | #F97316 | Promotions, special offers | Vibrant local markets |
| Neutral Gray | #6B7280 | Text, borders, backgrounds | - |
| Success Green | #10B981 | Success messages, confirmations | - |
| Warning Amber | #F59E0B | Warnings, cautions | - |
| Background White | #FFFFFF | Main backgrounds | - |
| Surface Gray | #F3F4F6 | Card backgrounds, sections | - |

### Typography

The platform uses a carefully selected type system optimized for readability on various devices:

**Primary Font**: Inter (sans-serif)
- **Headings**: Inter Bold (700)
- **Body**: Inter Regular (400)
- **Emphasis**: Inter Medium (500)

**Size Scale**:
- H1: 32px / 2rem (Mobile), 40px / 2.5rem (Desktop)
- H2: 24px / 1.5rem (Mobile), 32px / 2rem (Desktop)
- H3: 20px / 1.25rem (Mobile), 24px / 1.5rem (Desktop)
- Body: 16px / 1rem
- Small: 14px / 0.875rem
- Caption: 12px / 0.75rem

### Spacing System

Consistent spacing using an 8px base unit:
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

### Cultural Design Elements

**Ndop-Inspired Patterns**: Geometric patterns inspired by traditional Cameroonian Ndop cloth are used as decorative elements in headers, borders, and backgrounds. These patterns use the Ndop Blue color and are applied subtly to avoid overwhelming the interface.

**Traditional Symbols**: Select traditional Cameroonian symbols are incorporated as icons and decorative elements:
- **Crocodile**: Adaptability (used in onboarding)
- **Sun**: Prosperity (used in earnings displays)
- **Linked Hearts**: Unity (used in community features)

---

## Customer Mobile App Screens (42 Total)

### 1. Onboarding & Authentication (7 screens)

#### Screen 1.1: Splash Screen

**Purpose**: Brand introduction and app initialization

**Layout**:
- Full-screen background in Okada Green (#007A3D)
- Centered Okada logo (motorcycle rider icon in Okada Yellow)
- "OKADA" wordmark in white below logo
- Tagline: "Your Market, Delivered" in white, smaller text
- Loading indicator at bottom (subtle animation)

**Components**:
- Logo image (SVG, 120x120px)
- Text labels (wordmark and tagline)
- Loading spinner (24px, white)

**Behavior**:
- Displays for 2-3 seconds while app initializes
- Checks for internet connectivity
- Loads cached data if available
- Transitions automatically to language selection (first launch) or home screen (returning user)

**Technical Requirements**:
- Offline capability: Cached assets load even without internet
- Performance: Must load in <2 seconds on low-end devices
- Animation: Subtle fade-in for logo, smooth transition

**Cameroon-Specific Adaptations**:
- Optimized image compression for fast loading on slow networks
- Minimal data usage during initialization

---

#### Screen 1.2: Language Selection

**Purpose**: Allow users to choose their preferred language

**Layout**:
- White background
- Centered content area
- Okada logo at top (smaller, 80x80px)
- Heading: "Choose Your Language / Choisissez Votre Langue"
- Two large language option cards

**Components**:
- **French Option Card**:
  - Cameroon flag icon
  - "Français" text (Inter Bold, 24px)
  - "French" subtitle (Inter Regular, 16px, gray)
  - Radio button indicator (selected state: Okada Green)
- **English Option Card**:
  - Cameroon flag icon
  - "English" text (Inter Bold, 24px)
  - "Anglais" subtitle (Inter Regular, 16px, gray)
  - Radio button indicator
- **Continue Button**: Full-width, Okada Green, white text, "Continue / Continuer"

**Behavior**:
- Default selection: Based on device language (French if device is French, English otherwise)
- Tap on card selects that language
- Continue button proceeds to onboarding carousel
- Language preference saved locally and synced to server

**Technical Requirements**:
- Instant language switching without reload
- Preference persisted in local storage and user profile
- All subsequent screens render in selected language

**Accessibility**:
- Large touch targets (minimum 48x48px)
- High contrast text
- Clear visual feedback on selection

---

#### Screen 1.3-1.5: Onboarding Carousel (3 screens)

**Purpose**: Educate new users about Okada's value proposition

**Common Layout Elements**:
- Top navigation: Progress dots (1 of 3, 2 of 3, 3 of 3)
- Skip button (top right, text link)
- Large illustration area (60% of screen height)
- Headline (Inter Bold, 24px, centered)
- Description (Inter Regular, 16px, centered, gray)
- Navigation buttons at bottom:
  - "Back" button (outline, left side) - hidden on first screen
  - "Next" button (filled, Okada Green, right side) - changes to "Get Started" on last screen

**Screen 1.3: Benefits**
- **Illustration**: Colorful drawing of fresh produce (tomatoes, onions, fruits) with shopping basket
- **Headline**: "Fresh Groceries Delivered to Your Door"
- **Description**: "Get everything you need from your local market delivered in 30-45 minutes"
- **Cultural Element**: Ndop pattern border at bottom

**Screen 1.4: Features**
- **Illustration**: Smartphone mockup showing product categories with Cameroon flag colors
- **Headline**: "Thousands of Products at Your Fingertips"
- **Description**: "Browse fresh produce, household essentials, and more with easy search and filters"
- **Cultural Element**: Market-inspired color palette in illustration

**Screen 1.5: Delivery**
- **Illustration**: Motorcycle rider (Okada Yellow) with delivery box, map in background
- **Headline**: "Track Your Order in Real-Time"
- **Description**: "Know exactly when your order will arrive with live tracking and notifications"
- **Cultural Element**: Cameroon landmarks in background illustration
- **CTA**: "Get Started" button (prominent, Okada Green)

**Behavior**:
- Swipe left/right to navigate between screens
- Tap "Next" to advance
- Tap "Skip" to jump directly to registration
- Auto-advance after 5 seconds of inactivity (optional)
- Progress dots update to show current position

**Technical Requirements**:
- Smooth swipe animations (60fps)
- Preload all images for instant transitions
- Minimal data usage (compressed illustrations)

---

#### Screen 1.6: Registration

**Purpose**: Create new user account

**Layout**:
- White background
- Scrollable form
- Okada logo at top (small, 60x60px)
- Heading: "Create Your Account"
- Form fields (stacked vertically with spacing)
- Terms and conditions checkbox
- Primary CTA button
- Secondary link to login

**Form Components**:

1. **Phone Number Field**:
   - Label: "Phone Number"
   - Input: Country code dropdown (+237 Cameroon, pre-selected) + number input
   - Placeholder: "6 XX XX XX XX"
   - Validation: Real-time format checking (must start with 6, 9 digits total)
   - Error message: "Please enter a valid Cameroon phone number"
   - Helper text: "We'll send you a verification code"

2. **Full Name Field**:
   - Label: "Full Name"
   - Input: Text field
   - Placeholder: "Jean-Paul Fotso"
   - Validation: Minimum 2 characters, letters and spaces only
   - Error message: "Please enter your full name"

3. **Password Field**:
   - Label: "Password"
   - Input: Password field with show/hide toggle (eye icon)
   - Placeholder: "Create a strong password"
   - Validation: Minimum 8 characters, at least one number
   - Strength indicator: Weak (red) / Medium (amber) / Strong (green)
   - Error message: "Password must be at least 8 characters with one number"

4. **Confirm Password Field**:
   - Label: "Confirm Password"
   - Input: Password field
   - Placeholder: "Re-enter your password"
   - Validation: Must match password field
   - Error message: "Passwords do not match"

5. **Terms Checkbox**:
   - Checkbox + text: "I agree to the Terms and Conditions and Privacy Policy"
   - Links: "Terms and Conditions" and "Privacy Policy" open in modal
   - Validation: Must be checked to proceed

6. **Create Account Button**:
   - Full-width button
   - Background: Okada Green
   - Text: "Create Account" (white, Inter Medium, 16px)
   - Disabled state: Gray background until form is valid
   - Loading state: Spinner replaces text during API call

7. **Login Link**:
   - Text: "Already have an account? Login"
   - Style: Centered, Okada Green color, underlined on hover

**Behavior**:
- Real-time validation on field blur
- Form submit on button click
- API call to create account
- On success: Send SMS verification code, navigate to phone verification screen
- On error: Display error message (e.g., "Phone number already registered")

**Technical Requirements**:
- Client-side validation before API call
- Secure password handling (no plain text storage)
- Rate limiting on registration attempts
- Offline mode: Show error message, queue registration for when online

**Cameroon-Specific Adaptations**:
- Phone number format specific to Cameroon (6XXXXXXXX)
- Support for common Cameroonian names (including hyphens, apostrophes)
- French/English language toggle available

---

#### Screen 1.7: Login

**Purpose**: Existing users sign in to their accounts

**Layout**:
- Similar to registration screen
- Okada logo at top
- Heading: "Welcome Back"
- Simplified form (phone/email + password)
- Primary CTA button
- Secondary links

**Form Components**:

1. **Phone/Email Field**:
   - Label: "Phone Number or Email"
   - Input: Text field
   - Placeholder: "6 XX XX XX XX or email@example.com"
   - Validation: Check format (phone or email)

2. **Password Field**:
   - Label: "Password"
   - Input: Password field with show/hide toggle
   - Placeholder: "Enter your password"

3. **Remember Me Checkbox**:
   - Checkbox + text: "Remember me on this device"
   - Default: Unchecked

4. **Forgot Password Link**:
   - Text: "Forgot Password?"
   - Style: Right-aligned, Okada Green, underlined on hover
   - Action: Opens password recovery flow

5. **Login Button**:
   - Full-width button
   - Background: Okada Green
   - Text: "Login"
   - Loading state during authentication

6. **Register Link**:
   - Text: "New to Okada? Create Account"
   - Style: Centered, Okada Green

**Behavior**:
- Form validation on submit
- API call to authenticate
- On success: Navigate to home screen
- On error: Display error message ("Invalid credentials")
- Biometric option (fingerprint/face) if previously enabled

**Technical Requirements**:
- Secure credential handling
- Token-based authentication
- Session management
- Offline mode: Use cached credentials if available

---

### 2. Home & Navigation (3 screens)

#### Screen 2.1: Home Screen

**Purpose**: Primary landing screen for browsing and discovering products

**Layout**:
- **Header** (fixed at top):
  - Delivery address (left): "Delivering to: Ngoa-Ekelle" with dropdown icon
  - Notification bell icon (right) with badge if unread notifications
  - Background: Okada Green with subtle Ndop pattern

- **Search Bar** (below header):
  - Icon: Magnifying glass (left)
  - Placeholder: "Search for products..."
  - Background: White with shadow
  - Tap opens search screen

- **Main Content** (scrollable):
  
  1. **Promotional Banner Section**:
     - Carousel of 3-5 promotional banners
     - Auto-scroll every 5 seconds
     - Dot indicators at bottom
     - Examples: "20% off first order", "Free delivery today", "Fresh fish just arrived"
     - Tappable to view promotion details

  2. **Category Grid**:
     - Heading: "Shop by Category"
     - 2-column grid (4 rows visible, scrollable)
     - Each category card:
       - Icon (colorful, 48x48px)
       - Name (e.g., "Fresh Produce", "Dairy & Eggs")
       - Background: White card with shadow
       - Tap opens category detail screen
     - Categories: Fresh Produce, Dairy & Eggs, Meat & Fish, Bakery, Beverages, Household, Personal Care, Baby & Kids

  3. **Frequently Bought Section** (personalized):
     - Heading: "Your Favorites"
     - Horizontal scroll of product cards
     - Shows 4-6 products user frequently orders
     - Product card: Image, name, price, "Add" button

  4. **Fresh Today Section**:
     - Heading: "Fresh Today"
     - Horizontal scroll of fresh produce
     - Highlights products that arrived today
     - Product card with "Fresh" badge

  5. **Special Offers Section**:
     - Heading: "Limited Time Offers"
     - Grid of 2-4 discounted products
     - Product card with discount percentage badge

- **Bottom Navigation Bar** (fixed):
  - Home icon (active, Okada Green)
  - Categories icon
  - Orders icon
  - Account icon
  - Each with label below icon

**Components**:
- Address selector (dropdown)
- Search bar (input field)
- Promotional banner carousel
- Category cards (8 items)
- Product cards (horizontal scroll lists)
- Bottom navigation (4 tabs)

**Behavior**:
- Pull-to-refresh to update content
- Scroll to load more sections
- Tap category card → Category Detail screen
- Tap product card → Product Detail screen
- Tap search bar → Search screen
- Tap address → Address selection modal
- Tap notification bell → Notification Center

**Data Requirements**:
- User's default delivery address
- Promotional banners (from CMS)
- Product categories (from API)
- Personalized product recommendations (from AI)
- Fresh products (inventory data)
- Special offers (promotions API)

**Technical Requirements**:
- Lazy loading for images
- Caching for faster subsequent loads
- Offline mode: Show cached content with "Offline" indicator
- Performance: Render in <1 second on low-end devices

**Cameroon-Specific Adaptations**:
- Bilingual category names (French/English)
- Prices in CFA
- Products relevant to Cameroonian cuisine
- Promotional timing aligned with local shopping patterns

---

#### Screen 2.2: Bottom Navigation

**Purpose**: Primary navigation across main app sections

**Layout**:
- Fixed bar at bottom of screen
- Height: 64px
- Background: White with top border (gray)
- 4 navigation items evenly spaced

**Navigation Items**:

1. **Home**:
   - Icon: House outline (inactive), House filled (active)
   - Label: "Home"
   - Color: Gray (inactive), Okada Green (active)
   - Destination: Home Screen

2. **Categories**:
   - Icon: Grid outline (inactive), Grid filled (active)
   - Label: "Categories"
   - Color: Gray (inactive), Okada Green (active)
   - Destination: Category List Screen

3. **Orders**:
   - Icon: Shopping bag outline (inactive), Shopping bag filled (active)
   - Label: "Orders"
   - Badge: Red dot if active order exists
   - Color: Gray (inactive), Okada Green (active)
   - Destination: Orders List Screen

4. **Account**:
   - Icon: User outline (inactive), User filled (active)
   - Label: "Account"
   - Color: Gray (inactive), Okada Green (active)
   - Destination: Profile Screen

**Behavior**:
- Tap on item switches to that screen
- Active item highlighted with color and filled icon
- Smooth transition between screens (no reload)
- Persists across most screens (hidden on checkout flow)

**Technical Requirements**:
- React Navigation or similar routing library
- State management to track active tab
- Minimal re-rendering on tab switch

---

#### Screen 2.3: Notification Center

**Purpose**: Display app notifications and updates

**Layout**:
- **Header**:
  - Title: "Notifications"
  - Back button (left)
  - Mark all as read (right, text link)
  - Background: Okada Green

- **Notification List** (scrollable):
  - Grouped by date: "Today", "Yesterday", "This Week", "Older"
  - Each notification card:
    - Icon (left): Order, Promotion, System, etc.
    - Title (bold): e.g., "Order Delivered"
    - Message: e.g., "Your order #OKD-123 was delivered successfully"
    - Timestamp: "2 hours ago"
    - Unread indicator: Green dot (left of icon)
    - Background: White (unread), Light gray (read)
    - Tap to view details or navigate to related screen

**Notification Types**:
1. **Order Updates**: Status changes (preparing, out for delivery, delivered)
2. **Promotions**: New offers, discounts, deals
3. **System**: App updates, maintenance notices
4. **Account**: Password changes, profile updates

**Behavior**:
- Pull-to-refresh to check for new notifications
- Tap notification → Navigate to relevant screen (e.g., order detail)
- Swipe left → Delete notification
- Mark all as read → Clears unread indicators

**Data Requirements**:
- Notifications from API (real-time via push notifications)
- Local storage for offline access

**Technical Requirements**:
- Firebase Cloud Messaging or similar for push notifications
- Background sync for new notifications
- Offline mode: Show cached notifications

---

### 3. Product Discovery (7 screens)

#### Screen 3.1: Category List

**Purpose**: Browse all product categories

**Layout**:
- **Header**:
  - Title: "Categories"
  - Back button (left)
  - Search icon (right)
  - Background: Okada Green

- **Category List** (scrollable):
  - Each category as a full-width card:
    - Category icon (left, 64x64px, colorful)
    - Category name (Inter Bold, 18px)
    - Product count: "234 products"
    - Chevron right icon (right)
    - Background: White with bottom border
    - Tap opens Category Detail screen

**Categories** (in order):
1. Fresh Produce (green icon)
2. Dairy & Eggs (blue icon)
3. Meat & Fish (red icon)
4. Bakery (orange icon)
5. Beverages (purple icon)
6. Pantry Staples (brown icon)
7. Household (yellow icon)
8. Personal Care (pink icon)
9. Baby & Kids (light blue icon)
10. Pet Supplies (green icon)

**Behavior**:
- Tap category → Category Detail screen
- Tap search icon → Search screen
- Pull-to-refresh to update product counts

**Data Requirements**:
- Category list from API
- Product counts per category

**Technical Requirements**:
- Fast rendering (list virtualization)
- Cached data for offline access

---

#### Screen 3.2: Category Detail

**Purpose**: Browse products within a specific category

**Layout**:
- **Header**:
  - Back button (left)
  - Category name (center): e.g., "Fresh Produce"
  - Filter icon (right)
  - Sort icon (right)
  - Background: Okada Green

- **Subcategory Tabs** (horizontal scroll):
  - "All" (default selected)
  - Subcategory names: "Vegetables", "Fruits", "Herbs"
  - Active tab: Okada Green underline
  - Inactive tabs: Gray text

- **Product Grid** (scrollable):
  - 2-column grid
  - Product cards:
    - Product image (square, 150x150px)
    - Product name (2 lines max, ellipsis)
    - Price: "500 CFA/kg" (Inter Bold, Okada Green)
    - Stock status: "In Stock" (green) / "Low Stock" (amber) / "Out of Stock" (red)
    - Add to cart button: "+" icon in circle (Okada Green)
    - Tap card → Product Detail screen
    - Tap "+" → Add to cart (quantity 1)

**Behavior**:
- Tap subcategory tab → Filter products
- Tap filter icon → Open Filter modal
- Tap sort icon → Open Sort modal
- Scroll to bottom → Load more products (pagination)
- Tap product card → Product Detail screen
- Tap "+" → Add to cart with animation

**Data Requirements**:
- Products for selected category/subcategory
- Inventory status for each product

**Technical Requirements**:
- Lazy loading for images
- Pagination (load 20 products at a time)
- Offline mode: Show cached products

**Cameroon-Specific Adaptations**:
- Products relevant to Cameroonian cuisine
- Prices in CFA
- Stock status reflects local inventory

---

#### Screen 3.3: Search Screen

**Purpose**: Search for products by name or keyword

**Layout**:
- **Search Header**:
  - Back button (left)
  - Search input field (center, auto-focused)
  - Clear button (right, appears when text entered)
  - Background: Okada Green

- **Search Suggestions** (before search):
  - **Recent Searches**:
    - Heading: "Recent Searches"
    - List of last 5 searches
    - Each with clock icon and "X" to remove
    - Tap to search again
  - **Trending Searches**:
    - Heading: "Trending Now"
    - List of popular searches
    - Each with trending icon
    - Tap to search
  - **Popular Categories**:
    - Quick access to top categories
    - Icon + name
    - Tap opens category

- **Search Results** (after search):
  - Results count: "24 products found for 'tomatoes'"
  - Product grid (same as Category Detail)
  - Empty state if no results: "No products found. Try a different search."

**Behavior**:
- Auto-focus search input on screen load
- Real-time search suggestions as user types
- Debounced API call (300ms after last keystroke)
- Tap suggestion → Execute search
- Tap clear → Clear input and show suggestions again
- Tap product → Product Detail screen

**Data Requirements**:
- Search API endpoint
- Recent searches (local storage)
- Trending searches (from API)

**Technical Requirements**:
- Fast search response (<500ms)
- Offline mode: Search cached products only
- Typo tolerance in search algorithm

---

#### Screen 3.4: Filter Screen

**Purpose**: Filter products by various criteria

**Layout** (Modal overlay):
- **Header**:
  - Title: "Filters"
  - Close button (left)
  - Reset button (right, text link)
  - Background: Okada Green

- **Filter Options** (scrollable):
  
  1. **Price Range**:
     - Heading: "Price Range"
     - Dual-handle slider
     - Min and max price inputs
     - Range: 0 - 50,000 CFA

  2. **Stock Status**:
     - Heading: "Availability"
     - Checkboxes:
       - ☑ In Stock
       - ☐ Low Stock
       - ☐ Include Out of Stock

  3. **Subcategory** (if in category):
     - Heading: "Subcategory"
     - Checkboxes for each subcategory
     - Example: ☑ Vegetables, ☐ Fruits

  4. **Brand** (if applicable):
     - Heading: "Brand"
     - Checkboxes for top brands
     - "Show more" to expand

  5. **Discount**:
     - Heading: "Discounts"
     - Checkboxes:
       - ☐ On Sale
       - ☐ 10% or more
       - ☐ 20% or more

- **Footer** (fixed at bottom):
  - "Apply Filters" button (full-width, Okada Green)
  - Shows count: "Apply Filters (24 products)"

**Behavior**:
- Select/deselect checkboxes to filter
- Adjust price slider to set range
- Product count updates in real-time
- Tap "Apply Filters" → Close modal, show filtered results
- Tap "Reset" → Clear all filters
- Tap "Close" → Close modal without applying

**Technical Requirements**:
- Client-side filtering for fast response
- Persist filter state during session

---

#### Screen 3.5: Sort Options

**Purpose**: Sort products by different criteria

**Layout** (Bottom sheet modal):
- **Header**:
  - Title: "Sort By"
  - Close button (right)

- **Sort Options** (list):
  - Radio buttons for each option:
    - ○ Relevance (default)
    - ○ Price: Low to High
    - ○ Price: High to Low
    - ○ Popularity
    - ○ Newest First
    - ○ Discount: High to Low
  - Selected option: Filled radio button (Okada Green)

**Behavior**:
- Tap option → Select and close modal
- Products re-sorted immediately
- Selection persists during session

---

#### Screen 3.6: Product Detail

**Purpose**: Display comprehensive product information

**Layout** (scrollable):
- **Product Image Gallery**:
  - Large image (full width, 300px height)
  - Swipeable if multiple images
  - Dot indicators for multiple images
  - Zoom on tap (optional)

- **Product Information**:
  - Product name (Inter Bold, 24px)
  - Price (Inter Bold, 20px, Okada Green): "500 CFA/kg"
  - Stock status badge: "In Stock" (green)
  - Rating: 4.5 stars (234 reviews) - tap to view reviews
  - Favorite icon (heart, top right) - tap to add to wishlist

- **Quantity Selector**:
  - Label: "Quantity"
  - Minus button (-) | Quantity display (1 kg) | Plus button (+)
  - Unit selector (if applicable): kg / piece / liter
  - Total price updates: "Total: 500 CFA"

- **Product Description**:
  - Heading: "Description"
  - Text: "Locally sourced fresh tomatoes from Douala farms. Perfect for sauces, salads, and cooking."
  - Expandable if long

- **Nutritional Information** (if applicable):
  - Heading: "Nutritional Information"
  - Table: Calories, Protein, Carbs, Fat, etc.
  - Expandable/collapsible

- **Customer Reviews**:
  - Heading: "Customer Reviews (234)"
  - Average rating: 4.5 stars
  - Rating breakdown: 5★ (180), 4★ (40), 3★ (10), 2★ (3), 1★ (1)
  - Top 3 reviews with user name, rating, comment
  - "View All Reviews" link

- **Frequently Bought Together**:
  - Heading: "Frequently Bought Together"
  - Horizontal scroll of 3-4 related products
  - Product cards with "Add" button

- **Footer** (fixed at bottom):
  - "Add to Cart" button (full-width, Okada Green)
  - Shows total: "Add to Cart - 500 CFA"

**Behavior**:
- Swipe image gallery to view multiple images
- Tap +/- to adjust quantity
- Tap unit selector to change unit (if applicable)
- Tap "Add to Cart" → Add product, show success toast, update cart badge
- Tap favorite icon → Add/remove from wishlist
- Tap reviews → Open Reviews screen
- Tap related product → Navigate to that product's detail

**Data Requirements**:
- Product details from API
- Inventory status
- Customer reviews
- Related products (AI recommendations)

**Technical Requirements**:
- High-quality images (optimized for mobile)
- Lazy loading for reviews and related products
- Offline mode: Show cached product data

**Cameroon-Specific Adaptations**:
- Prices in CFA
- Units common in Cameroon (kg, liters, pieces)
- Reviews in French and English

---

### 4. Shopping Cart & Checkout (8 screens)

#### Screen 4.1: Cart Screen

**Purpose**: Review and manage items before checkout

**Layout**:
- **Header**:
  - Title: "My Cart"
  - Back button (left)
  - Clear cart button (right, text link)
  - Background: Okada Green

- **Cart Items List** (scrollable):
  - Each cart item card:
    - Product image (left, 80x80px)
    - Product name (top)
    - Price per unit: "500 CFA/kg"
    - Quantity selector: - | 2 kg | +
    - Subtotal: "1,000 CFA"
    - Remove button (trash icon, right)
    - Swipe left to delete (alternative)

- **Promo Code Section** (expandable):
  - "Have a promo code?" (tap to expand)
  - Input field: "Enter promo code"
  - Apply button
  - Success/error message display

- **Order Summary** (sticky at bottom):
  - Subtotal: "18,500 CFA"
  - Delivery Fee: "1,000 CFA"
  - Discount: "-3,900 CFA" (if promo applied, in green)
  - Total: "15,600 CFA" (Inter Bold, 20px)
  - "Proceed to Checkout" button (full-width, Okada Green)

- **Empty Cart State**:
  - Illustration of empty cart
  - Message: "Your cart is empty"
  - "Start Shopping" button

**Behavior**:
- Tap +/- to adjust quantity → Update subtotal and total
- Tap remove → Confirm deletion, remove item
- Swipe left → Delete item
- Enter promo code, tap Apply → Validate code, apply discount
- Tap "Proceed to Checkout" → Navigate to Delivery Address screen
- Tap "Clear cart" → Confirm, empty cart

**Data Requirements**:
- Cart items (local storage + synced to server)
- Product prices and availability
- Promo code validation (API)
- Delivery fee calculation

**Technical Requirements**:
- Real-time price calculation
- Optimistic UI updates (instant feedback)
- Sync cart to server for cross-device access
- Offline mode: Show cached cart, queue updates

**Cameroon-Specific Adaptations**:
- Prices in CFA
- Delivery fee based on location in Cameroon

---

#### Screen 4.2: Checkout - Delivery Address

**Purpose**: Select or add delivery address

**Layout**:
- **Header**:
  - Title: "Delivery Address"
  - Back button (left)
  - Background: Okada Green

- **Saved Addresses List**:
  - Each address card:
    - Address type icon (Home, Work, Other)
    - Label: "Home"
    - Full address: "Emana, Near St. Joseph Church, Yaoundé"
    - Landmark: "Near St. Joseph Church"
    - Phone: "6XX XXX XXX"
    - Default badge (if default address)
    - Radio button (right) - selected state: Okada Green
    - Edit button (pencil icon)
    - Tap card to select

- **Add New Address Button**:
  - "+ Add New Address" (outlined button)
  - Opens Add Address screen

- **Delivery Instructions** (optional):
  - Text area: "Add delivery instructions (optional)"
  - Placeholder: "e.g., Please call when you arrive"
  - Max 200 characters

- **Delivery Time Selection**:
  - Heading: "Delivery Time"
  - Options (radio buttons):
    - ○ ASAP (30-45 minutes)
    - ○ Schedule for later (opens time picker)
  - Selected option: Filled radio button (Okada Green)

- **Footer**:
  - "Continue to Payment" button (full-width, Okada Green)

**Behavior**:
- Tap address card → Select address
- Tap Edit → Open Edit Address screen
- Tap "Add New Address" → Open Add Address screen
- Select delivery time option
- Tap "Continue to Payment" → Navigate to Payment Method screen

**Data Requirements**:
- User's saved addresses (from API)
- Delivery zones and fees

**Technical Requirements**:
- Validate address is within delivery zone
- Calculate delivery fee based on address
- Offline mode: Show cached addresses, queue updates

---

#### Screen 4.3: Checkout - Payment Method

**Purpose**: Select payment method for order

**Layout**:
- **Header**:
  - Title: "Payment Method"
  - Back button (left)
  - Background: Okada Green

- **Payment Options List**:
  
  1. **MTN Mobile Money**:
     - MTN logo (left)
     - "MTN Mobile Money" (Inter Bold)
     - Saved number: "6XX XXX XXX" (if saved)
     - Radio button (right)
     - Tap to select and expand

  2. **Orange Money**:
     - Orange logo (left)
     - "Orange Money" (Inter Bold)
     - Saved number: "6YY YYY YYY" (if saved)
     - Radio button (right)
     - Tap to select and expand

  3. **Cash on Delivery**:
     - Cash icon (left)
     - "Cash on Delivery" (Inter Bold)
     - "Pay when your order arrives"
     - Radio button (right)

  4. **Bank Card**:
     - Card icon (left)
     - "Debit/Credit Card" (Inter Bold)
     - "+ Add Card" or saved card ending (if saved)
     - Radio button (right)

- **Selected Payment Details** (expanded section):
  - For Mobile Money:
    - Phone number input: "Enter MTN/Orange Money number"
    - "Save for future orders" checkbox
  - For Bank Card:
    - Card number input
    - Expiry date and CVV inputs
    - "Save card" checkbox

- **Order Summary** (sticky at bottom):
  - Total: "15,600 CFA"
  - "Place Order" button (full-width, Okada Green)

**Behavior**:
- Tap payment option → Select and expand details
- Enter payment details (phone number or card info)
- Check "Save" to store payment method
- Tap "Place Order" → Process payment, navigate to Order Confirmation

**Data Requirements**:
- Saved payment methods (from API)
- Payment gateway integration (MTN, Orange, card processor)

**Technical Requirements**:
- Secure payment handling (PCI compliance for cards)
- Integration with MTN Mobile Money API
- Integration with Orange Money API
- Offline mode: Queue order for when online

**Cameroon-Specific Adaptations**:
- MTN Mobile Money and Orange Money as primary options
- Cash on Delivery for users without mobile money
- Phone number format validation for Cameroon

---

#### Screen 4.4: Payment Processing

**Purpose**: Show payment in progress

**Layout**:
- White background
- Centered content:
  - Loading spinner (large, Okada Green)
  - Message: "Processing your payment..."
  - Submessage: "Please do not close this screen"
  - Okada logo (small, at bottom)

**Behavior**:
- Displays while payment is being processed
- For Mobile Money: User receives USSD prompt on their phone
- User enters PIN on USSD prompt
- System receives payment confirmation
- On success: Navigate to Order Confirmation screen
- On failure: Show error message, return to Payment Method screen

**Technical Requirements**:
- Timeout after 60 seconds if no response
- Handle payment failures gracefully
- Retry mechanism for network issues

---

#### Screen 4.5: Order Confirmation

**Purpose**: Confirm successful order placement

**Layout**:
- **Success Animation**:
  - Green checkmark with confetti animation
  - "Order Placed Successfully!" (Inter Bold, 24px, Okada Green)

- **Order Details**:
  - Order number: "#OKD-20251106-0234" (large, bold)
  - Estimated delivery: "5:30 PM - 6:15 PM" (highlighted)
  - Delivery address: "Emana, Near St. Joseph Church"
  - Total paid: "15,600 CFA"

- **Order Summary** (expandable):
  - "View Order Details" (tap to expand)
  - List of items ordered
  - Payment method used

- **Action Buttons**:
  - "Track Your Order" (primary button, Okada Green)
  - "Continue Shopping" (secondary button, outlined)

- **Confirmation Message**:
  - "We've sent a confirmation SMS to your phone"
  - "You'll receive updates as your order progresses"

**Behavior**:
- Display for 3-5 seconds with animation
- Tap "Track Your Order" → Navigate to Order Tracking screen
- Tap "Continue Shopping" → Navigate to Home screen
- System sends SMS confirmation
- System clears cart

**Data Requirements**:
- Order details from API
- SMS service for confirmation

**Technical Requirements**:
- Ensure order is saved before showing confirmation
- Handle edge cases (payment success but order creation failure)

---

### 5. Order Management (5 screens)

#### Screen 5.1: Orders List

**Purpose**: View all past and current orders

**Layout**:
- **Header**:
  - Title: "My Orders"
  - Back button (left)
  - Filter icon (right)
  - Background: Okada Green

- **Tabs** (horizontal):
  - "Active" (default selected)
  - "Completed"
  - "Cancelled"
  - Active tab: Okada Green underline

- **Orders List** (scrollable):
  - Each order card:
    - Order number: "#OKD-20251106-0234"
    - Order date: "Nov 6, 2025"
    - Status badge: "Out for Delivery" (color-coded)
    - Items preview: "3 items" with first item image
    - Total: "15,600 CFA"
    - Primary action button: "Track Order" (for active) or "Reorder" (for completed)
    - Tap card → Order Detail screen

- **Empty State** (if no orders):
  - Illustration
  - Message: "No orders yet"
  - "Start Shopping" button

**Behavior**:
- Tap tab → Filter orders by status
- Tap order card → Order Detail screen
- Tap "Track Order" → Order Tracking screen
- Tap "Reorder" → Add items to cart
- Pull-to-refresh to update orders

**Data Requirements**:
- User's orders (from API)
- Order statuses

**Technical Requirements**:
- Real-time updates for active orders
- Pagination for long order history
- Offline mode: Show cached orders

---

#### Screen 5.2: Order Detail

**Purpose**: View detailed information about a specific order

**Layout**:
- **Header**:
  - Title: "Order Details"
  - Back button (left)
  - Share icon (right) - share order details
  - Background: Okada Green

- **Order Status Section**:
  - Order number: "#OKD-20251106-0234"
  - Status badge: "Out for Delivery" (large, color-coded)
  - Estimated delivery: "5:30 PM - 6:15 PM"
  - "Track Order" button (if active order)

- **Order Timeline** (for active orders):
  - ✓ Order Placed (4:45 PM)
  - ✓ Preparing Your Order (4:50 PM)
  - ⏳ Out for Delivery (5:00 PM) - current
  - ⏳ Delivered

- **Delivery Information**:
  - Heading: "Delivery Address"
  - Address: "Emana, Near St. Joseph Church, Yaoundé"
  - Instructions: "Please call when you arrive"
  - Delivery time: "ASAP (30-45 minutes)"

- **Rider Information** (if assigned):
  - Heading: "Your Rider"
  - Rider name: "Emmanuel T."
  - Rider rating: 4.8 stars
  - Rider phone: "6XX XXX XXX" (masked)
  - "Call Rider" button
  - "Message Rider" button

- **Order Items**:
  - Heading: "Order Items (3)"
  - List of items:
    - Product image, name, quantity, price
    - Example: Fresh Tomatoes - 2 kg - 1,000 CFA

- **Payment Summary**:
  - Subtotal: "18,500 CFA"
  - Delivery Fee: "1,000 CFA"
  - Discount: "-3,900 CFA"
  - Total: "15,600 CFA" (bold)
  - Payment method: "Orange Money - 6YY YYY YYY"

- **Action Buttons** (for completed orders):
  - "Reorder" button
  - "Rate Order" button (if not rated)
  - "Get Help" button

**Behavior**:
- Tap "Track Order" → Order Tracking screen
- Tap "Call Rider" → Initiate phone call
- Tap "Message Rider" → Open chat
- Tap "Reorder" → Add items to cart
- Tap "Rate Order" → Open rating screen
- Tap "Get Help" → Open support chat

**Data Requirements**:
- Order details (from API)
- Real-time status updates
- Rider information (if assigned)

**Technical Requirements**:
- Real-time updates via WebSocket or polling
- Offline mode: Show cached order details

---

#### Screen 5.3: Order Tracking

**Purpose**: Track order in real-time with map

**Layout**:
- **Map View** (top 60% of screen):
  - Live map showing:
    - Dark store location (green pin)
    - Delivery address (red pin)
    - Rider location (blue dot, updates in real-time)
    - Route path (dotted line)
  - Zoom controls
  - "Center on Rider" button

- **Order Status Card** (bottom 40%, draggable):
  - Order number: "#OKD-20251106-0234"
  - Status: "Out for Delivery"
  - Estimated arrival: "5:30 PM - 6:15 PM"
  - Progress bar showing order stages
  - Rider information:
    - Name: "Emmanuel T."
    - Rating: 4.8 stars
    - Phone: "Call" button
  - "View Order Details" link

**Behavior**:
- Map updates rider location every 10 seconds
- Drag status card up to expand, down to minimize
- Tap "Call" → Initiate phone call to rider
- Tap "View Order Details" → Order Detail screen
- Receive push notification when rider is nearby

**Data Requirements**:
- Order details
- Rider location (real-time)
- Route information

**Technical Requirements**:
- Google Maps or Mapbox integration
- Real-time location updates via WebSocket
- Offline mode: Show last known location

**Cameroon-Specific Adaptations**:
- Map tiles cached for offline use
- Landmark-based navigation hints
- Low-bandwidth mode for map updates

---

#### Screen 5.4: Delivery Confirmation & Rating

**Purpose**: Confirm delivery and rate the experience

**Layout**:
- **Delivery Confirmation**:
  - "Order Delivered!" (Inter Bold, 24px, Okada Green)
  - Order number: "#OKD-20251106-0234"
  - Delivery time: "5:25 PM"
  - Delivery photo (if rider took photo)

- **Rate Your Experience**:
  - Heading: "How was your experience?"
  - Star rating (1-5 stars, large, tappable)
  - Selected stars: Okada Yellow
  - Unselected stars: Gray outline

- **Rate Your Rider**:
  - Heading: "Rate Your Rider"
  - Rider name: "Emmanuel T."
  - Star rating (1-5 stars)

- **Feedback** (optional):
  - Text area: "Tell us more (optional)"
  - Placeholder: "What did you like or dislike?"
  - Max 500 characters

- **Quick Feedback Tags** (optional):
  - Tappable tags: "Fast Delivery", "Fresh Products", "Friendly Rider", "Well Packaged"
  - Selected tags: Okada Green background

- **Submit Button**:
  - "Submit Rating" (full-width, Okada Green)
  - "Skip" link (gray, below button)

**Behavior**:
- Tap stars to rate (1-5)
- Tap feedback tags to select/deselect
- Enter optional text feedback
- Tap "Submit Rating" → Send rating, navigate to Home or Orders screen
- Tap "Skip" → Navigate without rating (can rate later)

**Data Requirements**:
- Order details
- Rating submission API

**Technical Requirements**:
- Ensure rating is submitted before allowing skip
- Offline mode: Queue rating for when online

---

### 6. Account Management (7 screens)

#### Screen 6.1: Profile Screen

**Purpose**: View and manage user account

**Layout**:
- **Header**:
  - Title: "My Account"
  - Back button (left)
  - Settings icon (right)
  - Background: Okada Green

- **Profile Section**:
  - Profile photo (circular, 80x80px) - tap to change
  - User name: "Jean-Paul Fotso"
  - Phone number: "6XX XXX XXX"
  - Email: "jeanpaul@example.com"
  - "Edit Profile" button

- **Account Options** (list):
  
  1. **My Orders**:
     - Icon: Shopping bag
     - Label: "My Orders"
     - Chevron right
     - Tap → Orders List screen

  2. **Addresses**:
     - Icon: Location pin
     - Label: "Delivery Addresses"
     - Chevron right
     - Tap → Address Management screen

  3. **Payment Methods**:
     - Icon: Credit card
     - Label: "Payment Methods"
     - Chevron right
     - Tap → Payment Methods screen

  4. **Okada Prime** (if applicable):
     - Icon: Star
     - Label: "Okada Prime Subscription"
     - Badge: "Active" or "Subscribe"
     - Chevron right
     - Tap → Subscription screen

  5. **Refer a Friend**:
     - Icon: Gift
     - Label: "Refer a Friend"
     - Badge: "Earn 5,000 CFA"
     - Chevron right
     - Tap → Referral screen

  6. **Help Center**:
     - Icon: Question mark
     - Label: "Help & Support"
     - Chevron right
     - Tap → Help Center screen

  7. **Settings**:
     - Icon: Gear
     - Label: "Settings"
     - Chevron right
     - Tap → Settings screen

  8. **Logout**:
     - Icon: Logout
     - Label: "Logout"
     - Color: Red
     - Tap → Confirm logout, return to login screen

**Behavior**:
- Tap profile photo → Open photo picker, update photo
- Tap "Edit Profile" → Edit Profile screen
- Tap any option → Navigate to respective screen
- Tap "Logout" → Confirm dialog, logout, clear session

**Data Requirements**:
- User profile data (from API)

**Technical Requirements**:
- Cached profile data for offline viewing
- Image upload for profile photo

---

## Conclusion

This comprehensive screen inventory provides detailed specifications for all 177 screens across the Okada platform. Each screen is designed with Cameroon's specific market conditions in mind, including offline functionality, bilingual support, and cultural relevance. The specifications serve as a complete blueprint for design and development teams to build a cohesive, user-friendly quick commerce platform.

**Next Steps**:
1. Create high-fidelity mockups for each screen
2. Develop interactive prototypes
3. Conduct user testing in Cameroon
4. Iterate based on feedback
5. Begin phased development

---

**Document Control**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | November 2025 | Initial comprehensive screen specifications | Manus AI |


