# Implementation Plan: Order Tracking Screen

**Author:** Manus AI
**Date:** November 15, 2025
**Status:** Draft

## 1. Introduction

This document outlines the implementation plan for the **Order Tracking screen** in the Okada Customer App. This screen is a critical component of the post-purchase experience, providing customers with real-time visibility into the status and location of their order. The key feature of this screen is the **real-time rider location tracking** on a map, which enhances customer trust and reduces anxiety associated with package delivery.

## 2. Features

The Order Tracking screen will include the following features, as derived from the mockups (`04_order_tracking.png` and `13_order_tracking.png`):

- **Real-time Map View:** A map displaying the rider's current location, the pickup location (seller), and the delivery destination (customer).
- **Route Visualization:** A polyline on the map showing the route from the seller to the customer.
- **Order Status Timeline:** A vertical timeline indicating the current stage of the delivery process (e.g., Order Placed, Confirmed, Rider Assigned, In Transit, Delivered).
- **Rider Information:** The assigned rider's name, profile picture, and rating.
- **Contact Rider:** A button to initiate a call with the rider.
- **Order Details:** A summary of the items included in the order.
- **Estimated Time of Arrival (ETA):** Displaying the estimated time of arrival for the delivery.

## 3. Technical Architecture

The implementation will follow the existing architecture of the Okada mobile app, leveraging Flutter for the UI, Riverpod for state management, and the `OkadaApiClient` for API communication. The real-time location updates will be handled by a WebSocket connection to a dedicated service or by polling the API.

### Data Flow

1.  The customer navigates to the Order Tracking screen for a specific order.
2.  The app fetches the order and delivery details from the Okada API using the `orderId`.
3.  The app establishes a WebSocket connection to receive real-time location updates for the rider.
4.  The Rider App on the rider's device periodically sends location updates (latitude and longitude) to the backend.
5.  The backend pushes these location updates through the WebSocket to the Customer App.
6.  The Customer App updates the rider's marker on the map in real-time.
7.  The app also periodically polls the order status to update the timeline.

## 4. API Integration

The following API endpoints from the `openapi.yaml` specification will be used:

| Method | Endpoint                      | Description                                      |
| :----- | :---------------------------- | :----------------------------------------------- |
| `GET`  | `/orders/{id}`                | Fetches the details of a specific order.         |
| `GET`  | `/deliveries/{id}`            | Fetches the delivery details, including status.  |
| `POST` | `/deliveries/{id}/location`   | **(Rider App)** Updates the rider's location.    |

**Real-time Communication:**

As the current OpenAPI specification does not define a WebSocket endpoint for real-time location updates, I propose the following:

- **WebSocket Endpoint:** `wss://api.okada.cm/v1/tracking/{orderId}`
- **Message Format (Server to Client):**

```json
{
  "event": "location_update",
  "data": {
    "latitude": 6.3452,
    "longitude": 10.2345
  }
}
```

If a WebSocket implementation is not feasible in the short term, a **fallback polling mechanism** will be used. The app will call the `GET /deliveries/{id}` endpoint every 15 seconds to get the latest `current_location`.

## 5. Step-by-Step Implementation Plan

### Phase 1: Basic UI and Data Fetching

1.  Create the `order_tracking_screen.dart` file.
2.  Build the static UI based on the mockups, including the map placeholder, status timeline, and rider info card.
3.  Use the `OrderProvider` to fetch the order and delivery details.
4.  Populate the UI with the fetched data.

### Phase 2: Map Integration

1.  Integrate the `google_maps_flutter` package.
2.  Display the map centered on the delivery region.
3.  Add markers for the pickup location, delivery destination, and the rider's initial location.
4.  Draw a polyline on the map to show the route.

### Phase 3: Real-time Location Tracking

1.  Implement the WebSocket connection to the proposed tracking endpoint.
2.  Listen for `location_update` events.
3.  Update the rider's marker on the map in real-time when a new location is received.
4.  Implement the fallback polling mechanism if WebSockets are not available.

### Phase 4: Final Touches and Refinements

1.  Implement the "Contact Rider" functionality.
2.  Add the order details section.
3.  Implement the ETA calculation and display.
4.  Thoroughly test the screen and the real-time updates.

## 6. UI Components

The following custom widgets will be created:

- `OrderStatusTimeline`: A widget to display the vertical order status timeline.
- `RiderInfoCard`: A card to display the rider's information.
- `OrderDetailsCard`: A card to display the order items and prices.

## 7. State Management (Riverpod)

A new `OrderTrackingProvider` will be created to manage the state of the Order Tracking screen. This provider will handle:

- Fetching order and delivery details.
- Managing the WebSocket connection.
- Storing the rider's real-time location.
- Handling the screen's loading and error states.

## 8. Dependencies

The following Flutter packages will be required:

- `google_maps_flutter`: For displaying the map.
- `web_socket_channel`: For WebSocket communication.
- `flutter_polyline_points`: To draw the route on the map.
- `url_launcher`: To initiate the call to the rider.

## 9. Next Steps

Upon approval of this plan, I will proceed with the implementation of the Order Tracking screen, starting with Phase 1. I will provide regular updates on the progress.

