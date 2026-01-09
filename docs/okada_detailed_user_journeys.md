# Okada Platform - Detailed User Journeys and Screen Flows

**Document Version**: 1.0  
**Last Updated**: November 2025  
**Author**: Manus AI

---

## Executive Summary

This document provides detailed user journeys for the Okada quick commerce platform in Cameroon, mapping out step-by-step flows through the customer mobile app, rider mobile app, and merchant web platform. Each journey includes screen transitions, user actions, system responses, and success criteria. These journeys are designed to accommodate users with varying levels of digital literacy and account for Cameroon's specific infrastructure challenges including intermittent connectivity and diverse payment preferences.

---

## Customer Mobile App User Journeys

### Journey 1: First-Time User Onboarding

**Persona**: Jean-Paul Fotso (Tech-Savvy Student)  
**Goal**: Download the app, create an account, and place first order  
**Duration**: 5-8 minutes  
**Success Criteria**: Account created, delivery address added, first order placed

#### Detailed Flow

**Step 1: App Discovery and Download**
- **Trigger**: User sees Okada advertisement on social media or hears about it from a friend
- **Action**: User searches for "Okada" in Google Play Store
- **Screen**: Google Play Store listing
- **User Action**: Taps "Install" button
- **System Response**: App downloads (18MB optimized for low bandwidth)
- **Offline Consideration**: Download requires internet connection
- **Success Indicator**: App successfully installed on device

**Step 2: First Launch - Splash Screen**
- **Screen**: Splash Screen with Okada logo (motorcycle rider icon in yellow on green background)
- **Duration**: 2-3 seconds while app initializes
- **System Action**: Checks for internet connectivity, loads initial data
- **Visual Elements**: Animated motorcycle icon, "Okada - Your Market, Delivered" tagline
- **Transition**: Automatic transition to language selection

**Step 3: Language Selection**
- **Screen**: Language Selection Screen
- **Options Presented**: French (Français) and English with flag icons
- **User Action**: Selects preferred language (Jean-Paul chooses English)
- **System Response**: Sets app language preference, stores in local storage
- **Accessibility**: Large buttons with both text and visual indicators
- **Transition**: Proceeds to onboarding carousel

**Step 4: Onboarding Carousel - Screen 1 (Benefits)**
- **Screen**: Onboarding Screen 1
- **Visual**: Illustration of fresh produce and groceries
- **Headline**: "Fresh Groceries Delivered to Your Door"
- **Description**: "Get everything you need from your local market delivered in 30-45 minutes"
- **User Action**: Swipes left or taps "Next" button
- **Skip Option**: "Skip" button in top right corner
- **Progress Indicator**: 1 of 3 dots highlighted

**Step 5: Onboarding Carousel - Screen 2 (Features)**
- **Screen**: Onboarding Screen 2
- **Visual**: Illustration of smartphone with product categories
- **Headline**: "Thousands of Products at Your Fingertips"
- **Description**: "Browse fresh produce, household essentials, and more with easy search and filters"
- **User Action**: Swipes left or taps "Next" button
- **Progress Indicator**: 2 of 3 dots highlighted

**Step 6: Onboarding Carousel - Screen 3 (Delivery)**
- **Screen**: Onboarding Screen 3
- **Visual**: Illustration of motorcycle rider with delivery box
- **Headline**: "Track Your Order in Real-Time"
- **Description**: "Know exactly when your order will arrive with live tracking and notifications"
- **User Action**: Taps "Get Started" button
- **Progress Indicator**: 3 of 3 dots highlighted
- **Transition**: Proceeds to registration screen

**Step 7: Registration Screen**
- **Screen**: Registration Screen
- **Form Fields**:
  - Phone Number (with Cameroon country code +237 pre-filled)
  - Full Name
  - Password (with strength indicator)
  - Confirm Password
  - Terms and Conditions checkbox
- **User Action**: Jean-Paul enters his phone number (6 XX XX XX XX), name, and creates a password
- **Validation**: Real-time validation of phone number format and password strength
- **System Response**: Sends SMS verification code to provided phone number
- **Alternative Option**: "Already have an account? Login" link at bottom
- **Transition**: Proceeds to phone verification

**Step 8: Phone Verification**
- **Screen**: Phone Verification Screen
- **Display**: Shows masked phone number (6XX XXX XXX)
- **Input**: 6-digit verification code entry
- **User Action**: Enters code received via SMS
- **System Response**: Validates code, creates account
- **Resend Option**: "Didn't receive code? Resend" button (available after 60 seconds)
- **Error Handling**: Shows error message if code is incorrect, allows 3 attempts
- **Success**: Account created, user logged in automatically
- **Transition**: Proceeds to location/address setup

**Step 9: Delivery Address Setup**
- **Screen**: Add Delivery Address Screen
- **Options**:
  - Use Current Location (GPS-based)
  - Enter Address Manually
  - Select from Map
