# Mobile App 100 Screens Implementation Plan

## Current Status
- **Customer App**: 49 screens implemented
- **Rider App**: 28 screens implemented
- **Total**: 77 screens implemented
- **Target**: 100 additional screens (177 total)

---

## BATCH 1: Customer App - Home & Discovery (25 screens)

### Home Section (10 screens)
1. `home/home_screen.dart` - Main home with categories, featured stores, promotions
2. `home/categories_screen.dart` - All categories grid view
3. `home/category_detail_screen.dart` - Products in a specific category
4. `home/stores_screen.dart` - All stores list with filters
5. `home/store_products_screen.dart` - Products from a specific store
6. `home/popular_products_screen.dart` - Popular/trending products
7. `home/nearby_stores_screen.dart` - Stores near user location
8. `home/deals_of_day_screen.dart` - Daily deals and offers
9. `home/recently_viewed_screen.dart` - Recently viewed products
10. `home/notifications_list_screen.dart` - All notifications with filters

### Products Section (10 screens)
11. `products/product_reviews_screen.dart` - Product reviews and ratings
12. `products/write_review_screen.dart` - Write a product review
13. `products/product_gallery_screen.dart` - Full-screen product images
14. `products/compare_products_screen.dart` - Compare multiple products
15. `products/product_variants_screen.dart` - Select product variants (size, color)
16. `products/related_products_screen.dart` - Related/similar products
17. `products/product_questions_screen.dart` - Q&A about product
18. `products/ask_question_screen.dart` - Ask a question about product
19. `products/seller_products_screen.dart` - All products from a seller
20. `products/filter_screen.dart` - Advanced product filters

### Search Section (5 screens)
21. `search/search_results_screen.dart` - Search results with filters
22. `search/search_history_screen.dart` - Search history
23. `search/voice_search_screen.dart` - Voice search interface
24. `search/barcode_scanner_screen.dart` - Scan product barcode
25. `search/search_suggestions_screen.dart` - Search suggestions/autocomplete

---

## BATCH 2: Customer App - Orders & Checkout (25 screens)

### Cart Section (8 screens)
26. `cart/cart_items_screen.dart` - Cart items list with quantity controls
27. `cart/apply_coupon_screen.dart` - Apply coupon/promo code
28. `cart/delivery_options_screen.dart` - Select delivery time slot
29. `cart/delivery_address_screen.dart` - Select/add delivery address
30. `cart/order_summary_screen.dart` - Order summary before payment
31. `cart/payment_selection_screen.dart` - Select payment method
32. `cart/order_confirmation_screen.dart` - Order placed confirmation
33. `cart/save_for_later_screen.dart` - Saved items for later

### Orders Section (10 screens)
34. `orders/orders_list_screen.dart` - All orders with tabs (active, completed, cancelled)
35. `orders/order_items_screen.dart` - Items in an order
36. `orders/order_timeline_screen.dart` - Order status timeline
37. `orders/track_rider_screen.dart` - Real-time rider tracking on map
38. `orders/rider_info_screen.dart` - Rider details and contact
39. `orders/rate_order_screen.dart` - Rate order and rider
40. `orders/order_receipt_screen.dart` - Order receipt/invoice
41. `orders/cancel_order_screen.dart` - Cancel order with reason
42. `orders/reorder_screen.dart` - Reorder previous order
43. `orders/order_issue_screen.dart` - Report issue with order

### Checkout Section (7 screens)
44. `checkout/checkout_flow_screen.dart` - Multi-step checkout
45. `checkout/mtn_momo_screen.dart` - MTN Mobile Money payment
46. `checkout/orange_money_screen.dart` - Orange Money payment
47. `checkout/card_payment_screen.dart` - Card payment with Stripe
48. `checkout/payment_processing_screen.dart` - Payment processing animation
49. `checkout/payment_success_screen.dart` - Payment success
50. `checkout/payment_failed_screen.dart` - Payment failed with retry

---

## BATCH 3: Customer App - Profile & Settings (25 screens)

### Profile Section (8 screens)
51. `profile/profile_details_screen.dart` - Full profile details
52. `profile/edit_name_screen.dart` - Edit name
53. `profile/edit_phone_screen.dart` - Edit phone number
54. `profile/edit_email_screen.dart` - Edit email
55. `profile/profile_photo_screen.dart` - Change profile photo
56. `profile/delete_account_screen.dart` - Delete account
57. `profile/language_screen.dart` - Change language (EN/FR)
58. `profile/currency_screen.dart` - Change currency preference

### Addresses Section (5 screens)
59. `addresses/addresses_list_screen.dart` - All saved addresses
60. `addresses/add_address_screen.dart` - Add new address
61. `addresses/edit_address_screen.dart` - Edit existing address
62. `addresses/map_picker_screen.dart` - Pick location on map
63. `addresses/address_details_screen.dart` - Address details with map

