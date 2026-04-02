"use client"

import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { 
  Plus, 
  Star, 
  StarOff, 
  Trash2, 
  FolderCode, 
  Clock,
  Search,
  Settings,
  Key,
  Bug,
} from "lucide-react"
import { db, generateId, type Project, type UserSettings } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface ProjectDashboardProps {
  settings: UserSettings
  onProjectSelect: (project: Project) => void
  onOpenSettings: () => void
  onOpenBugReport: () => void
  onOpenAdmin: () => void
}

const PROJECT_TEMPLATES = [
  { id: 'blank', name: 'Blank Project', description: 'Start from scratch', files: [] },
  { 
    id: 'html', 
    name: 'HTML/CSS/JS', 
    description: 'Basic web project',
    files: [
      { path: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Project</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>Hello World</h1>\n  <script src="script.js"></script>\n</body>\n</html>' },
      { path: 'styles.css', content: '* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n}\n\nh1 {\n  color: #333;\n}' },
      { path: 'script.js', content: '// Your JavaScript code here\nconsole.log("Hello from script.js");' },
    ]
  },
  { 
    id: 'react', 
    name: 'React', 
    description: 'React component project',
    files: [
      { path: 'App.tsx', content: 'import React, { useState } from "react";\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div className="app">\n      <h1>React App</h1>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(c => c + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}' },
      { path: 'index.tsx', content: 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\nimport "./styles.css";\n\nReactDOM.createRoot(document.getElementById("root")!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);' },
      { path: 'styles.css', content: '.app {\n  padding: 2rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 0.5rem 1rem;\n  cursor: pointer;\n}' },
    ]
  },
  { 
    id: 'python', 
    name: 'Python', 
    description: 'Python script project',
    files: [
      { path: 'main.py', content: '#!/usr/bin/env python3\n"""Main entry point for the application."""\n\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()' },
      { path: 'utils.py', content: '"""Utility functions."""\n\ndef add(a: int, b: int) -> int:\n    """Add two numbers."""\n    return a + b\n\ndef multiply(a: int, b: int) -> int:\n    """Multiply two numbers."""\n    return a * b' },
    ]
  },
  { 
    id: 'node', 
    name: 'Node.js', 
    description: 'Node.js server project',
    files: [
      { path: 'index.js', content: 'const http = require("http");\n\nconst PORT = 3000;\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { "Content-Type": "application/json" });\n  res.end(JSON.stringify({ message: "Hello, World!" }));\n});\n\nserver.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`);\n});' },
      { path: 'package.json', content: '{\n  "name": "my-node-project",\n  "version": "1.0.0",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js"\n  }\n}' },
    ]
  },
]

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  const languages: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript',
    js: 'javascript', jsx: 'javascript',
    html: 'html', css: 'css',
    json: 'json', md: 'markdown',
    py: 'python',
  }
  return languages[ext || ''] || 'plaintext'
}

export function ProjectDashboard({ 
  settings, 
  onProjectSelect, 
  onOpenSettings,
  onOpenBugReport,
  onOpenAdmin,
}: ProjectDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("blank")

  const projects = useLiveQuery(
    () => db.projects.orderBy('updatedAt').reverse().toArray(),
    [],
    []
  )

  const filteredProjects = projects?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const starredProjects = filteredProjects.filter(p => p.starred)
  const recentProjects = filteredProjects.filter(p => !p.starred)

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    const template = PROJECT_TEMPLATES.find(t => t.id === selectedTemplate)
    const project: Project = {
      id: generateId(),
      name: newProjectName.trim(),
      description: template?.description || '',
      template: selectedTemplate,
      createdAt: new Date(),
      updatedAt: new Date(),
      starred: false,
    }

    await db.projects.add(project)

    // Create template files
    if (template?.files) {
      for (const file of template.files) {
        await db.files.add({
          id: generateId(),
          projectId: project.id,
          path: file.path,
          name: file.path.split('/').pop() || file.path,
          type: 'file',
          content: file.content,
          language: getLanguageFromPath(file.path),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }

    // Create default main branch
    await db.branches.add({
      id: generateId(),
      projectId: project.id,
      name: 'main',
      currentCommitId: null,
      createdAt: new Date(),
    })

    setShowNewProject(false)
    setNewProjectName("")
    setSelectedTemplate("blank")
    onProjectSelect(project)
  }

  const handleToggleStar = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    await db.projects.update(project.id, { starred: !project.starred })
  }

  const handleDeleteProject = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return
    
    await db.projects.delete(project.id)
    await db.files.where('projectId').equals(project.id).delete()
    await db.commits.where('projectId').equals(project.id).delete()
    await db.branches.where('projectId').equals(project.id).delete()
    await db.aiMessages.where('projectId').equals(project.id).delete()
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm safe-area-top">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FolderCode className="h-7 w-7 text-primary" />
              <h1 className="text-xl font-bold">CodeForge</h1>
              {settings.plan !== 'free' && (
                <Badge variant="secondary" className="text-xs">
                  {settings.plan === 'unlimited' ? 'Admin' : 'Pro'}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onOpenBugReport}>
                <Bug className="h-5 w-5" />
              </Button>
              {settings.isAdmin && (
                <Button variant="ghost" size="icon" onClick={onOpenAdmin}>
                  <Key className="h-5 w-5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onOpenSettings}>
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search and New Project */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setShowNewProject(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Starred Projects */}
        {starredProjects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Starred
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {starredProjects.map((project) => (
                <Card 
                  key={project.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors group"
                  onClick={() => onProjectSelect(project)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => handleToggleStar(project, e)}
                        >
                          <Star className="h-4 w-4 fill-primary text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => handleDeleteProject(project, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      {project.description || project.template}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(project.updatedAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Recent Projects */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent
          </h2>
          {recentProjects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <FolderCode className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">No projects yet</p>
                <Button onClick={() => setShowNewProject(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentProjects.map((project) => (
                <Card 
                  key={project.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors group"
                  onClick={() => onProjectSelect(project)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => handleToggleStar(project, e)}
                        >
                          <StarOff className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => handleDeleteProject(project, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      {project.description || project.template}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(project.updatedAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* New Project Dialog */}
      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Choose a template to get started quickly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Awesome Project"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              />
            </div>
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateProject} className="w-full" disabled={!newProjectName.trim()}>
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
