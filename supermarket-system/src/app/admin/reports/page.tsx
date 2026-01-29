'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ArrowLeft, TrendingUp, DollarSign } from 'lucide-react';

export default function ReportsPage() {
  const [data, setData] = useState({ salesByBranch: [], topProducts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/reports').then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-700 font-bold">Generating reports...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700">
            <ArrowLeft size={20}/>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">Sales Reports</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Sales by Branch */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <DollarSign className="text-green-700" /> Revenue by Branch
            </h3>
            <div className="space-y-6">
              {data.salesByBranch.length === 0 ? <p className="text-gray-600 italic">No sales data yet.</p> : 
                data.salesByBranch.map((branch: any) => (
                  <div key={branch._id} className="group">
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-gray-800">{branch.name}</span>
                      <span className="text-gray-900">KES {branch.total.toLocaleString()}</span>
                    </div>
                    {/* CSS Bar Chart */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: `${Math.min((branch.total / 100000) * 100, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 font-medium text-right">{branch.count} orders</p>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Card 2: Top Products */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <TrendingUp className="text-blue-700" /> Top Selling Products
            </h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-800 font-bold uppercase text-xs">
                <tr>
                  <th className="p-3 text-left rounded-l-lg">Product</th>
                  <th className="p-3 text-right">Units</th>
                  <th className="p-3 text-right rounded-r-lg">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.topProducts.map((p: any, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-bold text-gray-800">{p._id}</td>
                    <td className="p-3 text-right font-medium text-gray-600">{p.sold}</td>
                    <td className="p-3 text-right font-extrabold text-gray-900">KES {p.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}