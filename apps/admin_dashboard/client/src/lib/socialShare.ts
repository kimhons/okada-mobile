import { APP_TITLE } from "@/const";

export interface ShareData {
  badgeName: string;
  badgeTier: string;
  riderName: string;
  url?: string;
  imageUrl?: string;
}

/**
 * Generate share text for social media
 */
export function generateShareText(data: ShareData): string {
  const { badgeName, badgeTier, riderName } = data;
  return `🎉 ${riderName} just earned the ${badgeTier.toUpperCase()} "${badgeName}" badge on ${APP_TITLE}! Keep up the amazing work! 🏆`;
}

/**
 * Share on Facebook
 */
export function shareOnFacebook(data: ShareData) {
  const url = data.url || window.location.href;
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(shareUrl, "_blank", "width=600,height=400");
}

/**
 * Share on Twitter/X
 */
export function shareOnTwitter(data: ShareData) {
  const text = generateShareText(data);
  const url = data.url || window.location.href;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(shareUrl, "_blank", "width=600,height=400");
}

/**
 * Share on LinkedIn
 */
export function shareOnLinkedIn(data: ShareData) {
  const url = data.url || window.location.href;
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(shareUrl, "_blank", "width=600,height=400");
}

/**
 * Share on WhatsApp
 */
export function shareOnWhatsApp(data: ShareData) {
  const text = generateShareText(data);
  const url = data.url || window.location.href;
  const message = `${text}\n${url}`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(shareUrl, "_blank");
}

/**
 * Copy share link to clipboard
 */
export async function copyShareLink(data: ShareData): Promise<boolean> {
  const text = generateShareText(data);
  const url = data.url || window.location.href;
  const shareText = `${text}\n${url}`;

  try {
    await navigator.clipboard.writeText(shareText);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Use Web Share API if available (mobile)
 */
export async function nativeShare(data: ShareData): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  const text = generateShareText(data);
  const url = data.url || window.location.href;

  try {
    await navigator.share({
      title: `${data.badgeName} Badge Earned!`,
      text: text,
      url: url,
    });
    return true;
  } catch (error) {
    // User cancelled or error occurred
    console.error("Native share failed:", error);
    return false;
  }
}

/**
 * Check if Web Share API is available
 */
export function isNativeShareAvailable(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}