- **User Action**: Jean-Paul taps "Use Current Location"
- **System Response**: Requests location permission, fetches GPS coordinates
- **Address Fields**:
  - Detected Address (auto-filled from GPS)
  - Neighborhood/Quarter (e.g., "Ngoa-Ekelle")
  - Landmark (e.g., "Near University of Yaoundé I main gate")
  - Additional Instructions (optional)
  - Label (Home, Work, Other)
- **Validation**: Checks if address is within delivery zone
- **System Response**: Confirms address is serviceable, saves as default
- **Transition**: Proceeds to home screen

**Step 10: Welcome to Home Screen**
- **Screen**: Home Screen with tutorial overlay
- **Tutorial Elements**:
  - Highlights search bar: "Search for products here"
  - Points to categories: "Browse by category"
  - Shows cart icon: "Your cart and checkout"
- **User Action**: Taps "Got it" or dismisses tutorial
- **System Response**: Stores tutorial completion status
- **First-Time Offer**: Banner showing "First order discount: 20% off up to 5,000 CFA"
- **Success**: User is now ready to browse and shop

**Journey Completion Metrics**:
- **Time to Complete**: 5-8 minutes
- **Drop-off Points**: Language selection (5%), Phone verification (15%), Address setup (10%)
- **Success Rate Target**: 70% completion
- **Key Success Factors**: Simple form fields, clear value proposition, attractive first-order discount

---

### Journey 2: Product Discovery and Search

**Persona**: Marie Nkeng (Busy Professional)  
**Goal**: Find specific products for dinner and discover new items  
**Duration**: 3-5 minutes  
**Success Criteria**: Products added to cart, ready for checkout

#### Detailed Flow

**Step 1: Accessing Home Screen**
- **Context**: Marie opens the app during her lunch break at work
- **Screen**: Home Screen
- **Display Elements**:
  - Search bar at top
  - Promotional banners (current deals)
  - Category grid (8-10 main categories with icons)
  - "Frequently Bought" section based on her history
  - "Fresh Today" section highlighting fresh produce
- **Connectivity Status**: Green indicator showing online mode
- **User Observation**: Marie scans the screen looking for vegetables

**Step 2: Category Selection**
- **User Action**: Marie taps on "Fresh Produce" category icon (green vegetable icon)
- **System Response**: Loads category detail screen
- **Screen**: Category Detail - Fresh Produce
- **Display**:
  - Subcategories: Vegetables, Fruits, Herbs & Spices
  - Filter button (top right)
  - Sort button (Price, Popularity, Freshness)
  - Product grid with images, names, prices
- **Visual Design**: Products displayed with high-quality images, prices in CFA
- **Loading**: Skeleton screens while products load (optimized for slow connections)

**Step 3: Browsing Products**
- **User Action**: Marie scrolls through vegetable products
- **Products Displayed**: Tomatoes, Onions, Carrots, Cabbage, etc.
- **Product Card Information**:
  - Product image
  - Product name (in both French and English)
  - Price per unit (e.g., "500 CFA/kg")
  - Stock status (In Stock / Low Stock / Out of Stock)
  - "Add to Cart" button
- **User Observation**: Marie sees tomatoes and wants to check details

**Step 4: Product Detail View**
- **User Action**: Taps on "Fresh Tomatoes" product card
- **Screen**: Product Detail Screen
- **Display Elements**:
  - Large product image (swipeable gallery if multiple images)
  - Product name: "Fresh Tomatoes"
  - Price: "500 CFA/kg"
  - Description: "Locally sourced fresh tomatoes from Douala farms"
  - Quantity selector (- / 1 kg / +)
  - Nutritional information (expandable)
  - Customer reviews and ratings (4.5 stars, 234 reviews)
  - "Add to Cart" button (prominent, in Okada Green)
- **User Action**: Marie adjusts quantity to 2 kg using + button
- **System Response**: Updates quantity display and total price (1,000 CFA)

**Step 5: Adding to Cart**
- **User Action**: Taps "Add to Cart" button
- **System Response**: 
  - Shows brief success animation (checkmark)
  - Updates cart icon badge to show "1" item
  - Displays toast notification: "2 kg Fresh Tomatoes added to cart"
  - Offers "Continue Shopping" or "View Cart" options
- **User Action**: Taps "Continue Shopping"
- **Transition**: Returns to Fresh Produce category screen

**Step 6: Using Search Function**
- **User Action**: Marie taps the search bar at the top
- **Screen**: Search Screen
- **Display**:
  - Search input field (focused, keyboard appears)
  - Recent searches: "Rice", "Cooking Oil", "Chicken"
  - Trending searches: "Fresh Fish", "Plantains", "Tomatoes"
  - Popular categories for quick access
- **User Action**: Types "onions" in search field
- **System Response**: Shows real-time search suggestions as she types
  - "Onions - Red"
  - "Onions - White"
  - "Onions - Spring"

**Step 7: Search Results**
- **User Action**: Taps "Onions - Red" from suggestions
- **Screen**: Search Results Screen
- **Display**:
  - Search query at top: "Onions - Red"
  - Filter and Sort options
  - Number of results: "5 products found"
  - Product grid with matching items
- **Products Shown**: Different sizes and brands of red onions
- **User Action**: Marie quickly adds "Red Onions - 1 kg" to cart
- **System Response**: Cart updated, now shows "2" items

