'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './contexts/AuthContext';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Store, User } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/customer/shop');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-white">
       
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
            src="https://images.pexels.com/photos/4113625/pexels-photo-4113625.jpeg" 
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
          className="flex items-center gap-2 text-sm font-semibold hover:text-blue-300 transition-colors"
        >
          <User size={18} />
          <span>Member Login</span>
        </Link>
      </header>
 
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        
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
 
        <div className="absolute bottom-0 w-full border-t border-white/10 bg-black/20 backdrop-blur-md py-6 overflow-hidden">
          <div className="flex justify-center flex-wrap gap-8 md:gap-16 opacity-70">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥤</span>
              <span className="font-bold tracking-widest text-sm md:text-xl">COKE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍊</span>
              <span className="font-bold tracking-widest text-sm md:text-xl">FANTA</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="font-bold tracking-widest text-sm md:text-xl">SPRITE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="font-bold tracking-widest text-sm md:text-xl">RED BULL</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-2xl">🟤</span>
              <span className="font-bold tracking-widest text-sm md:text-xl">STONEY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}