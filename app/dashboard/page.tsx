'use client';

import React, { useState, useEffect } from 'react';
import { User, Edit, BookOpen, Settings, CreditCard, Bell, ExternalLink } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import LoadingDashboard from './loading';
import { getDashboardData, getCurrentUser } from '@/app/lib/actions/dashboard';

// Define types
interface UserStats {
  projectCount: number;
  totalWordCount: number;
  publishedCount: number;
  draftCount: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  timestamp: Date;
}

interface DashboardData {
  stats: UserStats;
  activities: Activity[];
}

export default function Dashboard() {
  const [greeting, setGreeting] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [prevPath, setPrevPath] = useState('');

  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Fetch dashboard data when session is available
    fetchDashboardData();
    fetchCurrentUser();
  }, [status, session]);

  useEffect(() => {
    if (prevPath.includes('/dashboard/settings/profile') && pathname === '/dashboard') {
      fetchCurrentUser();
    }

    setPrevPath(pathname);
  }, [pathname]);

  const fetchDashboardData = async () => {
    try {
      if (session?.user?.id) {
        const data = await getDashboardData(5);
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      if (session?.user?.id) {
        const userData = await getCurrentUser();
        if (userData) {
          setCurrentUser(userData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch current user data:', error);
    }
  };

  // Formatting timestamp for activity display
  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffInMs = now.getTime() - activityDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Loading state
  if (status === 'loading' || isLoading) {
    return <LoadingDashboard />;
  }

  const userName = currentUser?.username || session?.user?.username || 'Demo';
  const userImage = session?.user?.profile_picture_url || '/fallback_avatar.png';
  const userFullName = `${session?.user?.first_name || ''} ${session?.user?.last_name || ''}`.trim() || 'Demo User';

  // Set default stats if data failed to load
  const stats = dashboardData?.stats || {
    projectCount: 0,
    totalWordCount: 0,
    publishedCount: 0,
    draftCount: 0
  };

  // Function to get appropriate icon color based on activity type
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'publication': return 'bg-green-500';
      case 'update': return 'bg-blue-500';
      case 'creation': return 'bg-yellow-500';
      case 'comment': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto mt-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold">{greeting}, {userName}!</h2>
          <p className="text-gray-400 text-sm md:text-base">Here's an overview of your writing journey.</p>
        </div>

        {error && (
          <div className="bg-myred-500 text-white p-4 rounded mb-6">
            {error}
          </div>
        )}

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
              <p className="text-gray-400 text-sm mb-4">@{userName}</p>



              <div className="flex gap-2 mt-4">
                <Link
                  href="/dashboard/settings/profile"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm flex items-center"
                >
                  <User size={14} className="mr-2" />
                  Edit Profile
                </Link>
                <Link
                  href={`/dashboard/user/${userName.toLowerCase()}`}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm flex items-center"
                  target="_blank"
                >
                  <ExternalLink size={14} className="mr-2" />
                  View Public Profile
                </Link>
              </div>
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
                <p className="text-2xl font-bold mt-1">{stats.publishedCount}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                <p className="text-gray-400 text-xs uppercase">Drafts</p>
                <p className="text-2xl font-bold mt-1">{stats.draftCount}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {dashboardData?.activities && dashboardData.activities.length > 0 ? (
                  dashboardData.activities.map((activity, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)} mt-2 mr-3`}></div>
                      <div>
                        <p className="text-sm">
                          {activity.type === 'publication' && 'You published '}
                          {activity.type === 'update' && 'You updated '}
                          {activity.type === 'creation' && 'You started a new project '}
                          {activity.type === 'comment' && 'You commented on '}
                          <span className="font-semibold text-white">{activity.title}</span>
                        </p>
                        <p className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No recent activity found.</p>
                )}
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