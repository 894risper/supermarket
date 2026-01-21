import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';
import { Branch } from '../../../../types';

export async function GET() {
  try {
    const db = await getDatabase();
    
    const branches = await db
      .collection<Branch>('branches')
      .find({})
      .toArray();

    return NextResponse.json({ branches });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}