# Order Tracking Edge Case Mockups

**Author:** Manus AI
**Date:** November 15, 2025
**Status:** Final

## 1. Introduction

This document presents the UI/UX mockups for the edge cases of the **Order Tracking screen**. Handling exceptions gracefully is crucial for maintaining customer trust and satisfaction. These mockups cover two critical scenarios: **Delayed Delivery** and **Cancelled Order**.

## 2. Delayed Delivery

Delays are inevitable. The key is to communicate proactively and provide the customer with options.

### State 1: Delay Warning

This screen appears when a delay is first detected.

![Delay Warning](generated/edge_case_delayed_delivery_warning.png)

**Annotations:**

| # | Element             | Description                                                                                             |
|:-:|:--------------------|:--------------------------------------------------------------------------------------------------------|
| 1 | **Warning Banner**  | A prominent yellow banner immediately informs the user about the delay and provides a new ETA.          |
| 2 | **Reason for Delay**| A clear explanation for the delay (e.g., "traffic congestion") is provided to manage expectations.      |
| 3 | **Status Update**   | The "In Transit" status is updated with a yellow warning icon.                                          |
| 4 | **Action Buttons**  | The user can contact the rider or opt-in for SMS updates.                                               |

### State 2: Resolution Options

If the delay is significant, the user is presented with options.

![Resolution Options](generated/edge_case_delayed_delivery_options.png)

**Annotations:**

| # | Element             | Description                                                                                             |
|:-:|:--------------------|:--------------------------------------------------------------------------------------------------------|
| 1 | **Clear Choice**    | The user is given three clear options: wait, cancel for a full refund, or contact support.              |
| 2 | **Timeline**        | A timeline visualizes the original ETA versus the new ETA.                                              |
| 3 | **Apology**         | A message from the rider adds a human touch and shows accountability.                                   |

### State 3: Compensation

To turn a negative experience into a positive one, Okada can proactively offer compensation.

![Compensation](generated/edge_case_delayed_compensation.png)

**Annotations:**

| # | Element             | Description                                                                                             |
|:-:|:--------------------|:--------------------------------------------------------------------------------------------------------|
| 1 | **Apology & Credit**| A green banner communicates the apology and the compensation applied to the user's account.             |
| 2 | **Updated Total**   | The order summary reflects the applied credit, showing the new, lower total.                            |
| 3 | **Positive Framing**| The overall tone is positive and reassuring, turning a potential complaint into a loyalty-building moment. |

## 3. Cancelled Order

Cancellations can be initiated by the customer, the seller, or due to system issues. Each scenario requires a different approach.

### State 1: Cancelled by Customer

This screen confirms a customer-initiated cancellation.

![Cancelled by Customer](generated/edge_case_cancelled_by_customer.png)

**Annotations:**

| # | Element             | Description                                                                                             |
|:-:|:--------------------|:--------------------------------------------------------------------------------------------------------|
| 1 | **Confirmation**    | A red banner confirms the cancellation. The timeline clearly shows "Cancelled by You".                  |
| 2 | **Refund Info**     | Clear information about the refund amount and destination (e.g., MTN Mobile Money) is provided.         |
| 3 | **Reorder Option**  | A "Reorder Items" button makes it easy for the user to place the order again if they wish.              |

### State 2: Cancelled by Seller

This screen informs the user that the seller could not fulfill the order.

![Cancelled by Seller](generated/edge_case_cancelled_by_seller.png)

**Annotations:**

| # | Element                 | Description                                                                                             |
|:-:|:------------------------|:--------------------------------------------------------------------------------------------------------|
| 1 | **Clear Communication**   | The screen clearly states that the seller cancelled the order and provides the reason (e.g., "Items Unavailable"). |
| 2 | **Apology & Alternatives**| An apology from the seller and suggestions for similar stores help to retain the customer.                |
| 3 | **Automatic Refund**    | The user is reassured that a refund is being processed automatically.                                   |

### State 3: No Rider Available

This screen appears when the system cannot find a rider to fulfill the order.

![No Rider Available](generated/edge_case_cancelled_no_rider.png)

**Annotations:**

| # | Element             | Description                                                                                             |
|:-:|:--------------------|:--------------------------------------------------------------------------------------------------------|
| 1 | **System Issue**    | The screen clearly explains the problem: no riders are available in the area.                           |
| 2 | **Actionable Options**| The user can choose to wait and try again later, or cancel immediately for a full refund.                |
| 3 | **Contextual Info** | Providing context, such as peak hours, helps the user make an informed decision.                        |

## 4. Refund Processing

To maintain transparency, a dedicated screen shows the status of the refund.

![Refund Processing](generated/edge_case_refund_processing.png)

**Annotations:**

| # | Element             | Description                                                                                             |
|:-:|:--------------------|:--------------------------------------------------------------------------------------------------------|
| 1 | **Progress Indicator**| A circular progress bar and a timeline visualize the refund process.                                    |
| 2 | **Detailed Info**   | The screen provides all the necessary details: amount, payment method, account number, and expected date. |
| 3 | **Help Section**    | An FAQ section and a contact support button provide additional assistance.                               |

## 5. Conclusion

These edge case mockups complete the design specification for the Order Tracking screen. By addressing these scenarios thoughtfully, Okada can provide a superior customer experience, even when things don't go as planned. This builds trust and sets Okada apart from the competition.