**Step 8: Discovering Recommendations**
- **Screen**: After adding onions, system shows "Frequently Bought Together" section
- **Recommendations**:
  - "Customers who bought onions also bought: Garlic, Ginger, Bell Peppers"
- **User Action**: Marie taps on "Garlic" to view details
- **Benefit**: Saves time by suggesting complementary items
- **User Action**: Adds garlic to cart
- **Cart Status**: Now contains 3 items

**Journey Completion Metrics**:
- **Time to Complete**: 3-5 minutes
- **Products Viewed**: 8-12 products on average
- **Conversion Rate**: 60% of viewed products added to cart
- **Key Success Factors**: Fast search, clear product images, easy add-to-cart, smart recommendations

---

### Journey 3: Checkout and Order Placement

**Persona**: Amadou Bello (Young Family Man)  
**Goal**: Complete purchase of groceries for the week  
**Duration**: 3-4 minutes  
**Success Criteria**: Order placed successfully, payment confirmed

#### Detailed Flow

**Step 1: Reviewing Cart**
- **Context**: Amadou has added 12 items to his cart over the past 15 minutes
- **User Action**: Taps cart icon in navigation bar
- **Screen**: Cart Screen
- **Display Elements**:
  - List of cart items with images, names, quantities, prices
  - Edit quantity buttons (- / + ) for each item
  - Remove item option (trash icon)
  - Subtotal calculation
  - Delivery fee: "1,000 CFA"
  - Total amount: "18,500 CFA"
  - Promo code field (expandable)
  - "Proceed to Checkout" button (prominent, in Okada Green)
- **User Action**: Amadou reviews items, adjusts milk quantity from 1 to 2 liters
- **System Response**: Recalculates total to "19,500 CFA"

**Step 2: Applying Promo Code**
- **User Action**: Taps "Have a promo code?" to expand field
- **Input**: Enters "FAMILY20" (20% off for family orders)
- **System Response**: 
  - Validates promo code
  - Shows success message: "Promo code applied! You saved 3,900 CFA"
  - Updates total to "15,600 CFA"
- **Visual Feedback**: Green checkmark next to promo code field
- **User Action**: Satisfied with savings, taps "Proceed to Checkout"

**Step 3: Delivery Address Confirmation**
- **Screen**: Checkout - Delivery Address
- **Display**:
  - Saved addresses list
  - Default address highlighted: "Home - Emana, Near St. Joseph Church"
  - Option to add new address
  - Option to edit existing address
- **User Action**: Confirms default address is correct
- **Additional Instructions**: Adds note: "Please call when you arrive"
- **Delivery Time Selection**:
  - ASAP (30-45 minutes)
  - Scheduled (select time slot)
- **User Action**: Selects "ASAP"
- **System Response**: Confirms delivery window: "Estimated delivery: 5:30 PM - 6:15 PM"
- **User Action**: Taps "Continue"

**Step 4: Payment Method Selection**
- **Screen**: Checkout - Payment Method
- **Available Options**:
  - MTN Mobile Money (saved: 6XX XXX XXX)
  - Orange Money
  - Cash on Delivery
  - Bank Card (Add new)
- **User Action**: Selects "Orange Money"
- **Display**: Shows Orange Money phone number input field
- **User Action**: Enters Orange Money number (6YY YYY YYY)
- **Option**: Checkbox to "Save this payment method for future orders"
- **User Action**: Checks the box
- **System Response**: Stores payment preference securely

**Step 5: Order Review**
- **Screen**: Order Summary
- **Display**:
  - Order items (collapsed list, expandable)
  - Delivery address
  - Delivery time
  - Payment method
  - Price breakdown:
    - Subtotal: 19,500 CFA
    - Delivery fee: 1,000 CFA
    - Discount: -3,900 CFA
    - **Total: 15,600 CFA**
  - Terms and conditions checkbox
  - "Place Order" button (prominent, in Okada Green)
- **User Action**: Reviews summary, checks terms box
- **User Action**: Taps "Place Order"

**Step 6: Payment Processing**
- **Screen**: Payment Processing Screen
- **Display**:
  - Loading animation
  - Message: "Processing your payment..."
  - "Do not close this screen"
- **System Action**: Initiates Orange Money payment request
- **User Device**: Receives Orange Money USSD prompt on same phone
- **User Action**: Enters Orange Money PIN on USSD prompt
- **System Response**: Receives payment confirmation from Orange Money
- **Duration**: 10-30 seconds

**Step 7: Order Confirmation**
- **Screen**: Order Confirmation Screen
- **Display**:
  - Success animation (green checkmark with confetti)
  - "Order Placed Successfully!" headline
  - Order number: "#OKD-20251106-0234"
  - Estimated delivery time: "5:30 PM - 6:15 PM"
  - "Track Your Order" button
  - "Continue Shopping" button
  - Order details summary (expandable)
- **System Action**: 
  - Sends SMS confirmation to Amadou's phone
  - Sends order to merchant platform for processing
  - Clears shopping cart
  - Updates order history
