//app/dashboard/layout.tsx
'use client'

import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import SideNav from '@/app/ui/dashboard/sidenav';
import MobileNav from '@/app/ui/dashboard/mobilenav';
import Link from 'next/link';
import LoadingDashboard from './loading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <LoadingDashboard />
  }
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
        <div className="md:hidden flex items-center px-4 py-2 space-x-3">
          <MobileNav />
              
        {/* Company Name for Mobile */}
          <h1 className="text-xl font-bold text-red-500 ml-2">The Boring Platform</h1>
        </div>
        
        
        {/* Page Content */}
        <main className="flex-1 overflow-hidden bg-gray-900 mt-15 m-auto">
          {children}
        </main>
      </div>
    </div>
  );
}