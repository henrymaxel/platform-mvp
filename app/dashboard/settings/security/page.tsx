'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { updatePassword } from '@/app/lib/actions/profile';
import LoadingDashboard from '../../loading';

export default function SecuritySettingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.currentPassword) {
      setError('Current password is required');
      return;
    }
    
    if (!formData.newPassword) {
      setError('New password is required');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Create FormData object
      const submitData = new FormData();
      submitData.append('currentPassword', formData.currentPassword);
      submitData.append('newPassword', formData.newPassword);
      submitData.append('confirmPassword', formData.confirmPassword);
      
      await updatePassword(submitData);
      
      setSuccess('Password updated successfully');
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to update password:', error);
      setError(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <LoadingDashboard />;
  }

  if (!session) {
    return <div>Please sign in to access security settings</div>;
  }

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/settings" className="mr-4 p-2 hover:bg-gray-700 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Security Settings</h1>
        </div>
        
        {error && (
          <div className="bg-myred-500 text-white p-4 rounded mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-600 text-white p-4 rounded mb-6">
            {success}
          </div>
        )}
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="currentPassword">
                Current Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="newPassword">
                New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
              />
              <p className="text-gray-400 text-sm mt-1">
                Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showPasswords"
                checked={showPasswords}
                onChange={() => setShowPasswords(!showPasswords)}
                className="w-4 h-4 border rounded focus:ring-3 focus:ring-myred-300 bg-gray-700 border-gray-600"
              />
              <label htmlFor="showPasswords" className="ml-2 text-sm text-gray-300">
                Show passwords
              </label>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-myred-600 hover:bg-myred-700 rounded flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg mt-6">
          <h2 className="text-xl font-semibold mb-4">Account Security</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <div>
                <h3 className="font-medium">Account Email</h3>
                <p className="text-gray-400 text-sm">{session.user.email}</p>
              </div>
              <button className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded">
                Change
              </button>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
              </div>
              <button className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded">
                Set Up
              </button>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <div>
                <h3 className="font-medium">Active Sessions</h3>
                <p className="text-gray-400 text-sm">Manage devices logged into your account</p>
              </div>
              <button className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded">
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}