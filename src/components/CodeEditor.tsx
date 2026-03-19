"use client";

import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  theme?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'javascript',
  height = '400px',
  theme = 'vs-light',
}) => {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };
  const isDark = theme.toLowerCase().includes('dark');

  return (
    <div style={{ 
      border: isDark ? '1px solid #273449' : '1px solid #d9d9d9',
      borderRadius: '6px',
      overflow: 'hidden',
      background: isDark ? '#0f172a' : '#ffffff',
    }}>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        theme={theme}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible'
          },
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          folding: true,
          lineNumbersMinChars: 3,
          glyphMargin: false,
        }}
        loading={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '400px',
            background: isDark ? '#0f172a' : '#f5f5f5',
            color: isDark ? '#cbd5e1' : '#111827',
          }}>
            Loading Code Editor...
          </div>
        }
      />
    </div>
  );
};

export default CodeEditor;
