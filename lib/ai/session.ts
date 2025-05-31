import { type ChatCompletionMessage } from 'openai/resources/chat'

export interface UserPreferences {
  interests: string[]
  preferredTopics: string[]
  language: string
  lastInteraction: string
  conversationContext: {
    currentTopic?: string
    lastQuestion?: string
    relevantTags?: string[]
  }
}

export interface Session {
  id: string
  preferences: UserPreferences
  messages: ChatCompletionMessage[]
  createdAt: string
  updatedAt: string
}

const DEFAULT_PREFERENCES: UserPreferences = {
  interests: [],
  preferredTopics: [],
  language: 'en',
  lastInteraction: new Date().toISOString(),
  conversationContext: {}
}

export class SessionManager {
  private sessions: Map<string, Session>

  constructor() {
    this.sessions = new Map()
  }

  createSession(id: string): Session {
    const session: Session = {
      id,
      preferences: { ...DEFAULT_PREFERENCES },
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.sessions.set(id, session)
    return session
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id)
  }

  updatePreferences(id: string, preferences: Partial<UserPreferences>): Session {
    const session = this.getSession(id)
    if (!session) {
      throw new Error(`Session ${id} not found`)
    }

    session.preferences = {
      ...session.preferences,
      ...preferences,
      lastInteraction: new Date().toISOString()
    }
    session.updatedAt = new Date().toISOString()

    return session
  }

  addMessage(id: string, message: ChatCompletionMessage): Session {
    const session = this.getSession(id)
    if (!session) {
      throw new Error(`Session ${id} not found`)
    }

    session.messages.push(message)
    session.updatedAt = new Date().toISOString()

    // Update conversation context based on the message
    if (message.role === 'user' && typeof message.content === 'string') {
      session.preferences.conversationContext.lastQuestion = message.content
    }

    return session
  }

  updateConversationContext(
    id: string,
    context: Partial<UserPreferences['conversationContext']>
  ): Session {
    const session = this.getSession(id)
    if (!session) {
      throw new Error(`Session ${id} not found`)
    }

    session.preferences.conversationContext = {
      ...session.preferences.conversationContext,
      ...context
    }
    session.updatedAt = new Date().toISOString()

    return session
  }

  extractInterests(messages: ChatCompletionMessage[]): string[] {
    const interests = new Set<string>()
    const interestKeywords = ['interested in', 'like', 'enjoy', 'favorite', 'passionate about']

    messages.forEach(message => {
      if (message.role === 'user' && typeof message.content === 'string') {
        interestKeywords.forEach(keyword => {
          const regex = new RegExp(`${keyword}\\s+([^.!?]+)`, 'gi')
          const matches = message.content.matchAll(regex)
          for (const match of matches) {
            if (match[1]) {
              interests.add(match[1].trim().toLowerCase())
            }
          }
        })
      }
    })

    return Array.from(interests)
  }

  extractTopics(messages: ChatCompletionMessage[]): string[] {
    const topics = new Set<string>()
    const topicKeywords = ['about', 'regarding', 'concerning', 'topic', 'subject']

    messages.forEach(message => {
      if (message.role === 'user' && typeof message.content === 'string') {
        topicKeywords.forEach(keyword => {
          const regex = new RegExp(`${keyword}\\s+([^.!?]+)`, 'gi')
          const matches = message.content.matchAll(regex)
          for (const match of matches) {
            if (match[1]) {
              topics.add(match[1].trim().toLowerCase())
            }
          }
        })
      }
    })

    return Array.from(topics)
  }

  getPersonalizedGreeting(id: string): string {
    const session = this.getSession(id)
    if (!session) {
      return 'Hello! How can I help you today?'
    }

    const { interests, preferredTopics } = session.preferences
    const timeOfDay = new Date().getHours() < 12 ? 'morning' : 'afternoon'

    if (interests.length > 0) {
      return `Good ${timeOfDay}! I see you're interested in ${interests.join(', ')}. How can I help you today?`
    }

    if (preferredTopics.length > 0) {
      return `Good ${timeOfDay}! I notice you've been asking about ${preferredTopics.join(', ')}. What would you like to know more about?`
    }

    return `Good ${timeOfDay}! How can I assist you today?`
  }

  cleanupOldSessions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = new Date().getTime()
    for (const [id, session] of this.sessions.entries()) {
      const sessionAge = now - new Date(session.updatedAt).getTime()
      if (sessionAge > maxAge) {
        this.sessions.delete(id)
      }
    }
  }
} 