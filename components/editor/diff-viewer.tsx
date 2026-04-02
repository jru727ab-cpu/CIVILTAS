"use client"

import { useMemo } from "react"
import { diffLines, type Change } from "diff"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DiffViewerProps {
  oldContent: string
  newContent: string
  oldLabel?: string
  newLabel?: string
}

export function DiffViewer({ 
  oldContent, 
  newContent, 
  oldLabel = "Previous",
  newLabel = "Current",
}: DiffViewerProps) {
  const diff = useMemo(() => {
    return diffLines(oldContent, newContent)
  }, [oldContent, newContent])

  const stats = useMemo(() => {
    let additions = 0
    let deletions = 0
    diff.forEach((part) => {
      const lines = part.value.split('\n').filter(Boolean).length
      if (part.added) additions += lines
      if (part.removed) deletions += lines
    })
    return { additions, deletions }
  }, [diff])

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{oldLabel}</span>
          <span className="text-muted-foreground">vs</span>
          <span className="text-muted-foreground">{newLabel}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-green-500">+{stats.additions}</span>
          <span className="text-red-500">-{stats.deletions}</span>
        </div>
      </div>

      {/* Diff Content */}
      <ScrollArea className="flex-1">
        <div className="font-mono text-sm">
          {diff.map((part, index) => (
            <DiffBlock key={index} part={part} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function DiffBlock({ part }: { part: Change }) {
  const lines = part.value.split('\n')
  // Remove last empty line if present
  if (lines[lines.length - 1] === '') {
    lines.pop()
  }

  return (
    <>
      {lines.map((line, i) => (
        <div
          key={i}
          className={cn(
            "px-4 py-0.5 border-l-2",
            part.added && "bg-green-500/10 border-green-500 text-green-300",
            part.removed && "bg-red-500/10 border-red-500 text-red-300",
            !part.added && !part.removed && "border-transparent text-muted-foreground"
          )}
        >
          <span className="select-none mr-3 text-muted-foreground/50">
            {part.added ? '+' : part.removed ? '-' : ' '}
          </span>
          {line || ' '}
        </div>
      ))}
    </>
  )
}
