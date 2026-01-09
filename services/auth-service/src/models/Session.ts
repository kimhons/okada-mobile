import { postgres } from '../config/database';
import { Session } from '../../../shared/types/auth';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface CreateSessionData {
  userId: string;
  refreshTokenJti: string;
  tokenFamily: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
}

export class SessionModel {
  private static tableName = 'refresh_tokens';

  static async create(sessionData: CreateSessionData): Promise<Session> {
    const {
      userId,
      refreshTokenJti,
      tokenFamily,
      ipAddress,
      userAgent,
      expiresAt
    } = sessionData;

    const query = `
      INSERT INTO ${this.tableName} (
        user_id,
        jti,
        token_family,
        ip_address,
        user_agent,
        expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      userId,
      refreshTokenJti,
      tokenFamily,
      ipAddress,
      userAgent,
      expiresAt
    ];

    try {
      const result = await postgres.query(query, values);
      const session = this.mapRowToSession(result.rows[0]);

      logger.info('Session created', {
        userId,
        sessionId: session.id,
        tokenFamily,
        ipAddress
      });

      return session;
    } catch (error) {
      logger.error('Failed to create session', error as Error, { userId, tokenFamily });
      throw error;
    }
  }

  static async findByJti(jti: string): Promise<Session | null> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE jti = $1 AND is_active = true
    `;

    try {
      const result = await postgres.query(query, [jti]);
      return result.rows.length > 0 ? this.mapRowToSession(result.rows[0]) : null;
    } catch (error) {
      logger.error('Failed to find session by JTI', error as Error, { jti });
      throw error;
    }
  }

  static async findByTokenFamily(tokenFamily: string): Promise<Session[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE token_family = $1 AND is_active = true
      ORDER BY created_at DESC
    `;

    try {
      const result = await postgres.query(query, [tokenFamily]);
      return result.rows.map(row => this.mapRowToSession(row));
    } catch (error) {
      logger.error('Failed to find sessions by token family', error as Error, { tokenFamily });
      throw error;
    }
  }

  static async findByUserId(userId: string): Promise<Session[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE user_id = $1 AND is_active = true
      ORDER BY last_used_at DESC
    `;

    try {
      const result = await postgres.query(query, [userId]);
      return result.rows.map(row => this.mapRowToSession(row));
    } catch (error) {
      logger.error('Failed to find sessions by user ID', error as Error, { userId });
      throw error;
    }
  }

