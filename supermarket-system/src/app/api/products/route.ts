// products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';
import { verifyToken, getTokenFromCookie } from '../../../../lib/auth';
import { ProductModel, IProduct } from '../../../../models/Product';
import { ObjectId } from 'mongodb';

// GET - Fetch all products
export async function GET() {
  try {
    const db = await getDatabase();
    
    const products = await db
      .collection<IProduct>(ProductModel.collectionName)
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

// POST - Create new product (Admin only)
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
    const sanitized = ProductModel.sanitize(body);
    
    // Validate input
    const validation = ProductModel.validate(sanitized);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const db = await getDatabase();

    // Create product
    const productData: IProduct = {
      name: sanitized.name!,
      brand: sanitized.brand!,
      category: sanitized.category || 'General',
      price: sanitized.price!,
      image: sanitized.image || '',
      createdAt: new Date(),
    };

    const result = await db
      .collection(ProductModel.collectionName)
      .insertOne(productData);

    // Create inventory entries for all branches for this new product
    const branches = await db.collection('branches').find({}).toArray();
    if (branches.length > 0) {
      const inventoryItems = branches.map((branch) => ({
        productId: result.insertedId,
        branchId: branch._id,
        quantity: 0,
        createdAt: new Date(),
      }));
      await db.collection('inventory').insertMany(inventoryItems);
      console.log(`✅ Created ${inventoryItems.length} inventory entries for new product`);
    }

    return NextResponse.json({
      success: true,
      productId: result.insertedId,
      message: 'Product created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update product (Admin only)
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
    const { productId, ...updateData } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Sanitize and validate update data
    const sanitized = ProductModel.sanitize(updateData);
    const validation = ProductModel.validate(sanitized);
    
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const db = await getDatabase();

    const updateFields: any = {};
    if (sanitized.name) updateFields.name = sanitized.name;
    if (sanitized.brand) updateFields.brand = sanitized.brand;
    if (sanitized.category) updateFields.category = sanitized.category;
    if (sanitized.price !== undefined) updateFields.price = sanitized.price;
    if (sanitized.image !== undefined) updateFields.image = sanitized.image;
    updateFields.updatedAt = new Date();

    const result = await db.collection(ProductModel.collectionName).updateOne(
      { _id: new ObjectId(productId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Product updated successfully' 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product (Admin only)
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
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const db = await getDatabase();

    // Check if product has any orders
    const hasOrders = await db.collection('orders').findOne({
      'items.productId': new ObjectId(productId),
    });

    if (hasOrders) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders' },
        { status: 400 }
      );
    }

    // Delete inventory for this product
    await db.collection('inventory').deleteMany({
      productId: new ObjectId(productId),
    });

    // Delete the product
    const result = await db.collection(ProductModel.collectionName).deleteOne({
      _id: new ObjectId(productId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}