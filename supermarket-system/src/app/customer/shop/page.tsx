'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast'; 
import { ShoppingCart, LogOut, Package, ImageOff } from 'lucide-react';
 
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

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      router.push('/auth/login');
      return;
    }
    fetchData(); 
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
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Supermarket Chain</h1>
              <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/customer/orders')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Package size={20} />
                <span className="hidden sm:inline">My Orders</span>
              </button>
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart size={20} />
                <span>Cart ({getTotalItems()})</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Branch Selection */}
        {branches.length > 0 ? (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Branch for Pickup
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name} - {branch.location}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">
              No branches available yet. Please contact the administrator.
            </p>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="text-center mb-4">
                    {/* CHANGE 3: Logic to show real image if available, else fallback to emoji */}
                    <div className="w-32 h-32 mx-auto bg-gray-50 rounded-lg flex items-center justify-center mb-4 overflow-hidden relative">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-contain hover:scale-105 transition-transform"
                          onError={(e) => {
                            // If image fails to load, hide it and show fallback
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      
                      {/* Fallback Emoji/Icon (Shown if no image or image fails) */}
                      <div className={`flex items-center justify-center w-full h-full ${product.image ? 'hidden' : ''}`}>
                         <span className="text-5xl">
                          {product.brand === 'Coca-Cola' || product.brand === 'Coke' ? '🥤' : 
                           product.brand === 'Fanta' ? '🍊' : 
                           product.brand === 'Sprite' ? '✨' : 
                           product.category === 'Energy Drink' ? '⚡' : '🥤'}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                    <p className="text-gray-600">{product.brand}</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      KES {product.price.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!selectedBranch}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {selectedBranch ? 'Add to Cart' : 'Select Branch First'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <p className="text-yellow-800 text-lg">
              No products available yet. Please check back later.
            </p>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="mx-auto text-gray-300" size={64} />
                  <p className="text-gray-500 mt-4">Your cart is empty</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-4 text-blue-600 hover:text-blue-700"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.product._id} className="flex justify-between items-center border-b pb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                             {/* CHANGE 4: Small thumbnail in cart */}
                            {item.product.image ? (
                              <img src={item.product.image} alt="" className="w-10 h-10 object-contain rounded bg-gray-50" />
                            ) : (
                              <span className="text-2xl">
                                {item.product.brand === 'Coca-Cola' || item.product.brand === 'Coke' ? '🥤' : '✨'}
                              </span>
                            )}
                            <div>
                              <h3 className="font-semibold">{item.product.name}</h3>
                              <p className="text-sm text-gray-600">KES {item.product.price} each</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.product._id, -1)}
                            className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 flex items-center justify-center font-bold"
                          >
                            −
                          </button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, 1)}
                            className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product._id)}
                            className="ml-2 text-red-600 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between text-lg font-bold mb-2">
                      <span>Subtotal ({getTotalItems()} items):</span>
                      <span>KES {getTotalAmount().toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">Pickup from: {branches.find(b => b._id === selectedBranch)?.name}</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      M-Pesa Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="254700000000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your Safaricom number (format: 254XXXXXXXXX)
                    </p>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading || !phoneNumber || !selectedBranch}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </span>
                    ) : (
                      `Pay KES ${getTotalAmount().toLocaleString()} with M-Pesa`
                    )}
                  </button>

                  <p className="text-xs text-center text-gray-500 mt-3">
                    You will receive an STK push on your phone to complete payment
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}