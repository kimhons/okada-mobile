/**
 * Order Notification Service
 * Handles SMS and email notifications for order status changes
 */

import { getDb } from "./db";
import { orders, users, riders, pushNotificationsLog, notificationPreferences } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Notification types for order events
export type OrderNotificationType = 
  | "order_confirmed"
  | "rider_assigned"
  | "order_in_transit"
  | "order_delivered"
  | "order_cancelled"
  | "quality_verification_required"
  | "quality_approved"
  | "quality_rejected";

// SMS provider interface (to be implemented with actual SMS gateway)
interface SMSMessage {
  to: string;
  message: string;
}

// Email message interface
interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

// Template variables for notifications
interface OrderTemplateVariables {
  orderNumber: string;
  customerName: string;
  riderName?: string;
  deliveryAddress: string;
  total: string;
  estimatedTime?: string;
  trackingLink?: string;
  supportPhone: string;
  supportEmail: string;
}

/**
 * Order Notification Service
 */
export const OrderNotificationService = {
  /**
   * Send notification when order status changes
   */
  async sendOrderStatusNotification(
    orderId: number,
    newStatus: string,
    previousStatus?: string
  ): Promise<{ sms: boolean; email: boolean; push: boolean }> {
    const db = await getDb();
    if (!db) return { sms: false, email: false, push: false };

    try {
      // Get order details with customer info
      const orderResult = await db
        .select({
          order: orders,
          customer: users,
        })
        .from(orders)
        .leftJoin(users, eq(orders.customerId, users.id))
        .where(eq(orders.id, orderId))
        .limit(1);

      if (orderResult.length === 0) {
        console.error(`Order ${orderId} not found`);
        return { sms: false, email: false, push: false };
      }

      const { order, customer } = orderResult[0];

      // Get rider info if assigned
      let riderInfo = null;
      if (order.riderId) {
        const riderResult = await db
          .select()
          .from(riders)
          .where(eq(riders.id, order.riderId))
          .limit(1);
        if (riderResult.length > 0) {
          riderInfo = riderResult[0];
        }
      }

      // Check customer notification preferences
      let preferences = null;
      if (customer?.id) {
        const prefResult = await db
          .select()
          .from(notificationPreferences)
          .where(eq(notificationPreferences.userId, customer.id))
          .limit(1);
        if (prefResult.length > 0) {
          preferences = prefResult[0];
        }
      }

      // Prepare template variables
      const variables: OrderTemplateVariables = {
        orderNumber: order.orderNumber,
        customerName: customer?.name || "Customer",
        riderName: riderInfo?.name,
        deliveryAddress: order.deliveryAddress,
        total: `${(order.total / 100).toLocaleString()} FCFA`,
        estimatedTime: order.estimatedDeliveryTime
          ? new Date(order.estimatedDeliveryTime).toLocaleTimeString()
          : undefined,
        trackingLink: `https://okada.cm/track/${order.orderNumber}`,
        supportPhone: "+237 6XX XXX XXX",
        supportEmail: "support@okada.cm",
      };

      // Determine notification type based on status
      const notificationType = this.getNotificationType(newStatus);
      
      // Get message content
      const { smsMessage, emailSubject, emailBody } = this.getNotificationContent(
        notificationType,
        variables
      );

      let smsResult = false;
      let emailResult = false;
      let pushResult = false;

      // Send SMS if customer has phone and SMS notifications enabled
      if (customer?.phone && (!preferences || preferences.smsNotifications)) {
        smsResult = await this.sendSMS({
          to: customer.phone,
          message: smsMessage,
        });
      }

      // Send email if customer has email and email notifications enabled
      if (customer?.email && (!preferences || preferences.emailNotifications)) {
        emailResult = await this.sendEmail({
          to: customer.email,
          subject: emailSubject,
          body: emailBody,
        });
      }

      // Send push notification if enabled
      if (!preferences || preferences.pushNotifications) {
        pushResult = await this.sendPushNotification(
          customer?.id || 0,
          emailSubject,
          smsMessage
        );
      }

      // Log the notification
      await this.logNotification(orderId, newStatus, {
        sms: smsResult,
        email: emailResult,
        push: pushResult,
      });

      return { sms: smsResult, email: emailResult, push: pushResult };
    } catch (error) {
      console.error("Error sending order notification:", error);
      return { sms: false, email: false, push: false };
    }
  },

  /**
   * Get notification type from order status
   */
  getNotificationType(status: string): OrderNotificationType {
    const statusMap: Record<string, OrderNotificationType> = {
      confirmed: "order_confirmed",
      rider_assigned: "rider_assigned",
      in_transit: "order_in_transit",
      delivered: "order_delivered",
      cancelled: "order_cancelled",
      quality_verification: "quality_verification_required",
    };
    return statusMap[status] || "order_confirmed";
  },

  /**
   * Get notification content based on type
   */
  getNotificationContent(
    type: OrderNotificationType,
    variables: OrderTemplateVariables
  ): { smsMessage: string; emailSubject: string; emailBody: string } {
    const templates: Record<
      OrderNotificationType,
      { sms: string; subject: string; body: string }
    > = {
      order_confirmed: {
        sms: `Okada: Your order ${variables.orderNumber} has been confirmed! Total: ${variables.total}. We're preparing it now.`,
        subject: `Order Confirmed - ${variables.orderNumber}`,
        body: `
          <h2>Order Confirmed!</h2>
          <p>Dear ${variables.customerName},</p>
          <p>Your order <strong>${variables.orderNumber}</strong> has been confirmed and is being prepared.</p>
          <p><strong>Order Total:</strong> ${variables.total}</p>
          <p><strong>Delivery Address:</strong> ${variables.deliveryAddress}</p>
          <p>Track your order: <a href="${variables.trackingLink}">${variables.trackingLink}</a></p>
          <p>Thank you for choosing Okada!</p>
        `,
      },
      rider_assigned: {
        sms: `Okada: ${variables.riderName || "A rider"} has been assigned to your order ${variables.orderNumber}. They'll pick it up soon!`,
        subject: `Rider Assigned - ${variables.orderNumber}`,
        body: `
          <h2>Rider Assigned!</h2>
          <p>Dear ${variables.customerName},</p>
          <p>Great news! <strong>${variables.riderName || "A rider"}</strong> has been assigned to deliver your order <strong>${variables.orderNumber}</strong>.</p>
          <p>They will pick up your order shortly.</p>
          <p>Track your order: <a href="${variables.trackingLink}">${variables.trackingLink}</a></p>
        `,
      },
      order_in_transit: {
        sms: `Okada: Your order ${variables.orderNumber} is on the way! ${variables.riderName || "Your rider"} is heading to you now.`,
        subject: `Order On The Way - ${variables.orderNumber}`,
        body: `
          <h2>Your Order is On The Way!</h2>
          <p>Dear ${variables.customerName},</p>
          <p>Your order <strong>${variables.orderNumber}</strong> is now in transit!</p>
          <p><strong>Rider:</strong> ${variables.riderName || "Your rider"}</p>
          <p><strong>Delivery Address:</strong> ${variables.deliveryAddress}</p>
          ${variables.estimatedTime ? `<p><strong>Estimated Arrival:</strong> ${variables.estimatedTime}</p>` : ""}
          <p>Track your order in real-time: <a href="${variables.trackingLink}">${variables.trackingLink}</a></p>
        `,
      },
      order_delivered: {
        sms: `Okada: Your order ${variables.orderNumber} has been delivered! Thank you for choosing Okada. Rate your experience in the app.`,
        subject: `Order Delivered - ${variables.orderNumber}`,
        body: `
          <h2>Order Delivered!</h2>
          <p>Dear ${variables.customerName},</p>
          <p>Your order <strong>${variables.orderNumber}</strong> has been successfully delivered!</p>
          <p><strong>Total Paid:</strong> ${variables.total}</p>
          <p>We hope you enjoyed your experience. Please take a moment to rate your delivery.</p>
          <p>Thank you for choosing Okada!</p>
          <p>Questions? Contact us at ${variables.supportEmail} or ${variables.supportPhone}</p>
        `,
      },
      order_cancelled: {
        sms: `Okada: Your order ${variables.orderNumber} has been cancelled. If you didn't request this, please contact support.`,
        subject: `Order Cancelled - ${variables.orderNumber}`,
        body: `
          <h2>Order Cancelled</h2>
          <p>Dear ${variables.customerName},</p>
          <p>Your order <strong>${variables.orderNumber}</strong> has been cancelled.</p>
          <p>If you didn't request this cancellation, please contact our support team immediately.</p>
          <p>Email: ${variables.supportEmail}</p>
          <p>Phone: ${variables.supportPhone}</p>
        `,
      },
      quality_verification_required: {
        sms: `Okada: Your order ${variables.orderNumber} is being verified for quality. We'll update you shortly.`,
        subject: `Quality Verification - ${variables.orderNumber}`,
        body: `
          <h2>Quality Verification in Progress</h2>
          <p>Dear ${variables.customerName},</p>
          <p>Your order <strong>${variables.orderNumber}</strong> is currently undergoing quality verification.</p>
          <p>Our team is ensuring everything meets our standards before delivery.</p>
          <p>We'll notify you once verification is complete.</p>
        `,
      },
      quality_approved: {
        sms: `Okada: Quality check passed for order ${variables.orderNumber}! Your order will be delivered soon.`,
        subject: `Quality Approved - ${variables.orderNumber}`,
        body: `
          <h2>Quality Check Passed!</h2>
          <p>Dear ${variables.customerName},</p>
          <p>Great news! Your order <strong>${variables.orderNumber}</strong> has passed our quality verification.</p>
          <p>Your order will be delivered shortly.</p>
        `,
      },
      quality_rejected: {
        sms: `Okada: There's an issue with order ${variables.orderNumber}. Our team will contact you shortly.`,
        subject: `Quality Issue - ${variables.orderNumber}`,
        body: `
          <h2>Quality Issue Detected</h2>
          <p>Dear ${variables.customerName},</p>
          <p>We found an issue during quality verification for order <strong>${variables.orderNumber}</strong>.</p>
          <p>Our team will contact you shortly to resolve this.</p>
          <p>We apologize for any inconvenience.</p>
        `,
      },
    };

    const template = templates[type];
    return {
      smsMessage: template.sms,
      emailSubject: template.subject,
      emailBody: template.body,
    };
  },

/**
 * Send SMS using Africa's Talking gateway
 */
async sendSMS(message: SMSMessage): Promise<boolean> {
  try {
    const { SMSService } = await import("./smsService");
    const result = await SMSService.send(message.to, message.message);
    return result.success;
  } catch (error) {
    console.error("SMS sending failed:", error);
    return false;
  }
},

  /**
   * Send Email (mock implementation - replace with actual email service)
   */
  async sendEmail(message: EmailMessage): Promise<boolean> {
    try {
      // TODO: Integrate with actual email service (e.g., SendGrid, Mailgun)
      console.log(`[Email] Sending to ${message.to}: ${message.subject}`);
      
      // Simulate email sending
      // In production, this would call the email service API
      
      return true;
    } catch (error) {
      console.error("Email sending failed:", error);
      return false;
    }
  },

  /**
   * Send Push Notification
   */
  async sendPushNotification(
    userId: number,
    title: string,
    message: string
  ): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    try {
      // Log the push notification
      await db.insert(pushNotificationsLog).values({
        title,
        message,
        type: "info",
        targetAudience: "specific",
        targetUserIds: userId.toString(),
        sentCount: 1,
        deliveredCount: 0,
        clickedCount: 0,
        status: "sent",
        sentBy: 1, // System user
        sentAt: new Date(),
      });

      // TODO: Integrate with actual push notification service (e.g., Firebase Cloud Messaging)
      console.log(`[Push] Sending to user ${userId}: ${title}`);
      
      return true;
    } catch (error) {
      console.error("Push notification failed:", error);
      return false;
    }
  },

  /**
   * Log notification for audit trail
   */
  async logNotification(
    orderId: number,
    status: string,
    results: { sms: boolean; email: boolean; push: boolean }
  ): Promise<void> {
    console.log(
      `[Notification Log] Order ${orderId} - Status: ${status} - SMS: ${results.sms}, Email: ${results.email}, Push: ${results.push}`
    );
    // Could also log to database for audit purposes
  },

  /**
   * Send notification to rider when assigned to order
   */
  async notifyRiderAssignment(orderId: number, riderId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    try {
      // Get order and rider details
      const orderResult = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      const riderResult = await db
        .select()
        .from(riders)
        .where(eq(riders.id, riderId))
        .limit(1);

      if (orderResult.length === 0 || riderResult.length === 0) {
        return false;
      }

      const order = orderResult[0];
      const rider = riderResult[0];

      // Send SMS to rider
      if (rider.phone) {
        await this.sendSMS({
          to: rider.phone,
          message: `Okada: New delivery assigned! Order ${order.orderNumber}. Pickup: ${order.pickupAddress || "See app"}. Delivery: ${order.deliveryAddress}. Accept in app.`,
        });
      }

      return true;
    } catch (error) {
      console.error("Error notifying rider:", error);
      return false;
    }
  },

  /**
   * Send bulk notification to all riders in a zone
   */
  async notifyRidersInZone(
    zoneId: number,
    title: string,
    message: string
  ): Promise<number> {
    // TODO: Implement zone-based rider notification
    console.log(`[Zone Notification] Zone ${zoneId}: ${title}`);
    return 0;
  },
};

export default OrderNotificationService;
