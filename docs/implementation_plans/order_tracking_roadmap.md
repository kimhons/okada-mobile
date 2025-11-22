# Order Tracking Screen: Implementation Roadmap

**Author:** Manus AI
**Date:** November 15, 2025
**Version:** 1.0

## 1. Overview & Goals

This document provides a detailed implementation roadmap for the development team to build the **Order Tracking screen** for the Okada Customer App. The primary goal is to deliver a best-in-class, real-time tracking experience that builds customer trust and handles exceptions gracefully.

**Key Priorities:**
1.  **Core Tracking Experience (Happy Path):** Implement the end-to-end tracking flow from "Rider Assigned" to "Delivered".
2.  **Delayed Delivery Edge Case:** Proactively manage and communicate delivery delays to the customer.

This roadmap is designed to be executed in two distinct sprints.

## 2. Team & Roles

-   **Frontend Team (Flutter):** Responsible for UI/UX implementation, state management, and API client integration.
-   **Backend Team (Laravel):** Responsible for implementing the necessary API endpoints, WebSocket server, and business logic for delay detection.

## 3. High-Level Architecture

The architecture will consist of three main components:

1.  **Customer App (Flutter):** The user-facing interface with a real-time map, built using the `google_maps_flutter` package and Riverpod for state management.
2.  **Backend API (Laravel):** The existing REST API will be extended to provide order/delivery data. A new WebSocket endpoint will be added for real-time communication.
3.  **Rider App (Flutter):** Will be responsible for sending frequent location updates to the backend via the `POST /deliveries/{id}/location` endpoint.

## 4. Phased Implementation Plan

### **Sprint 1: Core Tracking Experience (Happy Path)**

**Goal:** Implement the complete, real-time order tracking experience for a standard delivery.

**Sprint Tasks:**

| Task ID | Description | Team | Priority | Effort (Days) | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FE-01** | **Create `OrderTrackingScreen` UI Shell:** Build the static layout based on mockups, including map placeholder, status timeline, and rider info card. | Frontend | **High** | 1 | - |
| **FE-02** | **Implement `OrderTrackingProvider`:** Create a new Riverpod provider to manage the screen's state, including loading, error, and data states. | Frontend | **High** | 1 | - |
| **BE-01** | **Implement WebSocket Server:** Set up a WebSocket server (e.g., using Laravel WebSockets) to handle real-time location broadcasts. | Backend | **High** | 2 | - |
| **BE-02** | **Create `GET /orders/{id}/tracking` Endpoint:** Create a new endpoint that aggregates order, delivery, and initial rider location data. | Backend | **High** | 1 | - |
| **FE-03** | **Integrate Google Maps:** Add `google_maps_flutter`, display the map, and add markers for pickup, delivery, and rider. | Frontend | **High** | 2 | FE-01 |
| **FE-04** | **Implement Real-time Location Updates:** Connect to the WebSocket and update the rider's marker position in real-time as new coordinates are received. | Frontend | **High** | 2 | FE-03, BE-01 |
| **FE-05** | **Implement Order Status Timeline:** Dynamically render the vertical timeline based on the order status received from the API. | Frontend | **Medium** | 1 | FE-02, BE-02 |
| **FE-06** | **Implement Rider Card & Contact:** Display rider info and implement the "Contact Rider" button using `url_launcher`. | Frontend | **Medium** | 0.5 | FE-01 |

### **Sprint 2: Delayed Delivery Edge Case**

**Goal:** Gracefully handle delivery delays by proactively informing the user and providing resolution options.

**Sprint Tasks:**

| Task ID | Description | Team | Priority | Effort (Days) | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BE-03** | **Implement Delay Detection Logic:** Create a backend job or service that monitors ongoing deliveries and flags them as "delayed" if the ETA is exceeded. | Backend | **High** | 2 | - |
| **BE-04** | **Update Order Status for Delays:** Add a "delayed" status to the order/delivery model and update the API to reflect this. | Backend | **High** | 1 | BE-03 |
| **FE-07** | **Implement Delay Warning UI:** Create the yellow warning banner and alert card UI components based on the mockups. | Frontend | **High** | 1 | - |
| **FE-08** | **Update `OrderTrackingProvider` for Delays:** Add logic to handle the "delayed" status, show/hide the warning UI, and manage the new ETA. | Frontend | **High** | 1 | FE-02, BE-04 |
| **FE-09** | **Implement Resolution Options Screen:** Build the UI that presents the user with the "Wait", "Cancel", or "Contact Support" options. | Frontend | **Medium** | 1.5 | FE-07 |
| **BE-05** | **Implement Compensation Logic:** Create an endpoint or service to apply a credit to the user's account for significant delays. | Backend | **Medium** | 1 | - |
| **FE-10** | **Implement Compensation UI:** Display the compensation banner and update the order summary to reflect the credit. | Frontend | **Medium** | 1 | FE-09, BE-05 |

## 5. API & Data Models

### **New Endpoint**

-   `GET /orders/{id}/tracking`: Aggregates all necessary data for the tracking screen.

    **Response Body:**

    ```json
    {
      "orderId": "ORD-12345",
      "status": "in_transit", // or "delayed"
      "estimatedAt": "2025-11-15T14:30:00Z",
      "newEstimatedAt": "2025-11-15T15:15:00Z", // if delayed
      "delayReason": "traffic_congestion", // if delayed
      "pickupLocation": { "latitude": 3.8480, "longitude": 11.5021 },
      "deliveryLocation": { "latitude": 3.8699, "longitude": 11.5213 },
      "rider": {
        "id": "RDR-678",
        "name": "Daniel Okoro",
        "phone": "+237670123456",
        "rating": 4.8,
        "currentLocation": { "latitude": 3.8550, "longitude": 11.5115 }
      }
    }
    ```

### **WebSocket Communication**

-   **Endpoint:** `wss://api.okada.cm/v1/tracking/{orderId}`
-   **Client-to-Server:** Connection initiation.
-   **Server-to-Client:**
    -   **Location Update:** `{"event": "location_update", "data": {"latitude": 3.8555, "longitude": 11.5120}}`
    -   **Delay Notification:** `{"event": "delivery_delayed", "data": {"newEstimatedAt": "2025-11-15T15:15:00Z", "reason": "traffic_congestion"}}`

## 6. Testing Strategy

-   **Unit Tests:** For the `OrderTrackingProvider` logic, including state changes for delays.
-   **Widget Tests:** For all new UI components (`OrderStatusTimeline`, `RiderInfoCard`, `DelayWarningBanner`).
-   **Integration Tests:**
    -   Test the WebSocket connection and real-time location updates using a mock server.
    -   Test the full API flow for fetching tracking data.
-   **Manual Testing:**
    -   Simulate a rider's movement to verify map updates.
    -   Manually trigger a delay on the backend to test the full delayed delivery flow.

## 7. Next Steps

1.  **Team Briefing:** Share this roadmap with the frontend and backend teams.
2.  **Sprint Planning:** Create tickets for each task in your project management tool (e.g., Jira, Trello).
3.  **Begin Sprint 1.**