- **User Action**: Taps "Track Your Order"

**Step 8: Order Tracking**
- **Screen**: Order Tracking Screen
- **Display**:
  - Order status timeline:
    - ✓ Order Placed (4:45 PM)
    - ⏳ Preparing Your Order (in progress)
    - ⏳ Out for Delivery
    - ⏳ Delivered
  - Live map showing dark store location
  - Estimated preparation time: "10-15 minutes"
  - "Contact Support" button
- **Real-time Updates**: Screen refreshes as order status changes
- **Notification**: Push notification when order moves to next stage

**Journey Completion Metrics**:
- **Time to Complete**: 3-4 minutes
- **Cart Abandonment Rate**: Target <20%
- **Payment Success Rate**: Target >95%
- **Key Success Factors**: Clear pricing, multiple payment options, real-time updates

---

## Rider Mobile App User Journeys

### Journey 4: Rider Onboarding and Verification

**Persona**: Emmanuel Tchoumi (Experienced Motorcycle Taxi Driver)  
**Goal**: Complete registration and verification to start earning  
**Duration**: 20-30 minutes (initial), 2-3 days (verification)  
**Success Criteria**: Account approved, ready to accept orders

#### Detailed Flow

**Step 1: App Download and First Launch**
- **Context**: Emmanuel heard about Okada from a friend who's already a rider
- **Action**: Downloads "Okada Rider" app from Google Play Store
- **Screen**: Splash Screen
- **Display**: "Okada Rider" logo with tagline "Earn More, Ride Smart"
- **System Action**: Checks for updates, initializes app
- **Transition**: Proceeds to language selection

**Step 2: Language Selection**
- **Screen**: Language Selection
- **Options**: French (Français), English
- **User Action**: Emmanuel selects French
- **System Response**: Sets app language to French
- **All subsequent screens**: Displayed in French

**Step 3: Onboarding Carousel**
- **Screen 1**: "Earn Stable Income"
  - Visual: Illustration of rider with earnings dashboard
  - Description: "Earn 150,000-250,000 CFA per month with flexible hours"
- **Screen 2**: "Smart Technology"
  - Visual: Illustration of smartphone with navigation
  - Description: "Get optimized routes and real-time earnings tracking"
- **Screen 3**: "Support and Benefits"
  - Visual: Illustration of rider with safety gear
  - Description: "Access health insurance, maintenance support, and rider community"
- **User Action**: Swipes through screens, taps "Get Started"

**Step 4: Registration Screen**
- **Screen**: Rider Registration
- **Form Fields**:
  - Full Name (as on ID card)
  - Phone Number (+237)
  - Email Address (optional)
  - Date of Birth
  - National ID Number
  - Password
  - Referral Code (optional)
- **User Action**: Emmanuel fills in his information
- **Validation**: Real-time validation of ID number format
- **User Action**: Taps "Continue"

**Step 5: Phone Verification**
- **Screen**: Phone Verification
- **Process**: Same as customer app (SMS code verification)
- **User Action**: Enters 6-digit code
- **System Response**: Verifies code, proceeds to next step

**Step 6: Document Upload - National ID**
- **Screen**: Document Upload - National ID
- **Instructions**: "Take a clear photo of your National ID card (both sides)"
- **Upload Options**:
  - Take Photo (camera)
  - Choose from Gallery
- **User Action**: Emmanuel takes photos of both sides of his ID
- **System Response**: 
  - Performs basic image quality check
  - Extracts text using OCR to verify ID number matches registration
  - Shows preview with "Retake" or "Continue" options
- **User Action**: Confirms photos are clear, taps "Continue"

**Step 7: Document Upload - Driver's License**
- **Screen**: Document Upload - Driver's License
- **Instructions**: "Upload your valid motorcycle driver's license"
- **User Action**: Takes photo of driver's license
- **System Response**: Verifies license is for motorcycle category
- **Additional Field**: License expiry date
- **User Action**: Enters expiry date, taps "Continue"

**Step 8: Vehicle Registration**
- **Screen**: Vehicle Registration
- **Form Fields**:
  - Vehicle Type (Motorcycle / Bicycle)
  - Make and Model (e.g., "Yamaha DT 125")
  - License Plate Number
  - Year of Manufacture
  - Vehicle Color
  - Insurance Status (Yes / No)
- **Photo Upload**: 
  - Front view of motorcycle
  - Side view showing license plate
  - Insurance certificate (if applicable)
- **User Action**: Emmanuel fills in his motorcycle details and uploads photos
- **System Response**: Validates information, stores for verification

**Step 9: Bank/Mobile Money Details**
- **Screen**: Payment Setup
- **Instructions**: "How would you like to receive your earnings?"
- **Options**:
  - MTN Mobile Money (most popular)
  - Orange Money
  - Bank Account
- **User Action**: Selects "MTN Mobile Money"
- **Input**: MTN Mobile Money number (must match registered phone or provide additional verification)
- **User Action**: Enters his MTN MoMo number
- **System Response**: Sends test transaction (1 CFA) to verify account
- **User Action**: Confirms receipt of test transaction

