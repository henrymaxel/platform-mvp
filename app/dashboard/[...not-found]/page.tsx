//app/dashboard/[...not-found]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Home, ArrowLeft, RefreshCw, BookOpen, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardNotFound() {
  const router = useRouter();
  const [randomQuote, setRandomQuote] = useState('');
  
  const quotes = [
    "Even the best writers lose their way sometimes.",
    "Every wrong turn is a chance to discover something new.",
    "Not all who wander are lost, but this page definitely is.",
    "This page is like a first draft - it needs some work.",
    "404: The chapter that never was.",
  ];

  useEffect(() => {
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-2xl mx-auto">
          {/* 404 with typewriter effect */}
          <div className="mb-8">
            <h1 className="text-7xl md:text-8xl font-bold text-red-500 mb-4">
              404
            </h1>
            <div className="h-1 w-24 bg-red-500 mx-auto mb-6"></div>
          </div>

          {/* Creative message */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-400 mb-6 text-lg italic">
            "{randomQuote}"
          </p>
          <p className="text-gray-500 mb-8">
            The page you're looking for seems to have vanished into the digital ether.
          </p>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link 
              href="/dashboard"
              className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg transition-all group"
            >
              <Home size={24} className="text-red-500 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Dashboard</h3>
              <p className="text-sm text-gray-400">Return to home base</p>
            </Link>
            
            <Link 
              href="/dashboard/studio"
              className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg transition-all group"
            >
              <Edit size={24} className="text-green-500 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Writing Studio</h3>
              <p className="text-sm text-gray-400">Create something new</p>
            </Link>
            
            <Link 
              href="/dashboard/reading"
              className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg transition-all group"
            >
              <BookOpen size={24} className="text-purple-500 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Reading Library</h3>
              <p className="text-sm text-gray-400">Explore existing content</p>
            </Link>
          </div>

          {/* Additional actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
            >
              <ArrowLeft size={20} className="mr-2" />
              Go Back
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
            >
              <RefreshCw size={20} className="mr-2" />
              Refresh Page
            </button>
          </div>

          {/* Error code for developers */}
          <div className="mt-16 p-4 bg-gray-800 rounded-lg max-w-md mx-auto">
            <p className="text-xs text-gray-500 font-mono">
              Error Code: PAGE_NOT_FOUND<br/>
              Path: {typeof window !== 'undefined' ? window.location.pathname : ''}<br/>
              Time: {new Date().toISOString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}