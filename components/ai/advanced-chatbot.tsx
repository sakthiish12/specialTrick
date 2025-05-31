import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { SessionManager } from '@/lib/ai/session'
import { type ChatCompletionMessage } from 'openai/resources/chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Loader2, Send, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { handleAIError, createErrorMessage, isRetryableError, getRetryDelay } from '@/lib/ai/error-handling'

interface Message {
  role: 'user' | 'assistant'
  content: string
  functionCall?: {
    name: string
    arguments: Record<string, unknown>
  }
}

interface AdvancedChatbotProps {
  className?: string
}

export function AdvancedChatbot({ className }: AdvancedChatbotProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionManager] = useState(() => new SessionManager())
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  // Initialize session when user is authenticated
  useEffect(() => {
    if (session?.user?.id) {
      const userSession = sessionManager.getSession(session.user.id)
      if (!userSession) {
        const newSession = sessionManager.createSession(session.user.id)
        setMessages([
          {
            role: 'assistant',
            content: sessionManager.getPersonalizedGreeting(session.user.id)
          }
        ])
      } else {
        // Restore previous session messages
        setMessages(userSession.messages as Message[])
      }
    }
  }, [session?.user?.id, sessionManager])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!input.trim() || !session?.user?.id) return

      const userMessage: Message = {
        role: 'user',
        content: input.trim()
      }

      setMessages(prev => [...prev, userMessage])
      setInput('')
      setIsLoading(true)
      setRetryCount(0)

      try {
        // Add message to session
        sessionManager.addMessage(session.user.id, userMessage as ChatCompletionMessage)

        // Extract interests and topics from the message
        const interests = sessionManager.extractInterests([userMessage as ChatCompletionMessage])
        const topics = sessionManager.extractTopics([userMessage as ChatCompletionMessage])

        // Update session preferences
        if (interests.length > 0 || topics.length > 0) {
          sessionManager.updatePreferences(session.user.id, {
            interests: [...new Set([...sessionManager.getSession(session.user.id)!.preferences.interests, ...interests])],
            preferredTopics: [...new Set([...sessionManager.getSession(session.user.id)!.preferences.preferredTopics, ...topics])]
          })
        }

        // Call AI API with function calling
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            sessionId: session.user.id
          })
        })

        if (!response.ok) {
          throw new Error('Failed to get AI response')
        }

        const data = await response.json()
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.content,
          functionCall: data.functionCall
        }

        setMessages(prev => [...prev, assistantMessage])
        sessionManager.addMessage(session.user.id, assistantMessage as ChatCompletionMessage)

        // Handle function calls
        if (data.functionCall) {
          const functionResponse = await fetch('/api/ai/function', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              functionCall: data.functionCall,
              sessionId: session.user.id
            })
          })

          if (!functionResponse.ok) {
            throw new Error('Failed to execute function')
          }

          const functionResult = await functionResponse.json()
          const functionMessage: Message = {
            role: 'assistant',
            content: `Function result: ${JSON.stringify(functionResult)}`
          }

          setMessages(prev => [...prev, functionMessage])
          sessionManager.addMessage(session.user.id, functionMessage as ChatCompletionMessage)
        }
      } catch (error) {
        console.error('Error in chat:', error)
        const aiError = handleAIError(error)
        const errorMessage = createErrorMessage(aiError)

        // Handle retryable errors
        if (isRetryableError(aiError) && retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1)
          setTimeout(() => {
            handleSubmit(e)
          }, getRetryDelay(aiError))
          return
        }

        setMessages(prev => [...prev, errorMessage as Message])
        sessionManager.addMessage(session.user.id, errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [input, messages, session?.user?.id, sessionManager, retryCount]
  )

  return (
    <Card className={cn('flex flex-col h-[600px] w-full max-w-2xl mx-auto', className)}>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn('flex items-start gap-3', {
                  'justify-end': message.role === 'user'
                })}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div
                  className={cn('rounded-lg px-4 py-2 max-w-[80%]', {
                    'bg-primary text-primary-foreground': message.role === 'user',
                    'bg-muted': message.role === 'assistant'
                  })}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.functionCall && (
                    <div className="mt-2 text-xs opacity-70">
                      <p>Function: {message.functionCall.name}</p>
                      <p>Arguments: {JSON.stringify(message.functionCall.arguments)}</p>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  )
} 