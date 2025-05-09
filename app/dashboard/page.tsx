'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Bell, CheckCircle, Clock, DollarSign, FileText, Home, Inbox, Menu, Search, Settings, 
  User, Users, X, BarChart2, PieChart as PieChartIcon, Calendar, 
  FileText as DocumentIcon, ArrowUpRight, ArrowDownRight, Grid, LogOut
} from 'lucide-react';

// Sample data for charts
const monthlyData = [
  { name: 'Jan', value: 1200 },
  { name: 'Feb', value: 1900 },
  { name: 'Mar', value: 1500 },
  { name: 'Apr', value: 2400 },
  { name: 'May', value: 2100 },
  { name: 'Jun', value: 3100 },
  { name: 'Jul', value: 2900 },
  { name: 'Aug', value: 3600 },
  { name: 'Sep', value: 3200 },
  { name: 'Oct', value: 4100 },
  { name: 'Nov', value: 3800 },
  { name: 'Dec', value: 4600 },
];

const categoryData = [
  { name: 'Category A', value: 35 },
  { name: 'Category B', value: 25 },
  { name: 'Category C', value: 20 },
  { name: 'Category D', value: 15 },
  { name: 'Category E', value: 5 },
];

const recentActivityData = [
  { id: 1, user: 'Jane Cooper', action: 'Created new project', time: '2 minutes ago', avatar: '/api/placeholder/35/35' },
  { id: 2, user: 'Esther Howard', action: 'Added new document', time: '10 minutes ago', avatar: '/api/placeholder/35/35' },
  { id: 3, user: 'Kristin Watson', action: 'Updated user profile', time: '1 hour ago', avatar: '/api/placeholder/35/35' },
  { id: 4, user: 'Jacob Jones', action: 'Completed task', time: '3 hours ago', avatar: '/api/placeholder/35/35' },
  { id: 5, user: 'Cameron Williamson', action: 'Added new member', time: '5 hours ago', avatar: '/api/placeholder/35/35' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('Test User');
  const [isLoading, setIsLoading] = useState(true);

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

  // Stats data with trend indicators
  const stats = [
    { 
      title: 'Total Users', 
      value: '3,721', 
      change: '+12%', 
      isPositive: true,
      icon: <Users className="h-6 w-6 text-blue-500" />
    },
    { 
      title: 'Revenue', 
      value: '$42,900', 
      change: '+8%', 
      isPositive: true,
      icon: <DollarSign className="h-6 w-6 text-green-500" />
    },
    { 
      title: 'Pending Tasks', 
      value: '18', 
      change: '-3%', 
      isPositive: true,
      icon: <Clock className="h-6 w-6 text-yellow-500" />
    },
    { 
      title: 'Active Projects', 
      value: '24', 
      change: '-2%', 
      isPositive: false,
      icon: <FileText className="h-6 w-6 text-purple-500" />
    },
  ];

  const formatNumber = (num: any) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

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

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} lg:w-64 bg-gray-800 p-4 transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-2xl font-bold text-red-500 ${!sidebarOpen && 'lg:block hidden'}`}>
            {sidebarOpen ? 'AcmeApp' : 'A'}
          </h1>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center w-full p-3 rounded-md hover:bg-gray-700 transition-colors ${activeTab === 'overview' ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-gray-300'}`}
          >
            <Home size={20} />
            {sidebarOpen && <span className="ml-3 lg:block hidden">Overview</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center w-full p-3 rounded-md hover:bg-gray-700 transition-colors ${activeTab === 'analytics' ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-gray-300'}`}
          >
            <BarChart2 size={20} />
            {sidebarOpen && <span className="ml-3 lg:block hidden">Analytics</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center w-full p-3 rounded-md hover:bg-gray-700 transition-colors ${activeTab === 'users' ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-gray-300'}`}
          >
            <Users size={20} />
            {sidebarOpen && <span className="ml-3 lg:block hidden">Users</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('documents')}
            className={`flex items-center w-full p-3 rounded-md hover:bg-gray-700 transition-colors ${activeTab === 'documents' ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-gray-300'}`}
          >
            <DocumentIcon size={20} />
            {sidebarOpen && <span className="ml-3 lg:block hidden">Documents</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center w-full p-3 rounded-md hover:bg-gray-700 transition-colors ${activeTab === 'calendar' ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-gray-300'}`}
          >
            <Calendar size={20} />
            {sidebarOpen && <span className="ml-3 lg:block hidden">Calendar</span>}
          </button>
        </nav>
        
        <div className="absolute bottom-4 w-full pr-8">
          <button className="flex items-center w-full p-3 rounded-md text-gray-300 hover:bg-gray-700 transition-colors">
            <Settings size={20} />
            {sidebarOpen && <span className="ml-3 lg:block hidden">Settings</span>}
          </button>
          <button className="flex items-center w-full p-3 rounded-md text-gray-300 hover:bg-red-500 transition-colors mt-2">
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3 lg:block hidden">Log Out</span>}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Navigation */}
        <header className="bg-gray-800 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 hidden lg:block"
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
              <button className="relative p-2 rounded-full hover:bg-gray-700">
                <Inbox size={20} className="text-gray-300" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-blue-500 rounded-full text-xs flex items-center justify-center">5</span>
              </button>
              <div className="flex items-center">
                <img 
                  src="/api/placeholder/32/32" 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full object-cover" 
                />
                <span className="ml-2 text-sm font-medium hidden md:block">{userName}</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{greeting}, {userName}!</h2>
            <p className="text-gray-400">Here's what's happening with your projects today.</p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <div className={`flex items-center mt-2 ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.isPositive ? 
                        <ArrowUpRight size={16} /> : 
                        <ArrowDownRight size={16} />
                      }
                      <span className="ml-1 text-sm">{stat.change} from last month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-700 rounded-lg">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Line Chart */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Monthly Performance</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-gray-700 rounded-md hover:bg-gray-600">Year</button>
                  <button className="px-3 py-1 text-sm bg-red-500 rounded-md hover:bg-red-600">Month</button>
                  <button className="px-3 py-1 text-sm bg-gray-700 rounded-md hover:bg-gray-600">Week</button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                      itemStyle={{ color: '#F9FAFB' }}
                      formatter={(value) => [`$${formatNumber(value)}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#EF4444', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Pie Chart */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-medium mb-4">Categories Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                      itemStyle={{ color: '#F9FAFB' }}
                      formatter={(value) => [value, 'Value']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Recent Activity and Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Recent Activity</h3>
                <button className="text-sm text-gray-400 hover:text-white">View All</button>
              </div>
              
              <div className="space-y-4">
                {recentActivityData.map((activity) => (
                  <div key={activity.id} className="flex items-start p-3 hover:bg-gray-700 rounded-md">
                    <img 
                      src={activity.avatar} 
                      alt={activity.user} 
                      className="h-10 w-10 rounded-full mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{activity.user}</p>
                        <span className="text-sm text-gray-400">{activity.time}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{activity.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tasks */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Tasks</h3>
                <button className="px-3 py-1 text-sm bg-red-500 rounded-md hover:bg-red-600">+ Add Task</button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center p-3 bg-gray-700 rounded-md">
                  <div className="flex-shrink-0 mr-3">
                    <CheckCircle size={18} className="text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p>Complete dashboard redesign</p>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar size={14} className="mr-1" />
                        <span>Due today</span>
                      </div>
                      <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full">Completed</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 hover:bg-gray-700 rounded-md">
                  <div className="flex-shrink-0 mr-3">
                    <input type="checkbox" className="h-4 w-4 rounded text-red-500 focus:ring-red-500 bg-gray-700 border-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p>Review new user applications</p>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar size={14} className="mr-1" />
                        <span>Due tomorrow</span>
                      </div>
                      <span className="px-2 py-1 text-xs bg-yellow-500 text-white rounded-full">In Progress</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 hover:bg-gray-700 rounded-md">
                  <div className="flex-shrink-0 mr-3">
                    <input type="checkbox" className="h-4 w-4 rounded text-red-500 focus:ring-red-500 bg-gray-700 border-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p>Finalize Q4 marketing strategy</p>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar size={14} className="mr-1" />
                        <span>Due in 3 days</span>
                      </div>
                      <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">Planning</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 hover:bg-gray-700 rounded-md">
                  <div className="flex-shrink-0 mr-3">
                    <input type="checkbox" className="h-4 w-4 rounded text-red-500 focus:ring-red-500 bg-gray-700 border-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p>Update user documentation</p>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar size={14} className="mr-1" />
                        <span>Due next week</span>
                      </div>
                      <span className="px-2 py-1 text-xs bg-purple-500 text-white rounded-full">Documentation</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-4 p-2 text-center text-sm text-gray-400 hover:text-white">
                View all tasks
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}