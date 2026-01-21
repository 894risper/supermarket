import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../../lib/mongodb';
import { verifyToken, getTokenFromCookie } from '../../../../../lib/auth';

export async function GET(request: NextRequest) {
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

    const db = await getDatabase();

    // Get all completed orders with branch and product details
    const salesData = await db
      .collection('orders')
      .aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'branches',
            localField: 'branchId',
            foreignField: '_id',
            as: 'branch',
          },
        },
        { $unwind: '$branch' },
        {
          $group: {
            _id: {
              branchId: '$branchId',
              branchName: '$branch.name',
              brand: '$items.brand',
            },
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.subtotal' },
          },
        },
        {
          $group: {
            _id: {
              branchId: '$_id.branchId',
              branchName: '$_id.branchName',
            },
            brandSales: {
              $push: {
                brand: '$_id.brand',
                quantity: '$quantity',
                revenue: '$revenue',
              },
            },
            totalRevenue: { $sum: '$revenue' },
          },
        },
        {
          $project: {
            _id: 0,
            branchId: '$_id.branchId',
            branch: '$_id.branchName',
            brandSales: 1,
            totalRevenue: 1,
          },
        },
        { $sort: { totalRevenue: -1 } },
      ])
      .toArray();

    // Calculate grand totals
    let grandTotal = 0;
    const brandTotals: Record<string, { quantity: number; revenue: number }> = {
      Coke: { quantity: 0, revenue: 0 },
      Fanta: { quantity: 0, revenue: 0 },
      Sprite: { quantity: 0, revenue: 0 },
    };

    salesData.forEach((branchData) => {
      grandTotal += branchData.totalRevenue;
      branchData.brandSales.forEach((brandSale: any) => {
        if (brandTotals[brandSale.brand]) {
          brandTotals[brandSale.brand].quantity += brandSale.quantity;
          brandTotals[brandSale.brand].revenue += brandSale.revenue;
        }
      });
    });

    return NextResponse.json({
      salesByBranch: salesData,
      brandTotals: Object.entries(brandTotals).map(([brand, data]) => ({
        brand,
        ...data,
      })),
      grandTotal,
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}