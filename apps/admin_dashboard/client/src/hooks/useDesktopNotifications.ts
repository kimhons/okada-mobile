import { useCallback, useEffect, useState } from "react";

const DESKTOP_NOTIFICATIONS_KEY = "okada_desktop_notifications_enabled";
const PERMISSION_REQUESTED_KEY = "okada_notification_permission_requested";

export type NotificationPermission = "default" | "granted" | "denied";

interface DesktopNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  onClick?: () => void;
}

interface UseDesktopNotificationsReturn {
  /** Whether desktop notifications are supported by the browser */
  isSupported: boolean;
  /** Current notification permission status */
  permission: NotificationPermission;
  /** Whether user has enabled desktop notifications in app settings */
  isEnabled: boolean;
  /** Toggle desktop notifications on/off */
  toggleEnabled: () => void;
  /** Set enabled state */
  setEnabled: (enabled: boolean) => void;
  /** Request notification permission from browser */
  requestPermission: () => Promise<NotificationPermission>;
  /** Show a desktop notification */
  showNotification: (options: DesktopNotificationOptions) => Notification | null;
  /** Whether permission has been requested before */
  hasRequestedPermission: boolean;
}

export function useDesktopNotifications(): UseDesktopNotificationsReturn {
  const [isSupported] = useState(() => {
    if (typeof window === "undefined") return false;
    return "Notification" in window;
  });

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "default";
    return Notification.permission as NotificationPermission;
  });

  const [isEnabled, setIsEnabledState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(DESKTOP_NOTIFICATIONS_KEY);
    return stored === "true";
  });

  const [hasRequestedPermission, setHasRequestedPermission] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(PERMISSION_REQUESTED_KEY) === "true";
  });

  // Update permission state when it changes externally
  useEffect(() => {
    if (!isSupported) return;

    const checkPermission = () => {
      setPermission(Notification.permission as NotificationPermission);
    };

    // Check permission on visibility change (user might have changed it in browser settings)
    document.addEventListener("visibilitychange", checkPermission);
    return () => document.removeEventListener("visibilitychange", checkPermission);
  }, [isSupported]);

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabledState(enabled);
    localStorage.setItem(DESKTOP_NOTIFICATIONS_KEY, String(enabled));
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabled(!isEnabled);
  }, [isEnabled, setEnabled]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      console.warn("[DesktopNotifications] Notifications not supported");
      return "denied";
    }

    // Mark that we've requested permission
    localStorage.setItem(PERMISSION_REQUESTED_KEY, "true");
    setHasRequestedPermission(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
      
      // Auto-enable if permission granted
      if (result === "granted") {
        setEnabled(true);
      }
      
      return result as NotificationPermission;
    } catch (error) {
      console.error("[DesktopNotifications] Error requesting permission:", error);
      return "denied";
    }
  }, [isSupported, setEnabled]);

  const showNotification = useCallback((options: DesktopNotificationOptions): Notification | null => {
    if (!isSupported || !isEnabled || permission !== "granted") {
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/favicon.ico",
        tag: options.tag,
        requireInteraction: options.requireInteraction,
      });

      if (options.onClick) {
        notification.onclick = () => {
          window.focus();
          options.onClick?.();
          notification.close();
        };
      }

      return notification;
    } catch (error) {
      console.error("[DesktopNotifications] Error showing notification:", error);
      return null;
    }
  }, [isSupported, isEnabled, permission]);

  return {
    isSupported,
    permission,
    isEnabled,
    toggleEnabled,
    setEnabled,
    requestPermission,
    showNotification,
    hasRequestedPermission,
  };
}

export default useDesktopNotifications;
