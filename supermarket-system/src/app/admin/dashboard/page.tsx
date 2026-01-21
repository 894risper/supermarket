'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart3, Package, DollarSign, LogOut, RefreshCw } from 'lucide-react';

interface SalesReport {
  salesByBranch: Array<{
    branchId: string;
    branch: string;
    brandSales: Array<{
      brand: string;
      quantity: number;
      revenue: number;
    }>;
    totalRevenue: number;
  }>;
  brandTotals: Array<{
    brand: string;
    quantity: number;
    revenue: number;
  }>;
  grandTotal: number;
}

interface InventoryItem {
  _id: string;
  quantity: number;
  product: {
    _id: string;
    name: string;
    brand: string;
  };
  branch: {
    _id: string;
    name: string;
  };
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'sales'>('overview');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    fetchData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user, router]);

  const fetchData = async () => {
    try {
      const [salesRes, inventoryRes] = await Promise.all([
        axios.get('/api/reports/sales'),
        axios.get('/api/inventory'),
      ]);
      setSalesReport(salesRes.data);
      setInventory(inventoryRes.data.inventory);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleRestock = async (branchId: string, productId: string, quantity: number) => {
    try {
      await axios.post('/api/inventory', { branchId, productId, quantity });
      toast.success('Inventory updated successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update inventory');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchData}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <RefreshCw size={20} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            {[
              { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
              { id: 'inventory' as const, label: 'Inventory', icon: Package },
              { id: 'sales' as const, label: 'Sales Report', icon: DollarSign },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                      KES {salesReport?.grandTotal.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Branches</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {salesReport?.salesByBranch.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Products Sold</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {salesReport?.brandTotals.reduce((sum, b) => sum + b.quantity, 0) || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Performance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Sales by Brand</h3>
              <div className="space-y-4">
                {salesReport?.brandTotals.map((brand) => (
                  <div key={brand.brand} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {brand.brand === 'Coke' ? '🥤' : brand.brand === 'Fanta' ? '🍊' : '✨'}
                      </span>
                      <div>
                        <p className="font-semibold">{brand.brand}</p>
                        <p className="text-sm text-gray-600">{brand.quantity} units sold</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      KES {brand.revenue.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Inventory Management</h3>
              <p className="text-sm text-gray-600">Restock branches from headquarters</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventory.map((item) => (
                    <tr key={item._id} className={item.quantity < 20 ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.branch.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.quantity < 20 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.quantity} units
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleRestock(item.branch._id, item.product._id, 50)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Restock +50
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sales Report Tab */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            {salesReport?.salesByBranch.map((branchSales) => (
              <div key={branchSales.branchId} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{branchSales.branch}</h3>
                  <p className="text-xl font-bold text-blue-600">
                    KES {branchSales.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  {branchSales.brandSales.map((brandSale) => (
                    <div key={brandSale.brand} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {brandSale.brand === 'Coke' ? '🥤' : brandSale.brand === 'Fanta' ? '🍊' : '✨'}
                        </span>
                        <div>
                          <p className="font-medium">{brandSale.brand}</p>
                          <p className="text-sm text-gray-600">{brandSale.quantity} units</p>
                        </div>
                      </div>
                      <p className="font-bold text-green-600">
                        KES {brandSale.revenue.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-100">Grand Total Revenue</p>
                  <p className="text-4xl font-bold">KES {salesReport?.grandTotal.toLocaleString()}</p>
                </div>
                <DollarSign size={48} className="text-blue-200" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}