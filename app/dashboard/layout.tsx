//app/dashboard/layout.tsx
'use client';

import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import SideNav from '@/app/ui/dashboard/sidenav';
import MobileNav from '@/app/ui/dashboard/mobilenav';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session } = useSession();
  const userImage = session?.user?.profile_picture_url || '/fallback_avatar.png';
  const userName = session?.user?.first_name || 'Demo';

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SideNav />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-gray-800 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Mobile Navigation */}
              <MobileNav />
              
              {/* Company Name for Mobile */}
              <h1 className="md:hidden text-xl font-bold text-red-500 ml-2">Company A</h1>
              
              {/* Search bar - hidden on mobile */}
              <div className="relative ml-4 hidden md:block">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={18} className="text-gray-400" />
                </span>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="py-2 pl-10 pr-4 bg-gray-700 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-full hover:bg-gray-700">
                <Bell size={20} className="text-gray-300" />
                <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">3</span>
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center"
                >
                  <Image 
                    src={userImage}
                    alt="Profile" 
                    width={32}
                    height={32}
                    unoptimized
                    className="h-8 w-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-red-500" 
                  />
                  <span className="ml-2 text-sm font-medium hidden sm:block">{userName}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-700 text-white rounded-md shadow-lg py-1 z-10">
                    <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-500">
                      Your Profile 
                    </Link>
                    <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-500">
                      Settings
                    </Link>
                    <button 
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-red-500"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-hidden bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}