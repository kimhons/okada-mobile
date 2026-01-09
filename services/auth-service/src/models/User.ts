import { postgres } from '../config/database';
import { User, UserRole, AccountStatus, Locale } from '../../../shared/types/auth';
import { CameroonPhoneNumber } from '../../../shared/types/common';
import { logger } from '../../../shared/utils/logger';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface CreateUserData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  language?: Locale;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  language?: Locale;
  timezone?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  marketingNotifications?: boolean;
  profileVisibility?: 'public' | 'private';
  locationSharing?: boolean;
  dataProcessing?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  status?: AccountStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  search?: string; // Search in name, email, phone
  createdAfter?: Date;
  createdBefore?: Date;
}

export class UserModel {
  private static tableName = 'users';

  static async create(userData: CreateUserData): Promise<User> {
    const {
      email,
      phone,
      password,
      firstName,
      lastName,
      role,
      language = Locale.FR
    } = userData;

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO ${this.tableName} (
        email,
        phone,
        password_hash,
        first_name,
        last_name,
        role,
        language
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      email.toLowerCase(),
      phone,
      passwordHash,
      firstName,
      lastName,
      role,
      language
    ];

    try {
      const result = await postgres.query(query, values);
      const user = this.mapRowToUser(result.rows[0]);

      logger.audit('User created', {
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return user;
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        if (error.constraint?.includes('email')) {
          throw new Error('Email already exists');
        }
        if (error.constraint?.includes('phone')) {
          throw new Error('Phone number already exists');
        }
      }
      logger.error('Failed to create user', error, { email, role });
      throw error;
    }
  }

  static async findById(id: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;

    try {
      const result = await postgres.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
    } catch (error) {
      logger.error('Failed to find user by ID', error as Error, { userId: id });
      throw error;
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE email = $1`;

    try {
      const result = await postgres.query(query, [email.toLowerCase()]);
      return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
    } catch (error) {
      logger.error('Failed to find user by email', error as Error, { email });
      throw error;
    }
  }

  static async findByPhone(phone: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE phone = $1`;

    try {
      const result = await postgres.query(query, [phone]);
      return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
    } catch (error) {
      logger.error('Failed to find user by phone', error as Error, { phone });
      throw error;
    }
  }

  static async findByEmailOrPhone(identifier: string): Promise<User | null> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE email = $1 OR phone = $1
    `;

    try {
      const result = await postgres.query(query, [identifier.toLowerCase()]);
      return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
    } catch (error) {
      logger.error('Failed to find user by email or phone', error as Error, { identifier });
      throw error;
    }
  }

  static async updateById(id: string, updateData: UpdateUserData): Promise<User | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = this.camelToSnakeCase(key);
        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    const query = `
      UPDATE ${this.tableName}
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);

    try {
      const result = await postgres.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }

      const user = this.mapRowToUser(result.rows[0]);

      logger.audit('User updated', {
        userId: user.id,
        updatedFields: Object.keys(updateData)
      });

      return user;
    } catch (error) {
      logger.error('Failed to update user', error as Error, { userId: id, updateData });
      throw error;
    }
  }

  static async updatePassword(id: string, newPassword: string): Promise<void> {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const query = `
      UPDATE ${this.tableName}
      SET password_hash = $1, password_changed_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    try {
      await postgres.query(query, [passwordHash, id]);

      logger.audit('Password updated', { userId: id });
    } catch (error) {
      logger.error('Failed to update password', error as Error, { userId: id });
      throw error;
    }
  }

  static async verifyPassword(userId: string, password: string): Promise<boolean> {
    const query = `SELECT password_hash FROM ${this.tableName} WHERE id = $1`;

    try {
      const result = await postgres.query(query, [userId]);
      if (result.rows.length === 0) {
        return false;
      }

      return await bcrypt.compare(password, result.rows[0].password_hash);
    } catch (error) {
      logger.error('Failed to verify password', error as Error, { userId });
      throw error;
    }
  }

  static async updateLoginAttempts(id: string, attempts: number): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET login_attempts = $1
      WHERE id = $2
    `;

    try {
      await postgres.query(query, [attempts, id]);
    } catch (error) {
      logger.error('Failed to update login attempts', error as Error, { userId: id, attempts });
      throw error;
    }
  }

  static async lockAccount(id: string, lockDurationMinutes: number): Promise<void> {
    const lockedUntil = new Date(Date.now() + lockDurationMinutes * 60 * 1000);

    const query = `
      UPDATE ${this.tableName}
      SET status = 'locked', locked_until = $1, login_attempts = 0
      WHERE id = $2
    `;

    try {
      await postgres.query(query, [lockedUntil, id]);

      logger.security('Account locked', {
        userId: id,
        lockedUntil: lockedUntil.toISOString(),
        lockDurationMinutes
      });
    } catch (error) {
      logger.error('Failed to lock account', error as Error, { userId: id });
      throw error;
    }
  }

  static async unlockAccount(id: string): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET status = 'active', locked_until = NULL, login_attempts = 0
      WHERE id = $1
    `;

    try {
      await postgres.query(query, [id]);

      logger.security('Account unlocked', { userId: id });
    } catch (error) {
      logger.error('Failed to unlock account', error as Error, { userId: id });
      throw error;
    }
  }

  static async updateLastLogin(id: string): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    try {
      await postgres.query(query, [id]);
    } catch (error) {
      logger.error('Failed to update last login', error as Error, { userId: id });
      throw error;
    }
  }

  static async verifyEmail(id: string): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET email_verified_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    try {
      await postgres.query(query, [id]);

      logger.audit('Email verified', { userId: id });
    } catch (error) {
      logger.error('Failed to verify email', error as Error, { userId: id });
      throw error;
    }
  }

  static async verifyPhone(id: string): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET phone_verified_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    try {
      await postgres.query(query, [id]);

      logger.audit('Phone verified', { userId: id });
    } catch (error) {
      logger.error('Failed to verify phone', error as Error, { userId: id });
      throw error;
    }
  }

  static async findMany(
    filters: UserFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ users: User[]; total: number }> {
    const whereConditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (filters.role) {
      whereConditions.push(`role = $${paramIndex}`);
      values.push(filters.role);
      paramIndex++;
    }

    if (filters.status) {
      whereConditions.push(`status = $${paramIndex}`);
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.emailVerified !== undefined) {
      whereConditions.push(
        filters.emailVerified
          ? `email_verified_at IS NOT NULL`
          : `email_verified_at IS NULL`
      );
    }

    if (filters.phoneVerified !== undefined) {
      whereConditions.push(
        filters.phoneVerified
          ? `phone_verified_at IS NOT NULL`
          : `phone_verified_at IS NULL`
      );
    }

    if (filters.search) {
      whereConditions.push(`(
        first_name ILIKE $${paramIndex} OR
        last_name ILIKE $${paramIndex} OR
        email ILIKE $${paramIndex} OR
        phone ILIKE $${paramIndex}
      )`);
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.createdAfter) {
      whereConditions.push(`created_at >= $${paramIndex}`);
      values.push(filters.createdAfter);
      paramIndex++;
    }

    if (filters.createdBefore) {
      whereConditions.push(`created_at <= $${paramIndex}`);
      values.push(filters.createdBefore);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${this.tableName}
      ${whereClause}
    `;

    // Data query
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT *
      FROM ${this.tableName}
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    try {
      const [countResult, dataResult] = await Promise.all([
        postgres.query(countQuery, values),
        postgres.query(dataQuery, [...values, limit, offset])
      ]);

      const total = parseInt(countResult.rows[0].total);
      const users = dataResult.rows.map(row => this.mapRowToUser(row));

      return { users, total };
    } catch (error) {
      logger.error('Failed to find users', error as Error, { filters, page, limit });
      throw error;
    }
  }

  static async deleteById(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;

    try {
      const result = await postgres.query(query, [id]);

      if (result.rowCount > 0) {
        logger.audit('User deleted', { userId: id });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to delete user', error as Error, { userId: id });
      throw error;
    }
  }

  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      phone: this.parsePhoneNumber(row.phone),
      passwordHash: row.password_hash,
      role: row.role as UserRole,
      status: row.status as AccountStatus,
      profile: {
        firstName: row.first_name,
        lastName: row.last_name,
        avatar: row.avatar,
        dateOfBirth: row.date_of_birth,
        gender: row.gender,
        language: row.language as Locale,
        timezone: row.timezone
      },
      security: {
        twoFactorEnabled: row.two_factor_enabled,
        twoFactorSecret: row.two_factor_secret,
        backupCodes: row.backup_codes || [],
        loginAttempts: row.login_attempts,
        lockedUntil: row.locked_until,
        passwordChangedAt: row.password_changed_at,
        securityQuestions: [] // TODO: Load from security_questions table
      },
      preferences: {
        notifications: {
          email: row.email_notifications,
          sms: row.sms_notifications,
          push: row.push_notifications,
          marketing: row.marketing_notifications
        },
        privacy: {
          profileVisibility: row.profile_visibility,
          locationSharing: row.location_sharing,
          dataProcessing: row.data_processing
        }
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
      emailVerifiedAt: row.email_verified_at,
      phoneVerifiedAt: row.phone_verified_at
    };
  }

  private static parsePhoneNumber(phone: string): CameroonPhoneNumber {
    // Parse Cameroon phone number
    const number = phone.substring(4); // Remove +237
    const firstDigit = number[0];
    const secondDigit = number[1];

    let operator: 'MTN' | 'Orange' | 'Camtel' | 'Nexttel' = 'MTN';

    if (firstDigit === '6') {
      if (['5', '6', '7', '8', '9'].includes(secondDigit)) {
        operator = 'MTN';
      } else if (['0', '1', '2', '3', '4'].includes(secondDigit)) {
        operator = 'Orange';
      }
    } else if (firstDigit === '2') {
      if (secondDigit === '2') {
        operator = 'Camtel';
      } else if (secondDigit === '4') {
        operator = 'Nexttel';
      }
    }

    return {
      countryCode: '+237',
      operator,
      number,
      formatted: `${phone.substring(0, 4)} ${number.substring(0, 1)}${number.substring(1, 3)} ${number.substring(3, 6)} ${number.substring(6)}`
    };
  }

  private static camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}