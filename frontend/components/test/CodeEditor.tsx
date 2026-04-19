'use client';
import { useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
}

export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  placeholder,
}: CodeEditorProps) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <Editor
        height="250px"
        language={language}
        value={value}
        onChange={(val) => onChange(val || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          placeholder,
        }}
      />
    </div>
  );
}