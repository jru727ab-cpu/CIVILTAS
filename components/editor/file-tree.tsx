"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FileEntry } from "@/lib/db"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"

interface FileTreeProps {
  files: FileEntry[]
  activeFileId: string | null
  onFileSelect: (file: FileEntry) => void
  onFileCreate: (type: 'file' | 'folder', parentPath: string) => void
  onFileDelete: (file: FileEntry) => void
  onFileRename: (file: FileEntry) => void
}

interface TreeNode {
  file: FileEntry
  children: TreeNode[]
  isExpanded: boolean
}

function buildTree(files: FileEntry[]): TreeNode[] {
  const folders = files.filter(f => f.type === 'folder').sort((a, b) => a.path.localeCompare(b.path))
  const regularFiles = files.filter(f => f.type === 'file').sort((a, b) => a.name.localeCompare(b.name))
  
  const rootFiles: TreeNode[] = []
  const folderMap = new Map<string, TreeNode>()
  
  // Add folders first
  folders.forEach(folder => {
    const node: TreeNode = { file: folder, children: [], isExpanded: false }
    folderMap.set(folder.path, node)
    
    const parentPath = folder.path.split('/').slice(0, -1).join('/')
    if (parentPath && folderMap.has(parentPath)) {
      folderMap.get(parentPath)!.children.push(node)
    } else {
      rootFiles.push(node)
    }
  })
  
  // Add files
  regularFiles.forEach(file => {
    const node: TreeNode = { file, children: [], isExpanded: false }
    const parentPath = file.path.split('/').slice(0, -1).join('/')
    if (parentPath && folderMap.has(parentPath)) {
      folderMap.get(parentPath)!.children.push(node)
    } else {
      rootFiles.push(node)
    }
  })
  
  return rootFiles
}

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const icons: Record<string, string> = {
    ts: '🔷', tsx: '⚛️', js: '🟨', jsx: '⚛️',
    html: '🌐', css: '🎨', scss: '🎨',
    json: '📋', md: '📝', py: '🐍',
    rs: '🦀', go: '🔵', java: '☕',
  }
  return icons[ext || ''] || ''
}

interface TreeItemProps {
  node: TreeNode
  depth: number
  activeFileId: string | null
  expandedFolders: Set<string>
  onToggle: (path: string) => void
  onFileSelect: (file: FileEntry) => void
  onFileCreate: (type: 'file' | 'folder', parentPath: string) => void
  onFileDelete: (file: FileEntry) => void
  onFileRename: (file: FileEntry) => void
}

function TreeItem({ 
  node, 
  depth, 
  activeFileId, 
  expandedFolders, 
  onToggle, 
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
}: TreeItemProps) {
  const isFolder = node.file.type === 'folder'
  const isExpanded = expandedFolders.has(node.file.path)
  const isActive = node.file.id === activeFileId
  
  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent/50 rounded-sm transition-colors",
              isActive && "bg-accent text-accent-foreground"
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => {
              if (isFolder) {
                onToggle(node.file.path)
              } else {
                onFileSelect(node.file)
              }
            }}
          >
            {isFolder ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Folder className="h-4 w-4 shrink-0 text-primary" />
                )}
              </>
            ) : (
              <>
                <span className="w-4" />
                <span className="text-xs">{getFileIcon(node.file.name)}</span>
                <File className="h-4 w-4 shrink-0 text-muted-foreground" />
              </>
            )}
            <span className="truncate">{node.file.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {isFolder && (
            <>
              <ContextMenuItem onClick={() => onFileCreate('file', node.file.path)}>
                <Plus className="h-4 w-4 mr-2" />
                New File
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onFileCreate('folder', node.file.path)}>
                <Folder className="h-4 w-4 mr-2" />
                New Folder
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuItem onClick={() => onFileRename(node.file)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => onFileDelete(node.file)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      
      {isFolder && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.file.id}
              node={child}
              depth={depth + 1}
              activeFileId={activeFileId}
              expandedFolders={expandedFolders}
              onToggle={onToggle}
              onFileSelect={onFileSelect}
              onFileCreate={onFileCreate}
              onFileDelete={onFileDelete}
              onFileRename={onFileRename}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileTree({ 
  files, 
  activeFileId, 
  onFileSelect, 
  onFileCreate,
  onFileDelete,
  onFileRename,
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const tree = buildTree(files)
  
  const handleToggle = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }
  
  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-3 pb-2 mb-2 border-b border-border">
        <span className="text-xs font-medium uppercase text-muted-foreground">Explorer</span>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => onFileCreate('file', '')}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => onFileCreate('folder', '')}
          >
            <Folder className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      {tree.length === 0 ? (
        <div className="px-3 py-4 text-sm text-muted-foreground text-center">
          No files yet. Create one to get started.
        </div>
      ) : (
        tree.map((node) => (
          <TreeItem
            key={node.file.id}
            node={node}
            depth={0}
            activeFileId={activeFileId}
            expandedFolders={expandedFolders}
            onToggle={handleToggle}
            onFileSelect={onFileSelect}
            onFileCreate={onFileCreate}
            onFileDelete={onFileDelete}
            onFileRename={onFileRename}
          />
        ))
      )}
    </div>
  )
}
