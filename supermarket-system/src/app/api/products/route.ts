import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';
import { Product } from '../../../../types';

export async function GET() {
  try {
    const db = await getDatabase();
    
    const products = await db
      .collection<Product>('products')
      .find({})
      .toArray();

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}