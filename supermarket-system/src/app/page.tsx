'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './contexts/AuthContext';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Smart Redirect: Only redirect if user is ALREADY logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/customer/shop');
      }
    }
  }, [user, loading, router]);

  // If checking auth, show a simple spinner (optional, or just show the page immediately)
  // We allow the page to render briefly even while checking to prevent a "white flash"
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans">
      
      {/* 1. BACKGROUND VIDEO */}
      {/* This video is free for use from Pexels (People toasting drinks) */}
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
          {/* Fallback Image if video fails */}
          <img 
            src="https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg" 
            alt="Cheers" 
            className="h-full w-full object-cover"
          />
        </video>
        {/* Dark Overlay to make text readable */}
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
      </div>

      {/* 2. MAIN CONTENT (Hero Section) */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center text-white">
        
        {/* Animated Badge */}
        <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium tracking-wide text-green-300">Fast Delivery in 5 Cities</span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl drop-shadow-lg max-w-4xl">
          Refresh Your <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">Moments</span>
        </h1>
        
        <p className="mb-10 max-w-2xl text-lg text-gray-200 sm:text-xl leading-relaxed">
          The country's premium drink distributor. From <strong>Nairobi HQ</strong> to <strong>Eldoret</strong>, 
          we bring the celebration to your doorstep instantly.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="/auth/login"
            className="group relative flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-blue-700 hover:scale-105 shadow-lg shadow-blue-600/30"
          >
            <ShoppingBag className="w-5 h-5" />
            Order Now
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link 
            href="/auth/register"
            className="flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105"
          >
            Create Account
          </Link>
        </div>

        {/* 3. SHOWCASE OF DRINKS (Ticker) */}
        <div className="absolute bottom-0 w-full border-t border-white/10 bg-black/20 backdrop-blur-md py-6 overflow-hidden">
          <div className="flex justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {/* We use text/emojis here for speed, but these represent the brands */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥤</span>
              <span className="font-bold tracking-widest text-xl">COKE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍊</span>
              <span className="font-bold tracking-widest text-xl">FANTA</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="font-bold tracking-widest text-xl">SPRITE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="font-bold tracking-widest text-xl">RED BULL</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-2xl">🟤</span>
              <span className="font-bold tracking-widest text-xl">STONEY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}