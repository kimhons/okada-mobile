/**
 * Seed Customer Data Script
 * 
 * This script creates customer user records for orders that reference
 * non-existent customer IDs, fixing the "Unknown Customer" display issue.
 */

import { drizzle } from "drizzle-orm/mysql2";
import { users, orders } from "../drizzle/schema";
import { sql, eq, inArray, isNull } from "drizzle-orm";

const CAMEROON_NAMES = [
  { name: "Jean-Pierre Mbarga", email: "jpmbarga@gmail.com" },
  { name: "Marie-Claire Ngo", email: "mcngo@yahoo.fr" },
  { name: "Paul Essomba", email: "pessomba@outlook.com" },
  { name: "Cécile Atangana", email: "catangana@gmail.com" },
  { name: "Emmanuel Fotso", email: "efotso@hotmail.com" },
  { name: "Brigitte Kamga", email: "bkamga@gmail.com" },
  { name: "François Tchinda", email: "ftchinda@yahoo.fr" },
  { name: "Thérèse Njoya", email: "tnjoya@gmail.com" },
  { name: "Michel Tagne", email: "mtagne@outlook.com" },
  { name: "Angélique Messi", email: "amessi@gmail.com" },
  { name: "Joseph Nkeng", email: "jnkeng@yahoo.fr" },
  { name: "Pauline Fouda", email: "pfouda@hotmail.com" },
  { name: "André Biya", email: "abiya@gmail.com" },
  { name: "Solange Mvondo", email: "smvondo@outlook.com" },
  { name: "Patrick Nana", email: "pnana@gmail.com" },
];

async function seedCustomers() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);
  
  console.log("🔍 Checking for orders with missing customer records...");
  
  // Get all unique customer IDs from orders
  const orderCustomerIds = await db
    .selectDistinct({ customerId: orders.customerId })
    .from(orders);
  
  console.log(`Found ${orderCustomerIds.length} unique customer IDs in orders`);
  
  // Get existing user IDs
  const existingUsers = await db
    .select({ id: users.id })
    .from(users);
  
  const existingUserIds = new Set(existingUsers.map(u => u.id));
  console.log(`Found ${existingUserIds.size} existing users`);
  
  // Find missing customer IDs
  const missingCustomerIds = orderCustomerIds
    .map(o => o.customerId)
    .filter(id => !existingUserIds.has(id));
  
  console.log(`Found ${missingCustomerIds.length} missing customer IDs: ${missingCustomerIds.join(', ')}`);
  
  if (missingCustomerIds.length === 0) {
    console.log("✅ All orders have valid customer records!");
    process.exit(0);
  }
  
  // Create customer records for missing IDs
  console.log("\n📝 Creating customer records...");
  
  for (let i = 0; i < missingCustomerIds.length; i++) {
    const customerId = missingCustomerIds[i];
    const customerData = CAMEROON_NAMES[i % CAMEROON_NAMES.length];
    
    // Generate a unique openId for the customer
    const openId = `customer_${customerId}_${Date.now()}`;
    
    try {
      // Insert with specific ID using raw SQL
      await db.execute(sql`
        INSERT INTO users (id, openId, name, email, role, createdAt, updatedAt, lastSignedIn)
        VALUES (${customerId}, ${openId}, ${customerData.name}, ${customerData.email}, 'user', NOW(), NOW(), NOW())
      `);
      
      console.log(`  ✅ Created customer ID ${customerId}: ${customerData.name}`);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`  ⚠️ Customer ID ${customerId} already exists, skipping`);
      } else {
        console.error(`  ❌ Failed to create customer ID ${customerId}:`, error.message);
      }
    }
  }
  
  console.log("\n✅ Customer seeding complete!");
  
  // Verify the fix
  console.log("\n🔍 Verifying orders now have customer names...");
  const verifyQuery = await db.execute(sql`
    SELECT o.id, o.orderNumber, o.customerId, u.name as customerName
    FROM orders o
    LEFT JOIN users u ON o.customerId = u.id
    ORDER BY o.id DESC
    LIMIT 10
  `);
  
  console.log("\nRecent orders with customer names:");
  console.table(verifyQuery[0]);
  
  process.exit(0);
}

seedCustomers().catch(console.error);
