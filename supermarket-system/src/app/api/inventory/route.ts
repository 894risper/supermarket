import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken, getTokenFromCookie } from '../../../../lib/auth';
import { InventoryModel, IInventory } from '../../../../models/Inventory';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('🔍 [INVENTORY] Request started');
  
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const includeAll = searchParams.get('includeAll') === 'true';

    const dbStart = Date.now();
    const db = await getDatabase();
    const dbTime = Date.now() - dbStart;
    console.log(`📊 [INVENTORY] DB connection took ${dbTime}ms`);

    if (includeAll) {
      const queryStart = Date.now();
      
      // SIMPLIFIED: Fetch data separately and combine in memory
      console.log('📦 [INVENTORY] Fetching products (Fanta, Coke, Sprite only)...');
      const allowedBrands = ['Fanta', 'Coke', 'Sprite'];
      
      const products = await db
        .collection('products')
        .find(
          { brand: { $in: allowedBrands } },
          { projection: { _id: 1, name: 1, brand: 1, category: 1, price: 1, image: 1 } }
        )
        // .limit(11) // Safety limit
        .toArray();
      
      // CRITICAL: Verify we're only getting allowed brands
      const filteredProducts = products.filter(p => allowedBrands.includes(p.brand));
      
      console.log(`✅ [INVENTORY] Found ${filteredProducts.length} products:`, filteredProducts.map(p => p.brand));
      
      if (filteredProducts.length === 0) {
        console.warn('⚠️ [INVENTORY] No Fanta/Coke/Sprite products found!');
        return NextResponse.json({ inventory: [] });
      }
      
      console.log('🏢 [INVENTORY] Fetching branches...');
      const branches = await db
        .collection('branches')
        .find({}, { projection: { _id: 1, name: 1, location: 1, code: 1 } })
        .toArray();
      
      console.log(`✅ [INVENTORY] Found ${branches.length} branches`);
      
      console.log('📊 [INVENTORY] Fetching inventory records...');
      const inventoryRecords = await db
        .collection(InventoryModel.collectionName)
        .find({})
        .limit(500) // Safety limit
        .toArray();
      
      console.log(`✅ [INVENTORY] Found ${inventoryRecords.length} inventory records`);
      
      // Create a map for fast inventory lookups
      const inventoryMap = new Map();
      inventoryRecords.forEach(record => {
        const key = `${record.productId.toString()}_${record.branchId.toString()}`;
        inventoryMap.set(key, record);
      });
      
      console.log('🔨 [INVENTORY] Building inventory combinations...');
      const buildStart = Date.now();
      
      // Build all product-branch combinations - ONLY for filtered products
      const inventory = [];
      for (const product of filteredProducts) {
        for (const branch of branches) {
          const key = `${product._id.toString()}_${branch._id.toString()}`;
          const inventoryRecord = inventoryMap.get(key);
          
          inventory.push({
            _id: inventoryRecord?._id || key,
            productId: product._id,
            branchId: branch._id,
            quantity: inventoryRecord?.quantity || 0,
            lastRestocked: inventoryRecord?.lastRestocked,
            createdAt: inventoryRecord?.createdAt || new Date(),
            updatedAt: inventoryRecord?.updatedAt,
            exists: !!inventoryRecord,
            product: {
              _id: product._id,
              name: product.name,
              brand: product.brand,
              category: product.category,
              price: product.price,
              image: product.image
            },
            branch: {
              _id: branch._id,
              name: branch.name,
              location: branch.location,
              code: branch.code
            }
          });
        }
      }
      
      const buildTime = Date.now() - buildStart;
      console.log(`⚡ [INVENTORY] Build took ${buildTime}ms`);
      
      // Sort by branch name, then product brand
      inventory.sort((a, b) => {
        const branchCompare = a.branch.name.localeCompare(b.branch.name);
        if (branchCompare !== 0) return branchCompare;
        return a.product.brand.localeCompare(b.product.brand);
      });

      const queryTime = Date.now() - queryStart;
      const totalTime = Date.now() - startTime;
      
      console.log(`✅ [INVENTORY] Query took ${queryTime}ms`);
      console.log(`✅ [INVENTORY] Total request took ${totalTime}ms`);
      console.log(`✅ [INVENTORY] Built ${inventory.length} inventory items`);

      return NextResponse.json(
        { inventory },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
          }
        }
      );
      
    } else {
      // Original behavior - only show existing inventory records
      const queryStart = Date.now();
      
      let matchQuery = {};
      if (branchId) {
        matchQuery = { branchId: new ObjectId(branchId) };
      }

      const inventory = await db
        .collection(InventoryModel.collectionName)
        .aggregate([
          { $match: matchQuery },
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $lookup: {
              from: 'branches',
              localField: 'branchId',
              foreignField: '_id',
              as: 'branch',
            },
          },
          { $unwind: '$product' },
          { $unwind: '$branch' },
          // Only show Fanta, Coke, Sprite
          { $match: { 'product.brand': { $in: ['Fanta', 'Coke', 'Sprite'] } } },
          { $sort: { 'branch.name': 1, 'product.brand': 1 } }
        ])
        .toArray();

      const queryTime = Date.now() - queryStart;
      const totalTime = Date.now() - startTime;
      
      console.log(`✅ [INVENTORY] Query took ${queryTime}ms`);
      console.log(`✅ [INVENTORY] Total request took ${totalTime}ms`);
      console.log(`✅ [INVENTORY] Found ${inventory.length} inventory records`);

      return NextResponse.json(
        { inventory },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
          }
        }
      );
    }
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ [INVENTORY] Error after ${errorTime}ms:`, error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🔄 [INVENTORY POST] Request started');
  
  try {
    // Verify admin authentication
    const token = getTokenFromCookie(request.headers.get('cookie'));
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { branchId, productId, quantity, action = 'restock' } = body;
    
    console.log(`📝 [INVENTORY POST] Action: ${action}, Quantity: ${quantity}, Branch: ${branchId}, Product: ${productId}`);

    // Validate input using model
    const inventoryData: Partial<IInventory> = {
      branchId: new ObjectId(branchId),
      productId: new ObjectId(productId),
      quantity: parseInt(quantity),
    };

    const validation = InventoryModel.validate(inventoryData);
    if (!validation.valid) {
      console.error(`❌ [INVENTORY POST] Validation failed:`, validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const db = await getDatabase();
    const parsedQuantity = parseInt(quantity);

    let message = '';
    let newQuantity = 0;

    if (action === 'restock') {
      console.log(`📦 [INVENTORY POST] Restocking +${parsedQuantity}`);
      
      // Upsert: create if doesn't exist, increment if exists
      const result = await db.collection(InventoryModel.collectionName).findOneAndUpdate(
        {
          branchId: new ObjectId(branchId),
          productId: new ObjectId(productId),
        },
        {
          $inc: { quantity: parsedQuantity },
          $set: { 
            lastRestocked: new Date(),
            updatedAt: new Date() 
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        {
          upsert: true,
          returnDocument: 'after'
        }
      );
      
      newQuantity = result?.quantity || parsedQuantity;
      message = `Stock restocked successfully. New quantity: ${newQuantity}`;
      console.log(`✅ [INVENTORY POST] Restocked: ${message}`);

    } else if (action === 'set') {
      console.log(`⚙️ [INVENTORY POST] Setting to ${parsedQuantity}`);
      
      // Upsert: create if doesn't exist, set if exists
      const result = await db.collection(InventoryModel.collectionName).findOneAndUpdate(
        {
          branchId: new ObjectId(branchId),
          productId: new ObjectId(productId),
        },
        {
          $set: { 
            quantity: parsedQuantity,
            lastRestocked: new Date(),
            updatedAt: new Date() 
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        {
          upsert: true,
          returnDocument: 'after'
        }
      );
      
      newQuantity = parsedQuantity;
      message = `Stock quantity set to: ${newQuantity}`;
      console.log(`✅ [INVENTORY POST] Set: ${message}`);

    } else if (action === 'deduct') {
      console.log(`➖ [INVENTORY POST] Deducting -${parsedQuantity}`);
      
      // Check if inventory exists and has enough stock
      const existingInventory = await db.collection(InventoryModel.collectionName).findOne({
        branchId: new ObjectId(branchId),
        productId: new ObjectId(productId),
      });

      if (!existingInventory) {
        console.error(`❌ [INVENTORY POST] Inventory not found for deduction`);
        return NextResponse.json({ error: 'Inventory not found' }, { status: 404 });
      }

      console.log(`📊 [INVENTORY POST] Current quantity: ${existingInventory.quantity}`);

      if (existingInventory.quantity < parsedQuantity) {
        console.error(`❌ [INVENTORY POST] Insufficient stock: ${existingInventory.quantity} < ${parsedQuantity}`);
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }

      // Deduct quantity
      const result = await db.collection(InventoryModel.collectionName).findOneAndUpdate(
        {
          branchId: new ObjectId(branchId),
          productId: new ObjectId(productId),
        },
        {
          $inc: { quantity: -parsedQuantity },
          $set: { 
            updatedAt: new Date() 
          },
        },
        {
          returnDocument: 'after'
        }
      );

      newQuantity = result?.quantity || 0;
      message = `Stock deducted successfully. New quantity: ${newQuantity}`;
      console.log(`✅ [INVENTORY POST] Deducted: ${message}`);
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ [INVENTORY POST] Completed in ${totalTime}ms`);

    return NextResponse.json({ 
      success: true,
      message: message,
      quantity: newQuantity,
      action: action
    });
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ [INVENTORY POST] Error after ${errorTime}ms:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove inventory item (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = getTokenFromCookie(request.headers.get('cookie'));
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const productId = searchParams.get('productId');

    if (!branchId || !productId) {
      return NextResponse.json({ error: 'Branch ID and Product ID are required' }, { status: 400 });
    }

    const db = await getDatabase();

    // Check if inventory has any orders
    const hasOrders = await db.collection('orders').findOne({
      'items.productId': new ObjectId(productId),
      branchId: new ObjectId(branchId),
    });

    if (hasOrders) {
      return NextResponse.json(
        { error: 'Cannot delete inventory with existing orders' },
        { status: 400 }
      );
    }

    // Delete the inventory item
    const result = await db.collection(InventoryModel.collectionName).deleteOne({
      branchId: new ObjectId(branchId),
      productId: new ObjectId(productId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Inventory item deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}