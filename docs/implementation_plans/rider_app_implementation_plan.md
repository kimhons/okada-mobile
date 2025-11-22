

> # Okada Rider App Implementation Plan
> 
> **Date:** November 22, 2025  
> **Project:** Okada Rider App  
> **Status:** &#128221; **PLANNING**

---

## 1. Executive Summary

This document outlines the implementation plan for the **Okada Rider App**, the mobile application for Okada's delivery riders. The Rider App is a critical component of the Okada ecosystem, enabling riders to accept and manage deliveries, capture Quality Verification Photos, and track their earnings.

The development will be divided into **2 sprints**, prioritizing the core delivery management and Quality Verification features. The app will be built using Flutter, ensuring a consistent and high-quality experience for riders on both iOS and Android.

**Sprint 1** will focus on the core delivery workflow, including order acceptance, real-time navigation, and the critical **Quality Verification Photos** feature. **Sprint 2** will build on this foundation, adding features for earnings management, order history, and rider profile management.

This plan provides a detailed breakdown of the screens, features, technical specifications, and API requirements for the Rider App. It will serve as the blueprint for the development team to build a world-class application that empowers Okada's riders and ensures a seamless delivery experience for customers.

**Key Priorities:**

-   **Accept and manage deliveries:** A clear and intuitive interface for riders to view and accept available orders.
-   **Capture Quality Verification Photos:** A simple and efficient camera interface for taking high-quality photos of products.
-   **Real-time navigation:** Integration with Google Maps for turn-by-turn navigation to pickup and delivery locations.
-   **Earnings tracking:** A transparent and easy-to-understand dashboard for riders to track their earnings.

This implementation plan is designed to ensure the successful and timely delivery of the Okada Rider App, a key enabler of Okada's unique value proposition.

---



> ## 2. Screen List & Feature Breakdown
> 
> The Rider App will consist of **20 screens** divided into **2 sprints**. Sprint 1 will focus on the core delivery workflow, while Sprint 2 will add supporting features for earnings, history, and profile management.
> 
> ### Sprint 1: Core Delivery & Quality Verification (13 screens)
> 
> This sprint focuses on the critical path for a rider to accept and complete a delivery, including the Quality Verification Photos feature.
> 
> | # | Screen | Mockup | Priority | Key Features |
> |:--|:---|:---|:---:|:---|
> | 1 | Splash Screen | `01_splash_screen.png` | Critical | App logo, loading indicator |
> | 2 | Onboarding (3) | `02-04_onboarding.png` | Critical | App value proposition, feature overview |
> | 3 | Login/Register | `05_login_register.png` | Critical | Phone number authentication, OTP verification |
> | 4 | Rider Registration | `06_rider_registration.png` | Critical | Name, ID, vehicle info, bank details |
> | 5 | Rider Dashboard | `07_rider_dashboard.png` | High | Online/offline toggle, summary stats, available orders |
> | 6 | Available Orders | `08_available_orders.png` | High | List of nearby orders, distance, delivery fee |
> | 7 | Order Detail | `09_order_detail.png` | High | Order summary, pickup/delivery locations, accept button |
> | 8 | Active Delivery | `10_active_delivery.png` | High | Real-time map, navigation, customer contact |
> | 9 | **Quality Verification Photo** | `11_quality_verification_photo.png` | **⭐ HIGHEST** | **Camera interface, photo guidelines, 3-photo capture** |
> | 10 | Verification Review | `12_verification_review.png` | High | Review captured photos, retake/submit options |
> | 11 | Waiting for Approval | `13_waiting_approval.png` | High | Real-time status, waiting for customer approval |
> | 12 | Delivery Complete | `14_delivery_complete.png` | High | Success screen, earnings summary |
> 
> ### Sprint 2: Earnings, History & Profile (7 screens)
> 
> This sprint adds features for riders to manage their earnings, view their history, and maintain their profile.
> 
> | # | Screen | Mockup | Priority | Key Features |
> |:--|:---|:---|:---:|:---|
> | 13 | Earnings Dashboard | `15_earnings_dashboard.png` | Medium | Daily/weekly/monthly earnings, withdrawal history |
> | 14 | Withdraw Earnings | `16_withdraw_earnings.png` | Medium | Withdraw to bank/mobile money, amount input |
> | 15 | Order History | `17_order_history.png` | Medium | List of past deliveries, earnings per order |
> | 16 | Ratings & Reviews | `18_ratings_reviews.png` | Medium | Customer feedback, overall rating |
> | 17 | Notifications | `19_notifications.png` | Medium | New orders, payment confirmations, system alerts |
> | 18 | Rider Profile | `20_rider_profile.png` | Medium | Rider info, performance stats, settings |
> | 19 | Edit Profile | `21_edit_profile.png` | Medium | Update personal and vehicle information |
> | 20 | Settings | `22_settings.png` | Low | Notification preferences, language, support |
> 
> ---


