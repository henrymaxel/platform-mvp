'use client';

import React, { useEffect, useState } from 'react';
import { Home, ArrowLeft, RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const [glitchText, setGlitchText] = useState('404');
  
  // Glitch effect for the 404 text
  useEffect(() => {
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const glitched = '404'.split('').map(char => 
          Math.random() > 0.5 ? char : glitchChars[Math.floor(Math.random() * glitchChars.length)]
        ).join('');
        setGlitchText(glitched);
        setTimeout(() => setGlitchText('404'), 150);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated 404 with glitch effect */}
        <div className="relative mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-red-500 animate-pulse select-none">
            {glitchText}
          </h1>
          <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-red-500 opacity-50 animate-ping">
            404
          </div>
        </div>

        {/* Error message */}
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-100">
          Page Not Found
        </h2>
        <p className="text-gray-400 mb-8 text-lg">
          Looks like you've ventured into the digital void. The page you're looking for doesn't exist in our reality.
        </p>

        {/* Popular pages */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Popular Pages</h3>
          <div className="flex justify-center">
            <Link 
              href="/"
              className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg transition-all max-w-sm w-full transform hover:scale-105"
            >
              <div className="text-red-500 mb-2 font-semibold text-xl">Home Page</div>
              <p className="text-sm text-gray-400">Return to the home page</p>
            </Link>
          </div>
        </div>

        {/* Fun ASCII art */}
        <div className="mt-16 text-gray-600 text-xs font-mono hidden md:block">
          <pre>
{`    _______________
   |  ___________  |
   | |           | |
   | |   ERROR   | |
   | |    404    | |
   | |___________| |
   |_______________|
    \\___________/
         | |
        /   \\
       /     \\
      /       \\`}
          </pre>
        </div>
      </div>
    </div>
  );
}