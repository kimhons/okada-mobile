import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('Financial Dashboard Functions', () => {
  describe('getFinancialDashboard', () => {
    it('should return financial overview for month period', async () => {
      const result = await db.getFinancialDashboard('month');
      
      expect(result).toBeDefined();
      if (result) {
        expect(result).toHaveProperty('current');
        expect(result).toHaveProperty('previous');
        expect(result).toHaveProperty('growth');
        expect(result).toHaveProperty('period');
        expect(result.period).toBe('month');
        
        expect(result.current).toHaveProperty('revenue');
        expect(result.current).toHaveProperty('commissions');
        expect(result.current).toHaveProperty('payouts');
        expect(result.current).toHaveProperty('orders');
        
        expect(typeof result.current.revenue).toBe('number');
        expect(typeof result.current.commissions).toBe('number');
        expect(typeof result.current.payouts).toBe('number');
        expect(typeof result.current.orders).toBe('number');
      }
    });

    it('should return financial overview for day period', async () => {
      const result = await db.getFinancialDashboard('day');
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.period).toBe('day');
      }
    });

    it('should return financial overview for week period', async () => {
      const result = await db.getFinancialDashboard('week');
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.period).toBe('week');
      }
    });

    it('should return financial overview for year period', async () => {
      const result = await db.getFinancialDashboard('year');
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.period).toBe('year');
      }
    });

    it('should calculate growth percentages', async () => {
      const result = await db.getFinancialDashboard('month');
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.growth).toHaveProperty('revenue');
        expect(result.growth).toHaveProperty('commissions');
        expect(result.growth).toHaveProperty('payouts');
        expect(result.growth).toHaveProperty('orders');
        
        expect(typeof result.growth.revenue).toBe('number');
        expect(typeof result.growth.commissions).toBe('number');
        expect(typeof result.growth.payouts).toBe('number');
        expect(typeof result.growth.orders).toBe('number');
      }
    });
  });

  describe('getRevenueTrends', () => {
    it('should return revenue trends for 30 days', async () => {
      const result = await db.getRevenueTrends(30);
      
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('date');
        expect(result[0]).toHaveProperty('revenue');
        expect(result[0]).toHaveProperty('orderCount');
        expect(typeof result[0].revenue).toBe('number');
        expect(typeof result[0].orderCount).toBe('number');
      }
    });

    it('should return revenue trends for 7 days', async () => {
      const result = await db.getRevenueTrends(7);
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return revenue trends for 90 days', async () => {
      const result = await db.getRevenueTrends(90);
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return trends in chronological order', async () => {
      const result = await db.getRevenueTrends(30);
      
      if (result.length > 1) {
        const firstDate = new Date(result[0].date);
        const lastDate = new Date(result[result.length - 1].date);
        expect(lastDate.getTime()).toBeGreaterThanOrEqual(firstDate.getTime());
      }
    });
  });

  describe('getCommissionSummary', () => {
    it('should return commission breakdown', async () => {
      const result = await db.getCommissionSummary();
      
      expect(result).toBeDefined();
      if (result) {
        expect(result).toHaveProperty('platformCommission');
        expect(result).toHaveProperty('riderCommissions');
        expect(result).toHaveProperty('deliveryFees');
        expect(result).toHaveProperty('total');
        
        expect(typeof result.platformCommission).toBe('number');
        expect(typeof result.riderCommissions).toBe('number');
        expect(typeof result.deliveryFees).toBe('number');
        expect(typeof result.total).toBe('number');
      }
    });

    it('should calculate total correctly', async () => {
      const result = await db.getCommissionSummary();
      
      if (result) {
        const calculatedTotal = result.platformCommission + result.riderCommissions + result.deliveryFees;
        expect(result.total).toBe(calculatedTotal);
      }
    });

    it('should return non-negative values', async () => {
      const result = await db.getCommissionSummary();
      
      if (result) {
        expect(result.platformCommission).toBeGreaterThanOrEqual(0);
        expect(result.riderCommissions).toBeGreaterThanOrEqual(0);
        expect(result.deliveryFees).toBeGreaterThanOrEqual(0);
        expect(result.total).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('getPayoutStatuses', () => {
    it('should return payout status summary', async () => {
      const result = await db.getPayoutStatuses();
      
      expect(result).toBeDefined();
      if (result) {
        expect(result).toHaveProperty('pending');
        expect(result).toHaveProperty('completed');
        expect(result).toHaveProperty('failed');
        
        expect(result.pending).toHaveProperty('count');
        expect(result.pending).toHaveProperty('total');
        expect(result.completed).toHaveProperty('count');
        expect(result.completed).toHaveProperty('total');
        expect(result.failed).toHaveProperty('count');
        expect(result.failed).toHaveProperty('total');
      }
    });

    it('should return non-negative counts and totals', async () => {
      const result = await db.getPayoutStatuses();
      
      if (result) {
        expect(result.pending.count).toBeGreaterThanOrEqual(0);
        expect(result.pending.total).toBeGreaterThanOrEqual(0);
        expect(result.completed.count).toBeGreaterThanOrEqual(0);
        expect(result.completed.total).toBeGreaterThanOrEqual(0);
        expect(result.failed.count).toBeGreaterThanOrEqual(0);
        expect(result.failed.total).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('getTopRevenueCategories', () => {
    it('should return top 5 revenue categories', async () => {
      const result = await db.getTopRevenueCategories(5);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
      
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('categoryId');
        expect(result[0]).toHaveProperty('categoryName');
        expect(result[0]).toHaveProperty('revenue');
        expect(result[0]).toHaveProperty('orderCount');
        expect(typeof result[0].revenue).toBe('number');
        expect(typeof result[0].orderCount).toBe('number');
      }
    });

    it('should return top 10 revenue categories', async () => {
      const result = await db.getTopRevenueCategories(10);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should return categories sorted by revenue descending', async () => {
      const result = await db.getTopRevenueCategories(10);
      
      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].revenue).toBeGreaterThanOrEqual(result[i + 1].revenue);
        }
      }
    });
  });

  describe('getRevenueByPaymentMethod', () => {
    it('should return revenue breakdown by payment method', async () => {
      const result = await db.getRevenueByPaymentMethod();
      
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('paymentMethod');
        expect(result[0]).toHaveProperty('revenue');
        expect(result[0]).toHaveProperty('orderCount');
        expect(typeof result[0].revenue).toBe('number');
        expect(typeof result[0].orderCount).toBe('number');
      }
    });

    it('should return non-negative revenue values', async () => {
      const result = await db.getRevenueByPaymentMethod();
      
      result.forEach(method => {
        expect(method.revenue).toBeGreaterThanOrEqual(0);
        expect(method.orderCount).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
