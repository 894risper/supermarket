import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
 
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}
 
const IMAGE_URLS = {
  // SPRITE
  sprite_350: "https://cdn.mafrservices.com/sys-master-root/h35/h81/12456183660574/24163_Main.jpg",
  sprite_500: "https://i.pinimg.com/736x/84/03/3f/84033f0645848001966edd4347972a87.jpg",
  sprite_1L: "https://i.pinimg.com/1200x/35/71/03/357103e7e8c65e39dfc6f2728bdb1c2a.jpg",
  sprite_2L: "https://i.pinimg.com/1200x/3f/49/15/3f4915c095dd2f9ea15045bc1acce1c3.jpg",
  sprite_can: "https://i.pinimg.com/736x/52/92/42/529242d6e0132d261c2c4b60b85b8ba5.jpg",

  // FANTA BLACKCURRANT
  fanta_black_can: "https://i.pinimg.com/736x/9c/16/a7/9c16a7f7a6e1b72a28eb40579a009202.jpg",
  fanta_black_350: "https://beestondelight.com/wp-content/uploads/2024/07/Fanta-Blackcurrant-Flavoured-Drink-350ml.jpg",
  fanta_black_500: "https://greenspoon.co.ke/wp-content/uploads/2024/06/Greenspoon-fanta-black-current-1-of-1.jpg",
  fanta_black_1L: "https://justdrinks.co.ke/wp-content/uploads/2022/09/fanta-blackcurrant-240x240-1.jpg",
  fanta_black_2L: "https://mybigorder.com/public/uploads/products/meta/5zPAc0QClp7lsKTFz2LKzQzz5k0LdPeOHJ4ilZyd.jpeg",

  // FANTA ORANGE
  fanta_orange_can: "https://i.pinimg.com/1200x/c6/82/d0/c682d02db522ae12a4326f7e540ae211.jpg",
  fanta_orange_350: "https://dialacoke.com/media/catalog/product/cache/ea9fd91bf69f7931ab0fc6320db4b8ac/f/a/fanta-orange-pet-350ml.jpg",
  fanta_orange_500: "https://i.pinimg.com/736x/59/95/ca/5995ca0eaab3b64559a9d82e281b19c7.jpg",
  fanta_orange_1L: "https://i.pinimg.com/1200x/0c/55/d5/0c55d53c665f8cf0f7bfd2e25674551d.jpg",
  fanta_orange_2L: "https://i.pinimg.com/736x/d6/e6/e3/d6e6e36e5a9bc939d5f62bfd2054c7d2.jpg",

  // FANTA PINEAPPLE
  fanta_pine_can: "https://i.pinimg.com/1200x/1b/02/64/1b0264420e0708dbb615c7c75c27faa8.jpg",
  fanta_pine_350: "https://i.pinimg.com/1200x/25/fb/ed/25fbed90da02bbbefacb84bdbfc85f62.jpg",
  fanta_pine_500: "https://i.pinimg.com/736x/60/e6/89/60e6894d1964dbf35e25e4a37b6e9518.jpg",
  fanta_pine_2L: "https://i.pinimg.com/736x/d9/97/c4/d997c46a57026c9db8718d2f9429302a.jpg",

  // FANTA PASSION
  fanta_passion_500: "https://cdn.mafrservices.com/sys-master-root/h15/h17/17290167549982/24174_main.jpg",
  fanta_passion_2L: "https://greenspoon.co.ke/wp-content/uploads/2024/06/Greenspoon-Fanta-passion-1-of-1-1.jpg",

  // COKE
  coke_can: "https://i.pinimg.com/736x/c9/34/52/c93452c803770f81619856fa3a2a3df9.jpg",
  coke_500: "https://i.pinimg.com/1200x/f9/95/26/f99526974c02e2bffda82dd34e8bc023.jpg",
  coke_1L: "https://i.pinimg.com/1200x/e7/c9/f4/e7c9f4c93ee35fb53d50e9bc8f2d11db.jpg",
  coke_2L: "https://i.pinimg.com/736x/5a/fc/3c/5afc3cf2152c89c6296d38c0e0953606.jpg",
};
 
