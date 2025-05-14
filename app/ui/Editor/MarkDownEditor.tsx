// app/ui/Editor/MarkDownEditor.tsx
import React, { useEffect, useRef, useState } from 'react';
import styles from './editor.module.css';

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
  const [isPreview, setIsPreview] = useState(false);

  // Enhanced text insertion with proper cursor positioning
  const insertText = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;
    
    const newValue = 
      value.substring(0, start) + 
      before + selectedText + after + 
      value.substring(end);
    
    onChange(newValue);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertText('**', '**', 'bold text');
          break;
        case 'i':
          e.preventDefault();
          insertText('*', '*', 'italic text');
          break;
        // Removed code and link shortcuts
      }
    }
    
    // Handle tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current?.selectionStart ?? 0;
      const end = textareaRef.current?.selectionEnd ?? 0;
      
      if (e.shiftKey) {
        // Remove indentation
        const lines = value.split('\n');
        let currentPos = 0;
        let lineStart = 0;
        let lineEnd = 0;
        
        for (let i = 0; i < lines.length; i++) {
          lineEnd = currentPos + lines[i].length;
          if (currentPos <= start && start <= lineEnd) {
            lineStart = currentPos;
            break;
          }
          currentPos = lineEnd + 1;
        }
        
        if (value.substring(lineStart, lineStart + 2) === '  ') {
          const newValue = value.substring(0, lineStart) + value.substring(lineStart + 2);
          onChange(newValue);
          setTimeout(() => {
            textareaRef.current?.setSelectionRange(start - 2, end - 2);
          }, 0);
        }
      } else {
        // Add indentation
        insertText('  ', '', '');
      }
    }
  };

  // Make toolbar actions work with the new insert method
  useEffect(() => {
    if (onToolbarAction) {
      window.markdownInsertText = insertText;
    }
    return () => {
      delete window.markdownInsertText;
    };
  }, [value]);

  // Improved markdown preview renderer with proper styling
  const renderPreview = (text: string) => {
    // Basic markdown parsing
    let html = text
      // Headers (process these first to avoid conflicts)
      .replace(/^### (.*?)$/gm, '<h3 class="text-xl font-bold mb-2">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-bold mb-3">$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Blockquotes
      .replace(/^> (.*?)$/gm, '<blockquote class="border-l-4 border-gray-600 pl-4 my-2 text-gray-300">$1</blockquote>')
      // Fix bullet points - no double bullets
      .replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.*?)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      // Paragraphs (wrap lines that aren't already wrapped in tags)
      .split('\n\n').map(paragraph => {
        if (!paragraph.match(/^<[^>]+>/)) {
          return `<p class="mb-4">${paragraph.replace(/\n/g, '<br />')}</p>`;
        }
        return paragraph;
      }).join('\n')
      // Line breaks within paragraphs
      .replace(/([^>])\n([^<])/g, '$1<br />$2');
    
    return { __html: html };
  };

  return (
    <div className={styles.editorContainer}>
      {/* Toggle Preview Button */}
      <div className={styles.togglePreview}>
        <button
          onClick={() => setIsPreview(!isPreview)}
          className={styles.toggleButton}
        >
          {isPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor/Preview Area */}
      {isPreview ? (
        <div 
          className={`${styles.editorArea} prose prose-invert max-w-none ${className}`}
        >
          <div 
            dangerouslySetInnerHTML={renderPreview(value)}
          />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${styles.textarea} ${className}`}
        />
      )}

      {/* Status bar with word count */}
      <div className={styles.statusBar}>
        {!isPreview && (
          <div className={styles.keyboardShortcuts}>
            <span>Ctrl+B: Bold</span>
            <span>Ctrl+I: Italic</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Extend window interface for toolbar communication
declare global {
  interface Window {
    markdownInsertText?: (before: string, after?: string, defaultText?: string) => void;
  }
}