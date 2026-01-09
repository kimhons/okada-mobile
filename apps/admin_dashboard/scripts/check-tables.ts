import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

async function checkTables() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  const tables = [
    'customerSegments', 'marketingAutomations', 'riskAssessments',
    'complianceChecks', 'complianceViolations', 'webhookEndpoints', 'webhookLogs',
    'vendors', 'vendorContracts', 'vehicles', 'vehicleMaintenance',
    'deliveryRoutes', 'routeWaypoints'
  ];
  
  console.log('Checking for new tables...');
  
  for (const table of tables) {
    try {
      const result = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table}`));
      console.log(`✅ ${table}: exists`);
    } catch (e: any) {
      console.log(`❌ ${table}: not found - ${e.message?.substring(0, 50)}`);
    }
  }
  
  process.exit(0);
}

checkTables();
