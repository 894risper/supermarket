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
    category: string;
    price: number;
    image?: string;
  };
  branch: {
    _id: string;
    name: string;
    location: string;
    code: string;
  };
  exists: boolean;
  lastRestocked?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

interface Branch {
  _id: string;
  name: string;
  location: string;
  code: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'sales'>('overview');
  
  // Inventory filters
  const [filterBranch, setFilterBranch] = useState<string>('');
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [filterStock, setFilterStock] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

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

  // Calculate filtered inventory
  const filteredInventory = inventory.filter(item => {
    // Filter by branch
    if (filterBranch && item.branch._id !== filterBranch) {
      return false;
    }
    
    // Filter by brand
    if (filterBrand && item.product.brand !== filterBrand) {
      return false;
    }
    
    // Filter by stock level
    if (filterStock) {
      const hasStock = item.quantity > 0;
      const isLow = item.quantity < 20;
      const isMedium = item.quantity >= 20 && item.quantity < 50;
      const isGood = item.quantity >= 50;
      
      switch (filterStock) {
        case 'out': return !hasStock;
        case 'low': return isLow;
        case 'medium': return isMedium;
        case 'good': return isGood;
        default: return true;
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = item.product.name.toLowerCase().includes(searchLower);
      const matchesBrand = item.product.brand.toLowerCase().includes(searchLower);
      const matchesCategory = item.product.category.toLowerCase().includes(searchLower);
      const matchesBranch = item.branch.name.toLowerCase().includes(searchLower);
      
      return matchesName || matchesBrand || matchesCategory || matchesBranch;
    }
    
    return true;
  });

  const fetchData = async () => {
    try {
      const [salesRes, inventoryRes, branchesRes] = await Promise.all([
        axios.get('/api/reports/sales'),
        axios.get('/api/inventory?includeAll=true'),
        axios.get('/api/branches'),
      ]);
      setSalesReport(salesRes.data);
      setInventory(inventoryRes.data.inventory);
      setBranches(branchesRes.data.branches || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleRestock = async (branchId: string, productId: string, quantity: number, action: 'restock' | 'set' | 'deduct' = 'restock') => {
    try {
      await axios.post('/api/inventory', { branchId, productId, quantity, action });
      toast.success('Inventory updated successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update inventory');
    }
  };

  const handleStockAdjustment = async (branchId: string, productId: string, newQuantity: number) => {
    try {
      await axios.post('/api/inventory', { 
        branchId, 
        productId, 
        quantity: newQuantity, 
        action: 'set' 
      });
      toast.success('Stock quantity adjusted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to adjust stock');
    }
  };

  const handleStockDeduction = async (branchId: string, productId: string, quantity: number) => {
    try {
      await axios.post('/api/inventory', { 
        branchId, 
        productId, 
        quantity, 
        action: 'deduct' 
      });
      toast.success('Stock deducted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to deduct stock');
    }
  };

  const handleDeleteInventory = async (branchId: string, productId: string) => {
    try {
      await axios.delete(`/api/inventory?branchId=${branchId}&productId=${productId}`);
      toast.success('Inventory item deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete inventory item');
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
                <span>Logout</span>
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
          <div className="space-y-6">
            {/* Filters and Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:justify-between md:items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Inventory Management</h3>
                  <p className="text-sm text-gray-600">Manage stock levels across all branches</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Good Stock ≥ 50</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Medium Stock 20-49</span>
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Low Stock less than 20</span>
                </div>
              </div>
              
              {/* Inventory Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Total Products</h4>
                  <p className="text-2xl font-bold text-blue-600">{inventory.length}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Low Stock Items</h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    {inventory.filter(item => item.quantity < 20).length}
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Out of Stock</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {inventory.filter(item => item.quantity === 0).length}
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Branches</h4>
                  <p className="text-2xl font-bold text-purple-600">{branches.length}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-4">
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Branches</option>
                  {branches.map(branch => (
                    <option key={branch._id} value={branch._id}>{branch.name}</option>
                  ))}
                </select>
                
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Brands</option>
                  {Array.from(new Set(inventory.map(item => item.product.brand))).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>

                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Stock Levels</option>
                  <option value="out">Out of Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="medium">Medium Stock</option>
                  <option value="good">Good Stock</option>
                </select>

                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Inventory by Branch - Collapsible Cards */}
            <div className="space-y-4">
              {branches.map(branch => {
                const branchInventory = filteredInventory.filter(item => item.branch._id === branch._id);
                if (branchInventory.length === 0) return null;

                return (
                  <div key={branch._id} className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{branch.name}</h4>
                          <p className="text-sm text-gray-600">{branch.location}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">Total Products: {branchInventory.length}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            branchInventory.filter(item => item.quantity === 0).length > 0 ? 'bg-red-100 text-red-800' :
                            branchInventory.filter(item => item.quantity < 20).length > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {branchInventory.filter(item => item.quantity === 0).length > 0 ? '⚠️ Issues' :
                             branchInventory.filter(item => item.quantity < 20).length > 0 ? '⚠️ Low Stock' :
                             '✅ All Good'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Products Grid */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {branchInventory.map((item) => (
                          <div key={item._id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                            item.quantity === 0 ? 'border-red-200 bg-red-50' : 
                            item.quantity < 20 ? 'border-orange-200 bg-orange-50' : 
                            item.quantity < 50 ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
                          }`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">
                                    {item.product.brand === 'Coke' ? '🥤' : 
                                     item.product.brand === 'Fanta' ? '🍊' : '✨'}
                                  </span>
                                  <h5 className="font-semibold text-gray-900">{item.product.name}</h5>
                                </div>
                                <p className="text-sm text-gray-600">{item.product.brand} • {item.product.category}</p>
                              </div>
                              <div className="text-right">
                                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  item.quantity === 0 ? 'bg-red-100 text-red-800' :
                                  item.quantity < 20 ? 'bg-orange-100 text-orange-800' :
                                  item.quantity < 50 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {item.quantity} units
                                </div>
                                {item.quantity === 0 && (
                                  <span className="text-xs text-red-600 font-medium block mt-1">OUT OF STOCK</span>
                                )}
                                {item.quantity > 0 && item.quantity < 20 && (
                                  <span className="text-xs text-orange-600 font-medium block mt-1">LOW</span>
                                )}
                                {item.quantity >= 50 && (
                                  <span className="text-xs text-green-600 font-medium block mt-1">GOOD</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleRestock(item.branch._id, item.product._id, 50)}
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs transition-colors"
                              >
                                +50
                              </button>
                              <button
                                onClick={() => handleRestock(item.branch._id, item.product._id, 100)}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs transition-colors"
                              >
                                +100
                              </button>
                              {item.quantity > 0 && (
                                <button
                                  onClick={() => handleStockDeduction(item.branch._id, item.product._id, 1)}
                                  className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 text-xs transition-colors"
                                >
                                  -1
                                </button>
                              )}
                              {item.exists && (
                                <button
                                  onClick={() => handleDeleteInventory(item.branch._id, item.product._id)}
                                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            
                            {/* Manual adjustment */}
                            <div className="flex gap-2 mt-3">
                              <input
                                type="number"
                                placeholder="Set qty"
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const target = e.target as HTMLInputElement;
                                    const newQty = parseInt(target.value);
                                    if (newQty >= 0) {
                                      handleStockAdjustment(item.branch._id, item.product._id, newQty);
                                      target.value = '';
                                    }
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  const input = document.querySelector('input[placeholder="Set qty"]') as HTMLInputElement;
                                  const newQty = parseInt(input.value);
                                  if (newQty >= 0) {
                                    handleStockAdjustment(item.branch._id, item.product._id, newQty);
                                    input.value = '';
                                  }
                                }}
                                className="bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 text-xs transition-colors"
                              >
                                Set
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredInventory.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-500">
                  No inventory items found matching your filters.
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => {
                    const lowStockItems = filteredInventory.filter(item => item.quantity < 20);
                    lowStockItems.forEach(item => {
                      handleRestock(item.branch._id, item.product._id, 50);
                    });
                    toast.success(`Restocked ${lowStockItems.length} low stock items`);
                  }}
                  className="bg-yellow-600 text-white p-4 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <div className="text-lg font-semibold">Restock Low Items</div>
                  <div className="text-sm opacity-90">{filteredInventory.filter(item => item.quantity < 20).length} items</div>
                </button>
                
                <button
                  onClick={() => {
                    const outOfStockItems = filteredInventory.filter(item => item.quantity === 0);
                    outOfStockItems.forEach(item => {
                      handleRestock(item.branch._id, item.product._id, 100);
                    });
                    toast.success(`Restocked ${outOfStockItems.length} out of stock items`);
                  }}
                  className="bg-red-600 text-white p-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <div className="text-lg font-semibold">Restock Empty</div>
                  <div className="text-sm opacity-90">{filteredInventory.filter(item => item.quantity === 0).length} items</div>
                </button>

                <button
                  onClick={() => {
                    // Get unique products across all branches
                    const uniqueProducts = filteredInventory.reduce((acc, item) => {
                      const existing = acc.find(p => p.productId === item.product._id);
                      if (!existing) {
                        acc.push({
                          productId: item.product._id,
                          productName: item.product.name,
                          brand: item.product.brand
                        });
                      }
                      return acc;
                    }, [] as Array<{productId: string, productName: string, brand: string}>);

                    // Create inventory for all branches for each product
                    uniqueProducts.forEach(product => {
                      branches.forEach((branch: Branch) => {
                        handleRestock(branch._id, product.productId, 0); // Just ensure inventory exists
                      });
                    });
                    toast.success('Synced all branches');
                  }}
                  className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <div className="text-lg font-semibold">Sync All Branches</div>
                  <div className="text-sm opacity-90">Ensure all products in all branches</div>
                </button>

                <button
                  onClick={() => {
                    // Reset all inventory to zero (for testing/clearing)
                    if (confirm('Are you sure you want to reset all inventory to zero? This cannot be undone.')) {
                      filteredInventory.forEach(item => {
                        handleStockAdjustment(item.branch._id, item.product._id, 0);
                      });
                      toast.success('Reset all inventory');
                    }
                  }}
                  className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="text-lg font-semibold">Reset All</div>
                  <div className="text-sm opacity-90">Set all to zero</div>
                </button>
              </div>
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

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
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