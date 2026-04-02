"use client"

import { useState } from "react"
import { GitBranch, GitCommit, History, RotateCcw, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Commit, Branch } from "@/lib/db"
import { cn } from "@/lib/utils"

interface GitPanelProps {
  commits: Commit[]
  branches: Branch[]
  currentBranch: string
  stagedChanges: number
  onCommit: (message: string) => void
  onCheckout: (commitId: string) => void
  onBranchCreate: (name: string) => void
  onBranchSwitch: (name: string) => void
}

export function GitPanel({
  commits,
  branches,
  currentBranch,
  stagedChanges,
  onCommit,
  onCheckout,
  onBranchCreate,
  onBranchSwitch,
}: GitPanelProps) {
  const [commitMessage, setCommitMessage] = useState("")
  const [newBranchName, setNewBranchName] = useState("")
  const [showBranchDialog, setShowBranchDialog] = useState(false)

  const handleCommit = () => {
    if (commitMessage.trim()) {
      onCommit(commitMessage.trim())
      setCommitMessage("")
    }
  }

  const handleCreateBranch = () => {
    if (newBranchName.trim()) {
      onBranchCreate(newBranchName.trim())
      setNewBranchName("")
      setShowBranchDialog(false)
    }
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="changes" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-2">
          <TabsTrigger value="changes" className="text-xs">
            Changes {stagedChanges > 0 && `(${stagedChanges})`}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
          <TabsTrigger value="branches" className="text-xs">Branches</TabsTrigger>
        </TabsList>

        <TabsContent value="changes" className="flex-1 p-3 space-y-3 m-0">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{currentBranch}</span>
          </div>
          
          <div className="space-y-2">
            <Input
              placeholder="Commit message..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
              className="text-sm"
            />
            <Button 
              onClick={handleCommit} 
              disabled={!commitMessage.trim() || stagedChanges === 0}
              className="w-full"
              size="sm"
            >
              <GitCommit className="h-4 w-4 mr-2" />
              Commit {stagedChanges > 0 && `(${stagedChanges} files)`}
            </Button>
          </div>

          {stagedChanges === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No changes to commit
            </p>
          )}
        </TabsContent>

        <TabsContent value="history" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {commits.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No commits yet
                </p>
              ) : (
                commits.map((commit) => (
                  <div
                    key={commit.id}
                    className="group p-2 rounded-md hover:bg-accent/50 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{commit.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(commit.timestamp)} • {commit.files.length} files
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onCheckout(commit.id)}
                        title="Restore this version"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="branches" className="flex-1 m-0">
          <div className="p-2 space-y-2">
            <Dialog open={showBranchDialog} onOpenChange={setShowBranchDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Branch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Branch</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Branch name..."
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateBranch()}
                  />
                  <Button onClick={handleCreateBranch} className="w-full">
                    Create Branch
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <ScrollArea className="h-[200px]">
              <div className="space-y-1">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent/50",
                      branch.name === currentBranch && "bg-accent"
                    )}
                    onClick={() => onBranchSwitch(branch.name)}
                  >
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{branch.name}</span>
                    </div>
                    {branch.name === currentBranch && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
