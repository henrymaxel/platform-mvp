//app/dashboard/studio/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useDebounce } from '@/app/hooks/useDebounce';
import { MarkdownEditor } from '@/app/ui/Editor/MarkDownEditor';

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

export default function WritingStudio() {
  const { data: session } = useSession();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
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
  
  // Chapter dialog state
  const [showChapterDialog, setShowChapterDialog] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Debounced content for auto-save
  const debouncedContent = useDebounce(content, 2000);

  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Add a new state for editing the main chapter title
  const [isEditingMainTitle, setIsEditingMainTitle] = useState(false);
  const [mainTitleEdit, setMainTitleEdit] = useState('');

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
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }
      
      setProjects(data);
      
      // Set the first project and chapter as active
      if (data.length > 0) {
        const firstProject = data[0];
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
      } else {
        console.error('Save failed:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Updated to show dialog instead of creating directly
  const addNewChapter = async () => {
    if (!activeProject) return;
    
    // Set a default title and show the dialog
    setNewChapterTitle(`Chapter ${activeProject.chapters.length + 1}`);
    setShowChapterDialog(true);
  };

  // Function to handle the actual chapter creation
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

  // Updated to remove code, link, and image functionality
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

  // Update the updateChapterTitle function to handle both sidebar and main title edits
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
      if (fromMainTitle) {
        setIsEditingMainTitle(false);
        setMainTitleEdit('');
      }
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button 
            onClick={() => fetchProjects()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent"></div>
          <p className="mt-2">Loading studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden border-t border-l border-red-800">
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
          <div className="flex-1 overflow-y-auto p-4">
            {projects.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>No projects found.</p>
                <button 
                  className="mt-4 flex items-center text-gray-400 hover:text-white transition-colors mx-auto">
                  <Plus size={16} className="mr-2" />
                  Create your first project
                </button>
              </div>
            ) : (
              <>
                {projects.map((project) => (
                  <div key={project.id} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => toggleProject(project.id)}
                        className="flex items-center hover:text-gray-300 transition-colors"
                      >
                        {expandedProjects.includes(project.id) ? (
                          <ChevronDown size={16} className="mr-2" />
                        ) : (
                          <ChevronRight size={16} className="mr-2" />
                        )}
                        <FolderOpen size={16} className="mr-2 text-yellow-500" />
                        <span className="font-semibold">{project.title}</span>
                      </button>
                      <button className="p-1 hover:bg-gray-700 rounded">
                        <MoreVertical size={14} />
                      </button>
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
                                  ? 'bg-red-600 text-white' 
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
                      </div>
                    )}
                  </div>
                ))}
                <button 
                  onClick={addNewChapter}
                  className="mt-4 flex items-center text-gray-400 hover:text-white transition-colors">
                  <Plus size={16} className="mr-2" />
                  Add new chapter
                </button>
              </>
            )}
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
              disabled={isSaving}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm ${
                isSaving 
                  ? 'bg-gray-600 opacity-50' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Save size={16} />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
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
            {activeChapter ? (
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
                      className="text-2xl font-bold bg-gray-800 text-white px-2 py-1 rounded border border-gray-600 focus:border-red-500 focus:outline-none"
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
                <p>Select a chapter to start writing</p>
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
                    className="bg-red-500 h-2 rounded-full transition-all duration-300" 
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
                className="w-full p-2 bg-gray-700 rounded text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-500"
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
             className="w-full p-2 bg-gray-700 border border-gray-600 rounded mb-4 focus:border-red-500 focus:outline-none"
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
               className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Create Chapter
             </button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
}