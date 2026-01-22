import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';
import { verifyToken,getTokenFromCookie } from '../../../../lib/auth';
import { BranchModel, IBranch } from '../../../../models/Branch';
import { ObjectId } from 'mongodb';

// GET - Fetch all branches
export async function GET() {
  try {
    const db = await getDatabase();
    
    const branches = await db
      .collection<IBranch>(BranchModel.collectionName)
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

// POST - Create new branch (Admin only)
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
    
    // Sanitize input
    const sanitizedData = BranchModel.sanitize(body);
    
    // Validate input
    const validation = BranchModel.validate(sanitizedData);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const db = await getDatabase();

    // Check if code already exists
    const existingBranch = await db
      .collection(BranchModel.collectionName)
      .findOne({ code: sanitizedData.code });
      
    if (existingBranch) {
      return NextResponse.json(
        { error: 'Branch code already exists' },
        { status: 409 }
      );
    }

    // Create branch
    const branchData: IBranch = {
      name: sanitizedData.name!,
      location: sanitizedData.location!,
      code: sanitizedData.code!,
      isHeadquarter: sanitizedData.isHeadquarter || false,
      createdAt: new Date(),
    };

    const result = await db
      .collection(BranchModel.collectionName)
      .insertOne(branchData);

    // Create inventory entries for all products in this new branch
    const products = await db.collection('products').find({}).toArray();
    if (products.length > 0) {
      const inventoryItems = products.map((product) => ({
        productId: product._id,
        branchId: result.insertedId,
        quantity: 0,
        lastRestocked: new Date(),
        createdAt: new Date(),
      }));
      await db.collection('inventory').insertMany(inventoryItems);
      console.log(`✅ Created ${inventoryItems.length} inventory entries for new branch`);
    }

    return NextResponse.json({
      success: true,
      branchId: result.insertedId,
      message: 'Branch created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating branch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update branch (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromCookie(request.headers.get('cookie'));
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { branchId, name, location, code, isHeadquarter } = body;

    if (!branchId) {
      return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 });
    }

    const db = await getDatabase();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (code) updateData.code = code;
    if (isHeadquarter !== undefined) updateData.isHeadquarter = isHeadquarter;

    const result = await db.collection('branches').updateOne(
      { _id: new ObjectId(branchId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete branch (Admin only)
export async function DELETE(request: NextRequest) {
  try {
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

    if (!branchId) {
      return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 });
    }

    const db = await getDatabase();

    // Check if branch has any orders
    const hasOrders = await db.collection('orders').findOne({
      branchId: new ObjectId(branchId),
    });

    if (hasOrders) {
      return NextResponse.json(
        { error: 'Cannot delete branch with existing orders' },
        { status: 400 }
      );
    }

    // Delete inventory for this branch
    await db.collection('inventory').deleteMany({
      branchId: new ObjectId(branchId),
    });

    // Delete the branch
    const result = await db.collection('branches').deleteOne({
      _id: new ObjectId(branchId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}