**Step 10: Background Check Consent**
- **Screen**: Background Check Consent
- **Information**: "We conduct a basic background check to ensure rider and customer safety"
- **Consent Form**: Terms and conditions for background check
- **User Action**: Reads terms, checks consent box
- **User Action**: Taps "Submit Application"

**Step 11: Application Submitted**
- **Screen**: Application Submitted
- **Display**:
  - Success message: "Application Submitted Successfully!"
  - "What Happens Next" section:
    - Document verification (1-2 business days)
    - Background check (1-2 business days)
    - Training module access
    - Final approval notification
  - "Access Training While You Wait" button
- **User Action**: Taps "Access Training"

**Step 12: Training Module**
- **Screen**: Rider Training Dashboard
- **Modules**:
  - Using the Okada Rider App (15 minutes)
  - Customer Service Best Practices (10 minutes)
  - Safety Guidelines (10 minutes)
  - Handling Orders and Deliveries (20 minutes)
  - Payment and Earnings (10 minutes)
- **Format**: Video tutorials with quizzes
- **User Action**: Emmanuel completes all modules over the next hour
- **System Response**: Marks training as complete, awards "Training Complete" badge
- **Completion**: Receives notification when account is approved (2 days later)

**Journey Completion Metrics**:
- **Time to Complete Application**: 20-30 minutes
- **Verification Time**: 2-3 business days
- **Approval Rate**: Target 75% of applicants
- **Training Completion**: Target 90% complete training before approval
- **Key Success Factors**: Clear instructions, mobile-optimized photo upload, comprehensive training

---

### Journey 5: Daily Order Acceptance and Delivery

**Persona**: Grace Mbah (Part-Time Student Rider)  
**Goal**: Accept and complete deliveries during evening shift  
**Duration**: 2-3 hours (work session)  
**Success Criteria**: Multiple orders completed, earnings tracked

#### Detailed Flow

**Step 1: Starting Work Session**
- **Context**: Grace finishes her last class at 5:00 PM and is ready to start deliveries
- **User Action**: Opens Okada Rider app
- **Screen**: Home Dashboard (Offline Mode)
- **Display**:
  - "You're Offline" status indicator (red)
  - "Go Online" button (prominent, in Okada Green)
  - Today's earnings: "0 CFA"
  - Current zone: "Mvan, Yaoundé"
  - Battery level indicator
  - Network status
- **User Action**: Taps "Go Online"

**Step 2: Going Online**
- **System Action**: 
  - Updates rider status to "Available"
  - Sends location to server
  - Starts listening for order notifications
- **Screen**: Home Dashboard (Online Mode)
- **Display**:
  - "You're Online" status indicator (green)
  - "Go Offline" button
  - Waiting for orders animation
  - "No orders yet" message
  - Tips section: "Peak hours are 6:00 PM - 9:00 PM in your zone"
- **User Action**: Grace waits for her first order

**Step 3: Receiving Order Notification**
- **Trigger**: New order available in Grace's zone
- **Notification**: 
  - Push notification with sound
  - Vibration alert
  - Screen overlay with order preview
- **Screen**: Order Notification Overlay
- **Display**:
  - Pickup location: "Okada Dark Store - Mvan"
  - Delivery location: "Ngoa-Ekelle, Near University Main Gate"
  - Distance: "2.3 km"
  - Estimated earnings: "1,200 CFA"
  - Order items: "3 items"
  - Timer: "15 seconds to accept" (countdown)
  - "Accept" button (green)
  - "Decline" button (red)
- **User Action**: Grace reviews details and taps "Accept"

**Step 4: Order Accepted - Navigation to Pickup**
- **Screen**: Order Details - Pickup
- **Display**:
  - Order number: "#OKD-20251106-0234"
  - Pickup location: "Okada Dark Store - Mvan"
  - Address: "Rue 1.234, Mvan, Yaoundé"
  - Distance to pickup: "800 m"
  - Estimated time: "3 minutes"
  - "Start Navigation" button
  - "Call Store" button
  - Order items list (collapsed, expandable)
- **User Action**: Taps "Start Navigation"

**Step 5: Navigation to Dark Store**
- **Screen**: Navigation Screen - Pickup
- **Display**:
  - Map showing current location (blue dot) and destination (green pin)
  - Turn-by-turn directions
  - Distance remaining: "800 m"
  - ETA: "3 minutes"
  - Landmark hints: "Near Total Gas Station"
  - "Arrived" button (becomes active when within 50m)
- **Offline Capability**: Map tiles cached for offline use
- **User Action**: Grace follows directions, arrives at dark store
- **User Action**: Taps "Arrived at Store"

**Step 6: Order Pickup at Dark Store**
- **Screen**: Store Arrival Screen
- **Display**:
  - "You've Arrived at Okada Dark Store - Mvan"
  - Order number (large): "#OKD-20251106-0234"
  - "Show this to store staff" instruction
  - QR code for order verification
  - Order items checklist:
    - ☐ Fresh Tomatoes - 2 kg
    - ☐ Red Onions - 1 kg
    - ☐ Garlic - 200 g
  - "Report Issue" button
  - "Confirm Pickup" button (disabled until all items checked)
