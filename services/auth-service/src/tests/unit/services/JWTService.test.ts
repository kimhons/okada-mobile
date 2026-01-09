import { JWTService } from '../../../services/JWTService';
import { redis } from '../../../config/database';
import jwt from 'jsonwebtoken';

// Mock Redis
jest.mock('../../../config/database', () => ({
  redis: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    getClient: jest.fn(() => ({
      keys: jest.fn(),
      pipeline: jest.fn(() => ({
        set: jest.fn(),
        del: jest.fn(),
        exec: jest.fn()
      }))
    }))
  }
}));

describe('JWTService', () => {
  const mockUserId = 'test-user-id';
  const mockEmail = 'test@example.com';
  const mockRole = 'customer';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokenPair', () => {
    it('should generate valid access and refresh tokens', async () => {
      (redis.set as jest.Mock).mockResolvedValue('OK');

      const tokenPair = await JWTService.generateTokenPair(
        mockUserId,
        mockEmail,
        mockRole
      );

      expect(tokenPair).toHaveProperty('accessToken');
      expect(tokenPair).toHaveProperty('refreshToken');
      expect(tokenPair).toHaveProperty('expiresIn');
      expect(tokenPair).toHaveProperty('tokenFamily');

      // Verify token structure
      const accessTokenDecoded = jwt.decode(tokenPair.accessToken) as any;
      expect(accessTokenDecoded.sub).toBe(mockUserId);
      expect(accessTokenDecoded.email).toBe(mockEmail);
      expect(accessTokenDecoded.role).toBe(mockRole);

      const refreshTokenDecoded = jwt.decode(tokenPair.refreshToken) as any;
      expect(refreshTokenDecoded.sub).toBe(mockUserId);
      expect(refreshTokenDecoded.tokenFamily).toBe(tokenPair.tokenFamily);
    });

    it('should use provided token family', async () => {
      (redis.set as jest.Mock).mockResolvedValue('OK');
      const customFamily = 'custom-family';

      const tokenPair = await JWTService.generateTokenPair(
        mockUserId,
        mockEmail,
        mockRole,
        customFamily
      );

      expect(tokenPair.tokenFamily).toBe(customFamily);
    });

    it('should store token JTI in Redis', async () => {
      (redis.set as jest.Mock).mockResolvedValue('OK');

      await JWTService.generateTokenPair(mockUserId, mockEmail, mockRole);

      expect(redis.set).toHaveBeenCalled();
    });
  });

  describe('validateAccessToken', () => {
    it('should validate a valid token', async () => {
      const tokenPair = await JWTService.generateTokenPair(
        mockUserId,
        mockEmail,
        mockRole
      );

      (redis.exists as jest.Mock).mockResolvedValue(0); // Not revoked

      const result = await JWTService.validateAccessToken(tokenPair.accessToken);

      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.sub).toBe(mockUserId);
    });

    it('should reject revoked token', async () => {
      const tokenPair = await JWTService.generateTokenPair(
        mockUserId,
        mockEmail,
        mockRole
      );

      (redis.exists as jest.Mock).mockResolvedValue(1); // Revoked

      const result = await JWTService.validateAccessToken(tokenPair.accessToken);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Token has been revoked');
    });

    it('should reject expired token', async () => {
      // Create expired token
      const expiredToken = jwt.sign(
        {
          sub: mockUserId,
          email: mockEmail,
          role: mockRole,
          exp: Math.floor(Date.now() / 1000) - 1 // Expired 1 second ago
        },
        process.env.JWT_SECRET!
      );

      const result = await JWTService.validateAccessToken(expiredToken);

      expect(result.valid).toBe(false);
      expect(result.expired).toBe(true);
    });

    it('should reject invalid token', async () => {
      const result = await JWTService.validateAccessToken('invalid-token');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid token');
    });
  });

  describe('validateRefreshToken', () => {
    it('should validate a valid refresh token', async () => {
      const tokenPair = await JWTService.generateTokenPair(
        mockUserId,
        mockEmail,
        mockRole
      );

      const result = await JWTService.validateRefreshToken(tokenPair.refreshToken);

      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.sub).toBe(mockUserId);
    });

    it('should reject expired refresh token', async () => {
      const expiredRefreshToken = jwt.sign(
        {
          sub: mockUserId,
          tokenFamily: 'test-family',
          exp: Math.floor(Date.now() / 1000) - 1
        },
        process.env.JWT_REFRESH_SECRET!
      );

      const result = await JWTService.validateRefreshToken(expiredRefreshToken);

      expect(result.valid).toBe(false);
      expect(result.expired).toBe(true);
    });
  });

  describe('revokeToken', () => {
    it('should revoke a token', async () => {
      (redis.set as jest.Mock).mockResolvedValue('OK');

      const jti = 'test-jti';
      await JWTService.revokeToken(jti);

      expect(redis.set).toHaveBeenCalledWith(
        `revoked:${jti}`,
        '1',
        24 * 60 * 60
      );
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all user tokens', async () => {
      const mockKeys = [`token:${mockUserId}:jti1`, `token:${mockUserId}:jti2`];
      const mockPipeline = {
        set: jest.fn(),
        del: jest.fn(),
        exec: jest.fn().mockResolvedValue([])
      };

      (redis.getClient as jest.Mock).mockReturnValue({
        keys: jest.fn().mockResolvedValue(mockKeys),
        pipeline: jest.fn().mockReturnValue(mockPipeline)
      });

      await JWTService.revokeAllUserTokens(mockUserId);

      expect(mockPipeline.set).toHaveBeenCalledTimes(2);
      expect(mockPipeline.del).toHaveBeenCalledWith(...mockKeys);
    });
  });

  describe('isTokenRevoked', () => {
    it('should return true for revoked token', async () => {
      (redis.exists as jest.Mock).mockResolvedValue(1);

      const result = await JWTService.isTokenRevoked('test-jti');

      expect(result).toBe(true);
    });

    it('should return false for non-revoked token', async () => {
      (redis.exists as jest.Mock).mockResolvedValue(0);

      const result = await JWTService.isTokenRevoked('test-jti');

      expect(result).toBe(false);
    });

    it('should fail secure on Redis error', async () => {
      (redis.exists as jest.Mock).mockRejectedValue(new Error('Redis error'));

      const result = await JWTService.isTokenRevoked('test-jti');

      expect(result).toBe(true); // Fail secure
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const token = 'sample-token';
      const header = `Bearer ${token}`;

      const result = JWTService.extractTokenFromHeader(header);

      expect(result).toBe(token);
    });

    it('should return null for invalid header', () => {
      const result = JWTService.extractTokenFromHeader('Invalid header');

      expect(result).toBe(null);
    });

    it('should return null for missing header', () => {
      const result = JWTService.extractTokenFromHeader('');

      expect(result).toBe(null);
    });
  });

  describe('getTokenExpiry', () => {
    it('should extract expiry from valid token', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour
      const token = jwt.sign({ exp }, 'secret');

      const result = JWTService.getTokenExpiry(token);

      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(exp * 1000);
    });

    it('should return null for invalid token', () => {
      const result = JWTService.getTokenExpiry('invalid-token');

      expect(result).toBe(null);
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should cleanup expired tokens', async () => {
      const mockKeys = ['token:user1:jti1', 'token:user2:jti2'];
      const expiredTokenData = JSON.stringify({
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      });
      const validTokenData = JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + 3600 // Valid for 1 hour
      });

      (redis.getClient as jest.Mock).mockReturnValue({
        keys: jest.fn().mockResolvedValue(mockKeys)
      });
      (redis.get as jest.Mock)
        .mockResolvedValueOnce(expiredTokenData)
        .mockResolvedValueOnce(validTokenData);
      (redis.del as jest.Mock).mockResolvedValue(1);

      const result = await JWTService.cleanupExpiredTokens();

      expect(result).toBe(1);
      expect(redis.del).toHaveBeenCalledWith(mockKeys[0]);
    });
  });
});