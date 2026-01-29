import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db'; 
import mongoose from 'mongoose';

export async function GET() {
  try { 
    await connectDB();
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection failed');
    }
 
    const salesStats = await db.collection('orders').aggregate([
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$totalAmount' }, 
          totalOrders: { $count: {} } 
        } 
      }
    ]).toArray();
 
    const recentOrders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
 
    const lowStockCount = await db.collection('inventory').countDocuments({ quantity: { $lt: 50 } });

    
    const customerCount = await db.collection('users').countDocuments({ role: 'customer' });

  
    return NextResponse.json({
      revenue: salesStats[0]?.totalRevenue || 0,
      ordersCount: salesStats[0]?.totalOrders || 0,
      customers: customerCount,
      lowStock: lowStockCount,
      recentOrders: recentOrders
    });

  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}