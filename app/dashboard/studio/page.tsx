//app/dashboard/studio/page.tsx
'use client';

import React, { useState } from 'react';
import { 
  Save, 
  AlignLeft,
  AlignCenter,
  AlignJustify,
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
} from 'lucide-react';

// Mock data for projects
const mockProjects = [
  {
    id: '1',
    title: 'The Lost Kingdom',
    chapters: [
      { id: '1-1', title: 'Chapter 1: The Archway', words: 1245, status: 'completed' },
      { id: '1-2', title: 'Chapter 2: The Hidden Realm', words: 0, status: 'in-progress' },
      { id: '1-3', title: 'Chapter 3: The Eldari People', words: 0, status: 'outline' },
      { id: '1-4', title: 'Chapter 4: The Ancient Magic', words: 0, status: 'outline' },
      { id: '1-5', title: 'Chapter 5: The Prophecy', words: 0, status: 'outline' },
    ]
  }
];

export default function WritingStudio() {
  const [activeProject, setActiveProject] = useState(mockProjects[0]);
  const [activeChapter, setActiveChapter] = useState(activeProject.chapters[0]);
  const [content, setContent] = useState(`# The Lost Kingdom

The morning sun cast long shadows across the ancient stones of Eldreth. As Kira approached the crumbling archway, she felt a strange tingling sensation at her fingertips. Magic. It had to be.

"We shouldn't be here," whispered Tomas, her reluctant companion. "These ruins are forbidden for a reason."

Kira ignored him, her attention fixed on the strange symbols etched into the weathered stone. They seemed to shimmer and shift when she wasn't looking directly at them.`);
  
  const [isDocumentOutlineCollapsed, setIsDocumentOutlineCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<string[]>(['1']);
  const [wordCount, setWordCount] = useState(246);

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

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
            {mockProjects.map((project) => (
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
                    {project.chapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        onClick={() => setActiveChapter(chapter)}
                        className={`flex items-center justify-between w-full p-2 rounded text-left transition-colors ${
                          activeChapter.id === chapter.id 
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
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button className="mt-4 flex items-center text-gray-400 hover:text-white transition-colors">
              <Plus size={16} className="mr-2" />
              Add new chapter
            </button>
          </div>
        )}
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm">
              <Save size={16} />
              <span>Save</span>
            </button>
            <div className="hidden md:flex items-center space-x-2 ml-4">
              <select className="bg-gray-700 text-sm px-2 py-1 rounded">
                <option>Normal Text</option>
                <option>Heading 1</option>
                <option>Heading 2</option>
                <option>Heading 3</option>
              </select>
              <span className="text-gray-400">|</span>
              <button className="p-1.5 hover:bg-gray-700 rounded">
                <Bold size={16} />
              </button>
              <button className="p-1.5 hover:bg-gray-700 rounded">
                <Italic size={16} />
              </button>
              <button className="p-1.5 hover:bg-gray-700 rounded">
                <Underline size={16} />
              </button>
              <span className="text-gray-400">|</span>
              <button className="p-1.5 hover:bg-gray-700 rounded">
                <AlignLeft size={16} />
              </button>
              <button className="p-1.5 hover:bg-gray-700 rounded">
                <AlignCenter size={16} />
              </button>
              <button className="p-1.5 hover:bg-gray-700 rounded">
                <AlignJustify size={16} />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            <span>Auto-saved 2 mins ago</span>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full bg-gray-900 text-white resize-none outline-none leading-relaxed"
              style={{ minHeight: 'calc(100vh - 280px)' }}
              placeholder="Start writing..."
            />
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span>Total: {wordCount} words</span>
            <span>Goal: 50,000</span>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '15%' }}></div>
            </div>
            <span>15% complete</span>
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
                  <span className="text-gray-400">Word Count</span>
                  <span>{wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Characters</span>
                  <span>1423</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sentences</span>
                  <span>15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reading Time</span>
                  <span>~1 min</span>
                </div>
              </div>
            </div>

            {/* Writing Tips Section */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Writing Tips</h3>
              <div className="bg-gray-700 p-3 rounded text-sm">
                <p className="mb-2">Your dialogue is engaging and helps reveal character personalities.</p>
                <p className="mb-2">Consider adding more sensory details to enhance the magical atmosphere.</p>
                <p>Your pacing is good. The scene builds tension effectively toward the climactic moment.</p>
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
    </div>
  );
}