'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ArrowLeft, User, ShieldCheck } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/users').then(res => {
      setUsers(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="p-2 bg-white rounded-lg border hover:bg-gray-50 text-gray-700">
            <ArrowLeft size={20}/>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">User Management</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Name</th>
                <th className="p-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Email</th>
                <th className="p-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Role</th>
                <th className="p-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-600 font-bold">Loading users...</td></tr>
              ) : users.map((user: any) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  
                  {/* Name Column */}
                  <td className="p-4 font-bold text-gray-900 flex items-center gap-3">
                    <div className={`p-2 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role === 'admin' ? <ShieldCheck size={18}/> : <User size={18}/>}
                    </div>
                    {user.name}
                  </td>
 
                  <td className="p-4 font-medium text-gray-700">{user.email}</td>
 
                  <td className="p-4">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wide">
                        ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-gray-100 text-gray-800 border border-gray-200 uppercase tracking-wide">
                        CUSTOMER
                      </span>
                    )}
                  </td>
 
                  <td className="p-4 text-gray-700 font-medium text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
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