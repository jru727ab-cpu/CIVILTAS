"use client"

import { useState } from "react"
import { Bug, Send } from "lucide-react"
import { db, generateId, type BugReport } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { toast } from "sonner"

interface BugReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
}

export function BugReportDialog({ open, onOpenChange, projectId }: BugReportDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState<BugReport['severity']>("medium")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return

    setIsSubmitting(true)
    try {
      const bug: BugReport = {
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        severity,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        projectId,
      }

      await db.bugs.add(bug)
      
      toast.success("Bug report submitted", {
        description: "Thank you for helping improve CodeForge!",
      })

      setTitle("")
      setDescription("")
      setSeverity("medium")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to submit bug report")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-primary" />
            Report a Bug
          </DialogTitle>
          <DialogDescription>
            Found an issue? Let us know so we can fix it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened? What did you expect to happen?"
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Severity</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as BugReport['severity'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Minor issue</SelectItem>
                <SelectItem value="medium">Medium - Affects functionality</SelectItem>
                <SelectItem value="high">High - Major problem</SelectItem>
                <SelectItem value="critical">Critical - App unusable</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            disabled={!title.trim() || !description.trim() || isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
