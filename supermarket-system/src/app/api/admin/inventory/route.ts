import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await connectDB();
    const db = mongoose.connection.db; 
    
    if (!db) {
      throw new Error('Database not connected');
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    if (!branchId) return NextResponse.json({ error: 'Branch ID required' }, { status: 400 });

    const products = await db.collection('products').find({}).toArray();
    const inventory = await db.collection('inventory').find({ branchId: new mongoose.Types.ObjectId(branchId) }).toArray();

    const merged = products.map(p => {
      const item = inventory.find(i => i.productId.toString() === p._id.toString());
      return {
        ...p,
        quantity: item ? item.quantity : 0 
      };
    });

    return NextResponse.json(merged);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
 
    if (!db) {
      throw new Error('Database not connected');
    }

    const { branchId, productId, quantity } = await request.json();

    await db.collection('inventory').updateOne(
      { 
        branchId: new mongoose.Types.ObjectId(branchId),
        productId: new mongoose.Types.ObjectId(productId)
      },
      { $set: { quantity: parseInt(quantity), updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}