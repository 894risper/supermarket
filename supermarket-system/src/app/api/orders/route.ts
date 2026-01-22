import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken, getTokenFromCookie } from '../../../../lib/auth';
import { initiateSTKPush } from '../../../../lib/mpesa';
import { Order, OrderItem } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = getTokenFromCookie(request.headers.get('cookie'));
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { branchId, items, phoneNumber } = body;

    if (!branchId || !items || items.length === 0 || !phoneNumber) {
      return NextResponse.json(
        { error: 'Branch ID, items, and phone number are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Fetch product details and calculate total
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await db
        .collection('products')
        .findOne({ _id: new ObjectId(item.productId) });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      // Check inventory
      const inventory = await db.collection('inventory').findOne({
        productId: new ObjectId(item.productId),
        branchId: new ObjectId(branchId),
      });

      if (!inventory || inventory.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: new ObjectId(item.productId),
        productName: product.name,
        brand: product.brand,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });
    }

    // Create order
    const order: Partial<Order> = {
      userId: new ObjectId(user.id),
      branchId: new ObjectId(branchId),
      items: orderItems,
      totalAmount,
      paymentStatus: 'pending',
      phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orderResult = await db.collection<Order>('orders').insertOne(order as Order);
    const orderId = orderResult.insertedId.toString();

    console.log('📦 Order created:', orderId);

    // Initiate M-Pesa payment
    try {
      const mpesaResponse = await initiateSTKPush(
        phoneNumber,
        totalAmount,
        orderId,
        'Supermarket Purchase'
      );

      console.log('🎯 M-Pesa CheckoutRequestID:', mpesaResponse.CheckoutRequestID);

      // Update order with checkout request ID
      await db.collection('orders').updateOne(
        { _id: orderResult.insertedId },
        {
          $set: {
            mpesaTransactionId: mpesaResponse.CheckoutRequestID,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        orderId,
        checkoutRequestID: mpesaResponse.CheckoutRequestID,
        message: 'Please complete payment on your phone',
      });
    } catch (mpesaError: any) {
      console.error('❌ M-Pesa initiation failed:', mpesaError);
      
      // Update order status to failed
      await db.collection('orders').updateOne(
        { _id: orderResult.insertedId },
        { 
          $set: { 
            paymentStatus: 'failed',
            updatedAt: new Date() 
          } 
        }
      );

      return NextResponse.json(
        { error: 'Failed to initiate payment. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = getTokenFromCookie(request.headers.get('cookie'));
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDatabase();

    let query = {};
    if (user.role === 'customer') {
      query = { userId: new ObjectId(user.id) };
    }

    const orders = await db
      .collection('orders')
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'branches',
            localField: 'branchId',
            foreignField: '_id',
            as: 'branch',
          },
        },
        { $unwind: '$branch' },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}