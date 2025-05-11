//app/dashboard/studio/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, 
  Bold,
  Italic,
  Underline,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  FolderOpen,
  FileText,
  MoreVertical,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Pencil,
  Trash2,
  FolderPlus,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useDebounce } from '@/app/hooks/useDebounce';
import { MarkdownEditor } from '@/app/ui/Editor/MarkDownEditor';
import NewProjectDialog from '@/app/ui/Editor/NewProjectDialog';
import DeleteProjectDialog from '@/app/ui/Editor/DeleteProjectDialog';

// Types
interface Chapter {
  id: string;
  title: string;
  words: number;
  status: 'completed' | 'in-progress' | 'outline';
  content: string;
  chapter_number: number;
  version_number: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  word_count_goal?: number;
  chapters: Chapter[];
}

interface SubscriptionInfo {
  tier_name: string;
  max_project_count: number;
  current_project_count: number;
}

export default function WritingStudio() {
  const { data: session } = useSession();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [isDocumentOutlineCollapsed, setIsDocumentOutlineCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  
  // Dialog states
  const [showChapterDialog, setShowChapterDialog] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // Debounced content for auto-save
  const debouncedContent = useDebounce(content, 2000);

  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Add a new state for editing the main chapter title
  const [isEditingMainTitle, setIsEditingMainTitle] = useState(false);
  const [mainTitleEdit, setMainTitleEdit] = useState('');

  // Project menu state
  const [showProjectMenu, setShowProjectMenu] = useState<string | null>(null);

  // Calculate word count
  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [content]);
  
  const totalProjectWords = useMemo(() => {
    if (!activeProject) return 0;
    
    return activeProject.chapters.reduce((sum, ch) => {
      // If this is the active chapter, use the current word count instead of the saved count
      if (activeChapter && ch.id === activeChapter.id) {
        return sum + wordCount;
      }
      return sum + ch.words;
    }, 0);
  }, [activeProject, activeChapter, wordCount]);
  
  const completionPercentage = activeProject?.word_count_goal 
    ? Math.min(100, Math.round((totalProjectWords / activeProject.word_count_goal) * 100))
    : 0;

  // Check if user can create more projects
  const canCreateMoreProjects = subscription 
    ? subscription.current_project_count < subscription.max_project_count 
    : false;

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [session]);

  // Auto-save when content changes
  useEffect(() => {
    if (debouncedContent && activeChapter && content !== activeChapter.content) {
      saveContent();
    }
  }, [debouncedContent]);

  const fetchProjects = async () => {
    try {
      setError(null);
      const response = await fetch('/api/projects', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setProjects(data.projects || []);
      setSubscription(data.subscription || null);
      
      // Set the first project and chapter as active
      if (data.projects && data.projects.length > 0) {
        const firstProject = data.projects[0];
        setActiveProject(firstProject);
        setExpandedProjects([firstProject.id]);
        
        if (firstProject.chapters && firstProject.chapters.length > 0) {
          const firstChapter = firstProject.chapters[0];
          setActiveChapter(firstChapter);
          setContent(firstChapter.content || '');
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewProject = async (projectData: { title: string; description: string; word_count_goal: number }) => {
    setIsCreatingProject(true);
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }

      // Refresh projects list
      await fetchProjects();
      setShowNewProjectDialog(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const deleteProject = async () => {
    if (!projectToDelete) return;
    
    setIsDeletingProject(true);
    
    try {
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // If the deleted project was active, clear it
      if (activeProject?.id === projectToDelete.id) {
        setActiveProject(null);
        setActiveChapter(null);
        setContent('');
      }

      // Refresh projects list
      await fetchProjects();
      setShowDeleteDialog(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    } finally {
      setIsDeletingProject(false);
    }
  };

  const saveContent = async () => {
    if (!activeChapter || !activeProject) return;
    
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/chapters/${activeChapter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content,
          word_count: wordCount,
        }),
      });

      if (response.ok) {
        const savedData = await response.json();
        setLastSaved(new Date());
        
        // Update local state
        setActiveChapter(prev => prev ? { ...prev, content, words: wordCount } : null);
        setProjects(prev => prev.map(proj => 
          proj.id === activeProject.id 
            ? {
                ...proj,
                chapters: proj.chapters.map(ch => 
                  ch.id === activeChapter.id 
                    ? { ...ch, content, words: wordCount }
                    : ch
                )
              }
            : proj
        ));
      }
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addNewChapter = async () => {
    if (!activeProject) return;
    
    setNewChapterTitle(`Chapter ${activeProject.chapters.length + 1}`);
    setShowChapterDialog(true);
  };

  const createChapter = async () => {
    if (!activeProject || !newChapterTitle.trim()) return;

    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          project_id: activeProject.id,
          title: newChapterTitle.trim(),
          chapter_number: activeProject.chapters.length + 1,
        }),
      });

      if (response.ok) {
        const newChapter = await response.json();
        
        // Update local state
        setProjects(prev => prev.map(proj => 
          proj.id === activeProject.id 
            ? {
                ...proj,
                chapters: [...proj.chapters, newChapter]
              }
            : proj
        ));
        
        // Update active project
        setActiveProject(prev => prev ? {
          ...prev,
          chapters: [...prev.chapters, newChapter]
        } : null);
        
        // Switch to the new chapter
        setActiveChapter(newChapter);
        setContent(newChapter.content || '');
        
        // Close dialog and reset
        setShowChapterDialog(false);
        setNewChapterTitle('');
      }
    } catch (error) {
      console.error('Failed to create chapter:', error);
    }
  };

  const handleToolbarAction = (action: string) => {
    if (window.markdownInsertText) {
      switch (action) {
        case 'bold':
          window.markdownInsertText('**', '**', 'bold text');
          break;
        case 'italic':
          window.markdownInsertText('*', '*', 'italic text');
          break;
        case 'underline':
          window.markdownInsertText('<u>', '</u>', 'underlined text');
          break;
        case 'h1':
          window.markdownInsertText('# ', '', 'Heading 1');
          break;
        case 'h2':
          window.markdownInsertText('## ', '', 'Heading 2');
          break;
        case 'h3':
          window.markdownInsertText('### ', '', 'Heading 3');
          break;
        case 'quote':
          window.markdownInsertText('> ', '', 'quote');
          break;
        case 'ul':
          window.markdownInsertText('- ', '', 'list item');
          break;
        case 'ol':
          window.markdownInsertText('1. ', '', 'list item');
          break;
      }
    }
  };

  const switchChapter = async (chapter: Chapter) => {
    // Save current chapter before switching
    if (activeChapter && content !== activeChapter.content) {
      await saveContent();
    }
    
    setActiveChapter(chapter);
    setContent(chapter.content || '');
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved yet';
    
    const diff = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    return `${Math.floor(diff / 3600)} hours ago`;
  };

  const updateChapterTitle = async (chapterId: string, fromMainTitle: boolean = false) => {
    const titleToUpdate = fromMainTitle ? mainTitleEdit : editingTitle;
    if (!titleToUpdate.trim() || !activeProject) return;
    
    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: titleToUpdate.trim(),
        }),
      });

      if (response.ok) {
        // Update local state
        setProjects(prev => prev.map(proj => 
          proj.id === activeProject.id 
            ? {
                ...proj,
                chapters: proj.chapters.map(ch => 
                  ch.id === chapterId 
                    ? { ...ch, title: titleToUpdate.trim() }
                    : ch
                )
              }
            : proj
        ));
        
        // Update active chapter
        if (activeChapter?.id === chapterId) {
          setActiveChapter(prev => prev ? { ...prev, title: titleToUpdate.trim() } : null);
        }
        
        // Update active project
        setActiveProject(prev => prev ? {
          ...prev,
          chapters: prev.chapters.map(ch => 
            ch.id === chapterId 
              ? { ...ch, title: titleToUpdate.trim() }
              : ch
          )
        } : null);
        
        // Reset editing state
        if (fromMainTitle) {
          setIsEditingMainTitle(false);
          setMainTitleEdit('');
        } else {
          setEditingChapter(null);
          setEditingTitle('');
        }
      }
    } catch (error) {
      console.error('Failed to update chapter title:', error);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setActiveProject(project);
    setExpandedProjects(prev => 
      prev.includes(project.id) ? prev : [...prev, project.id]
    );
    
    // Set first chapter as active
    if (project.chapters && project.chapters.length > 0) {
      const firstChapter = project.chapters[0];
      setActiveChapter(firstChapter);
      setContent(firstChapter.content || '');
    } else {
      setActiveChapter(null);
      setContent('');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-myred-500 mb-4">Error: {error}</div>
          <button 
            onClick={() => fetchProjects()}
            className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-myred-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <h2 className="mt-4 text-xl font-semibold text-white">Loading your writing studio...</h2>
        </div>
      </div>
    );
  }

