'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, CheckCircle, XCircle, Clock, MapPin, Calendar, ShoppingBag, Store } from 'lucide-react';

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
 
const BrandIcon = ({ brand }: { brand: string }) => {
  const b = brand.toLowerCase();
  if (b.includes('coke') || b.includes('coca')) return <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">C</div>;
  if (b.includes('fanta')) return <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">F</div>;
  if (b.includes('sprite')) return <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">S</div>;
  return <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs">{brand.charAt(0)}</div>;
};

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
    setCompletingOrder(orderId);
    try {
      await axios.post('/api/orders/complete', { orderId });
      fetchOrders(); // Refresh UI
    } catch (error: any) {
      alert('Failed to update status');
    } finally {
      setCompletingOrder(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
            <CheckCircle size={14} /> Paid
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            <XCircle size={14} /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
            <Clock size={14} /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12"> 
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/customer/shop')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Order History</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Store size={18} />
              </div>
              <span className="font-bold text-gray-900 text-sm hidden sm:inline">SuperMart</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Looks like you haven't made your first purchase. The drinks are waiting!</p>
            <button
              onClick={() => router.push('/customer/shop')}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                
                 
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">#{order._id.slice(-6)}</span>
                      {getStatusBadge(order.paymentStatus)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock size={12}/> {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-medium mb-0.5">Total Amount</p>
                    <p className="text-xl font-extrabold text-gray-900">KES {order.totalAmount.toLocaleString()}</p>
                  </div>
                </div>

                
                <div className="px-6 py-4 space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <BrandIcon brand={item.brand} />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{item.productName}</p>
                          <p className="text-xs text-gray-500 font-medium">{item.quantity} x KES {item.price}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">KES {item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div> 

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-blue-600" />
                    <span className="font-medium">Pickup: <span className="text-gray-900">{order.branch.name}</span></span>
                  </div>
 
                  {order.paymentStatus === 'pending' && (
                    <button
                      onClick={() => completePayment(order._id)}
                      disabled={completingOrder === order._id}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {completingOrder === order._id ? 'Verifying...' : 'Confirm payment'}
                    </button>
                  )}
                  
                  {order.mpesaReceiptNumber && (
                    <span className="text-xs font-mono text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
                      Ref: {order.mpesaReceiptNumber}
                    </span>
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