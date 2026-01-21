import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Use the EXACT same URI as your app
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI not found in environment variables');
  console.error('Make sure you have a .env.local file with MONGODB_URI');
  console.error('Current working directory:', process.cwd());
  console.error('Looking for .env.local at:', path.resolve(process.cwd(), '.env.local'));
  process.exit(1);
}

// TypeScript safety check
const mongoUri: string = MONGODB_URI;

async function seed() {
  console.log('🌱 Starting database seed...');
  console.log('📡 MongoDB URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//*****:*****@'));
  
  const client = new MongoClient(mongoUri);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Use the EXACT same database name as your app
    const db = client.db('supermarket');
    console.log('📊 Using database: supermarket');

    // First, let's see what's currently in the database
    console.log('\n🔍 Checking current database state...');
    const currentUsers = await db.collection('users').find({}).toArray();
    console.log('Current users in database:', currentUsers.length);
    if (currentUsers.length > 0) {
      console.log('Current users:', currentUsers.map(u => ({ email: u.email, role: u.role })));
    }

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    const deleteResult = await db.collection('users').deleteMany({});
    console.log('Deleted', deleteResult.deletedCount, 'users');
    
    await db.collection('branches').deleteMany({});
    await db.collection('products').deleteMany({});
    await db.collection('inventory').deleteMany({});
    await db.collection('orders').deleteMany({});
    await db.collection('transactions').deleteMany({});
    console.log('✅ Cleared all collections');

    // Create admin user
    console.log('\n👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('Admin@123456', 10);
    console.log('🔐 Password hashed successfully');
    
    const adminResult = await db.collection('users').insertOne({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: adminPassword,
      role: 'admin',
      phone: '254700000000',
      createdAt: new Date(),
    });
    
    console.log('✅ Admin user inserted with ID:', adminResult.insertedId);
    console.log('Acknowledged:', adminResult.acknowledged);

    // VERIFY the admin was actually inserted
    console.log('\n🔍 Verifying admin user...');
    const adminCheck = await db.collection('users').findOne({ email: 'admin@gmail.com' });
    if (adminCheck) {
      console.log('✅ VERIFIED: Admin user found in database');
      console.log('   Email:', adminCheck.email);
      console.log('   Role:', adminCheck.role);
      console.log('   ID:', adminCheck._id);
    } else {
      console.error('❌ CRITICAL ERROR: Admin user NOT found after insertion!');
      process.exit(1);
    }

    // Create sample customers
    console.log('\n👥 Creating sample customers...');
    const customerPassword = await bcrypt.hash('Customer@123', 10);
    const customersResult = await db.collection('users').insertMany([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: customerPassword,
        role: 'customer',
        phone: '254700111111',
        createdAt: new Date(),
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: customerPassword,
        role: 'customer',
        phone: '254700222222',
        createdAt: new Date(),
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: customerPassword,
        role: 'customer',
        phone: '254700333333',
        createdAt: new Date(),
      },
    ]);
    console.log('✅ Created', Object.keys(customersResult.insertedIds).length, 'customers');

    // Create branches
    console.log('\n🏢 Creating branches...');
    const branchesResult = await db.collection('branches').insertMany([
      {
        name: 'Nairobi Headquarters',
        location: 'Nairobi',
        code: 'NRB-HQ',
        isHeadquarter: true,
      },
      {
        name: 'Kisumu Branch',
        location: 'Kisumu',
        code: 'KSM-01',
        isHeadquarter: false,
      },
      {
        name: 'Mombasa Branch',
        location: 'Mombasa',
        code: 'MBA-01',
        isHeadquarter: false,
      },
      {
        name: 'Nakuru Branch',
        location: 'Nakuru',
        code: 'NKU-01',
        isHeadquarter: false,
      },
      {
        name: 'Eldoret Branch',
        location: 'Eldoret',
        code: 'ELD-01',
        isHeadquarter: false,
      },
    ]);
    console.log('✅ Created', Object.keys(branchesResult.insertedIds).length, 'branches');

    // Create products
    console.log('\n🥤 Creating products...');
    const productsResult = await db.collection('products').insertMany([
      {
        name: 'Coca-Cola 500ml',
        brand: 'Coke',
        price: 60,
        image: '/images/coke.png',
      },
      {
        name: 'Fanta Orange 500ml',
        brand: 'Fanta',
        price: 60,
        image: '/images/fanta.png',
      },
      {
        name: 'Sprite 500ml',
        brand: 'Sprite',
        price: 60,
        image: '/images/sprite.png',
      },
    ]);
    console.log('✅ Created', Object.keys(productsResult.insertedIds).length, 'products');

    // Create inventory
    console.log('\n📦 Creating inventory...');
    const branchIds = Object.values(branchesResult.insertedIds);
    const productIds = Object.values(productsResult.insertedIds);

    const inventoryItems = [];
    for (const branchId of branchIds) {
      for (const productId of productIds) {
        inventoryItems.push({
          productId,
          branchId,
          quantity: 100,
          lastRestocked: new Date(),
        });
      }
    }

    await db.collection('inventory').insertMany(inventoryItems);
    console.log('✅ Created', inventoryItems.length, 'inventory items');

    // Create indexes
    console.log('\n🔍 Creating indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('inventory').createIndex({ productId: 1, branchId: 1 });
    await db.collection('orders').createIndex({ userId: 1 });
    await db.collection('orders').createIndex({ branchId: 1 });
    await db.collection('transactions').createIndex({ orderId: 1 });
    console.log('✅ Indexes created');

    // FINAL VERIFICATION - List ALL users
    console.log('\n🔍 FINAL VERIFICATION:');
    console.log('==================');
    const allUsers = await db.collection('users').find({}).toArray();
    console.log('Total users in database:', allUsers.length);
    console.log('\nAll users:');
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.name}`);
    });

    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('==================');
    console.log('✅ Admin Email: admin@gmail.com');
    console.log('✅ Admin Password: Admin@123456');
    console.log('\n✅ Sample Customers:');
    console.log('   - john@example.com / Customer@123');
    console.log('   - jane@example.com / Customer@123');
    console.log('   - bob@example.com / Customer@123');
    console.log('==================\n');

    console.log('🎉 Database seeded successfully!');
    console.log('🎯 You should now be able to login with admin@gmail.com');
    
  } catch (error) {
    console.error('\n💥 ERROR seeding database:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Database connection closed');
  }
}

seed();