> ## 3. Technical Specifications
> 
> The Rider App will be built using Flutter and will leverage several key technologies to deliver a robust and reliable experience.
> 
> ### Architecture
> 
> -   **State Management:** Riverpod for managing app state and dependencies.
> -   **API Client:** A dedicated `OkadaRiderApiClient` for interacting with the Okada backend.
> -   **Real-time Communication:** WebSockets for real-time order updates and location tracking.
> -   **Navigation:** Google Maps SDK for real-time navigation and route optimization.
> -   **Camera:** `camera` package for capturing Quality Verification Photos.
> -   **Local Storage:** `shared_preferences` for storing user settings and session data.
> 
> ### Key Integrations
> 
> -   **Okada Backend API:** For fetching orders, updating delivery status, and managing rider data.
> -   **Google Maps API:** For displaying maps, calculating routes, and providing turn-by-turn navigation.
> -   **Firebase Cloud Messaging (FCM):** For push notifications about new orders and other alerts.
> 
> ### API Requirements
> 
> The Rider App will require several new API endpoints to support its functionality:
> 
> | Method | Endpoint | Description |
> |:---|:---|:---|
> | `POST` | `/riders/register` | Register a new rider. |
> | `GET` | `/riders/me` | Get the current rider's profile. |
> | `PUT` | `/riders/me` | Update the current rider's profile. |
> | `GET` | `/orders/available` | Get a list of available orders for the rider. |
> | `POST` | `/orders/{id}/accept` | Accept an order. |
> | `POST` | `/orders/{id}/quality-photos` | Upload Quality Verification Photos. |
> | `GET` | `/orders/{id}/status` | Get the real-time status of an order. |
> | `POST` | `/riders/me/location` | Update the rider's real-time location. |
> | `GET` | `/riders/me/earnings` | Get the rider's earnings summary. |
> | `POST` | `/riders/me/withdraw` | Withdraw earnings. |
> 
> ---


> ## 4. Development Roadmap
> 
> The Rider App will be developed in **2 sprints**, with a strong focus on delivering the core functionality in Sprint 1.
> 
> ### Sprint 1: Core Delivery & Quality Verification (3 weeks)
> 
> -   **Week 1:** Authentication, Rider Registration, and Dashboard setup.
> -   **Week 2:** Available Orders, Order Details, and Active Delivery with real-time navigation.
> -   **Week 3:** **Quality Verification Photos** capture and submission, and delivery completion flow.
> 
> ### Sprint 2: Earnings, History & Profile (2 weeks)
> 
> -   **Week 4:** Earnings Dashboard and withdrawal functionality.
> -   **Week 5:** Order History, Ratings & Reviews, Notifications, and Rider Profile management.
> 
> ---
> 
> ## 5. Conclusion
> 
> This implementation plan provides a clear and comprehensive roadmap for the development of the Okada Rider App. By prioritizing the core delivery and Quality Verification features, we can quickly deliver a functional and valuable application to our riders.
> 
> The successful execution of this plan will be a critical step in completing the Okada ecosystem and delivering on our promise of quality and trust to our customers.
> 
> **The Rider App is ready for development!** &#128690;&#128248;&#128200;
> 
> ---
> 
> **Report Generated:** November 22, 2025  
> **Author:** Manus AI

