'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ShoppingCart, LogOut, Package, ImageOff, Store, Filter, XCircle } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  image?: string;
}

interface Branch {
  _id: string;
  name: string;
  location: string;
  code: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CustomerShop() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // NEW: Filter state for "Coke", "Fanta", "Sprite"
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      router.push('/auth/login');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const fetchData = async () => {
    try {
      setIsLoadingData(true);
      const [productsRes, branchesRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/branches'),
      ]);
      
      setProducts(productsRes.data.products || []);
      setBranches(branchesRes.data.branches || []);
      
      if (branchesRes.data.branches && branchesRes.data.branches.length > 0) {
        setSelectedBranch(branchesRes.data.branches[0]._id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product._id === product._id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    toast.success(`Added ${product.name} to cart`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.product._id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product._id !== productId));
    toast.success('Item removed from cart');
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (!selectedBranch) {
      toast.error('Please select a branch');
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!phoneNumber || phoneNumber.trim() === '') {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        branchId: selectedBranch,
        items: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        phoneNumber: phoneNumber.trim(),
      };

      const response = await axios.post('/api/orders', orderData);
      toast.success(response.data.message || 'Payment initiated! Check your phone.');
      
      setCart([]);
      setPhoneNumber('');
      setShowCart(false);
      
      setTimeout(() => {
        router.push('/customer/orders');
      }, 2000);
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.error || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  // FILTER LOGIC
  const filteredProducts = activeFilter === 'All' 
    ? products 
    : products.filter(p => p.brand.toLowerCase().includes(activeFilter.toLowerCase()));

  // HELPER: Extract size from name
  const getSizeBadge = (name: string) => {
    if (name.toLowerCase().includes('can')) return 'Can';
    if (name.toLowerCase().includes('2l')) return '2 Litres';
    if (name.toLowerCase().includes('1l')) return '1 Litre';
    if (name.toLowerCase().includes('500')) return '500ml';
    if (name.toLowerCase().includes('350')) return '350ml';
    return 'Standard';
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 1. PROFESSIONAL HEADER */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Store size={24} />
              </div>
              <div className="leading-tight">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">SuperMart</h1>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Fast & Fresh</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/customer/orders')}
                className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all font-medium"
              >
                <Package size={20} />
                <span>My Orders</span>
              </button>
              
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
              >
                <ShoppingCart size={20} />
                <span className="font-medium">Cart</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold border-2 border-white">
                    {getTotalItems()}
                  </span>
                )}
              </button>
              
              <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 2. CONTROL BAR */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           
           {/* Branch Selector */}
           {branches.length > 0 ? (
             <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="bg-blue-50 p-2.5 rounded-full text-blue-600 shrink-0">
                 <Store size={20}/>
               </div>
               <div className="flex-1">
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Pickup Branch</label>
                 <select 
                   value={selectedBranch} 
                   onChange={(e) => setSelectedBranch(e.target.value)} 
                   className="bg-transparent font-bold text-gray-900 text-sm focus:outline-none cursor-pointer w-full md:w-48 hover:text-blue-600 transition-colors"
                 >
                   {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                 </select>
               </div>
             </div>
           ) : (
             <div className="text-yellow-600 text-sm font-medium">No branches available</div>
           )}
           
           {/* FILTER TABS */}
           <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto no-scrollbar">
             {['All', 'Coke', 'Fanta', 'Sprite'].map(brand => (
               <button 
                 key={brand}
                 onClick={() => setActiveFilter(brand)}
                 className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                   activeFilter === brand 
                     ? 'bg-gray-900 text-white shadow-lg scale-105' 
                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                 }`}
               >
                 {brand === 'All' && <Filter size={14} />}
                 {brand}
               </button>
             ))}
           </div>
        </div>

        {/* 3. PRODUCT GRID */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 flex flex-col border border-gray-100 group">
                
                {/* Image Area */}
                <div className="relative w-full h-64 mb-4 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {/* Fallback */}
                  <div className={`flex items-center justify-center w-full h-full bg-gray-50 text-gray-300 ${product.image ? 'hidden' : ''}`}>
                     <ImageOff size={48} />
                  </div>
                </div>

                {/* Details Area */}
                <div className="mt-auto">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">{product.brand}</p>
                      <h3 className="font-bold text-gray-900 leading-tight text-lg">{product.name}</h3>
                    </div>
                    {/* Size Badge */}
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide shrink-0">
                      {getSizeBadge(product.name)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-extrabold text-gray-900">KES {product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!selectedBranch}
                      className="bg-gray-900 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200 active:scale-95"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Filter size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No drinks found</h3>
            <p className="text-gray-500">Try selecting a different brand filter.</p>
          </div>
        )}
      </div>

      {/* 4. CART SIDEBAR */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-opacity" onClick={() => setShowCart(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Your Cart</h2>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                  <XCircle size={24} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                   <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                     <ShoppingCart size={32}/>
                   </div>
                   <p className="text-gray-500 font-medium">Your cart is empty</p>
                   <button onClick={() => setShowCart(false)} className="mt-4 text-blue-600 hover:text-blue-700 font-semibold text-sm">
                     Start Shopping
                   </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-8">
                    {cart.map((item) => (
                      <div key={item.product._id} className="flex gap-4 border-b border-gray-100 pb-4">
                        {/* Cart Item Image */}
                        <div className="w-16 h-16 bg-white border border-gray-100 rounded-lg flex items-center justify-center p-1 shrink-0">
                          {item.product.image ? (
                            <img src={item.product.image} className="w-full h-full object-contain" />
                          ) : (
                            <Package size={24} className="text-gray-300"/>
                          )}
                        </div>
                        
                        {/* Cart Item Details */}
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 line-clamp-1">{item.product.name}</h4>
                          <p className="text-xs text-gray-500 mb-2 font-medium">KES {item.product.price}</p>
                          
                          <div className="flex items-center gap-3">
                             <button 
                               onClick={() => updateQuantity(item.product._id, -1)} 
                               className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-bold transition-colors text-gray-700"
                             >-</button>
                             <span className="text-sm font-bold w-4 text-center text-gray-900">{item.quantity}</span>
                             <button 
                               onClick={() => updateQuantity(item.product._id, 1)} 
                               className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-bold transition-colors text-gray-700"
                             >+</button>
                             
                             <button 
                               onClick={() => removeFromCart(item.product._id)} 
                               className="ml-auto text-xs text-red-500 font-medium hover:text-red-600 hover:underline"
                             >
                               Remove
                             </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <div className="flex justify-between items-end">
                      <span className="text-sm text-gray-500 font-medium">Total Amount</span>
                      <span className="text-2xl font-extrabold text-gray-900">KES {getTotalAmount().toLocaleString()}</span>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">M-Pesa Phone Number</label>
                      <input 
                        type="tel" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        placeholder="254712345678" 
                        className="w-full p-3.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400" 
                      />
                    </div>

                    <button 
                      onClick={handleCheckout} 
                      disabled={loading} 
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : 'Pay with M-Pesa'}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-3">
                    You will receive an STK push on your phone to complete payment
                  </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}