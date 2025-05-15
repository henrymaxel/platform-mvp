//app/ui/Editor/PublishDialog.tsx
'use client';

import React, { useState } from 'react';
import { ArrowUpFromLine, BookText, X } from 'lucide-react';
import { publishProject } from '@/app/lib/actions/publications';

interface PublishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  wordCount: number;
  onSuccess?: () => void;
}

export default function PublishDialog({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  wordCount,
  onSuccess
}: PublishDialogProps) {
  const [title, setTitle] = useState(projectTitle);
  const [publisher, setPublisher] = useState('The Boring Platform');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('fiction');
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsPublishing(true);
        setError(null);
        
        // Create form data for the server action
        const formData = new FormData();
        formData.append('projectId', projectId);
        formData.append('title', title.trim());
        formData.append('publisher', publisher.trim());
        formData.append('status', 'published');
        formData.append('tags', tags.join(','));
        formData.append('genre', genre);
        formData.append('description', description.trim());
        formData.append('language', 'en');
        formData.append('readingTimeEstimate', Math.ceil(wordCount / 200).toString());
        
        // Call the server action
        await publishProject(formData);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Close the dialog
        onClose();
      } catch (error) {
        console.error('Publishing error:', error);
        setError(error instanceof Error ? error.message : 'Failed to publish project');
      } finally {
        setIsPublishing(false);
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-myred-600 rounded-full mr-3">
              <ArrowUpFromLine size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold">Publish Your Work</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="bg-myred-500 text-white p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Publication Title*
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
            />
            {errors.title && (
              <p className="text-myred-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="publisher" className="block text-sm font-medium mb-2">
              Publisher
            </label>
            <input
              type="text"
              id="publisher"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label htmlFor="genre" className="block text-sm font-medium mb-2">
              Genre
            </label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
            >
              <option value="fiction">Fiction</option>
              <option value="non-fiction">Non-Fiction</option>
              <option value="poetry">Poetry</option>
              <option value="sci-fi">Science Fiction</option>
              <option value="fantasy">Fantasy</option>
              <option value="mystery">Mystery</option>
              <option value="thriller">Thriller</option>
              <option value="romance">Romance</option>
              <option value="horror">Horror</option>
              <option value="biography">Biography</option>
              <option value="history">History</option>
              <option value="self-help">Self-Help</option>
              <option value="technical">Technical</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags
            </label>
            <div className="flex">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-l focus:border-myred-500 focus:outline-none"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-r"
              >
                Add
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <div 
                    key={index} 
                    className="px-2 py-1 bg-myred-600 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-gray-300 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description*
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
              placeholder="Provide a brief description of your publication..."
            />
            {errors.description && (
              <p className="text-myred-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg mt-4">
            <div className="flex items-center mb-2">
              <BookText size={16} className="text-myred-500 mr-2" />
              <h3 className="text-sm font-medium">Publishing This Work Will:</h3>
            </div>
            <ul className="text-sm text-gray-300 space-y-1 ml-6 list-disc">
              <li>Make it visible in the Reading Library</li>
              <li>Prepare it for on-chain publishing (future feature)</li>
              <li>Allow tracking of reader metrics</li>
            </ul>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
              disabled={isPublishing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPublishing}
              className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isPublishing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Publishing...
                </>
              ) : (
                <>
                  <ArrowUpFromLine size={16} className="mr-2" />
                  Publish
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}