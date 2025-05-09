'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell, Home, Menu, Search, Settings, LogOut,
  BookOpen, Edit, User
} from 'lucide-react';
import Image from 'next/image';


export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('Test User');
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState('/fallback_avatar.png');

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Simulate loading user data
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <h2 className="mt-4 text-xl font-semibold text-white">Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 p-4 transition-all duration-300 ease-in-out overflow-y-auto flex-shrink-0`}>
        <div className="flex items-center justify-center mb-8">
          <h1 className={`text-2xl font-bold text-red-500 ${!sidebarOpen && 'hidden'}`}>
            {sidebarOpen ? 'Company A' : 'C'}
          </h1>
        </div>
        
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center w-full p-3 rounded-md hover:bg-gray-700 transition-colors ${activeTab === 'overview' ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-gray-300'}`}
          >
            <Home size={20} />
            {sidebarOpen && <span className="ml-3">Overview</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('writing')}
            className={`flex items-center w-full p-3 rounded-md hover:bg-gray-700 transition-colors ${activeTab === 'writing' ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-gray-300'}`}
          >
            <Edit size={20} />
            {sidebarOpen && <span className="ml-3">Writing Studio</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('reading')}
            className={`flex items-center w-full p-3 rounded-md hover:bg-gray-700 transition-colors ${activeTab === 'reading' ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-gray-300'}`}
          >
            <BookOpen size={20} />
            {sidebarOpen && <span className="ml-3">Reading Library</span>}
          </button>
        </nav>
        
        <div className="absolute bottom-4 left-0 right-0">
          <div className="px-4 space-y-2">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center w-full p-3 rounded-md hover:bg-gray-700 transition-colors ${activeTab === 'settings' ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-gray-300'}`}
            >
              <Settings size={20} />
              {sidebarOpen && <span className="ml-3">Settings</span>}
            </button>
            <button 
              onClick={() => setActiveTab('logout')}
              className={`flex items-center w-full p-3 rounded-md hover:bg-gray-700 transition-colors ${activeTab === 'logout' ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-gray-300'}`}
            >
              <LogOut size={20} />
              {sidebarOpen && <span className="ml-3">Log Out</span>}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-gray-800 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={toggleSidebar} 
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Menu size={20} />
              </button>
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
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">3</span>
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center"
                >
                  <Image 
                    src='/fallback_avatar.png'
                    alt="Profile" 
                    width={32}
                    height={32}
                    unoptimized
                    className="h-8 w-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-red-500" 
                  />
                  <span className="ml-2 text-sm font-medium hidden md:block">{userName}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-700 text-white rounded-md shadow-lg py-1 z-10">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-500">Your Profile</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-500">Settings</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-red-500">Log out</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{greeting}, {userName}!</h2>
            <p className="text-gray-400">Here's what's happening with your projects today.</p>
          </div>
          
          {/* Center Dashboard Options */}
          <div className="flex justify-center items-center mb-12">
            <div className="grid grid-cols-1 gap-8 text-center max-w-4xl">
              <div className="flex justify-center">
                <a href="#" className="bg-gray-800 rounded-lg p-6 shadow-lg hover:bg-gray-700 transition-all w-64">
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-blue-500 rounded-full mb-4">
                      <User size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Profile</h3>
                    <p className="text-gray-400">Manage your account settings</p>
                  </div>
                </a>
              </div>
              
              <div className="flex justify-center space-x-8">
                <a href="#" className="bg-gray-800 rounded-lg p-6 shadow-lg hover:bg-gray-700 transition-all w-64">
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-green-500 rounded-full mb-4">
                      <Edit size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Writing Studio</h3>
                    <p className="text-gray-400">Create and manage your projects</p>
                  </div>
                </a>
                
                <a href="#" className="bg-gray-800 rounded-lg p-6 shadow-lg hover:bg-gray-700 transition-all w-64">
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-purple-500 rounded-full mb-4">
                      <BookOpen size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Reading Library</h3>
                    <p className="text-gray-400">Explore published content</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}