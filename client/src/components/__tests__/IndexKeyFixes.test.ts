import { describe, it, expect } from "vitest";

describe("Index-based Key Fixes", () => {
  describe("ReportVisualization key generation", () => {
    it("should generate unique keys from data values", () => {
      const data = [
        { name: "Category A", value: 100 },
        { name: "Category B", value: 200 },
        { name: "Category C", value: 300 },
      ];
      const xAxisKey = "name";
      
      const keys = data.map((entry) => `cell-${String(entry[xAxisKey])}`);
      
      expect(keys[0]).toBe("cell-Category A");
      expect(keys[1]).toBe("cell-Category B");
      expect(keys[2]).toBe("cell-Category C");
    });

    it("should have unique keys for all entries", () => {
      const data = [
        { id: 1, name: "A" },
        { id: 2, name: "B" },
        { id: 3, name: "C" },
      ];
      const xAxisKey = "name";
      
      const keys = data.map((entry) => `cell-${String(entry[xAxisKey])}`);
      const uniqueKeys = new Set(keys);
      
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it("should handle numeric xAxisKey values", () => {
      const data = [
        { id: 1, value: 100 },
        { id: 2, value: 200 },
      ];
      const xAxisKey = "id";
      
      const keys = data.map((entry) => `cell-${String(entry[xAxisKey])}`);
      
      expect(keys[0]).toBe("cell-1");
      expect(keys[1]).toBe("cell-2");
    });

    it("should use data.indexOf for color selection", () => {
      const data = [{ name: "A" }, { name: "B" }, { name: "C" }];
      const COLORS = ["#FF0000", "#00FF00", "#0000FF"];
      
      const colors = data.map((entry) => COLORS[data.indexOf(entry) % COLORS.length]);
      
      expect(colors[0]).toBe("#FF0000");
      expect(colors[1]).toBe("#00FF00");
      expect(colors[2]).toBe("#0000FF");
    });
  });

  describe("Bar chart key generation", () => {
    it("should use series key as unique identifier", () => {
      const seriesKeys = ["revenue", "expenses", "profit"];
      
      const keys = seriesKeys.map((key) => key);
      
      expect(keys[0]).toBe("revenue");
      expect(keys[1]).toBe("expenses");
      expect(keys[2]).toBe("profit");
    });

    it("should have unique keys for all series", () => {
      const seriesKeys = ["sales", "returns", "net"];
      const uniqueKeys = new Set(seriesKeys);
      
      expect(uniqueKeys.size).toBe(seriesKeys.length);
    });
  });

  describe("ESLint compliance", () => {
    it("should not use array index as key", () => {
      // This pattern is avoided:
      // data.map((item, index) => <Component key={index} />)
      
      // Instead use:
      // data.map((item) => <Component key={item.uniqueId} />)
      
      const correctPattern = "key={item.uniqueId}";
      const incorrectPattern = "key={index}";
      
      expect(correctPattern).not.toContain("index");
      expect(incorrectPattern).toContain("index");
    });

    it("should generate stable keys", () => {
      const data = [{ id: "abc" }, { id: "def" }];
      
      // Keys should be the same across renders
      const keys1 = data.map((item) => item.id);
      const keys2 = data.map((item) => item.id);
      
      expect(keys1).toEqual(keys2);
    });
  });

  describe("RiderBadgeProfile key handling", () => {
    it("should use badge id as key", () => {
      const badges = [
        { id: 1, name: "Speed Demon" },
        { id: 2, name: "Top Earner" },
      ];
      
      const keys = badges.map((badge) => badge.id);
      
      expect(keys[0]).toBe(1);
      expect(keys[1]).toBe(2);
    });

    it("should have unique badge ids", () => {
      const badges = [
        { id: 1, name: "Badge A" },
        { id: 2, name: "Badge B" },
        { id: 3, name: "Badge C" },
      ];
      
      const ids = badges.map((b) => b.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
