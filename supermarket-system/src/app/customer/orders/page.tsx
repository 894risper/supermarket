// orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, CheckCircle, XCircle, Clock, ShoppingBag } from 'lucide-react';

interface Order {
  _id: string;
  items: Array<{
    productName: string;
    brand: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  mpesaReceiptNumber?: string;
  phoneNumber: string;
  createdAt: string;
  branch: {
    name: string;
    location: string;
  };
}

export default function CustomerOrders() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingOrder, setCompletingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      router.push('/auth/login');
      return;
    }
    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setLoading(false);
    }
  };

  const completePayment = async (orderId: string) => {
    if (!confirm('Complete this payment manually? (Test Mode Only)')) {
      return;
    }

    setCompletingOrder(orderId);
    try {
      const response = await axios.post('/api/orders/complete', { orderId });
      alert(response.data.message);
      fetchOrders(); // Refresh the orders
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to complete payment');
    } finally {
      setCompletingOrder(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'failed':
        return <XCircle className="text-red-500" size={24} />;
      default:
        return <Clock className="text-yellow-500" size={24} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.push('/customer/shop')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Shop</span>
            </button>
            <h1 className="ml-8 text-xl font-bold text-gray-900">My Orders</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sandbox Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Test Mode:</strong> If payment stays pending after 30 seconds, 
            use the "Complete Payment" button below. Sandbox callbacks may not work reliably on localhost.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No orders yet</p>
            <button
              onClick={() => router.push('/customer/shop')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-mono text-gray-500">
                      ID: {order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-900 font-medium mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      📍 {order.branch.name}, {order.branch.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.paymentStatus)}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.paymentStatus)}`}>
                      {getStatusText(order.paymentStatus)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-3"> 
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                            <ShoppingBag size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-blue-600 font-semibold uppercase">{item.brand}</p>
                            <p className="text-sm text-gray-500">
                              {item.quantity} × KES {item.price}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900">KES {item.subtotal.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total Amount</span>
                    <span className="font-bold text-xl text-gray-900">
                      KES {order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  {order.mpesaReceiptNumber && (
                    <p className="text-xs text-green-600 mt-1 font-mono">
                      Ref: {order.mpesaReceiptNumber}
                    </p>
                  )} 

                  {order.paymentStatus === 'pending' && (
                    <button
                      onClick={() => completePayment(order._id)}
                      disabled={completingOrder === order._id}
                      className="mt-3 w-full bg-white border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {completingOrder === order._id ? 'Processing...' : 'Complete Payment'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}