### Wallet & Payments (7 screens)
64. `wallet/wallet_balance_screen.dart` - Wallet balance and history
65. `wallet/add_money_screen.dart` - Add money to wallet
66. `wallet/withdraw_screen.dart` - Withdraw from wallet
67. `wallet/wallet_transactions_screen.dart` - Wallet transaction history
68. `wallet/saved_cards_screen.dart` - Saved payment cards
69. `wallet/mobile_money_accounts_screen.dart` - Linked mobile money accounts
70. `wallet/link_momo_screen.dart` - Link mobile money account

### Support Section (5 screens)
71. `support/support_tickets_screen.dart` - All support tickets
72. `support/create_ticket_screen.dart` - Create support ticket
73. `support/ticket_detail_screen.dart` - Ticket conversation
74. `support/contact_us_screen.dart` - Contact information
75. `support/emergency_screen.dart` - Emergency contact

---

## BATCH 4: Rider App - Complete Features (25 screens)

### Orders Section (8 screens)
76. `orders/available_orders_screen.dart` - Available orders to accept
77. `orders/order_detail_screen.dart` - Full order details
78. `orders/pickup_screen.dart` - Pickup confirmation
79. `orders/delivery_screen.dart` - Delivery in progress
80. `orders/signature_screen.dart` - Customer signature capture
81. `orders/delivery_issues_screen.dart` - Report delivery issues
82. `orders/order_chat_screen.dart` - Chat with customer
83. `orders/batch_orders_screen.dart` - Multiple orders delivery

### Earnings Section (5 screens)
84. `earnings/daily_earnings_screen.dart` - Daily earnings breakdown
85. `earnings/weekly_earnings_screen.dart` - Weekly earnings summary
86. `earnings/tips_screen.dart` - Tips received
87. `earnings/bonuses_screen.dart` - Bonuses and incentives
88. `earnings/payout_history_screen.dart` - Payout history

### Profile Section (6 screens)
89. `profile/edit_profile_screen.dart` - Edit rider profile
90. `profile/bank_details_screen.dart` - Bank account details
91. `profile/momo_details_screen.dart` - Mobile money details
92. `profile/ratings_screen.dart` - Rider ratings and reviews
93. `profile/badges_screen.dart` - Earned badges
94. `profile/stats_screen.dart` - Delivery statistics

### Settings Section (6 screens)
95. `settings/notification_settings_screen.dart` - Notification preferences
96. `settings/privacy_settings_screen.dart` - Privacy settings
97. `settings/app_settings_screen.dart` - App preferences
98. `settings/help_screen.dart` - Help and FAQ
99. `settings/about_screen.dart` - About the app
100. `settings/logout_screen.dart` - Logout confirmation

---

## Implementation Priority

### Week 1: Batch 1 (25 screens)
- Day 1-2: Home screens (10)
- Day 3-4: Product screens (10)
- Day 5: Search screens (5)

### Week 2: Batch 2 (25 screens)
- Day 1-2: Cart screens (8)
- Day 3-4: Orders screens (10)
- Day 5: Checkout screens (7)

### Week 3: Batch 3 (25 screens)
- Day 1-2: Profile screens (8)
- Day 3: Addresses screens (5)
- Day 4: Wallet screens (7)
- Day 5: Support screens (5)

### Week 4: Batch 4 (25 screens)
- Day 1-2: Rider Orders screens (8)
- Day 3: Rider Earnings screens (5)
- Day 4: Rider Profile screens (6)
- Day 5: Rider Settings screens (6)

---

## Backend API Endpoints Required

### Customer App APIs
- GET /api/mobile/home - Home feed data
- GET /api/mobile/categories - All categories
- GET /api/mobile/stores - Stores list
- GET /api/mobile/products - Products with filters
- GET /api/mobile/search - Search products
- POST /api/mobile/cart - Cart operations
- POST /api/mobile/orders - Create order
- GET /api/mobile/orders - Order history
- POST /api/mobile/payments/mtn - MTN MoMo payment
- POST /api/mobile/payments/orange - Orange Money payment
- GET /api/mobile/wallet - Wallet balance
- POST /api/mobile/support - Support tickets

### Rider App APIs
- GET /api/mobile/rider/orders/available - Available orders
- POST /api/mobile/rider/orders/accept - Accept order
- POST /api/mobile/rider/orders/pickup - Confirm pickup
- POST /api/mobile/rider/orders/deliver - Confirm delivery
- GET /api/mobile/rider/earnings - Earnings data
- POST /api/mobile/rider/location - Update location
- GET /api/mobile/rider/profile - Rider profile
- POST /api/mobile/rider/documents - Upload documents

---

## Quality Checklist for Each Screen

- [ ] Responsive layout (phones and tablets)
- [ ] Loading states with shimmer/skeleton
- [ ] Error states with retry option
- [ ] Empty states with helpful message
- [ ] Pull-to-refresh where applicable
- [ ] Proper navigation (back, close)
- [ ] Form validation with error messages
- [ ] Keyboard handling (dismiss, next field)
- [ ] Dark mode support
- [ ] Localization (EN/FR)
- [ ] Accessibility labels
- [ ] Backend API integration
- [ ] Offline support where needed
