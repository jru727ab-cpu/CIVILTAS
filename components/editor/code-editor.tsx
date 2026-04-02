"use client"

import { useRef, useCallback } from "react"
import Editor, { type OnMount, type Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { useTheme } from "next-themes"

interface CodeEditorProps {
  value: string
  language: string
  onChange: (value: string) => void
  readOnly?: boolean
  fontSize?: number
}

export function CodeEditor({ 
  value, 
  language, 
  onChange, 
  readOnly = false,
  fontSize = 14,
}: CodeEditorProps) {
  const { theme } = useTheme()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Define custom dark theme matching our design
    monaco.editor.defineTheme('codeforge-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '93c5fd' },
        { token: 'string', foreground: '86efac' },
        { token: 'number', foreground: 'fcd34d' },
        { token: 'type', foreground: '67e8f9' },
        { token: 'function', foreground: 'c4b5fd' },
        { token: 'variable', foreground: 'f9fafb' },
      ],
      colors: {
        'editor.background': '#0f1219',
        'editor.foreground': '#f9fafb',
        'editor.lineHighlightBackground': '#1f2937',
        'editor.selectionBackground': '#374151',
        'editorCursor.foreground': '#38bdf8',
        'editorIndentGuide.background': '#374151',
        'editorLineNumber.foreground': '#6b7280',
        'editorLineNumber.activeForeground': '#d1d5db',
      },
    })

    monaco.editor.defineTheme('codeforge-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#fafafa',
      },
    })

    monaco.editor.setTheme(theme === 'dark' ? 'codeforge-dark' : 'codeforge-light')

    // Focus editor
    editor.focus()
  }, [theme])

  const handleChange = useCallback((value: string | undefined) => {
    onChange(value || '')
  }, [onChange])

  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-border bg-card">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme={theme === 'dark' ? 'codeforge-dark' : 'codeforge-light'}
        options={{
          fontSize,
          fontFamily: 'var(--font-mono)',
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          readOnly,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
          tabSize: 2,
          insertSpaces: true,
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          suggest: {
            showMethods: true,
            showFunctions: true,
            showConstructors: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showStructs: true,
            showInterfaces: true,
            showModules: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showKeywords: true,
            showWords: true,
            showColors: true,
            showFiles: true,
            showReferences: true,
            showFolders: true,
            showTypeParameters: true,
            showSnippets: true,
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading editor...
          </div>
        }
      />
    </div>
  )
}
