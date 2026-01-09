import mysql from 'mysql2/promise';

async function createTable() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS backupSchedules (
        id int AUTO_INCREMENT PRIMARY KEY,
        name varchar(255) NOT NULL,
        type ENUM('full', 'incremental', 'differential') DEFAULT 'full' NOT NULL,
        frequency ENUM('hourly', 'daily', 'weekly', 'monthly') DEFAULT 'daily' NOT NULL,
        time varchar(10) NOT NULL,
        retentionDays int DEFAULT 30 NOT NULL,
        isEnabled boolean DEFAULT true NOT NULL,
        lastRun timestamp NULL,
        nextRun timestamp NULL,
        createdAt timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log('backupSchedules table created successfully');
  } catch (error) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('Table already exists');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    await connection.end();
  }
}

createTable();
