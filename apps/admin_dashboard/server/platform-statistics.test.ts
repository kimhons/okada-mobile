import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('Platform Statistics', () => {
  it('should get current platform statistics', async () => {
    const stats = await db.getPlatformStatistics();
    
    if (stats) {
      expect(stats).toHaveProperty('activeUsers');
      expect(stats).toHaveProperty('concurrentOrders');
      expect(stats).toHaveProperty('availableRiders');
      expect(stats).toHaveProperty('busyRiders');
      expect(stats).toHaveProperty('avgResponseTime');
      expect(stats).toHaveProperty('systemUptime');
      expect(typeof stats.activeUsers).toBe('number');
      expect(typeof stats.concurrentOrders).toBe('number');
    }
  });

  it('should get historical statistics', async () => {
    const stats = await db.getHistoricalStatistics(24);
    expect(Array.isArray(stats)).toBe(true);
  });

  it('should get historical statistics with custom hours', async () => {
    const stats = await db.getHistoricalStatistics(12);
    expect(Array.isArray(stats)).toBe(true);
  });
});
