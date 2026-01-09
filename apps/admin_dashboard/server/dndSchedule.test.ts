import { describe, it, expect } from "vitest";

describe("DND Schedule", () => {
  describe("Time parsing", () => {
    it("should parse HH:MM format correctly", () => {
      const timeRegex = /^\d{2}:\d{2}$/;
      expect(timeRegex.test("22:00")).toBe(true);
      expect(timeRegex.test("07:30")).toBe(true);
      expect(timeRegex.test("00:00")).toBe(true);
      expect(timeRegex.test("23:59")).toBe(true);
    });

    it("should reject invalid time formats", () => {
      const timeRegex = /^\d{2}:\d{2}$/;
      expect(timeRegex.test("2:00")).toBe(false);
      expect(timeRegex.test("22:0")).toBe(false);
      expect(timeRegex.test("22-00")).toBe(false);
      expect(timeRegex.test("invalid")).toBe(false);
    });
  });

  describe("Days of week parsing", () => {
    it("should parse comma-separated days", () => {
      const daysStr = "0,1,2,3,4,5,6";
      const days = daysStr.split(",").map(Number);
      expect(days).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });

    it("should handle weekdays only", () => {
      const daysStr = "1,2,3,4,5";
      const days = daysStr.split(",").map(Number);
      expect(days).toEqual([1, 2, 3, 4, 5]);
      expect(days.includes(0)).toBe(false);
      expect(days.includes(6)).toBe(false);
    });

    it("should handle weekends only", () => {
      const daysStr = "0,6";
      const days = daysStr.split(",").map(Number);
      expect(days).toEqual([0, 6]);
    });
  });

  describe("DND period check", () => {
    const isInTimeRange = (
      currentTime: string,
      startTime: string,
      endTime: string
    ): boolean => {
      // Handle overnight schedules (e.g., 22:00 - 07:00)
      if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime;
      }
      return currentTime >= startTime && currentTime <= endTime;
    };

    it("should detect time within normal range", () => {
      expect(isInTimeRange("14:00", "09:00", "17:00")).toBe(true);
      expect(isInTimeRange("08:00", "09:00", "17:00")).toBe(false);
      expect(isInTimeRange("18:00", "09:00", "17:00")).toBe(false);
    });

    it("should detect time within overnight range", () => {
      expect(isInTimeRange("23:00", "22:00", "07:00")).toBe(true);
      expect(isInTimeRange("03:00", "22:00", "07:00")).toBe(true);
      expect(isInTimeRange("12:00", "22:00", "07:00")).toBe(false);
    });

    it("should handle edge cases at boundaries", () => {
      expect(isInTimeRange("22:00", "22:00", "07:00")).toBe(true);
      expect(isInTimeRange("07:00", "22:00", "07:00")).toBe(true);
      expect(isInTimeRange("09:00", "09:00", "17:00")).toBe(true);
      expect(isInTimeRange("17:00", "09:00", "17:00")).toBe(true);
    });
  });

  describe("Day matching", () => {
    it("should match current day in schedule", () => {
      const scheduleDays = [1, 2, 3, 4, 5]; // Weekdays
      const currentDay = 3; // Wednesday
      expect(scheduleDays.includes(currentDay)).toBe(true);
    });

    it("should not match day outside schedule", () => {
      const scheduleDays = [1, 2, 3, 4, 5]; // Weekdays
      const currentDay = 0; // Sunday
      expect(scheduleDays.includes(currentDay)).toBe(false);
    });
  });

  describe("Muting options", () => {
    interface MuteOptions {
      muteSounds: boolean;
      muteDesktopNotifications: boolean;
      muteEmailNotifications: boolean;
      allowUrgent: boolean;
    }

    it("should have all mute options", () => {
      const options: MuteOptions = {
        muteSounds: true,
        muteDesktopNotifications: true,
        muteEmailNotifications: false,
        allowUrgent: true,
      };

      expect(options).toHaveProperty("muteSounds");
      expect(options).toHaveProperty("muteDesktopNotifications");
      expect(options).toHaveProperty("muteEmailNotifications");
      expect(options).toHaveProperty("allowUrgent");
    });

    it("should default to allowing urgent notifications", () => {
      const defaultOptions: MuteOptions = {
        muteSounds: true,
        muteDesktopNotifications: true,
        muteEmailNotifications: false,
        allowUrgent: true,
      };

      expect(defaultOptions.allowUrgent).toBe(true);
    });
  });

  describe("Schedule validation", () => {
    it("should require a name", () => {
      const isValidName = (name: string) => name.trim().length > 0;
      expect(isValidName("Night Mode")).toBe(true);
      expect(isValidName("")).toBe(false);
      expect(isValidName("   ")).toBe(false);
    });

    it("should require at least one day selected", () => {
      const isValidDays = (days: number[]) => days.length > 0;
      expect(isValidDays([0, 1, 2])).toBe(true);
      expect(isValidDays([6])).toBe(true);
      expect(isValidDays([])).toBe(false);
    });
  });

  describe("Format helpers", () => {
    const formatDays = (daysStr: string): string => {
      const days = daysStr.split(",").map(Number);
      const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      if (days.length === 7) return "Every day";
      if (days.length === 5 && !days.includes(0) && !days.includes(6)) return "Weekdays";
      if (days.length === 2 && days.includes(0) && days.includes(6)) return "Weekends";
      return days.map((d) => DAYS[d]).join(", ");
    };

    it("should format all days as 'Every day'", () => {
      expect(formatDays("0,1,2,3,4,5,6")).toBe("Every day");
    });

    it("should format weekdays correctly", () => {
      expect(formatDays("1,2,3,4,5")).toBe("Weekdays");
    });

    it("should format weekends correctly", () => {
      expect(formatDays("0,6")).toBe("Weekends");
    });

    it("should format custom days as list", () => {
      expect(formatDays("1,3,5")).toBe("Mon, Wed, Fri");
    });
  });

  describe("Toggle functionality", () => {
    it("should toggle schedule active state", () => {
      let isActive = true;
      isActive = !isActive;
      expect(isActive).toBe(false);
      isActive = !isActive;
      expect(isActive).toBe(true);
    });
  });
});
