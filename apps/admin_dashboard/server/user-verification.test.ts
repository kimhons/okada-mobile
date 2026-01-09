import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('User Verification', () => {
  it('should get verification requests with filters', async () => {
    const requests = await db.getVerificationRequests({ status: 'pending' });
    expect(Array.isArray(requests)).toBe(true);
  });

  it('should get verification requests without filters', async () => {
    const requests = await db.getVerificationRequests();
    expect(Array.isArray(requests)).toBe(true);
  });

  it('should filter by user type', async () => {
    const requests = await db.getVerificationRequests({ userType: 'seller' });
    expect(Array.isArray(requests)).toBe(true);
  });
});
