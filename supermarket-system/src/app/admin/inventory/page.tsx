'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Search, Store } from 'lucide-react';

export default function InventoryPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      const res = await axios.get('/api/branches');
      setBranches(res.data.branches || []);
      if (res.data.branches?.length > 0) {
        setSelectedBranch(res.data.branches[0]._id);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) loadInventory();
  }, [selectedBranch]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/inventory?branchId=${selectedBranch}`);
      setProducts(res.data);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (id: string, newQty: string) => {
    setProducts(products.map(p => p._id === id ? { ...p, quantity: parseInt(newQty) || 0 } : p));
  };

  const handleSave = async (product: any) => {
    try {
      await axios.post('/api/admin/inventory', {
        branchId: selectedBranch,
        productId: product._id,
        quantity: product.quantity
      });
      toast.success(`Updated ${product.name}`);
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700">
              <ArrowLeft size={20}/>
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-900">Inventory Management</h1>
          </div>
          
          {/* Branch Selector */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-300 shadow-sm">
            <Store size={20} className="text-blue-700 ml-2" />
            <select 
              value={selectedBranch} 
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent font-bold text-gray-900 outline-none p-2 cursor-pointer"
            >
              {branches.map(b => <option key={b._id} value={b._id} className="text-gray-900">{b.name}</option>)}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 placeholder-gray-500 font-medium"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide">Product Name</th>
                <th className="p-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide">Brand</th>
                <th className="p-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide">Current Stock</th>
                <th className="p-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide">Update</th>
                <th className="p-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-600 font-medium">Loading inventory...</td></tr>
              ) : filteredProducts.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{p.name}</td>
                  <td className="p-4 font-medium text-gray-700">{p.brand}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${p.quantity < 50 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {p.quantity} units
                    </span>
                  </td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      value={p.quantity} 
                      onChange={(e) => handleQuantityChange(p._id, e.target.value)}
                      className="w-24 p-2 border border-gray-300 rounded font-bold text-gray-900 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleSave(p)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-bold shadow-sm active:scale-95"
                    >
                      <Save size={16} /> Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}