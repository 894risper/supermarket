import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { UserModel, IUser } from '../models/User';

// Explicitly load .env.local from root directory
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

// If .env.local doesn't exist, try .env
if (!process.env.MONGODB_URI) {
  const envPathFallback = path.resolve(process.cwd(), '.env');
  console.log('Trying fallback .env from:', envPathFallback);
  dotenv.config({ path: envPathFallback });
}

async function seed() {
  try {
    // Debug output
    console.log('\n=== Environment Variables Check ===');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Loaded' : '✗ Missing');
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? '✓ Loaded' : '✗ Missing');
    console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? '✓ Loaded' : '✗ Missing');
    console.log('===================================\n');

    // Validate required environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined. Make sure .env.local or .env exists in the root directory");
    }
    if (!process.env.ADMIN_EMAIL) {
      throw new Error("ADMIN_EMAIL is not defined");
    }
    if (!process.env.ADMIN_PASSWORD) {
      throw new Error("ADMIN_PASSWORD is not defined");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const usersCollection = db.collection<IUser>(UserModel.collectionName);

    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ 
      email: process.env.ADMIN_EMAIL.toLowerCase().trim()
    });

    if (existingAdmin) {
      console.log("ℹ️  Admin already exists!");
      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      10
    );

    // Create admin user
    const adminUser: Omit<IUser, '_id'> = {
      name: "Admin User",
      email: process.env.ADMIN_EMAIL.toLowerCase().trim(),
      password: hashedPassword,
      phone: process.env.ADMIN_PHONE?.trim(),
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate before inserting
    const validation = UserModel.validate(adminUser);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.error}`);
    }

    // Insert admin user
    await usersCollection.insertOne(adminUser as IUser);
    
    console.log("✅ Admin created successfully!");
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

seed();