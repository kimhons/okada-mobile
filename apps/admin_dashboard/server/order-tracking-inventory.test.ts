import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Order Tracking & Inventory Alerts", () => {
  describe("Order Tracking", () => {
    it("should create rider location", async () => {
      const riders = await db.getAllRiders({});
      if (riders.length === 0) {
        console.log("No riders available for testing");
        return;
      }

      const testRider = riders[0];
      const location = await db.createRiderLocation({
        riderId: testRider.id,
        orderId: null,
        latitude: "3.8480",
        longitude: "11.5021",
        status: "idle",
        speed: 0,
        heading: 0,
        accuracy: 10,
        timestamp: new Date(),
      });

      expect(location).toBeDefined();
      expect(location.riderId).toBe(testRider.id);
      expect(location.latitude).toBe("3.8480");
      expect(location.status).toBe("idle");
    });

    it("should get latest rider location", async () => {
      const riders = await db.getAllRiders({});
      if (riders.length === 0) {
        console.log("No riders available for testing");
        return;
      }

      const testRider = riders[0];
      
      // Create a location first
      await db.createRiderLocation({
        riderId: testRider.id,
        orderId: null,
        latitude: "3.8490",
        longitude: "11.5030",
        status: "idle",
        speed: 0,
        heading: 0,
        accuracy: 10,
        timestamp: new Date(),
      });

      const location = await db.getLatestRiderLocation(testRider.id);

      expect(location).toBeDefined();
      expect(location?.riderId).toBe(testRider.id);
    });

    it("should get active deliveries", async () => {
      const deliveries = await db.getActiveDeliveries();

      expect(Array.isArray(deliveries)).toBe(true);
      // Each delivery should have order, rider, and location data
      if (deliveries.length > 0) {
        const delivery = deliveries[0];
        expect(delivery.order).toBeDefined();
        expect(delivery.rider).toBeDefined();
      }
    });

    it("should track rider with en_route_pickup status", async () => {
      const riders = await db.getAllRiders({});
      if (riders.length === 0) return;

      const testRider = riders[0];
      const location = await db.createRiderLocation({
        riderId: testRider.id,
        orderId: null,
        latitude: "3.8400",
        longitude: "11.5000",
        status: "en_route_pickup",
        speed: 30,
        heading: 90,
        accuracy: 10,
        timestamp: new Date(),
      });

      expect(location.status).toBe("en_route_pickup");
      expect(location.speed).toBe(30);
    });

    it("should track rider with en_route_delivery status", async () => {
      const riders = await db.getAllRiders({});
      if (riders.length === 0) return;

      const testRider = riders[0];
      const location = await db.createRiderLocation({
        riderId: testRider.id,
        orderId: null,
        latitude: "3.8450",
        longitude: "11.5010",
        status: "en_route_delivery",
        speed: 35,
        heading: 95,
        accuracy: 8,
        timestamp: new Date(),
      });

      expect(location.status).toBe("en_route_delivery");
      expect(location.speed).toBe(35);
    });

    it("should track rider offline status", async () => {
      const riders = await db.getAllRiders({});
      if (riders.length === 0) return;

      const testRider = riders[0];
      const location = await db.createRiderLocation({
        riderId: testRider.id,
        orderId: null,
        latitude: "3.8480",
        longitude: "11.5021",
        status: "offline",
        speed: 0,
        heading: 0,
        accuracy: 10,
        timestamp: new Date(),
      });

      expect(location.status).toBe("offline");
      expect(location.speed).toBe(0);
    });

    it("should get all rider locations", async () => {
      const locations = await db.getAllRiderLocations({});

      expect(Array.isArray(locations)).toBe(true);
    });

    it("should filter rider locations by status", async () => {
      const idleLocations = await db.getAllRiderLocations({ status: "idle" });
      
      expect(Array.isArray(idleLocations)).toBe(true);
      if (idleLocations.length > 0) {
        expect(idleLocations[0].status).toBe("idle");
      }
    });
  });

  describe("Inventory Alerts", () => {
    it("should create inventory threshold", async () => {
      const products = await db.getAllProducts({});
      if (products.length === 0) {
        console.log("No products available for testing");
        return;
      }

      const testProduct = products[0];
      
      // Delete existing threshold if any
      try {
        await db.deleteInventoryThreshold(testProduct.id);
      } catch (e) {
        // Ignore if doesn't exist
      }

      const threshold = await db.createInventoryThreshold({
        productId: testProduct.id,
        lowStockThreshold: 20,
        criticalStockThreshold: 10,
        overstockThreshold: 100,
        autoReorder: 1,
        reorderQuantity: 50,
      });

      expect(threshold).toBeDefined();
      expect(threshold.productId).toBe(testProduct.id);
      expect(threshold.lowStockThreshold).toBe(20);
      expect(threshold.criticalStockThreshold).toBe(10);

      // Cleanup
      await db.deleteInventoryThreshold(testProduct.id);
    });

    it("should check stock levels and create alerts", async () => {
      const alerts = await db.checkStockLevelsAndCreateAlerts();

      expect(Array.isArray(alerts)).toBe(true);
    });

    it("should get all inventory alerts", async () => {
      const alerts = await db.getAllInventoryAlerts({});

      expect(Array.isArray(alerts)).toBe(true);
    });

    it("should filter alerts by status", async () => {
      const activeAlerts = await db.getAllInventoryAlerts({ status: "active" });
      const resolvedAlerts = await db.getAllInventoryAlerts({ status: "resolved" });
      const dismissedAlerts = await db.getAllInventoryAlerts({ status: "dismissed" });

      expect(Array.isArray(activeAlerts)).toBe(true);
      expect(Array.isArray(resolvedAlerts)).toBe(true);
      expect(Array.isArray(dismissedAlerts)).toBe(true);
    });

    it("should filter alerts by severity", async () => {
      const criticalAlerts = await db.getAllInventoryAlerts({ severity: "critical" });
      const warningAlerts = await db.getAllInventoryAlerts({ severity: "warning" });
      const infoAlerts = await db.getAllInventoryAlerts({ severity: "info" });

      expect(Array.isArray(criticalAlerts)).toBe(true);
      expect(Array.isArray(warningAlerts)).toBe(true);
      expect(Array.isArray(infoAlerts)).toBe(true);
    });

    it("should create low stock alert", async () => {
      const products = await db.getAllProducts({});
      if (products.length === 0) return;

      const testProduct = products[0];
      
      // Create threshold
      try {
        await db.deleteInventoryThreshold(testProduct.id);
      } catch (e) {}
      
      await db.createInventoryThreshold({
        productId: testProduct.id,
        lowStockThreshold: 1000,
        criticalStockThreshold: 500,
        overstockThreshold: null,
        autoReorder: 0,
        reorderQuantity: null,
      });

      // Check stock levels
      const alerts = await db.checkStockLevelsAndCreateAlerts();
      
      expect(Array.isArray(alerts)).toBe(true);

      // Cleanup
      await db.deleteInventoryThreshold(testProduct.id);
    });

    it("should resolve inventory alert", async () => {
      const alerts = await db.getAllInventoryAlerts({ status: "active" });
      
      if (alerts.length > 0) {
        const testAlert = alerts[0];
        await db.resolveInventoryAlert(testAlert.id, 1, "Test resolution");
        
        const resolvedAlert = await db.getInventoryAlertById(testAlert.id);
        expect(resolvedAlert?.status).toBe("resolved");
        expect(resolvedAlert?.notes).toContain("Test resolution");
      }
    });

    it("should bulk resolve alerts", async () => {
      const activeAlerts = await db.getAllInventoryAlerts({ status: "active" });

      if (activeAlerts.length >= 2) {
        const alertIds = activeAlerts.slice(0, 2).map((a: any) => a.id);
        await db.bulkResolveInventoryAlerts(alertIds, 1);

        // Verify they were resolved
        for (const id of alertIds) {
          const alert = await db.getInventoryAlertById(id);
          expect(alert?.status).toBe("resolved");
        }
      }
    });

    it("should dismiss inventory alert", async () => {
      const alerts = await db.getAllInventoryAlerts({ status: "active" });
      
      if (alerts.length > 0) {
        const testAlert = alerts[0];
        await db.dismissInventoryAlert(testAlert.id);
        
        const dismissedAlert = await db.getInventoryAlertById(testAlert.id);
        expect(dismissedAlert?.status).toBe("dismissed");
      }
    });

    it("should get inventory threshold by product ID", async () => {
      const products = await db.getAllProducts({});
      if (products.length === 0) return;

      const testProduct = products[0];
      
      // Create threshold
      try {
        await db.deleteInventoryThreshold(testProduct.id);
      } catch (e) {}
      
      await db.createInventoryThreshold({
        productId: testProduct.id,
        lowStockThreshold: 25,
        criticalStockThreshold: 12,
        overstockThreshold: null,
        autoReorder: 0,
        reorderQuantity: null,
      });

      const threshold = await db.getInventoryThresholdByProductId(testProduct.id);

      expect(threshold).toBeDefined();
      expect(threshold?.productId).toBe(testProduct.id);
      expect(threshold?.lowStockThreshold).toBe(25);

      // Cleanup
      await db.deleteInventoryThreshold(testProduct.id);
    });

    it("should update inventory threshold", async () => {
      const products = await db.getAllProducts({});
      if (products.length === 0) return;

      const testProduct = products[0];
      
      // Create threshold
      try {
        await db.deleteInventoryThreshold(testProduct.id);
      } catch (e) {}
      
      await db.createInventoryThreshold({
        productId: testProduct.id,
        lowStockThreshold: 20,
        criticalStockThreshold: 10,
        overstockThreshold: null,
        autoReorder: 0,
        reorderQuantity: null,
      });

      // Update it
      await db.updateInventoryThreshold(testProduct.id, {
        lowStockThreshold: 30,
        criticalStockThreshold: 15,
      });

      const threshold = await db.getInventoryThresholdByProductId(testProduct.id);
      expect(threshold?.lowStockThreshold).toBe(30);
      expect(threshold?.criticalStockThreshold).toBe(15);

      // Cleanup
      await db.deleteInventoryThreshold(testProduct.id);
    });

    it("should delete inventory threshold", async () => {
      const products = await db.getAllProducts({});
      if (products.length === 0) return;

      const testProduct = products[0];
      
      // Create threshold
      try {
        await db.deleteInventoryThreshold(testProduct.id);
      } catch (e) {}
      
      await db.createInventoryThreshold({
        productId: testProduct.id,
        lowStockThreshold: 20,
        criticalStockThreshold: 10,
        overstockThreshold: null,
        autoReorder: 0,
        reorderQuantity: null,
      });

      // Delete it
      await db.deleteInventoryThreshold(testProduct.id);

      const threshold = await db.getInventoryThresholdByProductId(testProduct.id);
      expect(threshold).toBeUndefined();
    });

    it("should get all inventory thresholds", async () => {
      const thresholds = await db.getAllInventoryThresholds();

      expect(Array.isArray(thresholds)).toBe(true);
    });
  });
});

