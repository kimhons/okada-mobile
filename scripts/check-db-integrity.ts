/**
 * Database Integrity Check Script
 * 
 * Checks for duplicate IDs and other integrity issues across all tables.
 * Run with: pnpm tsx scripts/check-db-integrity.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

interface IntegrityCheck {
  table: string;
  total: number;
  unique_ids: number;
  has_duplicates: boolean;
}

const TABLES_TO_CHECK = [
  "users",
  "riders",
  "orders",
  "products",
  "sellers",
  "promotionalCampaigns",
  "supportTickets",
  "paymentTransactions",
  "deliveryZones",
  "activityLogs",
  "notifications",
  "badges",
  "riderBadges",
];

async function checkTableIntegrity(tableName: string): Promise<IntegrityCheck> {
  try {
    const result = await db.execute(sql.raw(`
      SELECT 
        '${tableName}' as table_name,
        COUNT(*) as total,
        COUNT(DISTINCT id) as unique_ids
      FROM ${tableName}
    `));

    // Drizzle returns [rows, fields], we need the first row
    const rows = Array.isArray(result[0]) ? result[0] : result;
    const row = rows[0] as any;
    const total = Number(row.total);
    const unique_ids = Number(row.unique_ids);

    return {
      table: tableName,
      total,
      unique_ids,
      has_duplicates: total !== unique_ids,
    };
  } catch (error) {
    console.warn(`⚠️  Could not check table ${tableName}:`, (error as Error).message);
    return {
      table: tableName,
      total: 0,
      unique_ids: 0,
      has_duplicates: false,
    };
  }
}

async function findDuplicateIds(tableName: string): Promise<any[]> {
  try {
    const result = await db.execute(sql.raw(`
      SELECT id, COUNT(*) as count
      FROM ${tableName}
      GROUP BY id
      HAVING COUNT(*) > 1
    `));

    // Drizzle returns [rows, fields]
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as any[];
  } catch (error) {
    return [];
  }
}

async function main() {
  console.log("🔍 Starting Database Integrity Check...\n");

  const results: IntegrityCheck[] = [];
  let hasIssues = false;

  for (const table of TABLES_TO_CHECK) {
    const check = await checkTableIntegrity(table);
    results.push(check);

    if (check.has_duplicates) {
      hasIssues = true;
      console.log(`❌ ${table}: Found duplicates (${check.total} rows, ${check.unique_ids} unique IDs)`);
      
      const duplicates = await findDuplicateIds(table);
      if (duplicates.length > 0) {
        console.log(`   Duplicate IDs:`, duplicates);
      }
    } else if (check.total > 0) {
      console.log(`✅ ${table}: OK (${check.total} rows, all unique)`);
    } else {
      console.log(`⚪ ${table}: Empty or not found`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Summary:");
  console.log("=".repeat(60));
  
  const totalTables = results.filter(r => r.total > 0).length;
  const tablesWithDuplicates = results.filter(r => r.has_duplicates).length;
  const totalRecords = results.reduce((sum, r) => sum + r.total, 0);

  console.log(`Total tables checked: ${totalTables}`);
  console.log(`Total records: ${totalRecords.toLocaleString()}`);
  console.log(`Tables with duplicate IDs: ${tablesWithDuplicates}`);

  if (hasIssues) {
    console.log("\n❌ INTEGRITY ISSUES FOUND!");
    console.log("Please review the duplicate IDs above and take corrective action.");
    process.exit(1);
  } else {
    console.log("\n✅ ALL CHECKS PASSED - Database integrity is good!");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