  static async updateLastUsed(jti: string): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET last_used_at = CURRENT_TIMESTAMP
      WHERE jti = $1 AND is_active = true
    `;

    try {
      await postgres.query(query, [jti]);
    } catch (error) {
      logger.error('Failed to update session last used', error as Error, { jti });
      throw error;
    }
  }

  static async revoke(jti: string): Promise<boolean> {
    const query = `
      UPDATE ${this.tableName}
      SET is_active = false
      WHERE jti = $1
    `;

    try {
      const result = await postgres.query(query, [jti]);

      if (result.rowCount > 0) {
        logger.info('Session revoked', { jti });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to revoke session', error as Error, { jti });
      throw error;
    }
  }

  static async revokeByTokenFamily(tokenFamily: string): Promise<number> {
    const query = `
      UPDATE ${this.tableName}
      SET is_active = false
      WHERE token_family = $1 AND is_active = true
    `;

    try {
      const result = await postgres.query(query, [tokenFamily]);
      const revokedCount = result.rowCount || 0;

      if (revokedCount > 0) {
        logger.security('Token family revoked (potential token reuse)', {
          tokenFamily,
          revokedSessions: revokedCount
        });
      }

      return revokedCount;
    } catch (error) {
      logger.error('Failed to revoke token family', error as Error, { tokenFamily });
      throw error;
    }
  }

  static async revokeByUserId(userId: string, excludeJti?: string): Promise<number> {
    let query = `
      UPDATE ${this.tableName}
      SET is_active = false
      WHERE user_id = $1 AND is_active = true
    `;

    const values = [userId];

    if (excludeJti) {
      query += ` AND jti != $2`;
      values.push(excludeJti);
    }

    try {
      const result = await postgres.query(query, values);
      const revokedCount = result.rowCount || 0;

      if (revokedCount > 0) {
        logger.info('User sessions revoked', {
          userId,
          revokedSessions: revokedCount,
          excludeJti
        });
      }

      return revokedCount;
    } catch (error) {
      logger.error('Failed to revoke user sessions', error as Error, { userId, excludeJti });
      throw error;
    }
  }

  static async cleanupExpired(): Promise<number> {
    const query = `
      UPDATE ${this.tableName}
      SET is_active = false
      WHERE expires_at < CURRENT_TIMESTAMP AND is_active = true
    `;

    try {
      const result = await postgres.query(query);
      const cleanedCount = result.rowCount || 0;

      if (cleanedCount > 0) {
        logger.info('Expired sessions cleaned up', { cleanedSessions: cleanedCount });
      }

      return cleanedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', error as Error);
      throw error;
    }
  }

  static async deleteOldSessions(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    const query = `
      DELETE FROM ${this.tableName}
      WHERE (expires_at < $1 OR is_active = false)
        AND created_at < $1
    `;

    try {
      const result = await postgres.query(query, [cutoffDate]);
      const deletedCount = result.rowCount || 0;

      if (deletedCount > 0) {
        logger.info('Old sessions deleted', { deletedSessions: deletedCount, olderThanDays });
      }

      return deletedCount;
    } catch (error) {
      logger.error('Failed to delete old sessions', error as Error, { olderThanDays });
      throw error;
    }
  }

  static async getSessionStatistics(userId?: string): Promise<{
    total: number;
    active: number;
    expired: number;
    recentLogins: number;
  }> {
    const baseCondition = userId ? 'WHERE user_id = $1' : '';
    const params = userId ? [userId] : [];

    const queries = [
      `SELECT COUNT(*) as count FROM ${this.tableName} ${baseCondition}`,
      `SELECT COUNT(*) as count FROM ${this.tableName} ${baseCondition}${userId ? ' AND' : 'WHERE'} is_active = true`,
      `SELECT COUNT(*) as count FROM ${this.tableName} ${baseCondition}${userId ? ' AND' : 'WHERE'} expires_at < CURRENT_TIMESTAMP`,
      `SELECT COUNT(*) as count FROM ${this.tableName} ${baseCondition}${userId ? ' AND' : 'WHERE'} last_used_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'`
    ];

    try {
      const results = await Promise.all(
        queries.map(query => postgres.query(query, params))
      );

      return {
        total: parseInt(results[0].rows[0].count),
        active: parseInt(results[1].rows[0].count),
        expired: parseInt(results[2].rows[0].count),
        recentLogins: parseInt(results[3].rows[0].count)
      };
    } catch (error) {
      logger.error('Failed to get session statistics', error as Error, { userId });
      throw error;
    }
  }

  static async findSuspiciousSessions(): Promise<Session[]> {
    // Find sessions with multiple rapid logins from different IPs
    const query = `
      SELECT DISTINCT ON (user_id) *
      FROM ${this.tableName}
      WHERE is_active = true
        AND created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour'
      GROUP BY user_id, ip_address
      HAVING COUNT(*) > 3
      ORDER BY user_id, created_at DESC
    `;

    try {
      const result = await postgres.query(query);
      const sessions = result.rows.map(row => this.mapRowToSession(row));

      if (sessions.length > 0) {
        logger.security('Suspicious sessions detected', {
          suspiciousSessionCount: sessions.length
        });
      }

      return sessions;
    } catch (error) {
      logger.error('Failed to find suspicious sessions', error as Error);
      throw error;
    }
  }

  private static mapRowToSession(row: any): Session {
    return {
      id: row.id,
      userId: row.user_id,
      refreshTokenJti: row.jti,
      tokenFamily: row.token_family,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      isActive: row.is_active,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at
    };
  }
}