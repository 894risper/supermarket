// scripts/check-db.ts
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supermarket';

async function checkDatabase() {
  console.log('🔍 Checking database...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('supermarket');
    
    // List all databases
    const adminDb = client.db().admin();
    const dbList = await adminDb.listDatabases();
    console.log('\n📚 Available databases:');
    dbList.databases.forEach(db => {
      console.log(`  - ${db.name}`);
    });
    
    // List all collections in supermarket db
    const collections = await db.listCollections().toArray();
    console.log('\n📦 Collections in "supermarket" database:');
    collections.forEach(coll => {
      console.log(`  - ${coll.name}`);
    });
    
    // Count users
    const userCount = await db.collection('users').countDocuments();
    console.log(`\n👥 Total users: ${userCount}`);
    
    // Get all users
    if (userCount > 0) {
      const users = await db.collection('users').find({}).toArray();
      console.log('\n👤 User details:');
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`  _id: ${user._id}`);
        console.log(`  name: ${user.name}`);
        console.log(`  email: "${user.email}"`);
        console.log(`  email length: ${user.email?.length}`);
        console.log(`  email bytes:`, Buffer.from(user.email || '').toString('hex'));
        console.log(`  role: ${user.role}`);
        console.log(`  phone: ${user.phone}`);
        console.log(`  hasPassword: ${!!user.password}`);
      });
      
      // Test email lookup
      console.log('\n🔍 Testing email lookups:');
      
      const testEmails = [
        'adminsuper@gmail.com',
        'adminsuper@gmail.com '.trim(),
        'adminsuper@gmail.com'.toLowerCase(),
        'adminsuper@gmail.com'.toLowerCase().trim(),
      ];
      
      for (const testEmail of testEmails) {
        const found = await db.collection('users').findOne({ email: testEmail });
        console.log(`  "${testEmail}" (length: ${testEmail.length}): ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
      }
    } else {
      console.log('⚠️  No users found in database!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkDatabase();