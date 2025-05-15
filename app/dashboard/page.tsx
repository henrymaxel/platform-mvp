//app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { User, Edit, BookOpen, Settings, CreditCard, Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import LoadingDashboard from './loading';

export default function Dashboard() {
  const [greeting, setGreeting] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [status]);

  // Loading state
  if (status === 'loading' || isLoading) {
    return <LoadingDashboard />;
  }

  const userName = session?.user?.first_name || 'Demo';
  const userImage = session?.user?.profile_picture_url || '/fallback_avatar.png';
  const userFullName = `${session?.user?.first_name || ''} ${session?.user?.last_name || ''}`.trim() || 'Demo User';

  // Get stats (this would normally come from your API)
  const stats = {
    projectCount: 3,
    totalWordCount: 14500,
    publishedStories: 1,
    draftStories: 2
  };

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold">{greeting}, {userName}!</h2>
          <p className="text-gray-400 text-sm md:text-base">Here's an overview of your writing journey.</p>
        </div>
        
        {/* Profile and Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  <Image
                    src={userImage}
                    alt={userFullName}
                    width={96}
                    height={96}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <h3 className="text-lg font-semibold">{userFullName}</h3>
              <p className="text-gray-400 text-sm mb-4">@{userName.toLowerCase()}</p>
              <Link 
                href="/dashboard/settings/profile" 
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm flex items-center"
              >
                <User size={14} className="mr-2" />
                Edit Profile
              </Link>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-sm font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/dashboard/settings/profile" className="flex items-center text-sm text-gray-300 hover:text-white">
                  <User size={14} className="mr-2 text-blue-500" />
                  Profile Settings
                </Link>
                <Link href="/dashboard/settings/subscriptions" className="flex items-center text-sm text-gray-300 hover:text-white">
                  <CreditCard size={14} className="mr-2 text-green-500" />
                  Subscription
                </Link>
                <Link href="/dashboard/settings/notifications" className="flex items-center text-sm text-gray-300 hover:text-white">
                  <Bell size={14} className="mr-2 text-yellow-500" />
                  Notification Settings
                </Link>
                <Link href="/dashboard/settings" className="flex items-center text-sm text-gray-300 hover:text-white">
                  <Settings size={14} className="mr-2 text-purple-500" />
                  All Settings
                </Link>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                <p className="text-gray-400 text-xs uppercase">Projects</p>
                <p className="text-2xl font-bold mt-1">{stats.projectCount}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                <p className="text-gray-400 text-xs uppercase">Words Written</p>
                <p className="text-2xl font-bold mt-1">{stats.totalWordCount.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                <p className="text-gray-400 text-xs uppercase">Published</p>
                <p className="text-2xl font-bold mt-1">{stats.publishedStories}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                <p className="text-gray-400 text-xs uppercase">Drafts</p>
                <p className="text-2xl font-bold mt-1">{stats.draftStories}</p>
              </div>
            </div>
            
            {/* Recent Activity - this would typically come from your API */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3"></div>
                  <div>
                    <p className="text-sm">You published <span className="font-semibold text-white">Getting Started with Next.js</span></p>
                    <p className="text-xs text-gray-400">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                  <div>
                    <p className="text-sm">You updated <span className="font-semibold text-white">The Future of AI in Writing</span></p>
                    <p className="text-xs text-gray-400">4 days ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 mr-3"></div>
                  <div>
                    <p className="text-sm">You started a new project <span className="font-semibold text-white">Web Development Tips</span></p>
                    <p className="text-xs text-gray-400">1 week ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/studio" className="bg-gray-800 rounded-lg p-6 shadow-lg hover:bg-gray-700 transition-all">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-green-500 rounded-full mb-4">
                <Edit size={32} className="text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Writing Studio</h3>
              <p className="text-gray-400 text-sm md:text-base text-center">Create and manage your writing projects</p>
            </div>
          </Link>
          
          <Link href="/dashboard/reading" className="bg-gray-800 rounded-lg p-6 shadow-lg hover:bg-gray-700 transition-all">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-purple-500 rounded-full mb-4">
                <BookOpen size={32} className="text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Reading Library</h3>
              <p className="text-gray-400 text-sm md:text-base text-center">Explore published content from all authors</p>
            </div>
          </Link>
          
          <Link href="/dashboard/settings/publications" className="bg-gray-800 rounded-lg p-6 shadow-lg hover:bg-gray-700 transition-all">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-orange-500 rounded-full mb-4">
                <BookOpen size={32} className="text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">My Publications</h3>
              <p className="text-gray-400 text-sm md:text-base text-center">Manage your published content</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}