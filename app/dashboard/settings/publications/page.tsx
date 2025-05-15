//app/dashboard/settings/publications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LoadingDashboard from '../../loading';
import { getUserPublications, removePublication } from '@/app/lib/actions/publications';
import { Publication } from '@/app/lib/definitions';

export default function PublicationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState<Publication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchPublications();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [status, session]);

  const fetchPublications = async () => {
    try {
      const data = await getUserPublications();
      setPublications(data || []);
    } catch (error) {
      console.error('Error fetching publications:', error);
      setError('Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (publication: Publication) => {
    setPublicationToDelete(publication);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!publicationToDelete) return;
    
    try {
      setIsDeleting(true);
      await removePublication(publicationToDelete.id);
      
      // Remove from local state
      setPublications(prevPublications => 
        prevPublications.filter(pub => pub.id !== publicationToDelete.id)
      );
      
      setShowDeleteDialog(false);
      setPublicationToDelete(null);
    } catch (error) {
      console.error('Error deleting publication:', error);
      setError('Failed to delete publication');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (status === 'loading' || loading) {
    return <LoadingDashboard />;
  }

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/settings" className="mr-4 p-2 hover:bg-gray-700 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">My Publications</h1>
        </div>
        
        {error && (
          <div className="bg-myred-500 text-white p-4 rounded mb-6">
            {error}
          </div>
        )}
        
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
                          : pub.status === 'pending'
                          ? 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                          : 'bg-gray-500 bg-opacity-20 text-gray-400'
                      }`}>
                        {pub.status === 'published' ? 'Published' : 
                         pub.status === 'pending' ? 'Pending' : 'Draft'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {pub.status === 'published' ? (
                        <>
                          Published on {formatDate(pub.first_edition_timestamp || pub.created_at)} • 
                          {pub.views_count || 0} views • 
                          {pub.unique_readers_count || 0} readers
                        </>
                      ) : (
                        <>Last edited on {formatDate(pub.updated_at)}</>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {pub.status === 'published' && (
                      <button 
                        onClick={() => router.push(`/read/${pub.id}`)}
                        className="p-2 hover:bg-gray-700 rounded" 
                        title="View"
                      >
                        <Eye size={18} className="text-gray-400" />
                      </button>
                    )}
                    <button 
                      onClick={() => router.push(`/dashboard/studio?publication=${pub.id}`)}
                      className="p-2 hover:bg-gray-700 rounded" 
                      title="Edit"
                    >
                      <Edit size={18} className="text-gray-400" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(pub)}
                      className="p-2 hover:bg-gray-700 rounded" 
                      title="Delete"
                    >
                      <Trash2 size={18} className="text-myred-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && publicationToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Delete Publication</h2>
              <p className="mb-6">
                Are you sure you want to delete "{publicationToDelete.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setPublicationToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}