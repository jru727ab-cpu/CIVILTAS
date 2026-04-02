"use client"

import { useState } from "react"
import { Settings, Key, Moon, Sun, Zap } from "lucide-react"
import { db, verifyAdminAccess, type UserSettings } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useTheme } from "next-themes"
import { toast } from "sonner"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: UserSettings
  onSettingsChange: (settings: UserSettings) => void
}

export function SettingsDialog({ 
  open, 
  onOpenChange, 
  settings, 
  onSettingsChange 
}: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const [adminKey, setAdminKey] = useState("")
  const [showAdminInput, setShowAdminInput] = useState(false)

  const handleFontSizeChange = async (value: number[]) => {
    const newSettings = { ...settings, fontSize: value[0] }
    await db.settings.update('user', { fontSize: value[0] })
    onSettingsChange(newSettings)
  }

  const handleTabSizeChange = async (value: number[]) => {
    const newSettings = { ...settings, tabSize: value[0] }
    await db.settings.update('user', { tabSize: value[0] })
    onSettingsChange(newSettings)
  }

  const handleWordWrapChange = async (checked: boolean) => {
    const newSettings = { ...settings, wordWrap: checked }
    await db.settings.update('user', { wordWrap: checked })
    onSettingsChange(newSettings)
  }

  const handleAdminKeySubmit = async () => {
    const isValid = await verifyAdminAccess(adminKey)
    if (isValid) {
      const newSettings = { ...settings, isAdmin: true, plan: 'unlimited' as const, aiCredits: 999999 }
      onSettingsChange(newSettings)
      toast.success("Admin access granted", {
        description: "You now have unlimited AI access!",
      })
      setAdminKey("")
      setShowAdminInput(false)
    } else {
      toast.error("Invalid admin key")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Customize your CodeForge experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label>Theme</Label>
                <p className="text-xs text-muted-foreground">
                  {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Font Size</Label>
              <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
            </div>
            <Slider
              value={[settings.fontSize]}
              onValueChange={handleFontSizeChange}
              min={10}
              max={24}
              step={1}
            />
          </div>

          {/* Tab Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Tab Size</Label>
              <span className="text-sm text-muted-foreground">{settings.tabSize} spaces</span>
            </div>
            <Slider
              value={[settings.tabSize]}
              onValueChange={handleTabSizeChange}
              min={2}
              max={8}
              step={2}
            />
          </div>

          {/* Word Wrap */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Word Wrap</Label>
              <p className="text-xs text-muted-foreground">Wrap long lines</p>
            </div>
            <Switch
              checked={settings.wordWrap}
              onCheckedChange={handleWordWrapChange}
            />
          </div>

          {/* Plan Status */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <Label>Current Plan</Label>
                  <p className="text-xs text-muted-foreground capitalize">
                    {settings.plan} {settings.plan === 'unlimited' && '(Admin)'}
                  </p>
                </div>
              </div>
              {settings.plan !== 'unlimited' && (
                <span className="text-sm">
                  {settings.aiCredits} AI credits
                </span>
              )}
            </div>

            {/* Admin Access */}
            {!settings.isAdmin && (
              <div className="space-y-3">
                {showAdminInput ? (
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      placeholder="Enter admin key"
                      onKeyDown={(e) => e.key === 'Enter' && handleAdminKeySubmit()}
                    />
                    <Button onClick={handleAdminKeySubmit} size="sm">
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowAdminInput(true)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Enter Admin Key
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
