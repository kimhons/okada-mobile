/**
 * Haptic Feedback Utility
 * 
 * Provides tactile feedback for mobile interactions using the Vibration API.
 * Gracefully degrades on devices that don't support vibration.
 */

export type HapticPattern = "light" | "medium" | "heavy" | "success" | "error" | "warning";

// Vibration patterns in milliseconds
const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  error: [20, 100, 20, 100, 20],
  warning: [15, 50, 15],
};

// Check if vibration API is supported
const isVibrationSupported = (): boolean => {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
};

// User preference for haptic feedback (stored in localStorage)
const HAPTIC_PREFERENCE_KEY = "haptic-feedback-enabled";

/**
 * Check if haptic feedback is enabled by user preference
 */
export const isHapticEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  
  const preference = localStorage.getItem(HAPTIC_PREFERENCE_KEY);
  // Default to enabled if no preference is set
  return preference === null || preference === "true";
};

/**
 * Set user preference for haptic feedback
 */
export const setHapticEnabled = (enabled: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(HAPTIC_PREFERENCE_KEY, enabled.toString());
};

/**
 * Trigger haptic feedback with the specified pattern
 * 
 * @param pattern - The haptic pattern to play
 * @returns true if vibration was triggered, false otherwise
 */
export const haptic = (pattern: HapticPattern): boolean => {
  // Check if vibration is supported and enabled
  if (!isVibrationSupported() || !isHapticEnabled()) {
    return false;
  }

  try {
    const vibrationPattern = PATTERNS[pattern];
    navigator.vibrate(vibrationPattern);
    return true;
  } catch (error) {
    console.warn("[Haptic] Failed to trigger vibration:", error);
    return false;
  }
};

/**
 * Stop any ongoing vibration
 */
export const stopHaptic = (): void => {
  if (isVibrationSupported()) {
    try {
      navigator.vibrate(0);
    } catch (error) {
      console.warn("[Haptic] Failed to stop vibration:", error);
    }
  }
};

/**
 * Haptic feedback for common UI interactions
 */
export const hapticFeedback = {
  /**
   * Light tap feedback for button presses
   */
  tap: () => haptic("light"),

  /**
   * Medium feedback for selections and toggles
   */
  select: () => haptic("medium"),

  /**
   * Heavy feedback for important actions
   */
  impact: () => haptic("heavy"),

  /**
   * Success feedback for completed actions
   */
  success: () => haptic("success"),

  /**
   * Error feedback for failed actions
   */
  error: () => haptic("error"),

  /**
   * Warning feedback for caution messages
   */
  warning: () => haptic("warning"),

  /**
   * Feedback for swipe gestures
   */
  swipe: () => haptic("medium"),

  /**
   * Feedback for pull-to-refresh
   */
  refresh: () => haptic("light"),

  /**
   * Feedback for delete actions
   */
  delete: () => haptic("heavy"),
};

export default hapticFeedback;
