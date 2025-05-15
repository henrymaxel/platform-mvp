'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUserProfile, updateProfile } from '@/app/lib/actions/profile';
import { Pencil, Save, User, Mail, Link } from 'lucide-react';
import Image from 'next/image';
import LoadingDashboard from '../loading';
import XIcon from '@/app/ui/icons/x-twitter';
import InstagramIcon from '@/app/ui/icons/instagram';
import TiktokIcon from '@/app/ui/icons/tiktok';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  // Load user profile
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const userData = await getUserProfile();

        // const twitterUsername = userData.twitter_link ? userData.twitter_link.replace('https://x.com/', '') : '';
        // const instagramUsername = userData.instagram_link ? userData.instagram_link.replace('https://instagram.com/', '') : '';
        // const tiktokUsername = userData.tiktok_link ? userData.tiktok_link.replace('https://tiktok.com/@', '') : '';

        setProfile(userData);
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          author_bio: userData.author_bio || '',
          twitter_link: userData.twitter_link ,
          instagram_link: userData.instagram_link,
          tiktok_link: userData.tiktok_link,
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
      
      // Create FormData object
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      
      if (profilePicture) {
        submitData.append('profile_picture', profilePicture);
      }
      const result = await updateProfile(submitData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      // Update local profile data
      setProfile(prev => ({
        ...prev,
        ...formData
      }));
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  const handleProfilePictureChange = (e: ReactHTMLElement.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  }

  if (status === 'loading' || loading) {
    return <LoadingDashboard />;
  }

  if (!session) {
    return <div>Please sign in to view your profile</div>;
  }

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Profile</h1>
        
        {error && (
          <div className="bg-myred-500 text-white p-4 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                {profile?.profile_picture_url ? (
                  <Image 
                    src={profile.profile_picture_url}
                    alt="Profile Picture"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <User size={64} className="text-gray-400" />
                )}
              </div>

              <label htmlFor='profile_picture' className="absolute bottom-0 right-0 p-2 bg-myred-500 hover:bg-myred-600 rounded-full cursor-pointer">
                <Pencil size={18} />
                <input
                  type="file"
                  id="profile_picture"
                  name="profile_picture"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                />
              </label>
              <button className="absolute bottom-0 right-0 p-2 bg-myred-500 hover:bg-myred-600 rounded-full">
                <Pencil size={18} />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              {!isEditing ? (
                <>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold">
                      {profile?.first_name} {profile?.last_name}
                    </h2>
                    <p className="text-gray-400 mt-1">
                      {profile?.email}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Bio</h3>
                    <p className="text-gray-300">
                      {profile?.author_bio || 'No bio available. Tell readers about yourself!'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Social Media</h3>
                    <div className="flex flex-wrap gap-4">
                      {profile?.twitter_link && (
                        <a 
                          href={profile.twitter_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-300 hover:text-myred-500"
                        >
                          <XIcon className="mr-2" />
                          Twitter
                        </a>
                      )}
                      
                      {profile?.instagram_link && (
                        <a 
                          href={profile.instagram_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-300 hover:text-myred-500"
                        >
                          <InstagramIcon className="mr-2" />
                          Instagram
                        </a>
                      )}
                      
                      {profile?.tiktok_link && (
                        <a 
                          href={profile.tiktok_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-300 hover:text-myred-500"
                        >
                          <TiktokIcon className="mr-2" />
                          TikTok
                        </a>
                      )}
                      
                      {!profile?.twitter_link && !profile?.instagram_link && !profile?.tiktok_link && (
                        <p className="text-gray-400">No social media links added yet</p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-6 px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded flex items-center mx-auto md:mx-0"
                  >
                    <Pencil size={16} className="mr-2" />
                    Edit Profile
                  </button>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="first_name">
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
                      <label className="block text-sm font-medium mb-1" htmlFor="last_name">
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
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="author_bio">
                      Author Bio
                    </label>
                    <textarea
                      id="author_bio"
                      name="author_bio"
                      value={formData.author_bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold">Social Media Links</h3>
                    
                    <div className="flex items-center">
                      <XIcon className="mr-2" />
                      <input
                        type="text"
                        id="twitter_username"
                        name="twitter_username"
                        value={formData.twitter_link}
                        onChange={handleInputChange}
                        placeholder="Twitter URL"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <InstagramIcon className="mr-2" />
                      <input
                        type="text"
                        id="instagram_username"
                        name="instagram_username"
                        value={formData.instagram_link}
                        onChange={handleInputChange}
                        placeholder="Instagram URL"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <TiktokIcon className="mr-2" />
                      <input
                        type="text"
                        id="tiktok_username"
                        name="tiktok_username"
                        value={formData.tiktok_link}
                        onChange={handleInputChange}
                        placeholder="TikTok URL"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-start space-x-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded flex items-center disabled:opacity-50"
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
                    
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}