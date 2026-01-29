'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShoppingBag, 
  Store, 
  User, 
  MapPin, 
  Zap, 
  Shield, 
  Clock, 
  Star 
} from 'lucide-react';

export default function Home() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Fast Service',
      description: 'Quick checkout and instant order confirmation',
      color: 'bg-yellow-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Payment',
      description: 'Your transactions are safe and encrypted via M-Pesa',
      color: 'bg-blue-500'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: '24/7 Availability',
      description: 'Shop anytime, anywhere across our 5 branches',
      color: 'bg-purple-500'
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Quality Assured',
      description: 'Only authentic products, freshly stocked',
      color: 'bg-pink-500'
    }
  ];

  const branches = [
    { name: 'Nairobi HQ', location: 'Westlands', status: 'Open' },
    { name: 'Kisumu', location: 'Mega Plaza', status: 'Open' },
    { name: 'Mombasa', location: 'Nyali Centre', status: 'Open' },
    { name: 'Nakuru', location: 'Gilani\'s', status: 'Open' },
    { name: 'Eldoret', location: 'Zion Mall', status: 'Open' },
  ];

  const BRANDS = [
     { 
      name: 'Coca-Cola', 
      url: 'https://logos-world.net/wp-content/uploads/2020/03/Coca-Cola-Logo.png',
      width: 'w-32'
    },
    { 
      name: 'Fanta', 
      url: 'https://logos-world.net/wp-content/uploads/2020/05/Fanta-Logo.png',
      width: 'w-24'
    },
    { 
      name: 'Sprite', 
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Sprite_Logo.svg',
      width: 'w-24'
    }
  ];

  return (
    <div className="font-sans text-gray-900 scroll-smooth">
      
      {/* SECTION 1: HERO */}
      <div className="relative h-screen w-full overflow-hidden text-white">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source 
              src="/home.mp4" 
              type="video/mp4" 
            />
            <img 
              src="https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg" 
              alt="Cheers" 
              className="h-full w-full object-cover"
            />
          </video>
          <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        </div>

        <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20">
              <Store className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">SuperMart</h1>
            </div>
          </div>
          <Link 
            href="/auth/login"
            className="flex items-center gap-2 text-sm font-semibold hover:text-blue-300 transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20"
          >
            <User size={18} />
            <span>Member Login</span>
          </Link>
        </header>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium tracking-wide text-green-300">Fast Delivery in 5 Cities</span>
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl drop-shadow-2xl max-w-4xl leading-tight">
            Refresh Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Moments</span>
          </h1>
          
          <p className="mb-10 max-w-2xl text-lg text-gray-200 sm:text-xl leading-relaxed font-light">
            The country's premium drink distributor. From <strong>Nairobi HQ</strong> to <strong>Eldoret</strong>, 
            we bring the celebration to your doorstep instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <Link 
              href="/auth/login"
              className="group relative flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-blue-700 hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
            >
              <ShoppingBag className="w-5 h-5" />
              Order Now
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link 
              href="/auth/register"
              className="flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 w-full border-t border-white/10 bg-black/30 backdrop-blur-md py-6 overflow-hidden z-20">
          <div className="flex justify-center items-center gap-12 md:gap-24 opacity-80">
            {BRANDS.map((brand) => (
              <div 
                key={brand.name}
                className="group relative flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-110 cursor-default"
              >
                <img 
                  src={brand.url} 
                  alt={brand.name} 
                  className={`${brand.width} h-auto object-contain filter grayscale brightness-200 contrast-125 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500 drop-shadow-lg`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-white font-bold tracking-widest text-lg">{brand.name.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: FEATURES */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">SuperMart?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing exceptional service and quality products across all our locations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-r from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: BRANCHES */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Branches</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Visit any of our conveniently located branches across Kenya
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-600"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{branch.name}</h3>
                      <p className="text-gray-600">{branch.location}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {branch.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: FOOTER */} 
      <footer id="contact" className="bg-gray-900 text-white py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">SuperMart</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for quality beverages across Kenya.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-lg">Quick Links</h3>
              <div className="space-y-2"> 
                <Link href="/customer/shop" className="block text-gray-400 hover:text-white transition-colors">Products</Link>
                <Link href="/auth/login" className="block text-gray-400 hover:text-white transition-colors">Login</Link>
                <Link href="/auth/register" className="block text-gray-400 hover:text-white transition-colors">Register</Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-lg">Support</h3>
              <div className="space-y-2"> 
                <a href="#contact" className="block text-gray-400 hover:text-white transition-colors">Contact Us</a> 
                <Link href="/legal" className="block text-gray-400 hover:text-white transition-colors">FAQ</Link>
                <Link href="/legal" className="block text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-lg">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <p>📞 +254 791 894 370</p>
                <p>✉️ info@supermart.co.ke</p>
                <p>📍 Westlands, Nairobi</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} SuperMart Chain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}