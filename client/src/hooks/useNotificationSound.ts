import { useCallback, useEffect, useRef, useState } from "react";

const SOUND_ENABLED_KEY = "okada_notification_sound_enabled";
const SOUND_VOLUME_KEY = "okada_notification_sound_volume";

interface UseNotificationSoundReturn {
  /** Whether sound notifications are enabled */
  soundEnabled: boolean;
  /** Toggle sound on/off */
  toggleSound: () => void;
  /** Set sound enabled state */
  setSoundEnabled: (enabled: boolean) => void;
  /** Current volume (0-1) */
  volume: number;
  /** Set volume (0-1) */
  setVolume: (volume: number) => void;
  /** Play the new order notification sound */
  playNewOrderSound: () => void;
  /** Play a generic notification sound */
  playNotificationSound: () => void;
  /** Whether audio is available in the browser */
  audioAvailable: boolean;
}

export function useNotificationSound(): UseNotificationSoundReturn {
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(SOUND_ENABLED_KEY);
    return stored === null ? true : stored === "true";
  });

  const [volume, setVolumeState] = useState<number>(() => {
    if (typeof window === "undefined") return 0.7;
    const stored = localStorage.getItem(SOUND_VOLUME_KEY);
    return stored ? parseFloat(stored) : 0.7;
  });

  const [audioAvailable, setAudioAvailable] = useState(true);
  
  // Audio element refs
  const newOrderAudioRef = useRef<HTMLAudioElement | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    try {
      // New order sound - the chime we generated
      newOrderAudioRef.current = new Audio("/sounds/new-order.wav");
      newOrderAudioRef.current.preload = "auto";
      newOrderAudioRef.current.volume = volume;

      // Generic notification sound - use the same for now
      notificationAudioRef.current = new Audio("/sounds/new-order.wav");
      notificationAudioRef.current.preload = "auto";
      notificationAudioRef.current.volume = volume * 0.7; // Slightly quieter

      setAudioAvailable(true);
    } catch (error) {
      console.warn("[NotificationSound] Audio not available:", error);
      setAudioAvailable(false);
    }

    return () => {
      newOrderAudioRef.current = null;
      notificationAudioRef.current = null;
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (newOrderAudioRef.current) {
      newOrderAudioRef.current.volume = volume;
    }
    if (notificationAudioRef.current) {
      notificationAudioRef.current.volume = volume * 0.7;
    }
  }, [volume]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(!soundEnabled);
  }, [soundEnabled, setSoundEnabled]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    localStorage.setItem(SOUND_VOLUME_KEY, String(clampedVolume));
  }, []);

  const playNewOrderSound = useCallback(() => {
    if (!soundEnabled || !audioAvailable) return;

    try {
      if (newOrderAudioRef.current) {
        // Reset to start if already playing
        newOrderAudioRef.current.currentTime = 0;
        newOrderAudioRef.current.play().catch((error) => {
          // Browser may block autoplay until user interaction
          console.warn("[NotificationSound] Could not play sound:", error.message);
        });
      }
    } catch (error) {
      console.warn("[NotificationSound] Error playing new order sound:", error);
    }
  }, [soundEnabled, audioAvailable]);

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled || !audioAvailable) return;

    try {
      if (notificationAudioRef.current) {
        notificationAudioRef.current.currentTime = 0;
        notificationAudioRef.current.play().catch((error) => {
          console.warn("[NotificationSound] Could not play sound:", error.message);
        });
      }
    } catch (error) {
      console.warn("[NotificationSound] Error playing notification sound:", error);
    }
  }, [soundEnabled, audioAvailable]);

  return {
    soundEnabled,
    toggleSound,
    setSoundEnabled,
    volume,
    setVolume,
    playNewOrderSound,
    playNotificationSound,
    audioAvailable,
  };
}

export default useNotificationSound;
