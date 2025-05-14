// app/ui/dashboard/NewProjectDialog.tsx
'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: { title: string; description: string; word_count_goal: number }) => void;
  canCreateMoreProjects: boolean;
  isCreating: boolean;
}

export default function NewProjectDialog({
  isOpen,
  onClose,
  onCreateProject,
  canCreateMoreProjects,
  isCreating
}: NewProjectDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [wordCountGoal, setWordCountGoal] = useState(50000);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (wordCountGoal < 100) {
      newErrors.wordCountGoal = 'Word count goal must be at least 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onCreateProject({
        title: title.trim(),
        description: description.trim(),
        word_count_goal: wordCountGoal,
      });
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setWordCountGoal(50000);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Create New Project</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X size={20} />
          </button>
        </div>
        
        {!canCreateMoreProjects && (
          <div className="bg-yellow-600 text-yellow-100 p-3 rounded mb-4">
            <p className="text-sm">
              You've reached the project limit for your current subscription. 
              Upgrade to create more projects.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Project Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
              disabled={!canCreateMoreProjects}
            />
            {errors.title && (
              <p className="text-myred-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
              disabled={!canCreateMoreProjects}
            />
            {errors.description && (
              <p className="text-myred-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="wordCountGoal" className="block text-sm font-medium mb-2">
              Word Count Goal
            </label>
            <input
              type="number"
              id="wordCountGoal"
              value={wordCountGoal}
              onChange={(e) => setWordCountGoal(parseInt(e.target.value) || 0)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
              min={100}
              disabled={!canCreateMoreProjects}
            />
            {errors.wordCountGoal && (
              <p className="text-myred-500 text-sm mt-1">{errors.wordCountGoal}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canCreateMoreProjects || isCreating}
              className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}