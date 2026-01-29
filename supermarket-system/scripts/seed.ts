import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { UserModel, IUser } from '../models/User';
 
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}
 
const IMAGE_URLS = {
  coke: "https://i.pinimg.com/736x/07/64/ca/0764caf32552b630605fc39a17e4d7ab.jpg",
  fanta: "https://i.pinimg.com/736x/8f/8b/fc/8f8bfcd3578f62637a727c7db8f3483f.jpg",
  sprite: "https://i.pinimg.com/1200x/52/64/a2/5264a2e26080eca04e81bee6dbb6da41.jpg",
  redbull: "https://i.pinimg.com/736x/15/e6/3a/15e63a45a4fa5fb166f4ebf47063eb6d.jpg",
  stoney: "https://i.pinimg.com/736x/6d/82/b1/6d82b11b51677f73cb684e0f1abf192d.jpg",
  krest: "https://i.pinimg.com/736x/15/56/54/1556546e6e56296700bc1ff05ed4424c.jpg",
  water: "https://i.pinimg.com/1200x/c8/a1/4f/c8a14fba80083da72669c1389e4b6331.jpg"
};
 
async function fetchImage(url: string, fallbackColor: string): Promise<string> {
  try {
    console.log(`   ⬇️  Downloading image from ${url}...`);
    const response = await fetch(url, {
      headers: { 'User-Agent': 'StudentProject/1.0 (Educational Purpose)' }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.warn(`Failed to download image from ${url}. Using fallback color.`);
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42m${fallbackColor}AAAABJRU5ErkJggg==`;
  }
}

async function seed() {
  try {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing");
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
 
    console.log("⏳ Fetching real images... (This might take a minute)");
    const images = {
      coke: await fetchImage(IMAGE_URLS.coke, "P8z/Pw"), 
      fanta: await fetchImage(IMAGE_URLS.fanta, "Owl/fw"), 
      sprite: await fetchImage(IMAGE_URLS.sprite, "NCT/Pw"),
      stoney: await fetchImage(IMAGE_URLS.stoney, "QU1BAA"),
      krest: await fetchImage(IMAGE_URLS.krest, "MwAA/w"),
      redbull: await fetchImage(IMAGE_URLS.redbull, "VBORw0"),
      water: await fetchImage(IMAGE_URLS.water, "f///Pw")
    };
 
    const products = [
      { name: "Coca-Cola 500ml", brand: "Coca-Cola", price: 70, category: "Soft Drink", image: images.coke },
     
      { name: "Fanta Orange 2L", brand: "Coca-Cola", price: 220, category: "Soft Drink", image: images.fanta },
    
      { name: "Sprite Can 330ml", brand: "Coca-Cola", price: 80, category: "Soft Drink", image: images.sprite },
      { name: "Stoney Tangawizi 500ml", brand: "Coca-Cola", price: 75, category: "Soft Drink", image: images.stoney },
      { name: "Krest Bitter Lemon 500ml", brand: "Coca-Cola", price: 70, category: "Soft Drink", image: images.krest },
      { name: "Red Bull 250ml", brand: "Red Bull", price: 230, category: "Energy Drink", image: images.redbull },
      { name: "Dasani Water 1L", brand: "Coca-Cola", price: 80, category: "Water", image: images.water },
    ];
 
    for (const p of products) {
      await mongoose.connection.db?.collection('products').updateOne(
        { name: p.name },
        { 
          $set: { 
            image: p.image,  
            brand: p.brand,
            category: p.category,
            price: p.price,
            updatedAt: new Date() 
          },
          $setOnInsert: { createdAt: new Date() } 
        },
        { upsert: true }
      );
    }
    console.log(`Seeded ${products.length} products with REAL images`);

     
    const branches = [
      { name: "Nairobi HQ", location: "Nairobi", type: "headquarters" },
      { name: "Kisumu Branch", location: "Kisumu", type: "branch" },
      { name: "Mombasa Branch", location: "Mombasa", type: "branch" },
      { name: "Nakuru Branch", location: "Nakuru", type: "branch" },
      { name: "Eldoret Branch", location: "Eldoret", type: "branch" },
    ];

    for (const b of branches) {
      await mongoose.connection.db?.collection('branches').updateOne(
        { name: b.name },
        { $setOnInsert: { ...b, createdAt: new Date(), updatedAt: new Date() } },
        { upsert: true }
      );
    }
    console.log("Branches seeded");
 
    const usersCollection = mongoose.connection.db?.collection('users');
    if (usersCollection) {
      const existingAdmin = await usersCollection.findOne({ 
        email: process.env.ADMIN_EMAIL?.toLowerCase().trim() 
      });

      if (!existingAdmin && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        await usersCollection.insertOne({
          name: "Admin User",
          email: process.env.ADMIN_EMAIL.toLowerCase().trim(),
          password: hashedPassword,
          phone: process.env.ADMIN_PHONE?.trim(),
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log("✅ Admin created");
      }
    }

    console.log("Database ready! New images are embedded.");
    process.exit(0);
  } catch (error) {
    console.error(" Error:", error);
    process.exit(1);
  }
}

seed();