async function fetchImage(url: string, fallbackColor: string): Promise<string> {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'StudentProject/1.0' } });
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    return `data:image/jpeg;base64,${Buffer.from(arrayBuffer).toString('base64')}`;
  } catch (error) {
    console.warn(`Could not download ${url}. Using fallback.`);
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42m${fallbackColor}AAAABJRU5ErkJggg==`;
  }
}

async function seed() {
  try {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
 
    console.log("🧹 Clearing old products...");
    await mongoose.connection.db?.collection('products').deleteMany({});

    // 2. DOWNLOAD IMAGES
    console.log("⏳ Downloading images... (This may take 1 minute)");
    const images = {
      // Sprite
      sprite_350: await fetchImage(IMAGE_URLS.sprite_350, "NCT/Pw"),
      sprite_500: await fetchImage(IMAGE_URLS.sprite_500, "NCT/Pw"),
      sprite_1L: await fetchImage(IMAGE_URLS.sprite_1L, "NCT/Pw"),
      sprite_2L: await fetchImage(IMAGE_URLS.sprite_2L, "NCT/Pw"),
      sprite_can: await fetchImage(IMAGE_URLS.sprite_can, "NCT/Pw"),
      
      // Fanta Blackcurrant
      fanta_black_can: await fetchImage(IMAGE_URLS.fanta_black_can, "MgAA/w"),
      fanta_black_350: await fetchImage(IMAGE_URLS.fanta_black_350, "MgAA/w"),
      fanta_black_500: await fetchImage(IMAGE_URLS.fanta_black_500, "MgAA/w"),
      fanta_black_1L: await fetchImage(IMAGE_URLS.fanta_black_1L, "MgAA/w"),
      fanta_black_2L: await fetchImage(IMAGE_URLS.fanta_black_2L, "MgAA/w"),

      // Fanta Orange
      fanta_orange_can: await fetchImage(IMAGE_URLS.fanta_orange_can, "Owl/fw"),
      fanta_orange_350: await fetchImage(IMAGE_URLS.fanta_orange_350, "Owl/fw"),
      fanta_orange_500: await fetchImage(IMAGE_URLS.fanta_orange_500, "Owl/fw"),
      fanta_orange_1L: await fetchImage(IMAGE_URLS.fanta_orange_1L, "Owl/fw"),
      fanta_orange_2L: await fetchImage(IMAGE_URLS.fanta_orange_2L, "Owl/fw"),

      // Fanta Pineapple
      fanta_pine_can: await fetchImage(IMAGE_URLS.fanta_pine_can, "zkAAPw"),
      fanta_pine_350: await fetchImage(IMAGE_URLS.fanta_pine_350, "zkAAPw"),
      fanta_pine_500: await fetchImage(IMAGE_URLS.fanta_pine_500, "zkAAPw"),
      fanta_pine_2L: await fetchImage(IMAGE_URLS.fanta_pine_2L, "zkAAPw"),

      // Fanta Passion
      fanta_passion_500: await fetchImage(IMAGE_URLS.fanta_passion_500, "KwAA/w"),
      fanta_passion_2L: await fetchImage(IMAGE_URLS.fanta_passion_2L, "KwAA/w"),

      // Coke
      coke_can: await fetchImage(IMAGE_URLS.coke_can, "P8z/Pw"),
      coke_500: await fetchImage(IMAGE_URLS.coke_500, "P8z/Pw"),
      coke_1L: await fetchImage(IMAGE_URLS.coke_1L, "P8z/Pw"),
      coke_2L: await fetchImage(IMAGE_URLS.coke_2L, "P8z/Pw"),
    };
 
    const products = [
      // Sprite
      { name: "Sprite 350ml", brand: "Sprite", category: "Soda", price: 50, image: images.sprite_350 },
      { name: "Sprite 500ml", brand: "Sprite", category: "Soda", price: 70, image: images.sprite_500 },
      { name: "Sprite Can 330ml", brand: "Sprite", category: "Soda", price: 80, image: images.sprite_can },
      { name: "Sprite 1L", brand: "Sprite", category: "Soda", price: 130, image: images.sprite_1L },
      { name: "Sprite 2L", brand: "Sprite", category: "Soda", price: 220, image: images.sprite_2L },

      // Fanta Blackcurrant
      { name: "Fanta Blackcurrent Can", brand: "Fanta", category: "Soda", price: 80, image: images.fanta_black_can },
      { name: "Fanta Blackcurrent 350ml", brand: "Fanta", category: "Soda", price: 50, image: images.fanta_black_350 },
      { name: "Fanta Blackcurrent 500ml", brand: "Fanta", category: "Soda", price: 70, image: images.fanta_black_500 },
      { name: "Fanta Blackcurrent 1L", brand: "Fanta", category: "Soda", price: 130, image: images.fanta_black_1L },
      { name: "Fanta Blackcurrent 2L", brand: "Fanta", category: "Soda", price: 220, image: images.fanta_black_2L },

      // Fanta Orange
      { name: "Fanta Orange Can", brand: "Fanta", category: "Soda", price: 80, image: images.fanta_orange_can },
      { name: "Fanta Orange 350ml", brand: "Fanta", category: "Soda", price: 50, image: images.fanta_orange_350 },
      { name: "Fanta Orange 500ml", brand: "Fanta", category: "Soda", price: 70, image: images.fanta_orange_500 },
      { name: "Fanta Orange 1L", brand: "Fanta", category: "Soda", price: 130, image: images.fanta_orange_1L },
      { name: "Fanta Orange 2L", brand: "Fanta", category: "Soda", price: 220, image: images.fanta_orange_2L },

      // Fanta Pineapple
      { name: "Fanta Pineapple Can", brand: "Fanta", category: "Soda", price: 80, image: images.fanta_pine_can },
      { name: "Fanta Pineapple 350ml", brand: "Fanta", category: "Soda", price: 50, image: images.fanta_pine_350 },
      { name: "Fanta Pineapple 500ml", brand: "Fanta", category: "Soda", price: 70, image: images.fanta_pine_500 },
      { name: "Fanta Pineapple 2L", brand: "Fanta", category: "Soda", price: 220, image: images.fanta_pine_2L },

      // Fanta Passion
      { name: "Fanta Passion 500ml", brand: "Fanta", category: "Soda", price: 70, image: images.fanta_passion_500 },
      { name: "Fanta Passion 2L", brand: "Fanta", category: "Soda", price: 220, image: images.fanta_passion_2L },

      // Coke
      { name: "Coke Can 330ml", brand: "Coke", category: "Soda", price: 80, image: images.coke_can },
      { name: "Coke 500ml", brand: "Coke", category: "Soda", price: 70, image: images.coke_500 },
      { name: "Coke 1L", brand: "Coke", category: "Soda", price: 130, image: images.coke_1L },
      { name: "Coke 2L", brand: "Coke", category: "Soda", price: 220, image: images.coke_2L },
    ];
 
    await mongoose.connection.db?.collection('products').insertMany(
      products.map(p => ({ ...p, createdAt: new Date(), updatedAt: new Date() }))
    );
    console.log(`✅ Seeded ${products.length} products`);
 
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
      const existingAdmin = await usersCollection.findOne({ email: process.env.ADMIN_EMAIL?.toLowerCase().trim() });
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
        console.log("Admin created");
      }
    }

    console.log("Database refreshed with new products!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

seed();