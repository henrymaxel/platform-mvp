//app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { User, Edit, BookOpen } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Dashboard() {
  const [greeting, setGreeting] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { data: session } = useSession();
  
  const userName = session?.user?.first_name || 'Demo';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-myred-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <h2 className="mt-4 text-xl font-semibold text-white">Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold">{greeting}, {userName}!</h2>
        <p className="text-gray-400 text-sm md:text-base">Here's what's happening with your projects today.</p>
      </div>
      
      {/* Center Dashboard Options */}
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="grid grid-cols-1 gap-6 text-center w-full max-w-4xl px-4">
          <div className="flex justify-center">
            <Link href="/dashboard/profile" className="bg-gray-800 rounded-lg p-6 shadow-lg hover:bg-gray-700 transition-all w-full max-w-sm">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-blue-500 rounded-full mb-4">
                  <User size={32} className="text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Profile</h3>
                <p className="text-gray-400 text-sm md:text-base">Manage your account settings</p>
              </div>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/dashboard/studio" className="bg-gray-800 rounded-lg p-6 shadow-lg hover:bg-gray-700 transition-all">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-green-500 rounded-full mb-4">
                  <Edit size={32} className="text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Writing Studio</h3>
                <p className="text-gray-400 text-sm md:text-base">Create and manage your projects</p>
              </div>
            </Link>
            
            <Link href="/dashboard/reading" className="bg-gray-800 rounded-lg p-6 shadow-lg hover:bg-gray-700 transition-all">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-purple-500 rounded-full mb-4">
                  <BookOpen size={32} className="text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Reading Library</h3>
                <p className="text-gray-400 text-sm md:text-base">Explore published content</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}