import { SessionManager } from './session'
import { type ChatCompletionMessage } from 'openai/resources/chat'

describe('SessionManager', () => {
  let sessionManager: SessionManager

  beforeEach(() => {
    sessionManager = new SessionManager()
  })

  describe('createSession', () => {
    it('creates a new session with default preferences', () => {
      const session = sessionManager.createSession('test-session')
      expect(session.id).toBe('test-session')
      expect(session.preferences.interests).toEqual([])
      expect(session.preferences.preferredTopics).toEqual([])
      expect(session.preferences.language).toBe('en')
      expect(session.messages).toEqual([])
    })
  })

  describe('getSession', () => {
    it('returns undefined for non-existent session', () => {
      expect(sessionManager.getSession('non-existent')).toBeUndefined()
    })

    it('returns the session for existing session', () => {
      const session = sessionManager.createSession('test-session')
      expect(sessionManager.getSession('test-session')).toBe(session)
    })
  })

  describe('updatePreferences', () => {
    it('updates session preferences', () => {
      sessionManager.createSession('test-session')
      const updatedSession = sessionManager.updatePreferences('test-session', {
        interests: ['AI', 'Web Development']
      })

      expect(updatedSession.preferences.interests).toEqual(['AI', 'Web Development'])
      expect(updatedSession.preferences.language).toBe('en') // Default value preserved
    })

    it('throws error for non-existent session', () => {
      expect(() => {
        sessionManager.updatePreferences('non-existent', { interests: ['AI'] })
      }).toThrow('Session non-existent not found')
    })
  })

  describe('addMessage', () => {
    it('adds message to session and updates context', () => {
      sessionManager.createSession('test-session')
      const message: ChatCompletionMessage = {
        role: 'user',
        content: 'I am interested in AI and machine learning',
        refusal: null
      }

      const updatedSession = sessionManager.addMessage('test-session', message)
      expect(updatedSession.messages).toHaveLength(1)
      expect(updatedSession.messages[0]).toBe(message)
      expect(updatedSession.preferences.conversationContext.lastQuestion).toBe(
        'I am interested in AI and machine learning'
      )
    })

    it('throws error for non-existent session', () => {
      const message: ChatCompletionMessage = {
        role: 'user',
        content: 'Test message',
        refusal: null
      }

      expect(() => {
        sessionManager.addMessage('non-existent', message)
      }).toThrow('Session non-existent not found')
    })
  })

  describe('extractInterests', () => {
    it('extracts interests from user messages', () => {
      const messages: ChatCompletionMessage[] = [
        {
          role: 'user',
          content: 'I am interested in AI and machine learning',
          refusal: null
        },
        {
          role: 'assistant',
          content: 'That sounds interesting!',
          refusal: null
        },
        {
          role: 'user',
          content: 'I also enjoy web development',
          refusal: null
        }
      ]

      const interests = sessionManager.extractInterests(messages)
      expect(interests).toContain('ai and machine learning')
      expect(interests).toContain('web development')
    })
  })

  describe('extractTopics', () => {
    it('extracts topics from user messages', () => {
      const messages: ChatCompletionMessage[] = [
        {
          role: 'user',
          content: 'I want to know about React and Next.js',
          refusal: null
        },
        {
          role: 'assistant',
          content: 'I can help with that!',
          refusal: null
        },
        {
          role: 'user',
          content: 'Tell me more about TypeScript',
          refusal: null
        }
      ]

      const topics = sessionManager.extractTopics(messages)
      expect(topics).toContain('react and next.js')
      expect(topics).toContain('typescript')
    })
  })

  describe('getPersonalizedGreeting', () => {
    it('returns default greeting for new session', () => {
      expect(sessionManager.getPersonalizedGreeting('new-session')).toBe(
        'Hello! How can I help you today?'
      )
    })

    it('returns personalized greeting based on interests', () => {
      sessionManager.createSession('test-session')
      sessionManager.updatePreferences('test-session', {
        interests: ['AI', 'Web Development']
      })

      const greeting = sessionManager.getPersonalizedGreeting('test-session')
      expect(greeting).toContain('interested in AI, Web Development')
    })

    it('returns personalized greeting based on topics', () => {
      sessionManager.createSession('test-session')
      sessionManager.updatePreferences('test-session', {
        preferredTopics: ['React', 'TypeScript']
      })

      const greeting = sessionManager.getPersonalizedGreeting('test-session')
      expect(greeting).toContain('asking about React, TypeScript')
    })
  })

  describe('cleanupOldSessions', () => {
    it('removes sessions older than maxAge', () => {
      const oldSession = sessionManager.createSession('old-session')
      const newSession = sessionManager.createSession('new-session')

      // Mock the updatedAt timestamp for old session
      Object.defineProperty(oldSession, 'updatedAt', {
        value: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
      })

      sessionManager.cleanupOldSessions(24 * 60 * 60 * 1000) // 24 hours

      expect(sessionManager.getSession('old-session')).toBeUndefined()
      expect(sessionManager.getSession('new-session')).toBe(newSession)
    })
  })
}) 