- **User Action**: Grace shows QR code to store staff
- **Store Staff Action**: Scans QR code, hands over packaged order
- **User Action**: Verifies items by checking each box
- **System Response**: Enables "Confirm Pickup" button
- **User Action**: Taps "Confirm Pickup"

**Step 7: Navigation to Customer**
- **Screen**: Order Details - Delivery
- **Display**:
  - Customer name: "Amadou B." (last name initial for privacy)
  - Delivery address: "Emana, Near St. Joseph Church"
  - Customer phone: "6YY YYY YYY" (masked: 6YY XXX XXX)
  - Delivery instructions: "Please call when you arrive"
  - Distance: "2.3 km"
  - Estimated time: "8 minutes"
  - "Start Navigation" button
  - "Call Customer" button
  - "Message Customer" button
- **User Action**: Taps "Start Navigation"

**Step 8: En Route to Customer**
- **Screen**: Navigation Screen - Delivery
- **Display**: Similar to pickup navigation
  - Map with route highlighted
  - Turn-by-turn directions
  - Distance and ETA
  - Customer contact buttons easily accessible
- **User Action**: Grace follows directions
- **Approaching Destination**: When within 200m, system prompts "Call customer?"
- **User Action**: Taps "Call Customer"
- **System Action**: Initiates call through app (masked number for privacy)
- **Phone Call**: Grace speaks with Amadou, confirms exact location
- **User Action**: Arrives at delivery location, taps "Arrived"

**Step 9: Delivery Confirmation**
- **Screen**: Delivery Confirmation Screen
- **Display**:
  - "You've Arrived at Delivery Location"
  - Customer name: "Amadou B."
  - Order number: "#OKD-20251106-0234"
  - Delivery verification options:
    - Customer Pickup (customer receives order in person)
    - Leave at Door (contactless delivery)
  - "Take Photo" button (for proof of delivery)
  - "Report Issue" button
  - "Confirm Delivery" button
- **User Action**: Grace hands order to Amadou (Customer Pickup)
- **User Action**: Takes photo of Amadou with the order (optional but recommended)
- **User Action**: Taps "Confirm Delivery"

**Step 10: Delivery Complete**
- **Screen**: Delivery Complete Screen
- **Display**:
  - Success animation (green checkmark)
  - "Delivery Complete!" headline
  - Earnings for this order: "+1,200 CFA"
  - Total earnings today: "1,200 CFA"
  - Customer rating prompt: "How was your experience with this customer?"
    - Star rating (1-5 stars)
    - Optional comment
  - "Next Order" button (if orders are queued)
  - "Go to Dashboard" button
- **User Action**: Rates customer 5 stars
- **System Action**: 
  - Updates Grace's earnings
  - Sends delivery confirmation to customer
  - Prompts customer to rate Grace
  - Makes Grace available for next order
- **User Action**: Taps "Go to Dashboard" to see updated earnings

**Journey Completion Metrics**:
- **Average Time per Delivery**: 15-25 minutes
- **Orders per Hour**: 2-3 orders
- **Acceptance Rate Target**: >80%
- **On-Time Delivery Rate**: >90%
- **Customer Rating Target**: >4.5 stars
- **Key Success Factors**: Clear navigation, easy communication, quick confirmation process

---

## Merchant Web Platform User Journeys

### Journey 6: Daily Inventory Management

**Persona**: Pierre Kamga (Dark Store Manager)  
**Goal**: Review inventory, process restocking, manage stock levels  
**Duration**: 30-45 minutes (morning routine)  
**Success Criteria**: Inventory updated, low stock items reordered

#### Detailed Flow

**Step 1: Morning Login**
- **Context**: Pierre arrives at the dark store at 7:00 AM to prepare for the day
- **Device**: Laptop at store office
- **Browser**: Opens Okada Merchant Platform (web.okada.cm)
- **Screen**: Login Page
- **Display**:
  - Okada logo and "Merchant Platform" heading
  - Email/Phone input field
  - Password input field
  - "Remember me" checkbox
  - "Login" button (Okada Green)
  - "Forgot Password?" link
- **User Action**: Enters email and password
- **System Response**: Validates credentials, logs in
- **Security**: Two-factor authentication via SMS (first time on new device)
- **Transition**: Redirects to main dashboard

**Step 2: Dashboard Overview**
- **Screen**: Main Dashboard
- **Display Sections**:
  - **Header**: Store name "Okada Dark Store - Akwa", date/time, user profile menu
  - **KPI Cards** (top row):
    - Orders Today: "23 orders"
    - Revenue Today: "345,000 CFA"
    - Average Delivery Time: "28 minutes"
    - Customer Satisfaction: "4.7 stars"
  - **Active Orders Panel**: Real-time list of orders being prepared
  - **Inventory Alerts**: "12 items low stock", "3 items out of stock"
  - **Staff Status**: "8 staff online", "2 on break"
  - **Quick Actions**: Buttons for common tasks
- **User Observation**: Pierre notices inventory alerts
- **User Action**: Clicks on "12 items low stock" alert

