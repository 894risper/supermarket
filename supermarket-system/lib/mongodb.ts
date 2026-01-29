import { MongoClient, Db, MongoClientOptions } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supermarket';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Connection pool configuration for optimal performance
const mongoOptions: MongoClientOptions = {
  // Connection Pool Settings
  maxPoolSize: 10, // Maximum number of connections
  minPoolSize: 2,   // Minimum number of connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // How long to try selecting a server
  socketTimeoutMS: 45000, // How long a send or receive on a socket can take
  
  // Performance Settings
  connectTimeoutMS: 10000, // How long to wait for connection
  heartbeatFrequencyMS: 10000, // How often to check server status
  
  // Retry Settings
  retryWrites: true,
  retryReads: true,
};

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let connectionPromise: Promise<MongoClient> | null = null;

// Performance monitoring
let connectionCount = 0;
let lastConnectionTime = 0;

export async function getDatabase(): Promise<Db> {
  // Return cached database if available
  if (cachedDb && cachedClient) {
    return cachedDb;
  }

  // Prevent multiple simultaneous connection attempts
  if (!connectionPromise) {
    const startTime = Date.now();
    connectionCount++;
    console.log(`📊 MongoDB connection attempt #${connectionCount}`);
    
    connectionPromise = MongoClient.connect(MONGODB_URI, mongoOptions)
      .then(client => {
        const connectionTime = Date.now() - startTime;
        lastConnectionTime = connectionTime;
        console.log(`✅ MongoDB connected successfully in ${connectionTime}ms`);
        cachedClient = client;
        cachedDb = client.db('supermarket');
        connectionPromise = null;
        return client;
      })
      .catch(error => {
        console.error('❌ MongoDB connection failed:', error);
        connectionPromise = null;
        throw error;
      });
  }

  // Wait for connection to complete
  await connectionPromise;

  if (!cachedDb) {
    throw new Error('Database connection failed');
  }

  return cachedDb;
}

export async function closeDatabase(): Promise<void> {
  if (cachedClient) {
    console.log('🔌 Closing MongoDB connection...');
    await cachedClient.close(true); // Force close
    cachedClient = null;
    cachedDb = null;
    connectionCount = 0;
    lastConnectionTime = 0;
    console.log('✅ MongoDB connection closed');
  }
}

// Health check function for monitoring
export async function checkDatabaseHealth(): Promise<{ 
  connected: boolean; 
  connectionTime: number; 
  connectionCount: number;
  poolSize: number;
}> {
  try {
    const db = await getDatabase();
    const client = cachedClient;
    
    return {
      connected: true, // If we got here, connection is working
      connectionTime: lastConnectionTime,
      connectionCount: connectionCount,
      poolSize: mongoOptions.maxPoolSize || 0,
    };
  } catch (error) {
    return {
      connected: false,
      connectionTime: 0,
      connectionCount: connectionCount,
      poolSize: 0,
    };
  }
}

// Graceful shutdown handler
export function setupGracefulShutdown(): void {
  const shutdown = async (signal: string) => {
    console.log(`\n📡 Received ${signal}. Closing MongoDB connection...`);
    try {
      await closeDatabase();
      console.log('✅ MongoDB connection closed gracefully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during MongoDB shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Initialize graceful shutdown if this is the main module
if (require.main === module) {
  setupGracefulShutdown();
}
