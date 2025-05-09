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
        
        <div className="absolute bottom-4 left-0 right-0 mx-4">
          <button 
            className="flex items-center p-3 rounded-md text-gray-300 hover:bg-gray-700 transition-colors w-full"
          >
            <Settings size={20} />
            {sidebarOpen && <span className="ml-3">Settings</span>}
          </button>
          <button 
            className="flex items-center p-3 rounded-md text-gray-300 hover:bg-red-500 transition-colors mt-2 w-full"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3">Log Out</span>}
          </button>
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
                    src="/fallback_avatar.png" 
                    // src="data:image/jpeg;base64,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"
                    alt="Profile" 
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-red-500" 
                    onError={(e) => {
                      console.error("Image failed to load: ", e);

                    }}
                  />
                  <span className="ml-2 text-sm font-medium hidden md:block">{userName}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-700 text-gray-700 rounded-md shadow-lg py-1 z-10">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Your Profile</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Settings</a>
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