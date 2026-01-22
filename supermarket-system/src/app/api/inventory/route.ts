import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken, getTokenFromCookie } from '../../../../lib/auth';
import { InventoryModel, IInventory } from '../../../../models/Inventory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    const db = await getDatabase();

    let query = {};
    if (branchId) {
      query = { branchId: new ObjectId(branchId) };
    }

    const inventory = await db
      .collection(InventoryModel.collectionName)
      .aggregate([
        { $match: query },
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
      ])
      .toArray();

    return NextResponse.json({ inventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { branchId, productId, quantity } = body;

    // Validate input using model
    const inventoryData: Partial<IInventory> = {
      branchId: new ObjectId(branchId),
      productId: new ObjectId(productId),
      quantity: parseInt(quantity),
    };

    const validation = InventoryModel.validate(inventoryData);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const db = await getDatabase();

    // Update inventory (increment quantity)
    const result = await db.collection(InventoryModel.collectionName).updateOne(
      {
        branchId: new ObjectId(branchId),
        productId: new ObjectId(productId),
      },
      {
        $inc: { quantity: parseInt(quantity) },
        $set: { 
          lastRestocked: new Date(),
          updatedAt: new Date() 
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Inventory not found' }, { status: 404 });
    }

    // Get updated inventory
    const updated = await db.collection(InventoryModel.collectionName).findOne({
      branchId: new ObjectId(branchId),
      productId: new ObjectId(productId),
    });

    return NextResponse.json({ 
      success: true,
      message: `Stock updated successfully. New quantity: ${updated?.quantity}`,
      quantity: updated?.quantity 
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}