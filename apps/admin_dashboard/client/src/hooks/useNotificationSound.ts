import { useCallback, useEffect, useRef, useState } from "react";

const SOUND_ENABLED_KEY = "okada_notification_sound_enabled";
const SOUND_VOLUME_KEY = "okada_notification_sound_volume";
const SOUND_PREFERENCE_KEY = "okada_notification_sound_preferences";

/**
 * Available notification sound types
 */
export type NotificationSoundType = 
  | "newOrder"
  | "deliveryComplete"
  | "riderAssigned"
  | "urgentAlert"
  | "generic";

/**
 * Sound configuration for each notification type
 */
interface SoundConfig {
  path: string;
  volumeMultiplier: number;
  description: string;
}

const SOUND_CONFIG: Record<NotificationSoundType, SoundConfig> = {
  newOrder: {
    path: "/sounds/new-order.wav",
    volumeMultiplier: 1.0,
    description: "New order received",
  },
  deliveryComplete: {
    path: "/sounds/delivery-complete.wav",
    volumeMultiplier: 0.9,
    description: "Delivery completed successfully",
  },
  riderAssigned: {
    path: "/sounds/rider-assigned.wav",
    volumeMultiplier: 0.8,
    description: "Rider assigned to order",
  },
  urgentAlert: {
    path: "/sounds/urgent-alert.wav",
    volumeMultiplier: 1.0,
    description: "Urgent attention required",
  },
  generic: {
    path: "/sounds/new-order.wav",
    volumeMultiplier: 0.7,
    description: "General notification",
  },
};

interface SoundPreferences {
  newOrder: boolean;
  deliveryComplete: boolean;
  riderAssigned: boolean;
  urgentAlert: boolean;
  generic: boolean;
}

const DEFAULT_PREFERENCES: SoundPreferences = {
  newOrder: true,
  deliveryComplete: true,
  riderAssigned: true,
  urgentAlert: true,
  generic: true,
};

interface UseNotificationSoundReturn {
  /** Whether sound notifications are enabled globally */
  soundEnabled: boolean;
  /** Toggle sound on/off */
  toggleSound: () => void;
  /** Set sound enabled state */
  setSoundEnabled: (enabled: boolean) => void;
  /** Current volume (0-1) */
  volume: number;
  /** Set volume (0-1) */
  setVolume: (volume: number) => void;
  /** Play a specific notification sound by type */
  playSound: (type: NotificationSoundType) => void;
  /** Play the new order notification sound (legacy) */
  playNewOrderSound: () => void;
  /** Play a generic notification sound (legacy) */
  playNotificationSound: () => void;
  /** Play delivery complete sound */
  playDeliveryCompleteSound: () => void;
  /** Play rider assigned sound */
  playRiderAssignedSound: () => void;
  /** Play urgent alert sound */
  playUrgentAlertSound: () => void;
  /** Whether audio is available in the browser */
  audioAvailable: boolean;
  /** Per-sound-type preferences */
  soundPreferences: SoundPreferences;
  /** Update preference for a specific sound type */
  setSoundPreference: (type: NotificationSoundType, enabled: boolean) => void;
  /** Get available sound types */
  getSoundTypes: () => { type: NotificationSoundType; description: string }[];
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

  const [soundPreferences, setSoundPreferences] = useState<SoundPreferences>(() => {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES;
    const stored = localStorage.getItem(SOUND_PREFERENCE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_PREFERENCES;
      }
    }
    return DEFAULT_PREFERENCES;
  });

  const [audioAvailable, setAudioAvailable] = useState(true);
  
  // Audio element refs for each sound type
  const audioRefs = useRef<Record<NotificationSoundType, HTMLAudioElement | null>>({
    newOrder: null,
    deliveryComplete: null,
    riderAssigned: null,
    urgentAlert: null,
    generic: null,
  });

  // Initialize audio elements
  useEffect(() => {
    try {
      Object.entries(SOUND_CONFIG).forEach(([type, config]) => {
        const audio = new Audio(config.path);
        audio.preload = "auto";
        audio.volume = volume * config.volumeMultiplier;
        audioRefs.current[type as NotificationSoundType] = audio;
      });
      setAudioAvailable(true);
    } catch (error) {
      console.warn("[NotificationSound] Audio not available:", error);
      setAudioAvailable(false);
    }

    return () => {
      Object.keys(audioRefs.current).forEach((type) => {
        audioRefs.current[type as NotificationSoundType] = null;
      });
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    Object.entries(SOUND_CONFIG).forEach(([type, config]) => {
      const audio = audioRefs.current[type as NotificationSoundType];
      if (audio) {
        audio.volume = volume * config.volumeMultiplier;
      }
    });
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

  const setSoundPreference = useCallback((type: NotificationSoundType, enabled: boolean) => {
    setSoundPreferences((prev) => {
      const updated = { ...prev, [type]: enabled };
      localStorage.setItem(SOUND_PREFERENCE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const playSound = useCallback((type: NotificationSoundType) => {
    if (!soundEnabled || !audioAvailable) return;
    if (!soundPreferences[type]) return;

    try {
      const audio = audioRefs.current[type];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch((error) => {
          console.warn(`[NotificationSound] Could not play ${type} sound:`, error.message);
        });
      }
    } catch (error) {
      console.warn(`[NotificationSound] Error playing ${type} sound:`, error);
    }
  }, [soundEnabled, audioAvailable, soundPreferences]);

  const playNewOrderSound = useCallback(() => {
    playSound("newOrder");
  }, [playSound]);

  const playNotificationSound = useCallback(() => {
    playSound("generic");
  }, [playSound]);

  const playDeliveryCompleteSound = useCallback(() => {
    playSound("deliveryComplete");
  }, [playSound]);

  const playRiderAssignedSound = useCallback(() => {
    playSound("riderAssigned");
  }, [playSound]);

  const playUrgentAlertSound = useCallback(() => {
    playSound("urgentAlert");
  }, [playSound]);

  const getSoundTypes = useCallback(() => {
    return Object.entries(SOUND_CONFIG).map(([type, config]) => ({
      type: type as NotificationSoundType,
      description: config.description,
    }));
  }, []);

  return {
    soundEnabled,
    toggleSound,
    setSoundEnabled,
    volume,
    setVolume,
    playSound,
    playNewOrderSound,
    playNotificationSound,
    playDeliveryCompleteSound,
    playRiderAssignedSound,
    playUrgentAlertSound,
    audioAvailable,
    soundPreferences,
    setSoundPreference,
    getSoundTypes,
  };
}

export default useNotificationSound;
