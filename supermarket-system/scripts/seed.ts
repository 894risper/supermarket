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
  coke: "https://commons.wikimedia.org/wiki/Special:FilePath/Coca-cola_bottle.jpg",
  fanta: "https://commons.wikimedia.org/wiki/Special:FilePath/Fanta_orang_1.jpg",
  sprite: "https://commons.wikimedia.org/wiki/Special:FilePath/Sprite_bottle.JPG",
  redbull: "https://commons.wikimedia.org/wiki/Special:FilePath/8.4_floz_can_of_Red_Bull_Energy_Drink.jpg",
  stoney: "https://commons.wikimedia.org/wiki/Special:FilePath/Stoney_tangawizi.jpg",
  krest: "https://commons.wikimedia.org/wiki/Special:FilePath/Bottle_of_Bitter_Lemon_from_Germany.jpg",  
  water: "https://commons.wikimedia.org/wiki/Special:FilePath/Plastic_water_bottle.jpg"
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
    console.warn(`   ⚠️  Failed to download image. Using fallback color.`); 
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42m${fallbackColor}AAAABJRU5ErkJggg==`;
  }
}

async function seed() {
  try {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing");
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
 
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
      { name: "Fanta Orange 500ml", brand: "Coca-Cola", price: 70, category: "Soft Drink", image: images.fanta },
      { name: "Sprite 500ml", brand: "Coca-Cola", price: 70, category: "Soft Drink", image: images.sprite },
      { name: "Stoney Tangawizi 500ml", brand: "Coca-Cola", price: 75, category: "Soft Drink", image: images.stoney },
      { name: "Krest Bitter Lemon 500ml", brand: "Coca-Cola", price: 70, category: "Soft Drink", image: images.krest },
      { name: "Red Bull 250ml", brand: "Red Bull", price: 230, category: "Energy Drink", image: images.redbull },
      { name: "Keringet Water 1L", brand: "Crown Beverages", price: 80, category: "Water", image: images.water },
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
    console.log("✅ Branches seeded");

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

    console.log("Database ready! Images are embedded.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

seed();