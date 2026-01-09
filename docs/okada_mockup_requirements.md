# Okada Mockup Requirements and User Flows

## 1. Overview

This document outlines the requirements and user flows for the Okada quick commerce platform mockups. The platform consists of three main applications:

1. **Customer Mobile App**: For end users to browse products, place orders, and track deliveries
2. **Merchant/Admin Web Platform**: For business operations, inventory management, and analytics
3. **Rider Mobile App**: For delivery personnel to manage pickups and deliveries

All interfaces will be designed with Cameroon's specific market context in mind, including considerations for:
- Intermittent connectivity
- Multilingual support (French, English, Pidgin)
- Mobile money integration (MTN Mobile Money, Orange Money)
- Cultural relevance and local terminology

## 2. Design System

### 2.1 Color Palette
- **Primary Green**: #1E5631 (Dark green representing freshness and reliability)
- **Accent Orange**: #FF8C00 (Vibrant orange for calls-to-action and highlights)
- **White**: #FFFFFF (Clean background for readability)
- **Dark Gray**: #333333 (Text and secondary elements)
- **Light Gray**: #F5F5F5 (Background for sections and cards)
- **Error Red**: #E53935 (For error states and alerts)
- **Success Green**: #43A047 (For success states and confirmations)

### 2.2 Typography
- **Primary Font**: Montserrat (Headings and important text)
- **Secondary Font**: Open Sans (Body text and UI elements)
- **Font Sizes**:
  - Headings: 24-32px
  - Subheadings: 18-22px
  - Body: 14-16px
  - Small text: 12px

### 2.3 UI Components
- Rounded corners (8px radius) for cards and buttons
- Consistent iconography using Material Design icons
- Shadow elevation for interactive elements
- Clear visual hierarchy with adequate spacing

## 3. Customer Mobile App User Flows

### 3.1 Onboarding Flow
1. **Splash Screen**: App logo and tagline
2. **Welcome Screens**: Value proposition and key features (3 screens)
3. **Language Selection**: Choose between French, English, or Pidgin
4. **Registration/Login**: Phone number entry → OTP verification → Basic profile setup
5. **Location Access**: Permission request with clear explanation of benefits
6. **Home Screen**: First-time user experience with guided tour

### 3.2 Product Discovery Flow
1. **Home Screen**: Featured categories, promotions, and recently ordered items
2. **Category Browsing**: Grid view of product categories with visual icons
3. **Product Listing**: List/grid view of products with images, names, prices, and add buttons
4. **Product Detail**: Expanded view with description, nutritional info (for food), quantity selector
5. **Search**: Text search with autocomplete and recent searches
6. **Filters**: Sort by price, popularity, discounts, etc.

### 3.3 Cart and Checkout Flow
1. **Cart View**: List of items, quantities, prices, and subtotal
2. **Address Selection**: Saved addresses or add new address with map integration
3. **Delivery Time**: Select between immediate delivery or scheduled time slot
4. **Payment Method**: Choose between MTN Mobile Money, Orange Money, or cash on delivery
5. **Order Review**: Final review of items, address, delivery time, and total cost
6. **Order Confirmation**: Success screen with order number and estimated delivery time

### 3.4 Order Tracking Flow
1. **Active Order**: Real-time map showing rider location and estimated arrival time
2. **Order Status Updates**: Notifications for order received, preparation, pickup, and delivery
3. **Rider Information**: Name, photo, and contact option
4. **Order Details**: Access to receipt and ability to report issues
5. **Delivery Confirmation**: Rating prompt and option to reorder

## 4. Merchant/Admin Web Platform User Flows

### 4.1 Authentication Flow
1. **Login Screen**: Email/username and password fields with "Remember me" option
2. **Two-Factor Authentication**: SMS or authenticator app verification
3. **Password Recovery**: Email-based reset process
4. **Dashboard Access**: Role-based access control (Admin, Manager, Staff)

### 4.2 Dashboard and Analytics Flow
1. **Overview Dashboard**: Key metrics, recent orders, and alerts
2. **Sales Analytics**: Charts for daily/weekly/monthly sales, average order value, etc.
3. **Inventory Analytics**: Stock levels, turnover rates, popular products
4. **Customer Analytics**: New vs. returning customers, order frequency, etc.
5. **Export Options**: Download reports in CSV, Excel, or PDF formats

### 4.3 Order Management Flow
1. **Order Queue**: List of incoming orders sorted by time
2. **Order Details**: Customer information, items, special instructions
3. **Order Processing**: Accept/reject options with reason selection
4. **Order Fulfillment**: Picking list generation and packing confirmation
5. **Rider Assignment**: Manual or automatic assignment to available riders
6. **Order History**: Searchable and filterable archive of past orders

### 4.4 Inventory Management Flow
1. **Product Catalog**: List view with search, filter, and sort capabilities
2. **Product Creation/Editing**: Form with fields for name, description, price, category, etc.
3. **Stock Management**: Current levels, restock thresholds, and supplier information
4. **Bulk Operations**: Import/export functionality for product data
5. **Category Management**: Create, edit, and organize product categories

## 5. Rider Mobile App User Flows

### 5.1 Authentication Flow
1. **Login Screen**: Phone number entry and OTP verification
2. **Profile Setup**: Personal information, vehicle details, and document upload
3. **Status Toggle**: Online/offline availability setting

### 5.2 Order Management Flow
1. **Order Requests**: Incoming delivery requests with distance, pickup location, and estimated earnings
2. **Order Acceptance**: Accept/decline options with timer
3. **Navigation**: Map view with optimized route to pickup location
4. **Order Pickup**: QR code or PIN verification for order collection
5. **Delivery Navigation**: Map view with optimized route to customer location
6. **Delivery Confirmation**: Customer signature or photo confirmation
7. **Order Completion**: Rating and next order suggestion

### 5.3 Earnings and Performance Flow
1. **Daily Summary**: Orders completed, total earnings, and tips
2. **Weekly/Monthly Stats**: Performance metrics and comparison to previous periods
3. **Earnings History**: Detailed breakdown of payments and withdrawals
4. **Performance Ratings**: Customer feedback and overall rating

## 6. Mockup Deliverables

### 6.1 Customer Mobile App
- Splash and onboarding screens
- Home screen and navigation
- Category and product browsing
- Product detail view
- Search and filter interfaces
- Cart and checkout process
- Order tracking and history
- User profile and settings

### 6.2 Merchant/Admin Web Platform
- Login and authentication screens
- Dashboard and analytics views
- Order management interface
- Inventory management system
- Customer database view
- Settings and configuration panels

### 6.3 Rider Mobile App
- Authentication and profile screens
- Order request and acceptance interface
- Navigation and map views
- Order pickup and delivery flows
- Earnings and performance screens

Each mockup will include:
- Visual design with proper styling and branding
- Interactive elements highlighted
- Annotations explaining functionality
- Responsive considerations where applicable
- Offline state representations