**Step 3: Inventory Overview**
- **Screen**: Inventory Management - Overview
- **Display**:
  - **Filter Bar**: 
    - Category dropdown (All, Fresh Produce, Dairy, etc.)
    - Stock status filter (All, In Stock, Low Stock, Out of Stock)
    - Search box
  - **Inventory Table**:
    - Columns: Product Image, Name, SKU, Category, Current Stock, Min Stock, Status, Actions
    - Sortable columns
    - Pagination (showing 50 items per page)
  - **Summary Stats**:
    - Total SKUs: "2,847"
    - In Stock: "2,632"
    - Low Stock: "12" (highlighted in yellow)
    - Out of Stock: "3" (highlighted in red)
- **User Action**: Clicks "Low Stock" filter

**Step 4: Reviewing Low Stock Items**
- **Screen**: Inventory - Low Stock Items
- **Display**: Filtered table showing only low stock items
- **Low Stock Items**:
  - Fresh Tomatoes: 15 kg (Min: 50 kg) - Status: Low Stock
  - Whole Milk 1L: 8 units (Min: 30 units) - Status: Low Stock
  - Cooking Oil 2L: 5 units (Min: 20 units) - Status: Low Stock
  - [9 more items...]
- **AI Recommendation Badge**: "AI suggests reorder based on demand forecast"
- **User Action**: Pierre reviews the list and selects items to reorder
- **Bulk Actions**: Checkboxes to select multiple items
- **User Action**: Selects top 5 items, clicks "Bulk Reorder"

**Step 5: Creating Purchase Order**
- **Screen**: Create Purchase Order
- **Display**:
  - **Selected Items Table**:
    - Product, Current Stock, Min Stock, Suggested Order Quantity, Supplier, Unit Price
  - **AI Recommendations**: 
    - "Based on last week's sales, we recommend ordering 100 kg of tomatoes"
    - "Peak demand expected this weekend for cooking oil"
  - **Supplier Selection**: Dropdown for each item (default supplier pre-selected)
  - **Order Quantity**: Editable field (pre-filled with AI suggestion)
  - **Total Order Value**: Auto-calculated
  - **Expected Delivery**: Date/time picker
  - **Notes**: Text area for special instructions
- **User Action**: Pierre reviews AI suggestions, adjusts tomato quantity to 120 kg based on his experience
- **User Action**: Fills in expected delivery: "Today, 2:00 PM"
- **User Action**: Clicks "Submit Purchase Order"

**Step 6: Purchase Order Confirmation**
- **Screen**: Purchase Order Confirmation
- **Display**:
  - "Purchase Order Created Successfully!"
  - PO Number: "#PO-20251106-0012"
  - Supplier: "Fresh Farms Douala"
  - Total Value: "87,500 CFA"
  - Expected Delivery: "Today, 2:00 PM"
  - "Download PO" button (PDF)
  - "Send to Supplier" button (email/WhatsApp)
  - "Back to Inventory" button
- **System Action**: 
  - Sends PO to supplier via email and WhatsApp
  - Creates calendar reminder for expected delivery
  - Updates inventory system with pending stock
- **User Action**: Clicks "Back to Inventory"

**Step 7: Checking Out of Stock Items**
- **Screen**: Inventory - Out of Stock Items
- **Display**: Table showing 3 out-of-stock items
- **Out of Stock Items**:
  - Premium Chocolate Bar: 0 units (Min: 10 units)
  - Imported Cheese 200g: 0 units (Min: 5 units)
  - Specialty Coffee Beans: 0 units (Min: 8 units)
- **System Alert**: "These items have pending customer demand (5 customers waiting)"
- **User Action**: Pierre notes that chocolate bars are from a slow supplier
- **Decision**: Marks chocolate bars as "Temporarily Unavailable" to manage customer expectations
- **User Action**: Clicks "Mark as Temporarily Unavailable" for chocolate bars
- **System Response**: Updates product status, notifies customers who had it in their wishlist

**Step 8: Receiving Inventory Delivery**
- **Context**: At 2:15 PM, supplier arrives with delivery
- **User Action**: Pierre navigates to "Receive Inventory" section
- **Screen**: Receive Inventory
- **Display**:
  - **Pending Deliveries**: List of expected deliveries
  - **PO #PO-20251106-0012**: "Fresh Farms Douala - Expected 2:00 PM"
  - "Start Receiving" button
- **User Action**: Clicks "Start Receiving" for the fresh farms delivery

**Step 9: Inventory Receipt Process**
- **Screen**: Inventory Receipt - PO #PO-20251106-0012
- **Display**:
  - **Expected Items Table**:
    - Product, Ordered Qty, Received Qty, Condition, Notes
  - **Barcode Scanner**: Option to scan items
  - **Manual Entry**: Input fields for received quantities
  - **Condition Options**: Good, Damaged, Expired
  - **Photo Upload**: For damaged items
