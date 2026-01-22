import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 M-Pesa Callback Received!');
    console.log('🔍 Full Callback Body:', JSON.stringify(body, null, 2));

    const { Body } = body;
    
    if (!Body || !Body.stkCallback) {
      console.log('⚠️ No stkCallback in body - ignoring');
      return NextResponse.json({ success: true });
    }

    const { stkCallback } = Body;
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    console.log('🆔 CheckoutRequestID:', CheckoutRequestID);
    console.log('✅ ResultCode:', ResultCode);
    console.log('📝 ResultDesc:', ResultDesc);

    const db = await getDatabase();

    // Find the order with this checkout request ID
    const order = await db.collection('orders').findOne({
      mpesaTransactionId: CheckoutRequestID,
    });

    if (!order) {
      console.error('❌ Order not found for CheckoutRequestID:', CheckoutRequestID);
      return NextResponse.json({ success: true });
    }

    console.log('📦 Order found:', order._id);

    if (ResultCode === 0) {
      // Payment successful
      let mpesaReceiptNumber = '';
      let phoneNumber = '';
      let amount = 0;

      if (CallbackMetadata && CallbackMetadata.Item) {
        for (const item of CallbackMetadata.Item) {
          if (item.Name === 'MpesaReceiptNumber') {
            mpesaReceiptNumber = item.Value;
          }
          if (item.Name === 'PhoneNumber') {
            phoneNumber = item.Value;
          }
          if (item.Name === 'Amount') {
            amount = item.Value;
          }
        }
      }

      console.log('💰 Amount:', amount);
      console.log('📱 Phone:', phoneNumber);
      console.log('🧾 Receipt:', mpesaReceiptNumber);

      // Update order status
      await db.collection('orders').updateOne(
        { _id: order._id },
        {
          $set: {
            paymentStatus: 'completed',
            mpesaReceiptNumber,
            updatedAt: new Date(),
          },
        }
      );

      console.log('✅ Order status updated to completed');

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

      console.log('✅ Inventory updated');

      // Create transaction record
      await db.collection('transactions').insertOne({
        orderId: order._id,
        mpesaReceiptNumber,
        phoneNumber,
        amount,
        transactionDate: new Date(),
        status: 'success',
        checkoutRequestID: CheckoutRequestID,
      });

      console.log('✅ Transaction record created');
      console.log('🎉 Payment successful for order:', order._id);
    } else {
      // Payment failed
      await db.collection('orders').updateOne(
        { _id: order._id },
        {
          $set: {
            paymentStatus: 'failed',
            updatedAt: new Date(),
          },
        }
      );

      console.log('❌ Payment failed for order:', order._id, ResultDesc);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('💥 M-Pesa callback error:', error);
    return NextResponse.json({ success: true }); // Always return success to M-Pesa
  }
}