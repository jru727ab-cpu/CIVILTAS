"use client"

import { useState, useEffect, useCallback } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen,
  Settings,
  Bug,
  Save,
  Menu,
} from "lucide-react"
import { db, generateId, type FileEntry, type Commit, type Branch, type UserSettings } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileTree } from "./file-tree"
import { CodeEditor } from "./code-editor"
import { EditorTabs } from "./editor-tabs"
import { GitPanel } from "./git-panel"
import { AIChat } from "./ai-chat"
import { useIsMobile } from "@/hooks/use-mobile"

interface EditorWorkspaceProps {
  projectId: string
  projectName: string
  settings: UserSettings
  onBack: () => void
  onOpenBugReport: () => void
}

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const languages: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript',
    js: 'javascript', jsx: 'javascript',
    html: 'html', css: 'css', scss: 'scss',
    json: 'json', md: 'markdown',
    py: 'python', rs: 'rust', go: 'go',
    java: 'java', c: 'c', cpp: 'cpp',
    rb: 'ruby', php: 'php', sql: 'sql',
  }
  return languages[ext || ''] || 'plaintext'
}

export function EditorWorkspace({ 
  projectId, 
  projectName, 
  settings,
  onBack,
  onOpenBugReport,
}: EditorWorkspaceProps) {
  const isMobile = useIsMobile()
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile)
  const [showRightPanel, setShowRightPanel] = useState(false)
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [openFiles, setOpenFiles] = useState<FileEntry[]>([])
  const [modifiedFiles, setModifiedFiles] = useState<Set<string>>(new Set())
  const [fileContents, setFileContents] = useState<Map<string, string>>(new Map())
  const [currentBranch, setCurrentBranch] = useState("main")
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [newFileType, setNewFileType] = useState<'file' | 'folder'>('file')
  const [newFileParent, setNewFileParent] = useState("")
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Database queries
  const files = useLiveQuery(
    () => db.files.where('projectId').equals(projectId).toArray(),
    [projectId],
    []
  )

  const commits = useLiveQuery(
    () => db.commits.where('projectId').equals(projectId).reverse().sortBy('timestamp'),
    [projectId],
    []
  )

  const branches = useLiveQuery(
    () => db.branches.where('projectId').equals(projectId).toArray(),
    [projectId],
    []
  )

  // Initialize default branch if none exists
  useEffect(() => {
    async function initBranch() {
      const existingBranches = await db.branches.where('projectId').equals(projectId).count()
      if (existingBranches === 0) {
        await db.branches.add({
          id: generateId(),
          projectId,
          name: 'main',
          currentCommitId: null,
          createdAt: new Date(),
        })
      }
    }
    initBranch()
  }, [projectId])

  const activeFile = files?.find(f => f.id === activeFileId)
  const currentContent = activeFileId ? fileContents.get(activeFileId) ?? activeFile?.content ?? '' : ''

  const handleFileSelect = useCallback((file: FileEntry) => {
    if (file.type === 'folder') return
    
    setActiveFileId(file.id)
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles(prev => [...prev, file])
    }
    if (!fileContents.has(file.id)) {
      setFileContents(prev => new Map(prev).set(file.id, file.content))
    }
    if (isMobile) {
      setShowLeftPanel(false)
    }
  }, [openFiles, fileContents, isMobile])

  const handleTabClose = useCallback((file: FileEntry) => {
    setOpenFiles(prev => prev.filter(f => f.id !== file.id))
    if (activeFileId === file.id) {
      const remaining = openFiles.filter(f => f.id !== file.id)
      setActiveFileId(remaining.length > 0 ? remaining[remaining.length - 1].id : null)
    }
  }, [activeFileId, openFiles])

  const handleContentChange = useCallback((content: string) => {
    if (!activeFileId) return
    setFileContents(prev => new Map(prev).set(activeFileId, content))
    setModifiedFiles(prev => new Set(prev).add(activeFileId))
  }, [activeFileId])

  const handleSave = useCallback(async () => {
    if (!activeFileId || !activeFile) return
    const content = fileContents.get(activeFileId) ?? ''
    await db.files.update(activeFileId, { 
      content, 
      updatedAt: new Date() 
    })
    setModifiedFiles(prev => {
      const next = new Set(prev)
      next.delete(activeFileId)
      return next
    })
  }, [activeFileId, activeFile, fileContents])

  const handleSaveAll = useCallback(async () => {
    for (const fileId of modifiedFiles) {
      const content = fileContents.get(fileId)
      if (content !== undefined) {
        await db.files.update(fileId, { 
          content, 
          updatedAt: new Date() 
        })
      }
    }
    setModifiedFiles(new Set())
  }, [modifiedFiles, fileContents])

  const handleCreateFile = useCallback((type: 'file' | 'folder', parentPath: string) => {
    setNewFileType(type)
    setNewFileParent(parentPath)
    setNewFileName("")
    setShowNewFileDialog(true)
  }, [])

  const handleCreateFileConfirm = useCallback(async () => {
    if (!newFileName.trim()) return
    
    const path = newFileParent 
      ? `${newFileParent}/${newFileName.trim()}`
      : newFileName.trim()
    
    const file: FileEntry = {
      id: generateId(),
      projectId,
      path,
      name: newFileName.trim(),
      type: newFileType,
      content: newFileType === 'file' ? '' : '',
      language: newFileType === 'file' ? getLanguageFromFilename(newFileName) : '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    await db.files.add(file)
    setShowNewFileDialog(false)
    
    if (newFileType === 'file') {
      handleFileSelect(file)
    }
  }, [newFileName, newFileParent, newFileType, projectId, handleFileSelect])

  const handleDeleteFile = useCallback(async (file: FileEntry) => {
    await db.files.delete(file.id)
    if (file.type === 'folder') {
      // Delete all children
      const children = await db.files.where('projectId').equals(projectId).toArray()
      const toDelete = children.filter(f => f.path.startsWith(file.path + '/'))
      await db.files.bulkDelete(toDelete.map(f => f.id))
    }
    handleTabClose(file)
  }, [projectId, handleTabClose])

  const handleRenameFile = useCallback(async (file: FileEntry) => {
    const newName = prompt('Enter new name:', file.name)
    if (!newName || newName === file.name) return
    
    const parentPath = file.path.split('/').slice(0, -1).join('/')
    const newPath = parentPath ? `${parentPath}/${newName}` : newName
    
    await db.files.update(file.id, { 
      name: newName, 
      path: newPath,
      language: file.type === 'file' ? getLanguageFromFilename(newName) : '',
      updatedAt: new Date() 
    })
  }, [])

  const handleCommit = useCallback(async (message: string) => {
    await handleSaveAll()
    
    const allFiles = await db.files.where('projectId').equals(projectId).toArray()
    const commitFiles = allFiles
      .filter(f => f.type === 'file')
      .map(f => ({
        path: f.path,
        content: f.content,
        action: 'modify' as const,
      }))
    
    const branch = await db.branches.where({ projectId, name: currentBranch }).first()
    
    const commit: Commit = {
      id: generateId(),
      projectId,
      message,
      timestamp: new Date(),
      files: commitFiles,
      parentId: branch?.currentCommitId ?? null,
      branch: currentBranch,
    }
    
    await db.commits.add(commit)
    
    if (branch) {
      await db.branches.update(branch.id, { currentCommitId: commit.id })
    }
  }, [projectId, currentBranch, handleSaveAll])

  const handleCheckout = useCallback(async (commitId: string) => {
    const commit = await db.commits.get(commitId)
    if (!commit) return
    
    // Clear existing files
    await db.files.where('projectId').equals(projectId).delete()
    
    // Restore files from commit
    for (const file of commit.files) {
      await db.files.add({
        id: generateId(),
        projectId,
        path: file.path,
        name: file.path.split('/').pop() || file.path,
        type: 'file',
        content: file.content,
        language: getLanguageFromFilename(file.path),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
    
    // Clear open files
    setOpenFiles([])
    setActiveFileId(null)
    setFileContents(new Map())
    setModifiedFiles(new Set())
  }, [projectId])

  const handleBranchCreate = useCallback(async (name: string) => {
    const branch = await db.branches.where({ projectId, name: currentBranch }).first()
    
    await db.branches.add({
      id: generateId(),
      projectId,
      name,
      currentCommitId: branch?.currentCommitId ?? null,
      createdAt: new Date(),
    })
    
    setCurrentBranch(name)
  }, [projectId, currentBranch])

  const handleBranchSwitch = useCallback(async (name: string) => {
    const branch = await db.branches.where({ projectId, name }).first()
    if (!branch) return
    
    setCurrentBranch(name)
    
    if (branch.currentCommitId) {
      await handleCheckout(branch.currentCommitId)
    }
  }, [projectId, handleCheckout])

  const handleInsertCode = useCallback((code: string) => {
    if (!activeFileId) return
    const current = fileContents.get(activeFileId) ?? ''
    setFileContents(prev => new Map(prev).set(activeFileId, current + '\n' + code))
    setModifiedFiles(prev => new Set(prev).add(activeFileId))
  }, [activeFileId, fileContents])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-3 h-12 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
            Projects
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium truncate max-w-[150px]">{projectName}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {modifiedFiles.size > 0 && (
            <Button variant="ghost" size="sm" onClick={handleSaveAll}>
              <Save className="h-4 w-4 mr-1" />
              Save All
            </Button>
          )}
          {!isMobile && (
            <>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowLeftPanel(!showLeftPanel)}
              >
                {showLeftPanel ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowRightPanel(!showRightPanel)}
              >
                {showRightPanel ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={onOpenBugReport}>
            <Bug className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobile && showMobileMenu && (
        <div className="absolute inset-0 z-50 bg-background/95 flex flex-col">
          <div className="flex items-center justify-between px-4 h-12 border-b border-border">
            <span className="font-medium">Menu</span>
            <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(false)}>
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden grid grid-cols-2 gap-px bg-border">
            <div className="bg-background overflow-auto">
              <FileTree
                files={files || []}
                activeFileId={activeFileId}
                onFileSelect={(f) => { handleFileSelect(f); setShowMobileMenu(false); }}
                onFileCreate={handleCreateFile}
                onFileDelete={handleDeleteFile}
                onFileRename={handleRenameFile}
              />
            </div>
            <div className="bg-background overflow-auto">
              <GitPanel
                commits={commits || []}
                branches={branches || []}
                currentBranch={currentBranch}
                stagedChanges={modifiedFiles.size}
                onCommit={handleCommit}
                onCheckout={handleCheckout}
                onBranchCreate={handleBranchCreate}
                onBranchSwitch={handleBranchSwitch}
              />
            </div>
          </div>
          <div className="h-[40vh] border-t border-border">
            <AIChat
              projectId={projectId}
              currentFile={activeFile ? { 
                name: activeFile.name, 
                content: currentContent, 
                language: activeFile.language 
              } : undefined}
              isUnlimited={settings.plan === 'unlimited'}
              credits={settings.aiCredits}
              onInsertCode={handleInsertCode}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - File Tree + Git */}
          {showLeftPanel && !isMobile && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                <div className="h-full flex flex-col bg-card/50">
                  <div className="flex-1 overflow-auto">
                    <FileTree
                      files={files || []}
                      activeFileId={activeFileId}
                      onFileSelect={handleFileSelect}
                      onFileCreate={handleCreateFile}
                      onFileDelete={handleDeleteFile}
                      onFileRename={handleRenameFile}
                    />
                  </div>
                  <div className="h-[35%] border-t border-border overflow-hidden">
                    <GitPanel
                      commits={commits || []}
                      branches={branches || []}
                      currentBranch={currentBranch}
                      stagedChanges={modifiedFiles.size}
                      onCommit={handleCommit}
                      onCheckout={handleCheckout}
                      onBranchCreate={handleBranchCreate}
                      onBranchSwitch={handleBranchSwitch}
                    />
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Center - Editor */}
          <ResizablePanel defaultSize={showRightPanel ? 55 : 80}>
            <div className="h-full flex flex-col">
              <EditorTabs
                openFiles={openFiles}
                activeFileId={activeFileId}
                modifiedFiles={modifiedFiles}
                onTabSelect={handleFileSelect}
                onTabClose={handleTabClose}
              />
              <div className="flex-1 overflow-hidden">
                {activeFile ? (
                  <CodeEditor
                    value={currentContent}
                    language={activeFile.language}
                    onChange={handleContentChange}
                    fontSize={settings.fontSize}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg mb-2">No file open</p>
                      <p className="text-sm">Select a file from the explorer or create a new one</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          {/* Right Panel - AI Chat */}
          {showRightPanel && !isMobile && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <AIChat
                  projectId={projectId}
                  currentFile={activeFile ? { 
                    name: activeFile.name, 
                    content: currentContent, 
                    language: activeFile.language 
                  } : undefined}
                  isUnlimited={settings.plan === 'unlimited'}
                  credits={settings.aiCredits}
                  onInsertCode={handleInsertCode}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create New {newFileType === 'file' ? 'File' : 'Folder'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder={newFileType === 'file' ? 'index.tsx' : 'components'}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFileConfirm()}
              />
            </div>
            {newFileParent && (
              <p className="text-sm text-muted-foreground">
                Location: {newFileParent}/
              </p>
            )}
            <Button onClick={handleCreateFileConfirm} className="w-full">
              Create {newFileType === 'file' ? 'File' : 'Folder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
