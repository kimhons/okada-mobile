import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL!;

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  // Get distinct customer IDs from orders
  const [orderCustomers] = await connection.execute(
    'SELECT DISTINCT customerId FROM orders ORDER BY customerId'
  );
  console.log('Customer IDs in orders:', orderCustomers);
  
  // Get users
  const [users] = await connection.execute(
    'SELECT id, name FROM users WHERE id IN (SELECT DISTINCT customerId FROM orders) LIMIT 15'
  );
  console.log('Users matching order customer IDs:', users);
  
  await connection.end();
}

main().catch(console.error);
