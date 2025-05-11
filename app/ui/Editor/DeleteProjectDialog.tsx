// app/ui/dashboard/DeleteProjectDialog.tsx
'use client';

import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectTitle: string;
  isDeleting: boolean;
}

export default function DeleteProjectDialog({
  isOpen,
  onClose,
  onConfirm,
  projectTitle,
  isDeleting
}: DeleteProjectDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-red-600 rounded-full mr-3">
            <AlertTriangle size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">Delete Project</h2>
        </div>
        
        <p className="mb-4 text-gray-300">
          Are you sure you want to delete <span className="font-semibold">"{projectTitle}"</span>? 
          This action cannot be undone and all chapters and content will be permanently deleted.
        </p>
        
        <div className="bg-gray-900 p-3 rounded mb-6">
          <p className="text-sm text-gray-400">
            This will delete:
          </p>
          <ul className="text-sm text-gray-400 mt-2 space-y-1">
            <li>• All chapters and their content</li>
            <li>• All project settings and metadata</li>
            <li>• All comments and feedback</li>
          </ul>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Delete Project
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}