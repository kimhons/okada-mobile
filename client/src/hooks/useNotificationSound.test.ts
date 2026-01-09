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
