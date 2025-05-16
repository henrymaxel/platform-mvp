'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  CreditCard,
  Bell,
  Lock,
  Shield,
  ChevronRight,
  BookOpen,
  Diamond,
  Wallet
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();

  const settingsOptions = [
    {
      title: 'Profile Settings',
      description: 'Update your personal information',
      icon: User,
      href: '/dashboard/settings/profile',
      color: 'text-myred-500',
    },
    {
      title: 'Subscription',
      description: 'Manage your subscription plan',
      icon: CreditCard,
      href: '/dashboard/settings/subscriptions',
      color: 'text-myred-500',
    },
    {
      title: 'Account Security',
      description: 'Update password and security settings',
      icon: Shield,
      href: '/dashboard/settings/security',
      color: 'text-myred-500',
    },
    {
      title: 'Notification Preferences',
      description: 'Control how you receive notifications',
      icon: Bell,
      href: '/dashboard/settings/notifications',
      color: 'text-myred-500',
    },
    {
      title: 'My Publications',
      description: 'Manage your published content',
      icon: BookOpen,
      href: '/dashboard/settings/publications',
      color: 'text-myred-500',
    },
    {
      title: 'Asset Manager',
      description: 'Manage your verified NFTs and create character profiles',
      icon: Diamond,
      href: '/dashboard/settings/assets/',
      color: 'text-myred-500',
    },
    {
      title: 'Wallet Connect',
      description: 'Connect your wallets to verify your asset ownership',
      icon: Wallet,
      href: '/dashboard/settings/wallet/connect',
      color: 'text-myred-500',
    },
  ];

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Settings</h1>

        <div className="grid grid-cols-1 gap-4">
          {settingsOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <div
                key={index}
                onClick={() => router.push(option.href)}
                className="bg-gray-800 rounded-lg p-4 shadow-lg flex items-center cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className={`p-3 rounded-full bg-opacity-20 mr-4`}>
                  <IconComponent className={option.color} size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{option.title}</h3>
                  <p className="text-gray-400 text-sm">{option.description}</p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}