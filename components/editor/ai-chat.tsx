"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Send, Bot, User, Sparkles, Copy, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface AIChatProps {
  projectId: string
  currentFile?: { name: string; content: string; language: string }
  isUnlimited: boolean
  credits: number
  onInsertCode?: (code: string) => void
}

export function AIChat({ 
  projectId, 
  currentFile, 
  isUnlimited, 
  credits,
  onInsertCode 
}: AIChatProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [input, setInput] = useState('')
  
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/ai/chat',
      body: { projectId, currentFile }
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'
  const canUseAI = isUnlimited || credits > 0

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedInput = input.trim()
    if (!trimmedInput || !canUseAI || isLoading) return
    sendMessage({ text: trimmedInput })
    setInput('')
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const extractCodeBlocks = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const blocks: { language: string; code: string }[] = []
    let match
    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push({ language: match[1] || 'text', code: match[2].trim() })
    }
    return blocks
  }

  const getMessageText = (msg: typeof messages[0]): string => {
    if (!msg.parts || !Array.isArray(msg.parts)) return ''
    return msg.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
  }

  const renderMessage = (msg: typeof messages[0]) => {
    const text = getMessageText(msg)
    const codeBlocks = extractCodeBlocks(text)
    const textWithoutCode = text.replace(/```(\w+)?\n[\s\S]*?```/g, '').trim()

    return (
      <div className="space-y-2">
        {textWithoutCode && (
          <p className="text-sm whitespace-pre-wrap">{textWithoutCode}</p>
        )}
        {codeBlocks.map((block, idx) => (
          <div key={idx} className="relative group rounded-md overflow-hidden border border-border">
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border">
              <span className="text-xs text-muted-foreground">{block.language}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(block.code, `${msg.id}-${idx}`)}
                >
                  {copiedId === `${msg.id}-${idx}` ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                {onInsertCode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onInsertCode(block.code)}
                    title="Insert into editor"
                  >
                    <Sparkles className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <pre className="p-3 text-xs overflow-x-auto bg-card">
              <code>{block.code}</code>
            </pre>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Assistant</span>
        </div>
        {!isUnlimited && (
          <span className="text-xs text-muted-foreground">
            {credits} credits left
          </span>
        )}
        {isUnlimited && (
          <span className="text-xs text-primary font-medium">Unlimited</span>
        )}
      </div>

      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-3 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Ask me anything about your code
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                I can help with debugging, refactoring, and more
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? "flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
                msg.role === 'user' ? "bg-primary" : "bg-muted"
              )}>
                {msg.role === 'user' ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-foreground" />
                )}
              </div>
              <div className={cn(
                "flex-1 rounded-lg px-3 py-2",
                msg.role === 'user' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted"
              )}>
                {renderMessage(msg)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1 rounded-lg px-3 py-2 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-3 border-t border-border">
        {!canUseAI && (
          <p className="text-xs text-destructive mb-2 text-center">
            No AI credits remaining. Upgrade to Pro for unlimited access.
          </p>
        )}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={canUseAI ? "Ask about your code..." : "No credits"}
            disabled={!canUseAI || isLoading}
            className="min-h-[40px] max-h-[120px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!input || !input.trim() || !canUseAI || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