return (
  <div className="flex h-full overflow-hidden border-t border-l border-myred-800">
    {/* Document Outline Panel */}
    <div className={`${isDocumentOutlineCollapsed ? 'w-12' : 'w-64'} bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300`}>
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        {!isDocumentOutlineCollapsed && (
          <h2 className="text-lg font-bold">Document Outline</h2>
        )}
        <button
          onClick={() => setIsDocumentOutlineCollapsed(!isDocumentOutlineCollapsed)}
          className="p-1 hover:bg-gray-700 rounded ml-auto"
        >
          {isDocumentOutlineCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      {!isDocumentOutlineCollapsed && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {/* Subscription info */}
            {subscription && (
              <div className="bg-gray-700 p-3 rounded mb-4 text-sm">
                <div className="font-semibold">{subscription.tier_name} Plan</div>
                <div className="text-gray-300">
                  {subscription.current_project_count} / {subscription.max_project_count} projects
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className="bg-myred-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(subscription.current_project_count / subscription.max_project_count) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {projects.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>No projects found.</p>
                <p className="mt-2">Click "New Project" below to create your first project</p>
              </div>
            ) : (
              <>
                {projects.map((project) => (
                  <div key={project.id} className="mb-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center flex-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProject(project.id);
                          }}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <ChevronDown 
                            size={16} 
                            className={`transition-transform ${
                              expandedProjects.includes(project.id) ? '' : '-rotate-90'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleProjectSelect(project)}
                          className="flex items-center hover:text-gray-300 transition-colors flex-1"
                        >
                          <FolderOpen size={16} className="mr-2 text-yellow-500" />
                          <span className={`font-semibold ${
                            activeProject?.id === project.id ? 'text-myred-500' : ''
                          }`}>{project.title}</span>
                        </button>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowProjectMenu(showProjectMenu === project.id ? null : project.id);
                          }}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <MoreVertical size={14} />
                        </button>
                        {showProjectMenu === project.id && (
                          <div className="absolute right-0 top-8 bg-gray-700 rounded shadow-lg py-1 z-10 w-32">
                            <button
                              onClick={() => {
                                setProjectToDelete(project);
                                setShowDeleteDialog(true);
                                setShowProjectMenu(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-600 text-myred-400 flex items-center"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {expandedProjects.includes(project.id) && (
                      <div className="ml-6 space-y-1">
                        {project.chapters && project.chapters.length > 0 ? (
                          project.chapters.map((chapter) => (
                            <button
                              key={chapter.id}
                              onClick={() => switchChapter(chapter)}
                              className={`flex items-center justify-between w-full p-2 rounded text-left transition-colors ${
                                activeChapter?.id === chapter.id 
                                  ? 'bg-myred-600 text-white' 
                                  : 'hover:bg-gray-700'
                              }`}
                            >
                              <div className="flex items-center">
                                <FileText size={14} className="mr-2" />
                                <div>
                                  <div className="text-sm">{chapter.title}</div>
                                  <div className="text-xs text-gray-400">{chapter.words} words</div>
                                </div>
                              </div>
                              {chapter.status === 'in-progress' && (
                                <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-0.5 rounded">
                                  In progress
                                </span>
                              )}
                              {chapter.status === 'outline' && (
                                <span className="text-xs text-gray-400">
                                  Outline only
                                </span>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400 p-2">
                            No chapters yet
                          </div>
                        )}
                        {activeProject?.id === project.id && (
                          <button 
                            onClick={addNewChapter}
                            className="w-full mt-2 p-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors flex items-center">
                            <Plus size={14} className="mr-2" />
                            Add chapter
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
          
          {/* Sticky New Project button at the bottom */}
          <div className="p-4 border-t border-gray-700">
            <button 
              onClick={() => setShowNewProjectDialog(true)}
              className="w-full p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors flex items-center justify-center"
            >
              <FolderPlus size={16} className="mr-2" />
              New Project
            </button>
          </div>
        </div>
      )}
    </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={saveContent}
              disabled={isSaving || !activeChapter}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm ${
                isSaving || !activeChapter
                  ? 'bg-gray-600 opacity-50' 
                  : 'bg-myred-600 hover:bg-myred-700'
              }`}
            >
              <Save size={16} />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            {activeChapter && (
              <div className="hidden md:flex items-center space-x-2 ml-4">
                <button 
                  onClick={() => handleToolbarAction('h1')}
                  className="p-1.5 hover:bg-gray-700 rounded" 
                  title="Heading 1"
                >
                  <Heading1 size={16} />
                </button>
                <button 
                  onClick={() => handleToolbarAction('h2')}
                  className="p-1.5 hover:bg-gray-700 rounded" 
                  title="Heading 2"
                >
                  <Heading2 size={16} />
                </button>
                <button 
                  onClick={() => handleToolbarAction('h3')}
                  className="p-1.5 hover:bg-gray-700 rounded" 
                  title="Heading 3"
                >
                  <Heading3 size={16} />
                </button>
                <span className="text-gray-400">|</span>
                <button 
                  onClick={() => handleToolbarAction('bold')}
                  className="p-1.5 hover:bg-gray-700 rounded" 
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button 
                  onClick={() => handleToolbarAction('italic')}
                  className="p-1.5 hover:bg-gray-700 rounded" 
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button 
                  onClick={() => handleToolbarAction('underline')}
                  className="p-1.5 hover:bg-gray-700 rounded" 
                  title="Underline"
                >
                  <Underline size={16} />
                </button>
                <span className="text-gray-400">|</span>
                <button 
                  onClick={() => handleToolbarAction('quote')}
                  className="p-1.5 hover:bg-gray-700 rounded" 
                  title="Quote"
                >
                  <Quote size={16} />
                </button>
                <span className="text-gray-400">|</span>
                <button 
                  onClick={() => handleToolbarAction('ul')}
                  className="p-1.5 hover:bg-gray-700 rounded" 
                  title="Bullet List"
                >
                  <List size={16} />
                </button>
                <button 
                  onClick={() => handleToolbarAction('ol')}
                  className="p-1.5 hover:bg-gray-700 rounded" 
                  title="Numbered List"
                >
                  <ListOrdered size={16} />
                </button>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-400">
            <span>
              {isSaving ? 'Saving...' : lastSaved ? `Auto-saved ${formatLastSaved()}` : 'Not saved yet'}
            </span>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {activeProject ? (
              activeChapter ? (
                <>
                  <div className="flex items-center mb-4 group">
                    {isEditingMainTitle ? (
                      <input
                        type="text"
                        value={mainTitleEdit}
                        onChange={(e) => setMainTitleEdit(e.target.value)}
                        onBlur={() => updateChapterTitle(activeChapter.id, true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            updateChapterTitle(activeChapter.id, true);
                          } else if (e.key === 'Escape') {
                            setIsEditingMainTitle(false);
                            setMainTitleEdit('');
                          }
                        }}
                        className="text-2xl font-bold bg-gray-800 text-white px-2 py-1 rounded border border-gray-600 focus:border-myred-500 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <h1 className="text-2xl font-bold flex items-center">
                        {activeChapter.title}
                        <button
                          onClick={() => {
                            setIsEditingMainTitle(true);
                            setMainTitleEdit(activeChapter.title);
                          }}
                          className="ml-3 p-1 rounded hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Edit chapter title"
                        >
                          <Pencil size={18} />
                        </button>
                      </h1>
                    )}
                  </div>
                  <div style={{ minHeight: 'calc(100vh - 280px)' }}>
                    <MarkdownEditor
                      value={content}
                      onChange={setContent}
                      placeholder="Start writing..."
                      className="leading-relaxed"
                      onToolbarAction={handleToolbarAction}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 mt-20">
                  <h2 className="text-xl font-semibold mb-4">{activeProject.title}</h2>
                  <p className="mb-6">{activeProject.description}</p>
                  <button 
                    onClick={addNewChapter}
                    className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded flex items-center mx-auto"
                  >
                    <Plus size={18} className="mr-2" />
                    Create First Chapter
                  </button>
                </div>
              )
            ) : (
              <div className="text-center text-gray-400 mt-20">
                <p>Select a project to start writing</p>
              </div>
            )}
          </div>
        </div>
        

        {/* Bottom Status Bar */}
        <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span>Current: {wordCount} words</span>
            <span>Total: {totalProjectWords} words</span>
            {activeProject?.word_count_goal && (
              <>
                <span>Goal: {activeProject.word_count_goal.toLocaleString()}</span>
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-myred-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span>{completionPercentage}% complete</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant - Right Panel */}
      <div className={`${isRightPanelCollapsed ? 'w-12' : 'w-80'} bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <button
            onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {isRightPanelCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          {!isRightPanelCollapsed && (
            <h2 className="text-lg font-bold">AI Tools</h2>
          )}
        </div>
        
        {!isRightPanelCollapsed && (
          <div className="flex-1 overflow-y-auto p-4">
            {/* AI Tools Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">AI Tools</h3>
              <div className="space-y-2">
                <button className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-left">
                  Continue Story
                </button>
                <button className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-left">
                  Improve Writing
                </button>
                <button className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-left">
                  Add Description
                </button>
                <button className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-left">
                  Character Ideas
                </button>
              </div>
            </div>

            {/* Writing Stats Section */}
            {activeChapter && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Writing Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Chapter</span>
                    <span>{wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Words</span>
                    <span>{totalProjectWords}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Characters</span>
                    <span>{content.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reading Time</span>
                    <span>~{Math.ceil(wordCount / 200)} min</span>
                  </div>
                </div>
              </div>
            )}

            {/* Writing Tips Section */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Writing Tips</h3>
              <div className="bg-gray-700 p-3 rounded text-sm">
                <p className="mb-2">Keep your paragraphs concise for better readability.</p>
                <p className="mb-2">Show, don't tell - use descriptive language to paint scenes.</p>
                <p>Maintain consistent voice throughout your narrative.</p>
              </div>
            </div>

            {/* Ask AI for help */}
            <div className="mt-6">
              <input
                type="text"
                placeholder="Ask AI for help..."
                className="w-full p-2 bg-gray-700 rounded text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-myred-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chapter Title Dialog */}
      {showChapterDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Chapter</h2>
            <input
              type="text"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              placeholder="Chapter title..."
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded mb-4 focus:border-myred-500 focus:outline-none"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  createChapter();
                }
              }}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowChapterDialog(false);
                  setNewChapterTitle('');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
              >
                Cancel
              </button>
              <button
                onClick={createChapter}
                disabled={!newChapterTitle.trim()}
                className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Chapter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Dialog */}
      <NewProjectDialog
        isOpen={showNewProjectDialog}
        onClose={() => setShowNewProjectDialog(false)}
        onCreateProject={createNewProject}
        canCreateMoreProjects={canCreateMoreProjects}
        isCreating={isCreatingProject}
      />

      {/* Delete Project Dialog */}
      <DeleteProjectDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setProjectToDelete(null);
        }}
        onConfirm={deleteProject}
        projectTitle={projectToDelete?.title || ''}
        isDeleting={isDeletingProject}
      />
    </div>
  );
}