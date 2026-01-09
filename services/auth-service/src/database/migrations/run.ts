import fs from 'fs';
import path from 'path';
import { postgres } from '../../config/database';
import { logger } from '../../../../shared/utils/logger';

interface Migration {
  filename: string;
  version: number;
  executed: boolean;
}

class MigrationRunner {
  private migrationsDir: string;

  constructor() {
    this.migrationsDir = path.join(__dirname);
  }

  private async createMigrationsTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        version INTEGER UNIQUE NOT NULL,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await postgres.query(createTableQuery);
    logger.info('Migrations table created or already exists');
  }

  private async getExecutedMigrations(): Promise<number[]> {
    const result = await postgres.query('SELECT version FROM migrations ORDER BY version');
    return result.rows.map((row: any) => row.version);
  }

  private getMigrationFiles(): Migration[] {
    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .filter(file => file.match(/^\d{3}_/)) // Must start with 3 digits
      .sort();

    return files.map(filename => {
      const version = parseInt(filename.substring(0, 3));
      return {
        filename,
        version,
        executed: false
      };
    });
  }

  private async executeMigration(migration: Migration): Promise<void> {
    const filePath = path.join(this.migrationsDir, migration.filename);
    const sql = fs.readFileSync(filePath, 'utf8');

    logger.info(`Executing migration: ${migration.filename}`);

    try {
      // Execute the migration in a transaction
      await postgres.query('BEGIN');

      // Split and execute SQL statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          await postgres.query(statement);
        }
      }

      // Record the migration as executed
      await postgres.query(
        'INSERT INTO migrations (version, filename) VALUES ($1, $2)',
        [migration.version, migration.filename]
      );

      await postgres.query('COMMIT');
      logger.info(`Migration ${migration.filename} executed successfully`);
    } catch (error) {
      await postgres.query('ROLLBACK');
      logger.error(`Migration ${migration.filename} failed`, error as Error);
      throw error;
    }
  }

  public async runMigrations(): Promise<void> {
    try {
      logger.info('Starting database migrations...');

      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();

      // Get executed migrations
      const executedVersions = await this.getExecutedMigrations();
      logger.info(`Found ${executedVersions.length} executed migrations`);

      // Get available migration files
      const availableMigrations = this.getMigrationFiles();
      logger.info(`Found ${availableMigrations.length} migration files`);

      // Filter pending migrations
      const pendingMigrations = availableMigrations.filter(
        migration => !executedVersions.includes(migration.version)
      );

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations to execute');
        return;
      }

      logger.info(`Found ${pendingMigrations.length} pending migrations`);

      // Execute pending migrations
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }

      logger.info('All migrations completed successfully');
    } catch (error) {
      logger.error('Migration process failed', error as Error);
      throw error;
    }
  }

  public async rollback(targetVersion?: number): Promise<void> {
    logger.warn('Rollback functionality not implemented yet');
    // TODO: Implement rollback functionality
    throw new Error('Rollback functionality not implemented');
  }

  public async getMigrationStatus(): Promise<Migration[]> {
    const executedVersions = await this.getExecutedMigrations();
    const availableMigrations = this.getMigrationFiles();

    return availableMigrations.map(migration => ({
      ...migration,
      executed: executedVersions.includes(migration.version)
    }));
  }
}

// CLI interface
async function main(): Promise<void> {
  const runner = new MigrationRunner();
  const command = process.argv[2];

  try {
    switch (command) {
      case 'up':
      case 'migrate':
      default:
        await runner.runMigrations();
        break;

      case 'status':
        const status = await runner.getMigrationStatus();
        console.table(status);
        break;

      case 'rollback':
        const version = process.argv[3] ? parseInt(process.argv[3]) : undefined;
        await runner.rollback(version);
        break;

      default:
        console.log('Available commands:');
        console.log('  up|migrate - Run pending migrations');
        console.log('  status     - Show migration status');
        console.log('  rollback   - Rollback migrations (not implemented)');
    }

    process.exit(0);
  } catch (error) {
    logger.error('Migration command failed', error as Error);
    process.exit(1);
  }
}

// Export for programmatic use
export { MigrationRunner };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}