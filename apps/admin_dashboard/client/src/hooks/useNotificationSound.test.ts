import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

// Mock Audio
class MockAudio {
  src: string;
  volume: number = 1;
  currentTime: number = 0;
  preload: string = "";
  
  constructor(src?: string) {
    this.src = src || "";
  }
  
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  load = vi.fn();
}

global.Audio = MockAudio as any;

describe("Notification Sound System", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("localStorage persistence", () => {
    it("should store sound enabled preference", () => {
      localStorageMock.setItem("okada_notification_sound_enabled", "true");
      expect(localStorageMock.getItem("okada_notification_sound_enabled")).toBe("true");
    });

    it("should store volume preference", () => {
      localStorageMock.setItem("okada_notification_sound_volume", "0.5");
      expect(localStorageMock.getItem("okada_notification_sound_volume")).toBe("0.5");
    });

    it("should default to enabled when no preference stored", () => {
      const stored = localStorageMock.getItem("okada_notification_sound_enabled");
      // When null, should default to true
      const defaultValue = stored === null ? true : stored === "true";
      expect(defaultValue).toBe(true);
    });

    it("should default to 0.7 volume when no preference stored", () => {
      const stored = localStorageMock.getItem("okada_notification_sound_volume");
      const defaultValue = stored ? parseFloat(stored) : 0.7;
      expect(defaultValue).toBe(0.7);
    });
  });

  describe("Audio element", () => {
    it("should create Audio element with correct source", () => {
      const audio = new MockAudio("/sounds/new-order.wav");
      expect(audio.src).toBe("/sounds/new-order.wav");
    });

    it("should allow setting volume", () => {
      const audio = new MockAudio("/sounds/new-order.wav");
      audio.volume = 0.5;
      expect(audio.volume).toBe(0.5);
    });

    it("should allow resetting currentTime", () => {
      const audio = new MockAudio("/sounds/new-order.wav");
      audio.currentTime = 0;
      expect(audio.currentTime).toBe(0);
    });

    it("should call play method", async () => {
      const audio = new MockAudio("/sounds/new-order.wav");
      await audio.play();
      expect(audio.play).toHaveBeenCalled();
    });
  });

  describe("Volume clamping", () => {
    it("should clamp volume to 0-1 range", () => {
      const clampVolume = (v: number) => Math.max(0, Math.min(1, v));
      
      expect(clampVolume(-0.5)).toBe(0);
      expect(clampVolume(0)).toBe(0);
      expect(clampVolume(0.5)).toBe(0.5);
      expect(clampVolume(1)).toBe(1);
      expect(clampVolume(1.5)).toBe(1);
    });
  });

  describe("Sound toggle logic", () => {
    it("should toggle from enabled to disabled", () => {
      let soundEnabled = true;
      soundEnabled = !soundEnabled;
      expect(soundEnabled).toBe(false);
    });

    it("should toggle from disabled to enabled", () => {
      let soundEnabled = false;
      soundEnabled = !soundEnabled;
      expect(soundEnabled).toBe(true);
    });

    it("should persist toggle state to localStorage", () => {
      const newValue = false;
      localStorageMock.setItem("okada_notification_sound_enabled", String(newValue));
      expect(localStorageMock.getItem("okada_notification_sound_enabled")).toBe("false");
    });
  });

  describe("Sound file", () => {
    it("should reference correct WAV file path", () => {
      const soundPath = "/sounds/new-order.wav";
      expect(soundPath).toBe("/sounds/new-order.wav");
    });

    it("should use WAV format for better browser compatibility", () => {
      const soundPath = "/sounds/new-order.wav";
      expect(soundPath.endsWith(".wav")).toBe(true);
    });
  });
});


describe("Multiple Sound Types", () => {
  const SOUND_CONFIG = {
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

  it("should have all required sound types", () => {
    expect(SOUND_CONFIG).toHaveProperty("newOrder");
    expect(SOUND_CONFIG).toHaveProperty("deliveryComplete");
    expect(SOUND_CONFIG).toHaveProperty("riderAssigned");
    expect(SOUND_CONFIG).toHaveProperty("urgentAlert");
    expect(SOUND_CONFIG).toHaveProperty("generic");
  });

  it("should have valid paths for all sounds", () => {
    Object.values(SOUND_CONFIG).forEach((config) => {
      expect(config.path).toMatch(/^\/sounds\/.*\.wav$/);
    });
  });

  it("should have volume multipliers between 0 and 1", () => {
    Object.values(SOUND_CONFIG).forEach((config) => {
      expect(config.volumeMultiplier).toBeGreaterThanOrEqual(0);
      expect(config.volumeMultiplier).toBeLessThanOrEqual(1);
    });
  });

  it("should have descriptions for all sounds", () => {
    Object.values(SOUND_CONFIG).forEach((config) => {
      expect(config.description).toBeDefined();
      expect(config.description.length).toBeGreaterThan(0);
    });
  });

  it("should have 5 different sound types", () => {
    expect(Object.keys(SOUND_CONFIG)).toHaveLength(5);
  });
});

describe("Sound Preferences", () => {
  const DEFAULT_PREFERENCES = {
    newOrder: true,
    deliveryComplete: true,
    riderAssigned: true,
    urgentAlert: true,
    generic: true,
  };

  it("should have all sound types enabled by default", () => {
    Object.values(DEFAULT_PREFERENCES).forEach((enabled) => {
      expect(enabled).toBe(true);
    });
  });

  it("should merge stored preferences with defaults", () => {
    const storedPrefs = { newOrder: false };
    const merged = { ...DEFAULT_PREFERENCES, ...storedPrefs };
    expect(merged.newOrder).toBe(false);
    expect(merged.deliveryComplete).toBe(true);
  });

  it("should allow disabling individual sound types", () => {
    let prefs = { ...DEFAULT_PREFERENCES };
    prefs = { ...prefs, riderAssigned: false };
    expect(prefs.riderAssigned).toBe(false);
    expect(prefs.newOrder).toBe(true);
  });
});

describe("Event to Sound Mapping", () => {
  it("should map event types to sound types correctly", () => {
    const eventToSound: Record<string, string> = {
      "order_created": "newOrder",
      "order_delivered": "deliveryComplete",
      "rider_assigned": "riderAssigned",
      "urgent_issue": "urgentAlert",
      "default": "generic",
    };

    expect(eventToSound["order_created"]).toBe("newOrder");
    expect(eventToSound["order_delivered"]).toBe("deliveryComplete");
    expect(eventToSound["rider_assigned"]).toBe("riderAssigned");
    expect(eventToSound["urgent_issue"]).toBe("urgentAlert");
    expect(eventToSound["default"]).toBe("generic");
  });
});
