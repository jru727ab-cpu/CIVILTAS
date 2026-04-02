"use client"

import { useState, useEffect } from "react"
import { db, initializeSettings, type Project, type UserSettings } from "@/lib/db"
import { ProjectDashboard } from "@/components/dashboard/project-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { EditorWorkspace } from "@/components/editor/editor-workspace"
import { SettingsDialog } from "@/components/dashboard/settings-dialog"
import { BugReportDialog } from "@/components/dashboard/bug-report-dialog"
import { Toaster } from "sonner"
import { InstallPrompt } from "@/components/pwa/install-prompt"

type View = 'dashboard' | 'editor' | 'admin'

export default function Home() {
  const [view, setView] = useState<View>('dashboard')
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showBugReport, setShowBugReport] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize settings on mount
  useEffect(() => {
    async function init() {
      try {
        const userSettings = await initializeSettings()
        setSettings(userSettings)
      } catch (error) {
        console.error('Failed to initialize settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const handleProjectSelect = async (project: Project) => {
    // Update project's updatedAt timestamp
    await db.projects.update(project.id, { updatedAt: new Date() })
    setCurrentProject(project)
    setView('editor')
  }

  const handleBackToDashboard = () => {
    setCurrentProject(null)
    setView('dashboard')
  }

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading CodeForge...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {view === 'dashboard' && (
        <ProjectDashboard
          settings={settings}
          onProjectSelect={handleProjectSelect}
          onOpenSettings={() => setShowSettings(true)}
          onOpenBugReport={() => setShowBugReport(true)}
          onOpenAdmin={() => setView('admin')}
        />
      )}

      {view === 'editor' && currentProject && (
        <EditorWorkspace
          projectId={currentProject.id}
          projectName={currentProject.name}
          settings={settings}
          onBack={handleBackToDashboard}
          onOpenBugReport={() => setShowBugReport(true)}
        />
      )}

      {view === 'admin' && (
        <AdminDashboard onBack={() => setView('dashboard')} />
      )}

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        settings={settings}
        onSettingsChange={setSettings}
      />

      <BugReportDialog
        open={showBugReport}
        onOpenChange={setShowBugReport}
        projectId={currentProject?.id}
      />

      <Toaster richColors position="top-center" />
      <InstallPrompt />
    </>
  )
}
