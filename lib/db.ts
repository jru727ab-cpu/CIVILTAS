import Dexie, { type EntityTable } from 'dexie'

// Database types
export interface Project {
  id: string
  name: string
  description: string
  template: string
  createdAt: Date
  updatedAt: Date
  starred: boolean
}

export interface FileEntry {
  id: string
  projectId: string
  path: string
  name: string
  type: 'file' | 'folder'
  content: string
  language: string
  createdAt: Date
  updatedAt: Date
}

export interface Commit {
  id: string
  projectId: string
  message: string
  timestamp: Date
  files: CommitFile[]
  parentId: string | null
  branch: string
}

export interface CommitFile {
  path: string
  content: string
  action: 'add' | 'modify' | 'delete'
}

export interface Branch {
  id: string
  projectId: string
  name: string
  currentCommitId: string | null
  createdAt: Date
}

export interface UserSettings {
  id: string
  theme: 'dark' | 'light'
  fontSize: number
  tabSize: number
  wordWrap: boolean
  isAdmin: boolean
  adminKey: string | null
  aiCredits: number
  plan: 'free' | 'pro' | 'unlimited'
}

export interface BugReport {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  createdAt: Date
  updatedAt: Date
  projectId?: string
}

export interface AIMessage {
  id: string
  projectId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Database class
const db = new Dexie('CodeForgeDB') as Dexie & {
  projects: EntityTable<Project, 'id'>
  files: EntityTable<FileEntry, 'id'>
  commits: EntityTable<Commit, 'id'>
  branches: EntityTable<Branch, 'id'>
  settings: EntityTable<UserSettings, 'id'>
  bugs: EntityTable<BugReport, 'id'>
  aiMessages: EntityTable<AIMessage, 'id'>
}

db.version(1).stores({
  projects: 'id, name, createdAt, updatedAt, starred',
  files: 'id, projectId, path, name, type',
  commits: 'id, projectId, timestamp, branch, parentId',
  branches: 'id, projectId, name',
  settings: 'id',
  bugs: 'id, status, severity, createdAt',
  aiMessages: 'id, projectId, timestamp',
})

export { db }

// Helper functions
export async function initializeSettings(): Promise<UserSettings> {
  const existing = await db.settings.get('user')
  if (existing) return existing
  
  const settings: UserSettings = {
    id: 'user',
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    isAdmin: false,
    adminKey: null,
    aiCredits: 10,
    plan: 'free',
  }
  await db.settings.put(settings)
  return settings
}

export async function verifyAdminAccess(key: string): Promise<boolean> {
  // Simple admin key - in production this would be more secure
  const ADMIN_KEY = 'codeforge-admin-2024'
  if (key === ADMIN_KEY) {
    await db.settings.update('user', { isAdmin: true, adminKey: key, plan: 'unlimited', aiCredits: 999999 })
    return true
  }
  return false
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
