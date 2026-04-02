"use client"

import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { 
  Shield, 
  Users, 
  Bug, 
  TrendingUp, 
  Check,
  X,
  Trash2,
  ArrowLeft,
} from "lucide-react"
import { db, type BugReport } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AdminDashboardProps {
  onBack: () => void
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const bugs = useLiveQuery(
    () => db.bugs.orderBy('createdAt').reverse().toArray(),
    [],
    []
  )

  const projects = useLiveQuery(
    () => db.projects.count(),
    [],
    0
  )

  const totalFiles = useLiveQuery(
    () => db.files.count(),
    [],
    0
  )

  const totalCommits = useLiveQuery(
    () => db.commits.count(),
    [],
    0
  )

  const filteredBugs = selectedStatus === "all" 
    ? bugs 
    : bugs?.filter(b => b.status === selectedStatus)

  const handleUpdateBugStatus = async (bugId: string, status: BugReport['status']) => {
    await db.bugs.update(bugId, { status, updatedAt: new Date() })
  }

  const handleDeleteBug = async (bugId: string) => {
    await db.bugs.delete(bugId)
  }

  const getSeverityColor = (severity: BugReport['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusColor = (status: BugReport['status']) => {
    switch (status) {
      case 'open': return 'bg-destructive/20 text-destructive'
      case 'in-progress': return 'bg-primary/20 text-primary'
      case 'resolved': return 'bg-success/20 text-success'
      case 'closed': return 'bg-muted text-muted-foreground'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const openBugs = bugs?.filter(b => b.status === 'open').length || 0
  const inProgressBugs = bugs?.filter(b => b.status === 'in-progress').length || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{projects}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalFiles}</p>
                  <p className="text-xs text-muted-foreground">Files</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCommits}</p>
                  <p className="text-xs text-muted-foreground">Commits</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Bug className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{openBugs}</p>
                  <p className="text-xs text-muted-foreground">Open Bugs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bug Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bug Reports</CardTitle>
                <CardDescription>
                  {inProgressBugs} in progress, {openBugs} open
                </CardDescription>
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {filteredBugs?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bug className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No bug reports</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBugs?.map((bug) => (
                    <div 
                      key={bug.id}
                      className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{bug.title}</h3>
                            <Badge className={getSeverityColor(bug.severity)} variant="secondary">
                              {bug.severity}
                            </Badge>
                            <Badge className={getStatusColor(bug.status)} variant="outline">
                              {bug.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{bug.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(bug.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {bug.status !== 'resolved' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateBugStatus(bug.id, 'resolved')}
                              title="Mark as resolved"
                            >
                              <Check className="h-4 w-4 text-success" />
                            </Button>
                          )}
                          {bug.status !== 'closed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateBugStatus(bug.id, 'closed')}
                              title="Close"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteBug(bug.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
