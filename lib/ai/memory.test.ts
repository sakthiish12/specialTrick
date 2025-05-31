import {
  getUserPreferences,
  updateUserPreferences,
  getConversationMemory,
  updateConversationMemory,
  addMessageToMemory,
  addContextToMemory,
  getPersonalizedGreeting,
  type UserPreferences,
  type ConversationMemory
} from './memory'

// Mock Supabase
jest.mock('../supabase/server', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn()
  }
}))

describe('Memory System', () => {
  const mockUserId = 'test-user'
  const mockSessionId = 'test-session'
  const mockPreferences: UserPreferences = {
    interests: ['AI', 'Web Development'],
    preferredTopics: ['TypeScript', 'React'],
    language: 'en',
    lastInteraction: new Date().toISOString(),
    conversationStyle: 'technical'
  }
  const mockMemory: ConversationMemory = {
    sessionId: mockSessionId,
    messages: [
      {
        role: 'user',
        content: 'Hello',
        timestamp: new Date().toISOString()
      }
    ],
    context: [
      {
        type: 'blog',
        path: 'test.md',
        relevance: 0.8
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Preferences', () => {
    it('should get user preferences', async () => {
      const supabase = require('../supabase/server').supabaseAdmin
      supabase.single.mockResolvedValueOnce({ data: { preferences: mockPreferences }, error: null })

      const prefs = await getUserPreferences(mockUserId)
      expect(prefs).toEqual(mockPreferences)
    })

    it('should create default preferences if none exist', async () => {
      const supabase = require('../supabase/server').supabaseAdmin
      supabase.single.mockResolvedValueOnce({ data: null, error: null })
      supabase.insert.mockResolvedValueOnce({ error: null })

      const prefs = await getUserPreferences(mockUserId)
      expect(prefs.interests).toEqual([])
      expect(prefs.conversationStyle).toBe('technical')
    })

    it('should update user preferences', async () => {
      const supabase = require('../supabase/server').supabaseAdmin
      supabase.single.mockResolvedValueOnce({ data: { preferences: mockPreferences }, error: null })
      supabase.update.mockResolvedValueOnce({ error: null })

      const updates = {
        interests: ['AI', 'Machine Learning'],
        conversationStyle: 'casual' as const
      }

      const updatedPrefs = await updateUserPreferences(mockUserId, updates)
      expect(updatedPrefs.interests).toEqual(updates.interests)
      expect(updatedPrefs.conversationStyle).toBe(updates.conversationStyle)
    })
  })

  describe('Conversation Memory', () => {
    it('should get conversation memory', async () => {
      const supabase = require('../supabase/server').supabaseAdmin
      supabase.single.mockResolvedValueOnce({ data: { memory: mockMemory }, error: null })

      const memory = await getConversationMemory(mockSessionId)
      expect(memory).toEqual(mockMemory)
    })

    it('should update conversation memory', async () => {
      const supabase = require('../supabase/server').supabaseAdmin
      supabase.single.mockResolvedValueOnce({ data: { memory: mockMemory }, error: null })
      supabase.upsert.mockResolvedValueOnce({ error: null })

      const updates = {
        messages: [
          {
            role: 'assistant' as const,
            content: 'Hi there!',
            timestamp: new Date().toISOString()
          }
        ]
      }

      const updatedMemory = await updateConversationMemory(mockSessionId, updates)
      expect(updatedMemory.messages).toHaveLength(2)
    })

    it('should add message to memory', async () => {
      const supabase = require('../supabase/server').supabaseAdmin
      supabase.single.mockResolvedValueOnce({ data: { memory: mockMemory }, error: null })
      supabase.upsert.mockResolvedValueOnce({ error: null })

      await addMessageToMemory(mockSessionId, 'assistant', 'Hello!')
      expect(supabase.upsert).toHaveBeenCalled()
    })

    it('should add context to memory', async () => {
      const supabase = require('../supabase/server').supabaseAdmin
      supabase.single.mockResolvedValueOnce({ data: { memory: mockMemory }, error: null })
      supabase.upsert.mockResolvedValueOnce({ error: null })

      await addContextToMemory(mockSessionId, 'project', 'test.ts', 0.9)
      expect(supabase.upsert).toHaveBeenCalled()
    })
  })

  describe('Personalized Greeting', () => {
    it('should generate technical greeting', () => {
      const greeting = getPersonalizedGreeting({
        ...mockPreferences,
        conversationStyle: 'technical'
      })
      expect(greeting).toContain('How can I assist you with your technical needs')
    })

    it('should generate casual greeting', () => {
      const greeting = getPersonalizedGreeting({
        ...mockPreferences,
        conversationStyle: 'casual'
      })
      expect(greeting).toContain('What can I help you with')
    })

    it('should include interests in greeting', () => {
      const greeting = getPersonalizedGreeting(mockPreferences)
      expect(greeting).toContain('interested in AI, Web Development')
    })
  })
}) 