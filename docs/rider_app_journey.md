# Rider Mobile App User Journey & Screen Map

## Overview

The Okada rider mobile application enables delivery partners in Cameroon to manage pickups and deliveries from dark stores to customers. The app is designed with offline navigation capabilities, battery optimization, and features tailored to the unique challenges of Cameroonian infrastructure and addressing systems.

## User Personas

### Primary Persona: Full-time Rider
- **Name**: Emmanuel Fouda
- **Age**: 28
- **Location**: Douala
- **Behavior**: Dedicated delivery professional seeking consistent income
- **Pain Points**: Navigating without proper addresses, variable earnings
- **Goals**: Maximize earnings through efficient deliveries and incentives

### Secondary Persona: Part-time Student Rider
- **Name**: Sophie Mballa
- **Age**: 23
- **Location**: Yaoundé
- **Behavior**: Works between classes, values flexibility
- **Pain Points**: Balancing studies with work, limited working hours
- **Goals**: Earn supplementary income with flexible schedule

## Core User Journeys

### 1. Rider Onboarding

**User Goal**: Register as a delivery partner and complete verification

| Step | User Action | App Response | Screen |
|------|-------------|--------------|--------|
| 1 | Downloads and opens app | Shows splash screen with Okada logo in Cameroon flag colors | Splash Screen |
| 2 | Views onboarding screens | Displays key benefits and requirements | Onboarding Screens (3) |
| 3 | Selects language preference | Switches app language to French or English | Language Selection |
| 4 | Taps "Join as Rider" | Shows registration form | Registration Screen |
| 5 | Enters personal information | Validates information in real-time | Registration Screen |
| 6 | Verifies phone number | Sends and validates OTP | Phone Verification |
| 7 | Uploads required documents | Allows photo/scan of ID, driver's license, etc. | Document Upload |
| 8 | Provides vehicle information | Captures motorcycle/bicycle details | Vehicle Registration |
| 9 | Completes background check | Shows verification pending status | Verification Pending |
| 10 | Receives approval | Notifies of successful verification | Verification Success |
| 11 | Completes training module | Presents delivery guidelines and quiz | Training Module |
| 12 | Sets up payment information | Connects MTN/Orange Money account | Payment Setup |

### 2. Daily Login and Availability Management

**User Goal**: Start work shift and manage availability

| Step | User Action | App Response | Screen |
|------|-------------|--------------|--------|
| 1 | Opens app (returning rider) | Shows personalized dashboard | Home Dashboard |
| 2 | Reviews performance metrics | Displays earnings, ratings, deliveries | Performance Summary |
| 3 | Checks incentives and goals | Shows available bonuses and progress | Incentives Screen |
| 4 | Sets availability status | Toggles online/offline status | Availability Toggle |
| 5 | Defines working area | Shows map to select preferred zones | Zone Selection |
| 6 | Views upcoming schedule | Displays pre-committed time slots | Schedule Screen |
| 7 | Checks dark store locations | Shows map of nearby dark stores | Dark Store Map |

### 3. Order Acceptance and Pickup

**User Goal**: Receive, accept orders and pick up from dark store

| Step | User Action | App Response | Screen |
|------|-------------|--------------|--------|
| 1 | Receives order notification | Shows incoming order with details | Order Notification |
| 2 | Reviews order details | Displays pickup location, items, delivery address | Order Details |
| 3 | Accepts or declines order | Processes response and updates status | Order Acceptance |
| 4 | Navigates to dark store | Shows navigation with offline map support | Navigation - Pickup |
| 5 | Arrives at dark store | Updates status and shows check-in option | Store Arrival |
| 6 | Scans order QR code | Verifies order and confirms pickup | Order Verification |
| 7 | Confirms order items | Shows checklist of items to verify | Item Verification |
| 8 | Reports issues (if any) | Allows reporting of missing/damaged items | Issue Reporting |
| 9 | Completes pickup | Updates order status to "In Transit" | Pickup Confirmation |

### 4. Delivery Navigation and Completion

**User Goal**: Navigate to customer and complete delivery

| Step | User Action | App Response | Screen |
|------|-------------|--------------|--------|
| 1 | Views delivery information | Shows customer address and contact | Delivery Information |
| 2 | Navigates to customer | Provides turn-by-turn directions with landmarks | Navigation - Delivery |
| 3 | Communicates with customer | Opens in-app chat or call option | Customer Communication |
| 4 | Arrives at delivery location | Updates status and notifies customer | Arrival Notification |
| 5 | Handles delivery issues | Shows options for unresponsive customers | Delivery Issues |
| 6 | Completes delivery handover | Allows customer to sign or enter PIN | Delivery Confirmation |
| 7 | Takes delivery photo (optional) | Captures proof of delivery | Delivery Photo |
| 8 | Completes delivery | Updates order status and shows summary | Delivery Complete |
| 9 | Receives new order or returns | Shows next order or return instructions | Next Assignment |

