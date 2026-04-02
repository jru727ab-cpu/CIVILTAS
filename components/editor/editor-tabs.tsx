"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FileEntry } from "@/lib/db"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface EditorTabsProps {
  openFiles: FileEntry[]
  activeFileId: string | null
  modifiedFiles: Set<string>
  onTabSelect: (file: FileEntry) => void
  onTabClose: (file: FileEntry) => void
}

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const icons: Record<string, string> = {
    ts: '🔷', tsx: '⚛️', js: '🟨', jsx: '⚛️',
    html: '🌐', css: '🎨', scss: '🎨',
    json: '📋', md: '📝', py: '🐍',
    rs: '🦀', go: '🔵', java: '☕',
  }
  return icons[ext || ''] || '📄'
}

export function EditorTabs({
  openFiles,
  activeFileId,
  modifiedFiles,
  onTabSelect,
  onTabClose,
}: EditorTabsProps) {
  if (openFiles.length === 0) {
    return null
  }

  return (
    <ScrollArea className="w-full border-b border-border bg-card/50">
      <div className="flex items-center h-10">
        {openFiles.map((file) => {
          const isActive = file.id === activeFileId
          const isModified = modifiedFiles.has(file.id)
          
          return (
            <div
              key={file.id}
              className={cn(
                "group flex items-center gap-2 px-3 h-full border-r border-border cursor-pointer transition-colors",
                isActive 
                  ? "bg-background text-foreground" 
                  : "bg-card/30 text-muted-foreground hover:bg-card/60"
              )}
              onClick={() => onTabSelect(file)}
            >
              <span className="text-xs">{getFileIcon(file.name)}</span>
              <span className="text-sm whitespace-nowrap">{file.name}</span>
              {isModified && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
              <button
                className={cn(
                  "ml-1 p-0.5 rounded hover:bg-accent transition-opacity",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(file)
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
