import { notifyOwner } from "./_core/notification";
import * as db from "./db";

// Notification types
export type NotificationType = 
  | "verification_approved"
  | "verification_rejected"
  | "verification_pending"
  | "loyalty_points_earned"
  | "loyalty_tier_upgrade"
  | "loyalty_reward_available"
  | "order_status"
  | "payment_received"
  | "payout_processed";

interface NotificationOptions {
  userId?: number;
  riderId?: number;
  email?: string;
  phone?: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, any>;
}

// Email templates for different notification types
const emailTemplates: Record<NotificationType, (data: any) => { subject: string; body: string }> = {
  verification_approved: (data) => ({
    subject: "Your Account Has Been Verified! ✅",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Congratulations! 🎉</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Dear ${data.name || "User"},</p>
          <p style="font-size: 16px; color: #374151;">
            Great news! Your ${data.verificationType || "account"} verification has been approved.
            You now have full access to all platform features.
          </p>
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #065f46; font-weight: bold;">What's Next?</p>
            <ul style="color: #065f46; margin: 10px 0;">
              <li>Start accepting orders</li>
              <li>Complete your profile</li>
              <li>Explore available deliveries</li>
            </ul>
          </div>
          <p style="font-size: 14px; color: #6b7280;">
            Thank you for being part of Okada!
          </p>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} Okada Delivery. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),
  
  verification_rejected: (data) => ({
    subject: "Verification Update Required",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Action Required</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Dear ${data.name || "User"},</p>
          <p style="font-size: 16px; color: #374151;">
            Unfortunately, your ${data.verificationType || "account"} verification could not be approved at this time.
          </p>
          ${data.reason ? `
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">Reason:</p>
            <p style="color: #92400e; margin: 10px 0 0 0;">${data.reason}</p>
          </div>
          ` : ''}
          <p style="font-size: 16px; color: #374151;">
            Please review the requirements and resubmit your documents.
          </p>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} Okada Delivery. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),
  
  verification_pending: (data) => ({
    subject: "Verification Submitted - Under Review",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Verification In Progress</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Dear ${data.name || "User"},</p>
          <p style="font-size: 16px; color: #374151;">
            Thank you for submitting your verification documents. Our team is reviewing your application.
          </p>
          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;">
              <strong>Expected Review Time:</strong> 24-48 hours
            </p>
          </div>
          <p style="font-size: 14px; color: #6b7280;">
            We'll notify you as soon as the review is complete.
          </p>
        </div>
      </div>
    `,
  }),
  
  loyalty_points_earned: (data) => ({
    subject: `You Earned ${data.points} Loyalty Points! 🌟`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">+${data.points} Points! 🎯</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Dear ${data.name || "User"},</p>
          <p style="font-size: 16px; color: #374151;">
            Congratulations! You've earned <strong>${data.points} loyalty points</strong> from your recent activity.
          </p>
          <div style="background: #f5f3ff; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Your Total Points</p>
            <p style="margin: 10px 0 0 0; color: #7c3aed; font-size: 36px; font-weight: bold;">${data.totalPoints}</p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Current Tier: ${data.tier || "Bronze"}</p>
          </div>
        </div>
      </div>
    `,
  }),
  
  loyalty_tier_upgrade: (data) => ({
    subject: `🎉 You've Been Upgraded to ${data.newTier}!`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Tier Upgrade! 🏆</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Dear ${data.name || "User"},</p>
          <p style="font-size: 16px; color: #374151;">
            Amazing news! You've been upgraded from <strong>${data.previousTier}</strong> to <strong>${data.newTier}</strong>!
          </p>
          <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">Your New Benefits:</p>
            <ul style="color: #92400e; margin: 10px 0;">
              ${(data.benefits || ["Exclusive discounts", "Priority support", "Special offers"]).map((b: string) => `<li>${b}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>
    `,
  }),
  
  loyalty_reward_available: (data) => ({
    subject: "Your Reward is Ready to Claim! 🎁",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Reward Available! 🎁</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Dear ${data.name || "User"},</p>
          <p style="font-size: 16px; color: #374151;">
            You have a reward waiting for you: <strong>${data.rewardName}</strong>
          </p>
          <div style="background: #fdf2f8; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #be185d; font-size: 24px; font-weight: bold;">${data.rewardValue}</p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Expires: ${data.expiryDate || "No expiry"}</p>
          </div>
          <p style="text-align: center;">
            <a href="${data.claimUrl || '#'}" style="display: inline-block; background: #db2777; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Claim Now
            </a>
          </p>
        </div>
      </div>
    `,
  }),
  
  order_status: (data) => ({
    subject: `Order #${data.orderNumber} - ${data.status}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Update</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">
            Your order <strong>#${data.orderNumber}</strong> status has been updated to: <strong>${data.status}</strong>
          </p>
          ${data.estimatedDelivery ? `
          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;">
              <strong>Estimated Delivery:</strong> ${data.estimatedDelivery}
            </p>
          </div>
          ` : ''}
        </div>
      </div>
    `,
  }),
  
  payment_received: (data) => ({
    subject: `Payment Received - ${data.amount} FCFA`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Payment Confirmed ✓</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">
            We've received your payment of <strong>${data.amount} FCFA</strong>.
          </p>
          <div style="background: #ecfdf5; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #065f46;"><strong>Transaction ID:</strong> ${data.transactionId}</p>
            <p style="margin: 0; color: #065f46;"><strong>Payment Method:</strong> ${data.paymentMethod}</p>
          </div>
        </div>
      </div>
    `,
  }),
  
  payout_processed: (data) => ({
    subject: `Payout Processed - ${data.amount} FCFA`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Payout Sent! 💰</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Dear ${data.name || "Rider"},</p>
          <p style="font-size: 16px; color: #374151;">
            Your payout of <strong>${data.amount} FCFA</strong> has been processed and sent to your account.
          </p>
          <div style="background: #ecfdf5; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #065f46;"><strong>Reference:</strong> ${data.reference}</p>
            <p style="margin: 0; color: #065f46;"><strong>Account:</strong> ${data.accountNumber}</p>
          </div>
        </div>
      </div>
    `,
  }),
};

// SMS templates (shorter versions)
const smsTemplates: Record<NotificationType, (data: any) => string> = {
  verification_approved: (data) => 
    `Okada: Your ${data.verificationType || "account"} verification is approved! You can now start accepting orders.`,
  verification_rejected: (data) => 
    `Okada: Your verification needs attention. ${data.reason ? `Reason: ${data.reason}` : "Please check your email for details."}`,
  verification_pending: () => 
    `Okada: Your verification documents are under review. We'll notify you within 24-48 hours.`,
  loyalty_points_earned: (data) => 
    `Okada: You earned ${data.points} points! Total: ${data.totalPoints} points. Keep it up! 🌟`,
  loyalty_tier_upgrade: (data) => 
    `Okada: Congratulations! You've been upgraded to ${data.newTier}! Enjoy your new benefits. 🏆`,
  loyalty_reward_available: (data) => 
    `Okada: Your reward "${data.rewardName}" is ready to claim! Value: ${data.rewardValue}. 🎁`,
  order_status: (data) => 
    `Okada: Order #${data.orderNumber} is now ${data.status}.${data.estimatedDelivery ? ` ETA: ${data.estimatedDelivery}` : ""}`,
  payment_received: (data) => 
    `Okada: Payment of ${data.amount} FCFA received. Transaction: ${data.transactionId}`,
  payout_processed: (data) => 
    `Okada: Payout of ${data.amount} FCFA sent to your account. Ref: ${data.reference}`,
};

/**
 * Send notification to a user via email and/or SMS
 */
export async function sendUserNotification(options: NotificationOptions): Promise<boolean> {
  const { userId, riderId, email, phone, title, message, type, metadata = {} } = options;
  
  try {
    // Store notification in database
    if (userId) {
      await db.createNotification({
        userId,
        title,
        message,
        type: "system",
        isRead: false,
      });
    }

    // Get email template
    const emailTemplate = emailTemplates[type];
    if (emailTemplate && email) {
      const { subject, body } = emailTemplate({ ...metadata, name: metadata.name });
      
      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      // For now, log the email
      console.log(`[Notification] Email to ${email}:`, { subject, bodyLength: body.length });
      
      // Notify owner about the notification being sent (for admin visibility)
      await notifyOwner({
        title: `Notification Sent: ${type}`,
        content: `Email sent to ${email}\nSubject: ${subject}\nUser ID: ${userId || riderId || "N/A"}`,
      });
    }

    // Get SMS template
    const smsTemplate = smsTemplates[type];
    if (smsTemplate && phone) {
      const smsMessage = smsTemplate(metadata);
      
      // In production, integrate with SMS service (Twilio, Africa's Talking, etc.)
      // For now, log the SMS
      console.log(`[Notification] SMS to ${phone}:`, smsMessage);
    }

    return true;
  } catch (error) {
    console.error("[Notification] Error sending notification:", error);
    return false;
  }
}

/**
 * Send verification status notification
 */
export async function sendVerificationNotification(
  userId: number,
  status: "approved" | "rejected" | "pending",
  options: {
    email?: string;
    phone?: string;
    name?: string;
    verificationType?: string;
    reason?: string;
  }
): Promise<boolean> {
  const typeMap = {
    approved: "verification_approved" as NotificationType,
    rejected: "verification_rejected" as NotificationType,
    pending: "verification_pending" as NotificationType,
  };

  const titleMap = {
    approved: "Verification Approved",
    rejected: "Verification Update Required",
    pending: "Verification Under Review",
  };

  const messageMap = {
    approved: `Your ${options.verificationType || "account"} verification has been approved. You now have full access to the platform.`,
    rejected: `Your verification requires attention. ${options.reason || "Please check your email for details."}`,
    pending: "Your verification documents are being reviewed. We'll notify you within 24-48 hours.",
  };

  return sendUserNotification({
    userId,
    email: options.email,
    phone: options.phone,
    title: titleMap[status],
    message: messageMap[status],
    type: typeMap[status],
    metadata: {
      name: options.name,
      verificationType: options.verificationType,
      reason: options.reason,
    },
  });
}

/**
 * Send loyalty program notification
 */
export async function sendLoyaltyNotification(
  userId: number,
  notificationType: "points_earned" | "tier_upgrade" | "reward_available",
  options: {
    email?: string;
    phone?: string;
    name?: string;
    points?: number;
    totalPoints?: number;
    tier?: string;
    previousTier?: string;
    newTier?: string;
    benefits?: string[];
    rewardName?: string;
    rewardValue?: string;
    expiryDate?: string;
    claimUrl?: string;
  }
): Promise<boolean> {
  const typeMap = {
    points_earned: "loyalty_points_earned" as NotificationType,
    tier_upgrade: "loyalty_tier_upgrade" as NotificationType,
    reward_available: "loyalty_reward_available" as NotificationType,
  };

  const titleMap = {
    points_earned: `You Earned ${options.points} Points!`,
    tier_upgrade: `Upgraded to ${options.newTier}!`,
    reward_available: "Reward Available!",
  };

  const messageMap = {
    points_earned: `Congratulations! You've earned ${options.points} loyalty points. Total: ${options.totalPoints} points.`,
    tier_upgrade: `You've been upgraded from ${options.previousTier} to ${options.newTier}!`,
    reward_available: `Your reward "${options.rewardName}" worth ${options.rewardValue} is ready to claim!`,
  };

  return sendUserNotification({
    userId,
    email: options.email,
    phone: options.phone,
    title: titleMap[notificationType],
    message: messageMap[notificationType],
    type: typeMap[notificationType],
    metadata: options,
  });
}

/**
 * Send order status notification
 */
export async function sendOrderNotification(
  userId: number,
  options: {
    email?: string;
    phone?: string;
    orderNumber: string;
    status: string;
    estimatedDelivery?: string;
  }
): Promise<boolean> {
  return sendUserNotification({
    userId,
    email: options.email,
    phone: options.phone,
    title: `Order #${options.orderNumber} - ${options.status}`,
    message: `Your order status has been updated to: ${options.status}`,
    type: "order_status",
    metadata: options,
  });
}

/**
 * Send payout notification to rider
 */
export async function sendPayoutNotification(
  riderId: number,
  options: {
    email?: string;
    phone?: string;
    name?: string;
    amount: number;
    reference: string;
    accountNumber?: string;
  }
): Promise<boolean> {
  return sendUserNotification({
    riderId,
    email: options.email,
    phone: options.phone,
    title: `Payout Processed - ${options.amount} FCFA`,
    message: `Your payout of ${options.amount} FCFA has been sent to your account.`,
    type: "payout_processed",
    metadata: options,
  });
}