### 5. Earnings and Performance Management

**User Goal**: Track earnings and performance metrics

| Step | User Action | App Response | Screen |
|------|-------------|--------------|--------|
| 1 | Views daily earnings | Shows breakdown of day's earnings | Daily Earnings |
| 2 | Checks weekly summary | Displays weekly performance and earnings | Weekly Summary |
| 3 | Reviews customer ratings | Shows rating history and comments | Ratings & Reviews |
| 4 | Tracks incentive progress | Displays progress toward bonus goals | Incentive Tracking |
| 5 | Requests payment | Initiates transfer to mobile money account | Payment Request |
| 6 | Views payment history | Shows record of all payments | Payment History |
| 7 | Analyzes performance tips | Provides suggestions for improvement | Performance Tips |

### 6. Account and Support Management

**User Goal**: Manage account settings and get support

| Step | User Action | App Response | Screen |
|------|-------------|--------------|--------|
| 1 | Navigates to profile | Shows profile overview | Profile Screen |
| 2 | Updates personal information | Allows editing contact details, etc. | Edit Profile |
| 3 | Manages vehicle information | Allows updating vehicle details | Vehicle Management |
| 4 | Adjusts app settings | Provides options for notifications, language, etc. | Settings Screen |
| 5 | Reports technical issues | Opens support ticket form | Issue Reporting |
| 6 | Accesses help resources | Shows FAQs and training materials | Help Center |
| 7 | Communicates with support | Opens chat with support team | Support Chat |

## Complete Screen Inventory

### Onboarding & Authentication (12 screens)
1. Splash Screen
2. Onboarding Screen 1 (Benefits)
3. Onboarding Screen 2 (Requirements)
4. Onboarding Screen 3 (Process)
5. Language Selection
6. Registration Screen
7. Phone Verification
8. Document Upload
9. Vehicle Registration
10. Verification Pending
11. Training Module
12. Payment Setup

### Home & Dashboard (5 screens)
13. Home Dashboard
14. Performance Summary
15. Incentives Screen
16. Availability Toggle
17. Main Navigation (Bottom Tab Bar)

### Order Management (10 screens)
18. Order Notification
19. Order Details
20. Order Acceptance
21. Navigation - Pickup
22. Store Arrival
23. Order Verification
24. Item Verification
25. Issue Reporting
26. Pickup Confirmation
27. Batch Orders View

### Delivery Management (9 screens)
28. Delivery Information
29. Navigation - Delivery
30. Customer Communication
31. Arrival Notification
32. Delivery Issues
33. Delivery Confirmation
34. Delivery Photo
35. Delivery Complete
36. Next Assignment

### Earnings & Performance (7 screens)
37. Daily Earnings
38. Weekly Summary
39. Ratings & Reviews
40. Incentive Tracking
41. Payment Request
42. Payment History
43. Performance Tips

### Account Management (7 screens)
44. Profile Screen
45. Edit Profile
46. Vehicle Management
47. Settings Screen
48. Issue Reporting
49. Help Center
50. Support Chat

### Additional Utility Screens (5 screens)
51. Network Error Screen
52. Offline Mode Indicator
53. Battery Saver Mode
54. Zone Selection Map
55. Dark Store Map

## Offline Functionality Considerations

The rider app is designed with robust offline capabilities to handle Cameroon's variable network conditions:

1. **Offline Navigation**: Downloaded maps with turn-by-turn directions work without connectivity
2. **Order Caching**: Active order details are stored locally for offline access
3. **Delivery Confirmation Queue**: Delivery confirmations are queued if offline and synchronized later
4. **Landmark-Based Navigation**: Uses local landmarks in addition to GPS coordinates
5. **Battery Optimization**: Special mode for preserving battery in areas with unreliable electricity

## Localization Considerations

The app supports both French and English with:

1. **Dynamic Language Switching**: Riders can switch languages without restarting the app
2. **Local Address Interpretation**: System for handling informal addressing common in Cameroon
3. **Cultural Adaptations**: UI elements adapted for local cultural preferences
4. **Local Currency**: All earnings displayed in CFA francs with appropriate formatting

## Total Screen Count: 55 screens

This comprehensive screen inventory covers all essential functionality for the Okada rider mobile application, ensuring delivery partners have the tools they need to efficiently complete deliveries while navigating the unique challenges of the Cameroonian infrastructure.
