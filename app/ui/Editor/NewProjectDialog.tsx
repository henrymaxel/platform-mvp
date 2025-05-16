'use client';

import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import ProjectCharacters from './ProjectCharacters';

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
  // Track the current step in the wizard
  const [step, setStep] = useState(1);
  // Store the project ID after creation to use in character selection
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setWordCountGoal(50000);
      setErrors({});
      setStep(1);
      setCreatedProjectId(null);
    }
  }, [isOpen]);

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
    setStep(1);
    setCreatedProjectId(null);
    onClose();
  };

  const handleNextStep = () => {
    if (step === 1 && validateForm()) {
      setStep(2);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg">
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

        {/* Step indicator */}
        <div className="flex items-center mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-myred-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-myred-600' : 'bg-gray-700'
            }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-myred-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}>
            2
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
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
                disabled={!canCreateMoreProjects}
                className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-gray-400 text-sm">{description}</p>
              <p className="text-gray-400 text-sm mt-1">Word Count Goal: {wordCountGoal.toLocaleString()}</p>
            </div>

            <div className="space-y-4">
              {/* Character selection will be shown here after project is created */}
              {createdProjectId ? (
                <ProjectCharacters projectId={createdProjectId} />
              ) : (
                <div className="bg-gray-700 p-4 rounded">
                  <p className="text-center text-gray-400">
                    You'll be able to add characters after creating your project
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between space-x-3 mt-6">
              {!createdProjectId && (
                <>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isCreating || !canCreateMoreProjects}
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
                </>
              )}

              {createdProjectId && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded ml-auto"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}