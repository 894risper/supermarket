// This endpoint is for TESTING ONLY when sandbox callbacks don't work
// Remove this in production

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken, getTokenFromCookie } from '../../../../../lib/auth';

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
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const db = await getDatabase();

    // Find the order
    const order = await db.collection('orders').findOne({
      _id: new ObjectId(orderId),
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify user owns this order (unless admin)
    if (user.role !== 'admin' && order.userId.toString() !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (order.paymentStatus === 'completed') {
      return NextResponse.json({ error: 'Order already completed' }, { status: 400 });
    }

    // Simulate successful payment
    const mockReceiptNumber = `MOCK${Date.now()}`;

    console.log('🧪 Manually completing order:', orderId);

    // Update order status
    await db.collection('orders').updateOne(
      { _id: order._id },
      {
        $set: {
          paymentStatus: 'completed',
          mpesaReceiptNumber: mockReceiptNumber,
          updatedAt: new Date(),
        },
      }
    );

    // Reduce inventory
    for (const item of order.items) {
      await db.collection('inventory').updateOne(
        {
          productId: item.productId,
          branchId: order.branchId,
        },
        {
          $inc: { quantity: -item.quantity },
        }
      );
    }

    // Create transaction record
    await db.collection('transactions').insertOne({
      orderId: order._id,
      mpesaReceiptNumber: mockReceiptNumber,
      phoneNumber: order.phoneNumber,
      amount: order.totalAmount,
      transactionDate: new Date(),
      status: 'success',
      checkoutRequestID: order.mpesaTransactionId || 'MANUAL',
    });

    console.log('✅ Order manually completed:', orderId);

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully (TEST MODE)',
      receiptNumber: mockReceiptNumber,
    });
  } catch (error) {
    console.error('Error completing order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}