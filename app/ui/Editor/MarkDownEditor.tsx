'use client';

import React, { useRef, useEffect, useState } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onToolbarAction?: (action: string) => void;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing...",
  className = "",
  onToolbarAction 
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [highlightedHtml, setHighlightedHtml] = useState('');

  // Basic markdown syntax highlighting
  useEffect(() => {
    const highlighted = value
      // Headers
      .replace(/^(#{1,6})\s(.+)$/gm, '<span class="text-blue-400">$1</span> <span class="text-blue-300 font-bold">$2</span>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<span class="text-yellow-400">**</span><span class="font-bold">$1</span><span class="text-yellow-400">**</span>')
      // Italic
      .replace(/\*(.*?)\*/g, '<span class="text-yellow-400">*</span><span class="italic">$1</span><span class="text-yellow-400">*</span>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<span class="text-green-400">```</span><span class="text-green-300">$1</span><span class="text-green-400">```</span>')
      // Inline code
      .replace(/`([^`]+)`/g, '<span class="text-green-400">`</span><span class="text-green-300">$1</span><span class="text-green-400">`</span>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="text-purple-400">[</span><span class="text-purple-300">$1</span><span class="text-purple-400">](</span><span class="text-purple-500 underline">$2</span><span class="text-purple-400">)</span>')
      // Blockquotes
      .replace(/^>\s(.+)$/gm, '<span class="text-gray-400">></span> <span class="text-gray-300 italic">$1</span>')
      // Lists
      .replace(/^[-*+]\s(.+)$/gm, '<span class="text-orange-400">•</span> $1')
      .replace(/^\d+\.\s(.+)$/gm, '<span class="text-orange-400">$&</span>');

    setHighlightedHtml(highlighted);
  }, [value]);

  const handleScroll = () => {
    if (textareaRef.current) {
      const scrollPercentage = textareaRef.current.scrollTop / 
        (textareaRef.current.scrollHeight - textareaRef.current.clientHeight);
      
      const highlightedDiv = textareaRef.current.nextElementSibling as HTMLDivElement;
      if (highlightedDiv) {
        highlightedDiv.scrollTop = scrollPercentage * 
          (highlightedDiv.scrollHeight - highlightedDiv.clientHeight);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        className={`absolute inset-0 w-full h-full bg-transparent text-transparent caret-white resize-none outline-none z-10 font-mono ${className}`}
        placeholder={placeholder}
        style={{ caretColor: 'white' }}
      />
      <div 
        className="absolute inset-0 w-full h-full bg-gray-900 text-white overflow-auto pointer-events-none font-mono whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}