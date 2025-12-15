/**
 * Seed script to populate the Okada Admin database with sample data
 * Run with: node scripts/seed-data.mjs
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed Riders
    console.log('📦 Seeding riders...');
    const riders = [
      { name: 'Emmanuel Nguema', phone: '+237670001001', email: 'emmanuel@okada.cm', vehicleType: 'motorcycle', vehicleNumber: 'CM-YDE-001', status: 'approved', rating: 48, totalDeliveries: 156, acceptanceRate: 95 },
      { name: 'Pierre Kamga', phone: '+237670001002', email: 'pierre@okada.cm', vehicleType: 'motorcycle', vehicleNumber: 'CM-YDE-002', status: 'approved', rating: 46, totalDeliveries: 89, acceptanceRate: 92 },
      { name: 'Jean-Baptiste Fotso', phone: '+237670001003', email: 'jb@okada.cm', vehicleType: 'motorcycle', vehicleNumber: 'CM-YDE-003', status: 'approved', rating: 49, totalDeliveries: 234, acceptanceRate: 98 },
      { name: 'Samuel Mbarga', phone: '+237670001004', email: 'samuel@okada.cm', vehicleType: 'bicycle', vehicleNumber: 'CM-YDE-004', status: 'approved', rating: 45, totalDeliveries: 67, acceptanceRate: 88 },
      { name: 'David Nkomo', phone: '+237670001005', email: 'david@okada.cm', vehicleType: 'motorcycle', vehicleNumber: 'CM-YDE-005', status: 'pending', rating: 0, totalDeliveries: 0, acceptanceRate: 0 },
      { name: 'Michel Atangana', phone: '+237670001006', email: 'michel@okada.cm', vehicleType: 'motorcycle', vehicleNumber: 'CM-YDE-006', status: 'approved', rating: 47, totalDeliveries: 178, acceptanceRate: 94 },
    ];

    for (const rider of riders) {
      await connection.execute(
        `INSERT INTO riders (name, phone, email, vehicleType, vehicleNumber, status, rating, totalDeliveries, acceptanceRate) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), status=VALUES(status), rating=VALUES(rating)`,
        [rider.name, rider.phone, rider.email, rider.vehicleType, rider.vehicleNumber, rider.status, rider.rating, rider.totalDeliveries, rider.acceptanceRate]
      );
    }
    console.log(`✅ Seeded ${riders.length} riders\n`);

    // Seed Categories
    console.log('📦 Seeding categories...');
    const categories = [
      { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories' },
      { name: 'Food & Groceries', slug: 'food-groceries', description: 'Fresh food and grocery items' },
      { name: 'Fashion', slug: 'fashion', description: 'Clothing and fashion accessories' },
      { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and garden supplies' },
      { name: 'Health & Beauty', slug: 'health-beauty', description: 'Health and beauty products' },
    ];

    for (const cat of categories) {
      await connection.execute(
        `INSERT INTO categories (name, slug, description, isActive) 
         VALUES (?, ?, ?, true)
         ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        [cat.name, cat.slug, cat.description]
      );
    }
    console.log(`✅ Seeded ${categories.length} categories\n`);

    // Get category IDs
    const [catRows] = await connection.execute('SELECT id, slug FROM categories');
    const categoryMap = {};
    for (const row of catRows) {
      categoryMap[row.slug] = row.id;
    }

    // Seed Products
    console.log('📦 Seeding products...');
    const products = [
      { name: 'Samsung Galaxy A54', slug: 'samsung-galaxy-a54', description: 'Latest Samsung smartphone', price: 25000000, categorySlug: 'electronics', stock: 50 },
      { name: 'iPhone 15 Case', slug: 'iphone-15-case', description: 'Protective case for iPhone 15', price: 500000, categorySlug: 'electronics', stock: 200 },
      { name: 'Fresh Plantains (5kg)', slug: 'fresh-plantains-5kg', description: 'Fresh local plantains', price: 250000, categorySlug: 'food-groceries', stock: 100 },
      { name: 'Ndolé Spice Mix', slug: 'ndole-spice-mix', description: 'Traditional Cameroonian spice blend', price: 150000, categorySlug: 'food-groceries', stock: 150 },
      { name: 'African Print Dress', slug: 'african-print-dress', description: 'Beautiful African print dress', price: 1500000, categorySlug: 'fashion', stock: 30 },
      { name: 'Men\'s Polo Shirt', slug: 'mens-polo-shirt', description: 'Cotton polo shirt', price: 800000, categorySlug: 'fashion', stock: 75 },
      { name: 'Solar Panel 100W', slug: 'solar-panel-100w', description: '100W solar panel for home use', price: 4500000, categorySlug: 'home-garden', stock: 20 },
      { name: 'Shea Butter (500g)', slug: 'shea-butter-500g', description: 'Pure African shea butter', price: 350000, categorySlug: 'health-beauty', stock: 80 },
    ];

    for (const prod of products) {
      const categoryId = categoryMap[prod.categorySlug] || 1;
      await connection.execute(
        `INSERT INTO products (name, slug, description, price, categoryId, stock, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, true)
         ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), stock=VALUES(stock)`,
        [prod.name, prod.slug, prod.description, prod.price, categoryId, prod.stock]
      );
    }
    console.log(`✅ Seeded ${products.length} products\n`);

    // Get user IDs for orders
    const [userRows] = await connection.execute('SELECT id, name FROM users LIMIT 10');
    const userIds = userRows.map(u => u.id);
    
    // Get rider IDs
    const [riderRows] = await connection.execute('SELECT id FROM riders WHERE status = "approved" LIMIT 5');
    const riderIds = riderRows.map(r => r.id);

    if (userIds.length === 0) {
      console.log('⚠️ No users found, skipping order seeding');
    } else {
      // Seed Orders
      console.log('📦 Seeding orders...');
      const orderStatuses = ['pending', 'confirmed', 'rider_assigned', 'in_transit', 'quality_verification', 'delivered', 'delivered', 'delivered'];
      const paymentMethods = ['mtn_money', 'orange_money', 'cash'];
      const addresses = [
        'Rue de la Joie, Bastos, Yaoundé',
        'Avenue Kennedy, Bonapriso, Douala',
        'Quartier Fouda, Yaoundé',
        'Akwa Nord, Douala',
        'Nlongkak, Yaoundé',
        'Bonanjo, Douala',
        'Mvan, Yaoundé',
        'Deido, Douala',
      ];

      for (let i = 1; i <= 25; i++) {
        const orderNumber = `ORD-${String(i).padStart(4, '0')}`;
        const customerId = userIds[Math.floor(Math.random() * userIds.length)];
        const riderId = riderIds.length > 0 ? riderIds[Math.floor(Math.random() * riderIds.length)] : null;
        const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
        const subtotal = Math.floor(Math.random() * 5000000) + 500000; // 5,000 - 50,000 FCFA
        const deliveryFee = 150000; // 1,500 FCFA
        const total = subtotal + deliveryFee;
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const paymentStatus = status === 'delivered' ? 'paid' : (Math.random() > 0.3 ? 'paid' : 'pending');
        const address = addresses[Math.floor(Math.random() * addresses.length)];

        try {
          await connection.execute(
            `INSERT INTO orders (orderNumber, customerId, riderId, status, subtotal, deliveryFee, total, paymentMethod, paymentStatus, deliveryAddress) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status=VALUES(status), paymentStatus=VALUES(paymentStatus)`,
            [orderNumber, customerId, riderId, status, subtotal, deliveryFee, total, paymentMethod, paymentStatus, address]
          );
        } catch (err) {
          console.log(`  Skipping order ${orderNumber}: ${err.message}`);
        }
      }
      console.log(`✅ Seeded 25 orders\n`);
    }

    // Seed Sellers (requires userId from users table)
    console.log('📦 Seeding sellers...');
    if (userIds.length >= 4) {
      const sellers = [
        { userId: userIds[0], businessName: 'TechZone Cameroon', businessType: 'Electronics', businessEmail: 'alain@techzone.cm', businessPhone: '+237699001001', businessAddress: 'Akwa, Douala', status: 'approved', commissionRate: 10 },
        { userId: userIds[1], businessName: 'Fresh Market Yaoundé', businessType: 'Food & Groceries', businessEmail: 'marie@freshmarket.cm', businessPhone: '+237699001002', businessAddress: 'Mokolo, Yaoundé', status: 'approved', commissionRate: 8 },
        { userId: userIds[2], businessName: 'Fashion Hub CM', businessType: 'Fashion', businessEmail: 'grace@fashionhub.cm', businessPhone: '+237699001003', businessAddress: 'Bonapriso, Douala', status: 'approved', commissionRate: 12 },
        { userId: userIds[3], businessName: 'Home Essentials', businessType: 'Home & Garden', businessEmail: 'paul@homeessentials.cm', businessPhone: '+237699001004', businessAddress: 'Bastos, Yaoundé', status: 'pending', commissionRate: 10 },
      ];

      for (const seller of sellers) {
        try {
          await connection.execute(
            `INSERT INTO sellers (userId, businessName, businessType, businessEmail, businessPhone, businessAddress, status, commissionRate) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE businessName=VALUES(businessName), status=VALUES(status)`,
            [seller.userId, seller.businessName, seller.businessType, seller.businessEmail, seller.businessPhone, seller.businessAddress, seller.status, seller.commissionRate]
          );
        } catch (err) {
          console.log(`  Skipping seller ${seller.businessName}: ${err.message}`);
        }
      }
      console.log(`✅ Seeded ${sellers.length} sellers\n`);
    } else {
      console.log('⚠️ Not enough users to seed sellers\n');
    }

    // Seed Delivery Zones
    console.log('📦 Seeding delivery zones...');
    const zones = [
      { name: 'Yaoundé Centre', city: 'Yaoundé', baseFee: 100000, perKmFee: 5000, minDeliveryTime: 30, maxDeliveryTime: 60 },
      { name: 'Douala Centre', city: 'Douala', baseFee: 100000, perKmFee: 5000, minDeliveryTime: 30, maxDeliveryTime: 60 },
      { name: 'Yaoundé Périphérie', city: 'Yaoundé', baseFee: 150000, perKmFee: 7500, minDeliveryTime: 45, maxDeliveryTime: 90 },
    ];

    for (const zone of zones) {
      try {
        await connection.execute(
          `INSERT INTO deliveryZones (name, city, baseFee, perKmFee, minDeliveryTime, maxDeliveryTime, isActive) 
           VALUES (?, ?, ?, ?, ?, ?, true)
           ON DUPLICATE KEY UPDATE baseFee=VALUES(baseFee), perKmFee=VALUES(perKmFee)`,
          [zone.name, zone.city, zone.baseFee, zone.perKmFee, zone.minDeliveryTime, zone.maxDeliveryTime]
        );
      } catch (err) {
        console.log(`  Skipping zone ${zone.name}: ${err.message}`);
      }
    }
    console.log(`✅ Seeded ${zones.length} delivery zones\n`);

    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seed().catch(console.error);
