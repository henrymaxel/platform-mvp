'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function PublicationsPage() {
  const router = useRouter();
  // This would normally come from your API/database
  const [publications, setPublications] = useState([
    {
      id: '1',
      title: 'Getting Started with Next.js',
      status: 'published',
      date: 'May 10, 2025',
      views: 1243,
      likes: 89,
    },
    {
      id: '2',
      title: 'The Future of AI in Writing',
      status: 'draft',
      date: 'May 15, 2025',
      views: 0,
      likes: 0,
    },
  ]);

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/settings" className="mr-4 p-2 hover:bg-gray-700 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">My Publications</h1>
        </div>
        
        {/* Empty state */}
        {publications.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Publications Yet</h2>
            <p className="text-gray-400 mb-6">
              You haven't published any content yet. Start writing and publish your first story.
            </p>
            <button
              onClick={() => router.push('/dashboard/studio')}
              className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded"
            >
              Go to Writing Studio
            </button>
          </div>
        )}
        
        {/* Publications list */}
        {publications.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Your Publications</h2>
                <p className="text-sm text-gray-400">Manage your published and draft content</p>
              </div>
              <div>
                <button
                  onClick={() => router.push('/dashboard/studio')}
                  className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded"
                >
                  Create New
                </button>
              </div>
            </div>
            
            <div className="overflow-hidden bg-gray-800 rounded-lg">
              {publications.map((pub, index) => (
                <div 
                  key={pub.id}
                  className={`p-4 flex items-center justify-between ${
                    index < publications.length - 1 ? 'border-b border-gray-700' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-semibold">{pub.title}</h3>
                      <span className={`ml-3 px-2 py-0.5 text-xs rounded-full ${
                        pub.status === 'published' 
                          ? 'bg-green-500 bg-opacity-20 text-green-400' 
                          : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                      }`}>
                        {pub.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {pub.status === 'published' ? (
                        <>Published on {pub.date} • {pub.views} views • {pub.likes} likes</>
                      ) : (
                        <>Last edited on {pub.date}</>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {pub.status === 'published' && (
                      <button className="p-2 hover:bg-gray-700 rounded" title="View">
                        <Eye size={18} className="text-gray-400" />
                      </button>
                    )}
                    <button className="p-2 hover:bg-gray-700 rounded" title="Edit">
                      <Edit size={18} className="text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-700 rounded" title="Delete">
                      <Trash2 size={18} className="text-myred-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}