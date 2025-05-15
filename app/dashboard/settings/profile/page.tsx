'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUserProfile, updateProfile } from '@/app/lib/actions/profile';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import LoadingDashboard from '../../loading';

export default function ProfileSettingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    author_bio: '',
    twitter_link: '',
    instagram_link: '',
    tiktok_link: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load user profile
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const userData = await getUserProfile();
        setProfile(userData);
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          author_bio: userData.author_bio || '',
          twitter_link: userData.twitter_link || '',
          instagram_link: userData.instagram_link || '',
          tiktok_link: userData.tiktok_link || '',
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      loadProfile();
    }
  }, [status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Create FormData object
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      
      const fileInput = document.getElementById('profile_picture') as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        submitData.append('profile_picture', fileInput.files[0]);
      }

      console.log('Submitting profile update with data: ', Object.fromEntries(submitData.entries()));
      const result = await updateProfile(submitData);
      console.log('Profile update result: ', result);

      // Update local profile data
      setProfile(prev => ({
        ...prev,
        ...formData
      }));
      
      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };


  if (status === 'loading' || loading) {
    return <LoadingDashboard />;
  }

  if (!session) {
    return <div>Please sign in to view your profile settings</div>;
  }

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/settings" className="mr-4 p-2 hover:bg-gray-700 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="first_name">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="last_name">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="author_bio">
                Author Bio
              </label>
              <textarea
                id="author_bio"
                name="author_bio"
                value={formData.author_bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                placeholder="Tell readers about yourself..."
              />
              <p className="text-gray-400 text-sm mt-1">
                Your bio appears on your public profile and published works.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Social Media Links</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="twitter_link">
                    Twitter URL
                  </label>
                  <input
                    type="text"
                    id="twitter_link"
                    name="twitter_link"
                    value={formData.twitter_link}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="instagram_link">
                    Instagram URL
                  </label>
                  <input
                    type="text"
                    id="instagram_link"
                    name="instagram_link"
                    value={formData.instagram_link}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="tiktok_link">
                    TikTok URL
                  </label>
                  <input
                    type="text"
                    id="tiktok_link"
                    name="tiktok_link"
                    value={formData.tiktok_link}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                    placeholder="https://tiktok.com/@yourusername"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4">
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
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}