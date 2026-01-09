# Customer Mobile App User Journey & Screen Map

## Overview

The Okada customer mobile application enables users in Cameroon to browse products, place orders, and track deliveries from local dark stores. The app is designed with offline functionality, bilingual support (French and English), and optimization for variable network conditions common in Cameroon.

## User Personas

### Primary Persona: Urban Professional
- **Name**: Marie Nguemo
- **Age**: 32
- **Location**: Douala
- **Behavior**: Busy professional who values convenience and time-saving
- **Pain Points**: Limited time for shopping, frustrated by traffic congestion
- **Goals**: Quick access to essentials without disrupting work schedule

### Secondary Persona: University Student
- **Name**: Jean-Paul Mbarga
- **Age**: 22
- **Location**: Yaoundé
- **Behavior**: Tech-savvy, price-conscious, social shopper
- **Pain Points**: Limited budget, unreliable transportation
- **Goals**: Affordable access to groceries and study supplies

## Core User Journeys

### 1. First-Time User Onboarding

**User Goal**: Download the app and create an account

| Step | User Action | App Response | Screen |
|------|-------------|--------------|--------|
| 1 | Downloads and opens app | Shows splash screen with Okada logo in Cameroon flag colors | Splash Screen |
| 2 | Views onboarding screens | Displays key features and benefits | Onboarding Screens (3) |
| 3 | Selects language preference | Switches app language to French or English | Language Selection |
| 4 | Taps "Create Account" | Shows registration form | Registration Screen |
| 5 | Enters personal information | Validates information in real-time | Registration Screen |
| 6 | Verifies phone number | Sends and validates OTP | Phone Verification |
| 7 | Sets delivery address | Shows address input with map and landmark option | Address Setup |
| 8 | Completes registration | Shows success message and proceeds to home | Registration Success |

### 2. Product Discovery and Search

**User Goal**: Find specific products or browse categories

| Step | User Action | App Response | Screen |
|------|-------------|--------------|--------|
| 1 | Opens app (returning user) | Shows personalized home screen with recommendations | Home Screen |
| 2 | Browses product categories | Displays category grid with icons | Category List |
| 3 | Selects a category | Shows products within that category | Category Detail |
| 4 | Uses search bar | Shows search interface with voice search option | Search Screen |
| 5 | Enters search term | Displays real-time search results | Search Results |
| 6 | Applies filters | Filters products by price, brand, etc. | Filter Screen |
| 7 | Sorts results | Reorders products by relevance, price, etc. | Search Results |
| 8 | Views product details | Shows detailed product information | Product Detail |

### 3. Order Placement

**User Goal**: Add products to cart and complete checkout

| Step | User Action | App Response | Screen |
|------|-------------|--------------|--------|
| 1 | Adds product to cart | Shows animation and updates cart count | Product Detail |
| 2 | Views cart | Displays all items in cart with quantities | Cart Screen |
| 3 | Adjusts quantities | Updates quantities and recalculates total | Cart Screen |
| 4 | Applies promotion code | Validates code and applies discount | Cart Screen |
| 5 | Proceeds to checkout | Shows delivery options and summary | Checkout - Delivery |
| 6 | Selects delivery time | Offers available time slots | Checkout - Delivery |
| 7 | Confirms delivery address | Shows saved addresses or option to add new | Checkout - Address |
| 8 | Selects payment method | Displays available payment options (MTN Money, Orange Money, Cash) | Checkout - Payment |
| 9 | Completes payment | Processes payment and shows confirmation | Payment Processing |
| 10 | Reviews order | Shows order summary and confirmation | Order Confirmation |

### 4. Order Tracking

**User Goal**: Track order status and delivery progress

| Step | User Action | App Response | Screen |
|------|-------------|--------------|--------|
| 1 | Views active orders | Shows list of current orders | Orders List |
| 2 | Selects specific order | Displays detailed order information | Order Detail |
| 3 | Tracks delivery status | Shows real-time map with rider location | Order Tracking |
| 4 | Communicates with rider | Opens in-app chat or call option | Rider Communication |
| 5 | Receives delivery notification | Shows push notification when rider is nearby | Notification |
| 6 | Confirms delivery | Allows rating and feedback submission | Delivery Confirmation |

### 5. Account Management

**User Goal**: Manage personal information and preferences

| Step | User Action | App Response | Screen |
|------|-------------|--------------|--------|
| 1 | Navigates to profile | Shows profile overview | Profile Screen |
| 2 | Edits personal information | Allows updating name, email, etc. | Edit Profile |
| 3 | Manages addresses | Shows saved addresses with edit options | Address Management |
| 4 | Views order history | Displays past orders with details | Order History |
| 5 | Manages payment methods | Shows saved payment methods | Payment Methods |
| 6 | Adjusts app settings | Allows changing language, notifications, etc. | Settings Screen |
| 7 | Accesses help center | Shows FAQs and support options | Help Center |

## Complete Screen Inventory

### Onboarding & Authentication (7 screens)
1. Splash Screen
2. Onboarding Screen 1 (Benefits)
3. Onboarding Screen 2 (Features)
4. Onboarding Screen 3 (Delivery)
5. Language Selection
6. Registration Screen
7. Login Screen

### Home & Navigation (3 screens)
8. Home Screen
9. Main Navigation (Bottom Tab Bar)
10. Notification Center

### Product Discovery (7 screens)
11. Category List
12. Category Detail
13. Search Screen
14. Search Results
15. Filter Screen
16. Sort Options
17. Product Detail

### Shopping Cart & Checkout (8 screens)
18. Cart Screen
19. Checkout - Delivery Options
20. Checkout - Address Selection
21. Checkout - Payment Selection
22. Payment Processing
23. MTN Money Integration
24. Orange Money Integration
25. Order Confirmation

### Order Management (5 screens)
26. Orders List
27. Order Detail
28. Order Tracking
29. Rider Communication
30. Delivery Confirmation & Rating

### Account Management (7 screens)
31. Profile Screen
32. Edit Profile
33. Address Management
34. Order History
35. Payment Methods
36. Settings Screen
37. Help Center

### Additional Utility Screens (5 screens)
38. Network Error Screen
39. Offline Mode Indicator
40. Promotion Screen
41. Referral Program
42. Feedback Form

## Offline Functionality Considerations

The customer app is designed with offline-first principles to handle Cameroon's variable network conditions:

1. **Cached Product Catalog**: Essential product information is cached for browsing without connectivity
2. **Offline Cart**: Users can add products to cart while offline
3. **Pending Orders Queue**: Orders created offline are queued for submission when connectivity returns
4. **Synchronized History**: Order history is synchronized when connection is restored
5. **Offline Maps**: Basic map functionality works without active internet connection

## Localization Considerations

The app supports both French and English with:

1. **Dynamic Language Switching**: Users can switch languages without restarting the app
2. **Localized Content**: All product information, categories, and descriptions available in both languages
3. **Cultural Adaptations**: UI elements adapted for local cultural preferences
4. **Local Currency**: All prices displayed in CFA francs with appropriate formatting

## Total Screen Count: 42 screens

This comprehensive screen inventory covers all essential functionality for the Okada customer mobile application, ensuring a complete and seamless user experience tailored to the Cameroonian market.
