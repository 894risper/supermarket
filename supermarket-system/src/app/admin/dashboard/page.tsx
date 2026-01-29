'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  ArrowUpRight, 
  Package, 
  Store,
  LogOut,
  TrendingUp,
  CreditCard
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    ordersCount: 0,
    customers: 0,
    lowStock: 0,
    recentOrders: []
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Dashboard load failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col"> 
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900 p-2 rounded-lg text-white">
              <Store size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600 font-medium">Administrator</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-gray-600 hover:text-red-700 rounded-lg transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-700 mt-1 font-medium">Here is what's happening in your supermarket today.</p>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-gray-600">Total Revenue</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-2">KES {stats.revenue.toLocaleString()}</h3>
              </div>
              <div className="bg-green-100 p-2 rounded-lg text-green-700">
                <CreditCard size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-700 font-bold">
              <TrendingUp size={14} className="mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>
 
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-gray-600">Total Orders</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-2">{stats.ordersCount}</h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                <ShoppingBag size={20} />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600 font-medium">Processed successfully</div>
          </div>
 
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-gray-600">Active Customers</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-2">{stats.customers}</h3>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600 font-medium">Registered accounts</div>
          </div>
 
          <div 
            onClick={() => router.push('/admin/inventory')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-gray-600">Low Stock Alerts</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-2">{stats.lowStock}</h3>
              </div>
              <div className="bg-orange-100 p-2 rounded-lg text-orange-700">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="mt-4 text-xs text-orange-700 font-bold flex items-center gap-1 group-hover:underline">
              View Inventory <ArrowUpRight size={12}/>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 text-xs text-gray-700 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-3 text-left">Order ID</th>
                    <th className="px-6 py-3 text-left">Amount</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentOrders.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-600 font-medium">No recent orders found</td></tr>
                  ) : (
                    stats.recentOrders.map((order: any) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold font-mono text-gray-700">#{order._id.slice(-6).toUpperCase()}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">KES {order.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
 
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/admin/inventory')}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                    <Package size={20} />
                  </div>
                  <span className="text-sm font-bold text-gray-800 group-hover:text-blue-900">Manage Inventory</span>
                </div>
                <ArrowUpRight size={18} className="text-gray-400 group-hover:text-blue-600" />
              </button>

              <button 
                onClick={() => router.push('/admin/reports')}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:bg-green-50 hover:border-green-300 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-700">
                    <BarChart3 size={20} />
                  </div>
                  <span className="text-sm font-bold text-gray-800 group-hover:text-green-900">View Sales Reports</span>
                </div>
                <ArrowUpRight size={18} className="text-gray-400 group-hover:text-green-600" />
              </button>

              <button 
                onClick={() => router.push('/admin/users')}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:bg-purple-50 hover:border-purple-300 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
                    <Users size={20} />
                  </div>
                  <span className="text-sm font-bold text-gray-800 group-hover:text-purple-900">User Management</span>
                </div>
                <ArrowUpRight size={18} className="text-gray-400 group-hover:text-purple-600" />
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}