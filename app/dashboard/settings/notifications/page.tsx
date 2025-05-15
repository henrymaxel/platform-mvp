'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import LoadingDashboard from '../../loading';

export default function NotificationSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  // Email notification settings
  const [emailSettings, setEmailSettings] = useState({
    newComment: true,
    newFollower: true,
    publishSuccess: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  // In-app notification settings
  const [appSettings, setAppSettings] = useState({
    newComment: true,
    newFollower: true,
    publishSuccess: true,
    achievements: true,
    systemUpdates: true,
  });

  const handleToggleEmail = (setting: keyof typeof emailSettings) => {
    setEmailSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleToggleApp = (setting: keyof typeof appSettings) => {
    setAppSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would save these settings to the database
      
      setSuccess('Notification preferences updated successfully');
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/settings" className="mr-4 p-2 hover:bg-gray-700 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Notification Preferences</h1>
        </div>
        
        {success && (
          <div className="bg-green-600 text-white p-4 rounded mb-6">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Email Notifications */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Email Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium">New Comments</h3>
                  <p className="text-sm text-gray-400">Receive emails when someone comments on your content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={emailSettings.newComment}
                    onChange={() => handleToggleEmail('newComment')}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-myred-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-gray-700">
                <div>
                  <h3 className="font-medium">New Followers</h3>
                  <p className="text-sm text-gray-400">Receive emails when someone follows you</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={emailSettings.newFollower}
                    onChange={() => handleToggleEmail('newFollower')}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-myred-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-gray-700">
                <div>
                  <h3 className="font-medium">Publishing Confirmations</h3>
                  <p className="text-sm text-gray-400">Receive emails when your content is published</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={emailSettings.publishSuccess}
                    onChange={() => handleToggleEmail('publishSuccess')}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-myred-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-gray-700">
                <div>
                  <h3 className="font-medium">Weekly Digest</h3>
                  <p className="text-sm text-gray-400">Receive a weekly summary of activity</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={emailSettings.weeklyDigest}
                    onChange={() => handleToggleEmail('weeklyDigest')}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-myred-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-gray-700">
                <div>
                  <h3 className="font-medium">Marketing Emails</h3>
                  <p className="text-sm text-gray-400">Receive product updates and promotional content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={emailSettings.marketingEmails}
                    onChange={() => handleToggleEmail('marketingEmails')}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-myred-500"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* In-App Notifications */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">In-App Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium">New Comments</h3>
                  <p className="text-sm text-gray-400">Receive notifications when someone comments on your content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={appSettings.newComment}
                    onChange={() => handleToggleApp('newComment')}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-myred-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-gray-700">
                <div>
                  <h3 className="font-medium">New Followers</h3>
                  <p className="text-sm text-gray-400">Receive notifications when someone follows you</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={appSettings.newFollower}
                    onChange={() => handleToggleApp('newFollower')}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-myred-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-gray-700">
                <div>
                  <h3 className="font-medium">Publishing Confirmations</h3>
                  <p className="text-sm text-gray-400">Receive notifications when your content is published</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={appSettings.publishSuccess}
                    onChange={() => handleToggleApp('publishSuccess')}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-myred-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-gray-700">
                <div>
                  <h3 className="font-medium">Achievements</h3>
                  <p className="text-sm text-gray-400">Receive notifications about milestones and achievements</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={appSettings.achievements}
                    onChange={() => handleToggleApp('achievements')}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-myred-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-gray-700">
                <div>
                  <h3 className="font-medium">System Updates</h3>
                  <p className="text-sm text-gray-400">Receive notifications about platform updates and maintenance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={appSettings.systemUpdates}
                    onChange={() => handleToggleApp('systemUpdates')}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-myred-500"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-myred-600 hover:bg-myred-700 rounded flex items-center disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}