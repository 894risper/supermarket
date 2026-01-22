import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supermarket';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  if (!cachedClient) {
    console.log('📊 Connecting to MongoDB...');
    cachedClient = new MongoClient(MONGODB_URI);
    await cachedClient.connect();
  }

  // CRITICAL: Explicitly use 'supermarket' database
  cachedDb = cachedClient.db('supermarket');
  
  console.log('📊 Connected to database:', cachedDb.databaseName);

  return cachedDb;
}

export async function closeDatabase(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}