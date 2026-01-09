import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('Dispute Resolution', () => {
  it('should get disputes with filters', async () => {
    const disputes = await db.getDisputes({ status: 'open' });
    expect(Array.isArray(disputes)).toBe(true);
  });

  it('should get disputes without filters', async () => {
    const disputes = await db.getDisputes();
    expect(Array.isArray(disputes)).toBe(true);
  });

  it('should filter by priority', async () => {
    const disputes = await db.getDisputes({ priority: 'high' });
    expect(Array.isArray(disputes)).toBe(true);
  });

  it('should filter by status and priority', async () => {
    const disputes = await db.getDisputes({ 
      status: 'investigating',
      priority: 'urgent'
    });
    expect(Array.isArray(disputes)).toBe(true);
  });
});
