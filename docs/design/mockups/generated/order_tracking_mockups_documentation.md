# Order Tracking Screen Mockups

**Author:** Manus AI
**Date:** November 15, 2025
**Status:** Final

## 1. Introduction

This document presents the UI/UX mockups for the **Order Tracking screen** of the Okada Customer App. These mockups visualize the different states of the order tracking process, from the moment a rider is assigned to the final delivery confirmation. The design is consistent with the Okada brand identity, using the specified color palette and typography.

## 2. Mockup States

The following mockups illustrate the key stages of the order tracking experience:

### State 1: Rider Assigned

This state is shown when a rider has accepted the delivery request but has not yet started moving towards the customer.

![State 1: Rider Assigned](generated/order_tracking_state_1_rider_assigned.png)

**Annotations:**

| # | Element             | Description                                                                                             |
|:-:|:--------------------|:--------------------------------------------------------------------------------------------------------|
| 1 | **Map View**        | Displays the pickup location, delivery destination, and the rider's initial position.                   |
| 2 | **Status Timeline** | Shows that the order has been placed, confirmed, and a rider has been assigned. The "In Transit" status is pending. |
| 3 | **Rider Info**      | Displays the rider's name, phone number, and a button to initiate contact.                                |

### State 2: In Transit

This state is active when the rider has picked up the order and is on the way to the customer's location.

![State 2: In Transit](generated/order_tracking_state_2_in_transit.png)

**Annotations:**

| # | Element           | Description                                                                                                     |
|:-:|:------------------|:----------------------------------------------------------------------------------------------------------------|
| 1 | **Route Polyline**| A green line on the map visualizes the route the rider is taking.                                                 |
| 2 | **Rider Icon**    | The motorcycle icon moves along the polyline in real-time, showing the rider's current location.                |
| 3 | **Status Update** | The "In Transit" status is now active, indicated by a solid green circle.                                       |
| 4 | **Order Details** | A summary of the order items and their prices is displayed.                                                     |

### State 3: Arriving Soon

This state is triggered when the rider is close to the delivery destination.

![State 3: Arriving Soon](generated/order_tracking_state_3_arriving.png)

**Annotations:**

| # | Element         | Description                                                                                             |
|:-:|:----------------|:--------------------------------------------------------------------------------------------------------|
| 1 | **ETA Overlay** | A floating card on the map displays the estimated time of arrival (e.g., "Arriving in 3 minutes").         |
| 2 | **Pulsing Icon**| The delivery destination icon pulses to draw the user's attention.                                        |
| 3 | **Status Update**| The timeline now shows an "Arriving Soon" status with a pulsing green circle.                             |

### State 4: Delivered

This is the final state, shown after the customer has received the order.

![State 4: Delivered](generated/order_tracking_state_4_delivered.png)

**Annotations:**

| # | Element                 | Description                                                                                                                                 |
|:-:|:------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | **Success Banner**      | A prominent banner at the top confirms that the order has been delivered.                                                                   |
| 2 | **Static Map**          | The map now shows a static view with a checkmark at the delivery location.                                                                  |
| 3 | **Rate Experience**     | A section appears, prompting the user to rate their experience and leave a review.                                                          |
| 4 | **Quality Photos Button**| A button to view the Quality Verification Photos taken by the rider before delivery. This reinforces Okada's key differentiator. |

## 3. Detailed Map View

This mockup provides a closer look at the map component, showcasing the level of detail and clarity.

![Detailed Map View](generated/order_tracking_map_detail.png)

**Annotations:**

| # | Element             | Description                                                                                             |
|:-:|:--------------------|:--------------------------------------------------------------------------------------------------------|
| 1 | **Location Labels** | Clear labels for the pickup and delivery locations.                                                     |
| 2 | **Map Controls**    | Standard map controls for zooming and centering the view.                                               |
| 3 | **Street Names**    | Subtle street names to provide context without cluttering the interface.                                |

## 4. Conclusion

These mockups provide a comprehensive visual guide for the implementation of the Order Tracking screen. They are designed to create an intuitive, informative, and reassuring experience for the customer, which is crucial for building trust and loyalty.

