'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, Calendar, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import XIcon from '@/app/ui/icons/x-twitter';
import InstagramIcon from '@/app/ui/icons/instagram';
import TiktokIcon from '@/app/ui/icons/tiktok';

// This would be replaced with a real API call
const fetchUserProfile = async (username: string) => {
  // Simulate API call
  await new Promise(r => setTimeout(r, 1000));
  
  // Mock data - in a real app, this would come from your API
  return {
    id: '123',
    username: username,
    first_name: 'John',
    last_name: 'Doe',
    profile_picture_url: '/fallback_avatar.png',
    author_bio: 'Writer and developer passionate about technology and storytelling. I write about software development, AI, and occasionally, science fiction.',
    twitter_link: 'https://x.com/johndoe',
    instagram_link: 'https://instagram.com/johndoe',
    tiktok_link: 'https://tiktok.com/@johndoe',
    joined_date: '2025-01-15T00:00:00Z',
    follower_count: 156,
    following_count: 89,
    publications: [
      {
        id: '1',
        title: 'Getting Started with Next.js',
        excerpt: 'Learn how to build modern web applications with Next.js',
        published_date: '2025-04-10T00:00:00Z',
        read_time: 8,
        likes: 42
      },
      {
        id: '2',
        title: 'The Future of AI in Writing',
        excerpt: 'How artificial intelligence is transforming the writing industry',
        published_date: '2025-03-22T00:00:00Z',
        read_time: 12,
        likes: 78
      }
    ]
  };
};

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await fetchUserProfile(username);
        setProfile(data);
      } catch (err) {
        setError('Failed to load user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [username]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-myred-500 border-r-transparent"></div>
          <h2 className="mt-4 text-xl">Loading profile...</h2>
        </div>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-myred-500">Profile Not Found</h1>
          <p className="mt-4 text-gray-400">
            The user profile you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Link href="/" className="mt-6 inline-block px-6 py-3 bg-myred-600 hover:bg-myred-700 rounded-lg">
            Return Home
          </Link>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl mb-8">
          {/* Cover image */}
          <div className="h-48 bg-gradient-to-r from-myred-900 to-purple-900"></div>
          
          <div className="px-6 py-8 relative">
            {/* Profile picture */}
            <div className="absolute -top-16 left-6 rounded-full border-4 border-gray-800 overflow-hidden">
              <Image
                src={profile.profile_picture_url}
                alt={`${profile.first_name} ${profile.last_name}`}
                width={128}
                height={128}
                unoptimized
                className="w-32 h-32 object-cover"
              />
            </div>
            
            {/* Profile info */}
            <div className="mt-16">
              <h1 className="text-3xl font-bold">{profile.first_name} {profile.last_name}</h1>
              <p className="text-gray-400">@{profile.username}</p>
              
              {/* Bio */}
              <p className="mt-4 text-gray-300 max-w-2xl">
                {profile.author_bio}
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-6">
                <div className="flex items-center text-gray-400">
                  <Calendar size={16} className="mr-2" />
                  <span>Joined {formatDate(profile.joined_date)}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Users size={16} className="mr-2" />
                  <span>{profile.follower_count} followers</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <BookOpen size={16} className="mr-2" />
                  <span>{profile.publications?.length || 0} publications</span>
                </div>
              </div>
              
              {/* Social links */}
              <div className="flex gap-3 mt-6">
                {profile.twitter_link && (
                  <a 
                    href={profile.twitter_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                    aria-label="Twitter/X"
                  >
                    <XIcon className="w-5 h-5" />
                  </a>
                )}
                {profile.instagram_link && (
                  <a 
                    href={profile.instagram_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-5 h-5" />
                  </a>
                )}
                {profile.tiktok_link && (
                  <a 
                    href={profile.tiktok_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                    aria-label="TikTok"
                  >
                    <TiktokIcon className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Publications */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Publications</h2>
          
          {profile.publications?.length > 0 ? (
            <div className="space-y-6">
              {profile.publications.map((pub: any) => (
                <div key={pub.id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-2">
                    <Link href={`/article/${pub.id}`} className="hover:text-myred-500 transition-colors">
                      {pub.title}
                    </Link>
                  </h3>
                  <p className="text-gray-300 mb-4">{pub.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <span>{formatDate(pub.published_date)}</span>
                      <span>{pub.read_time} min read</span>
                      <span>{pub.likes} likes</span>
                    </div>
                    <Link href={`/article/${pub.id}`} className="flex items-center text-myred-500 hover:text-myred-400">
                      Read <ExternalLink size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">No publications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
