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

    const users = await db.collection('users').find({}).toArray();
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}