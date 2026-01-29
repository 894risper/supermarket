import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    const db = mongoose.connection.db;
 
    if (!db) {
      throw new Error('Database not connected');
    }

    const salesByBranch = await db.collection('orders').aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: '$branchId', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branch' } },
      { $unwind: '$branch' },
      { $project: { name: '$branch.name', total: 1, count: 1 } }
    ]).toArray();

    const topProducts = await db.collection('orders').aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.productName', sold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.subtotal' } } },
      { $sort: { sold: -1 } },
      { $limit: 5 }
    ]).toArray();

    return NextResponse.json({ salesByBranch, topProducts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}