- **User Action**: Pierre checks each item as it's unloaded
  - Fresh Tomatoes: Ordered 120 kg, Received 120 kg, Condition: Good ✓
  - Whole Milk 1L: Ordered 30 units, Received 28 units, Condition: Good (notes: 2 units short)
  - Cooking Oil 2L: Ordered 20 units, Received 20 units, Condition: Good ✓
  - [Other items...]
- **Discrepancy Handling**: System flags 2 missing milk units
- **User Action**: Pierre adds note: "Supplier confirmed 2 units damaged in transit, will credit account"
- **User Action**: Clicks "Complete Receipt"

**Step 10: Inventory Update Confirmation**
- **Screen**: Receipt Completed
- **Display**:
  - "Inventory Updated Successfully!"
  - **Summary**:
    - Items Received: "5 products"
    - Total Quantity: "198 units"
    - Discrepancies: "1 (Milk -2 units)"
  - **Updated Stock Levels**: Shows before/after for each item
  - **Actions**:
    - "Print Receipt" button
    - "Report Discrepancy to Supplier" button
    - "Back to Inventory" button
- **System Action**:
  - Updates inventory database
  - Makes products available for customer orders
  - Sends receipt confirmation to supplier
  - Logs discrepancy for accounting
- **User Action**: Clicks "Report Discrepancy to Supplier"
- **System Response**: Generates and sends discrepancy report via email

**Journey Completion Metrics**:
- **Time to Complete**: 30-45 minutes
- **Inventory Accuracy Target**: >98%
- **Stockout Prevention**: <2% of SKUs out of stock at any time
- **Reorder Efficiency**: AI suggestions accepted 70% of the time
- **Key Success Factors**: AI-powered recommendations, streamlined receipt process, real-time updates

---

## Cross-Platform Integration Scenarios

### Scenario 1: Complete Order Lifecycle

**Participants**: Marie (Customer), Pierre (Merchant), Emmanuel (Rider)

**Timeline**: 45 minutes from order to delivery

1. **4:45 PM - Order Placement** (Customer App)
   - Marie places order for groceries
   - Payment confirmed via Orange Money
   - Order #OKD-20251106-0234 created

2. **4:46 PM - Order Received** (Merchant Platform)
   - Pierre's dashboard shows new order notification
   - Order automatically assigned to picker (Fatima)
   - System allocates inventory

3. **4:47 PM - Order Picking** (Merchant Platform)
   - Fatima receives picking list on her tablet
   - Scans items as she collects them
   - System updates order status to "Preparing"

4. **4:48 PM - Customer Notification** (Customer App)
   - Marie receives push notification: "Your order is being prepared"
   - Tracking screen updates to show "Preparing" status

5. **4:55 PM - Order Ready** (Merchant Platform)
   - Fatima completes picking, marks order as "Ready for Pickup"
   - System searches for available rider in zone

6. **4:56 PM - Rider Assignment** (Rider App)
   - Emmanuel receives order notification
   - Accepts order within 10 seconds
   - Navigation to dark store begins

7. **4:57 PM - Customer Update** (Customer App)
   - Marie sees "Order ready, rider assigned"
   - Can see Emmanuel's name and rating (4.8 stars)

8. **5:00 PM - Rider Pickup** (Rider App + Merchant Platform)
   - Emmanuel arrives at dark store
   - Scans QR code to verify order
   - Pierre's system confirms pickup

9. **5:01 PM - Out for Delivery** (All Apps)
   - Customer app shows "Out for delivery" with live map
   - Merchant platform updates order status
   - Rider app starts navigation to customer

10. **5:15 PM - Approaching Delivery** (Customer App + Rider App)
    - Emmanuel is 200m away, system prompts him to call
    - Marie receives notification: "Your rider is nearby"

11. **5:18 PM - Delivery Complete** (All Apps)
    - Emmanuel confirms delivery
    - Marie confirms receipt and rates Emmanuel 5 stars
    - Pierre's dashboard shows order completed
    - All systems update in real-time

**Integration Points**:
- Real-time order status synchronization
- Inventory allocation and release
- Rider assignment algorithm
- Live location tracking
- Multi-party notifications
- Rating and feedback system

---

## Conclusion

These detailed user journeys provide a comprehensive blueprint for the Okada platform's user experience across all three applications. Each journey is designed to accommodate Cameroon's specific market conditions including varying digital literacy levels, intermittent connectivity, and local payment preferences. The cross-platform integration ensures a seamless experience for all stakeholders in the quick commerce ecosystem.

**Key Design Principles Applied**:

1. **Simplicity**: Clear, intuitive interfaces with minimal steps
2. **Offline-First**: Robust functionality even with poor connectivity
3. **Cultural Relevance**: Cameroon flag colors, local languages, familiar landmarks
4. **Accessibility**: Support for users with varying digital literacy
5. **Transparency**: Clear pricing, real-time updates, honest communication
6. **Efficiency**: Optimized flows to minimize time and data usage

**Next Steps**:

1. Validate journeys with user testing in Cameroon
2. Create detailed wireframes for each screen
3. Develop interactive prototypes
4. Conduct usability testing with representative personas
5. Iterate based on feedback before development

---

**Document Control**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | November 2025 | Initial detailed user journey documentation | Manus AI |


