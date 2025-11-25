import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('Inventory Alerts', () => {
  it('should get inventory alerts with filters', async () => {
    const alerts = await db.getInventoryAlerts({ status: 'active' });
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('should get inventory alerts without filters', async () => {
    const alerts = await db.getInventoryAlerts();
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('should get inventory threshold for a product', async () => {
    const threshold = await db.getInventoryThreshold(1);
    // Can be null if no threshold is set
    expect(threshold === null || typeof threshold === 'object').toBe(true);
  });
});
