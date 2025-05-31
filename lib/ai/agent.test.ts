import { createAgent, defaultAgent } from './agent'
import { searchDocuments } from './embeddings'
import { processQuery } from './tool-calling'
import { getPersonalizedGreeting } from './memory'

// Mock dependencies
jest.mock('./embeddings', () => ({
  searchDocuments: jest.fn()
}))

jest.mock('./tool-calling', () => ({
  processQuery: jest.fn()
}))

jest.mock('./memory', () => ({
  getPersonalizedGreeting: jest.fn()
}))

jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }))
}))

describe('AI Agent', () => {
  const mockContext = {
    userId: 'test-user',
    sessionId: 'test-session',
    preferences: {
      interests: ['AI', 'Web Development'],
      preferredTopics: ['TypeScript', 'React'],
      language: 'en',
      lastInteraction: new Date().toISOString(),
      conversationStyle: 'technical'
    },
    memory: null
  }

  const mockMemory = {
    sessionId: 'test-session',
    messages: [
      {
        role: 'user',
        content: 'Hello',
        timestamp: new Date().toISOString()
      }
    ],
    context: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(searchDocuments as jest.Mock).mockResolvedValue([])
    ;(processQuery as jest.Mock).mockImplementation(msg => msg)
    ;(getPersonalizedGreeting as jest.Mock).mockReturnValue('Hello!')
  })

  describe('createAgent', () => {
    it('should create agent with default config', () => {
      const agent = createAgent()
      expect(agent).toHaveProperty('processMessage')
      expect(agent).toHaveProperty('updateConfig')
    })

    it('should create agent with custom config', () => {
      const customConfig = {
        model: 'gpt-3.5-turbo',
        temperature: 0.5
      }
      const agent = createAgent(customConfig)
      expect(agent).toHaveProperty('processMessage')
    })
  })

  describe('processMessage', () => {
    it('should process first message with greeting', async () => {
      const agent = createAgent()
      const message = 'Hi there!'
      
      ;(getPersonalizedGreeting as jest.Mock).mockReturnValue('Welcome!')
      ;(processQuery as jest.Mock).mockResolvedValue('How can I help you?')

      const response = await agent.processMessage(message, mockContext)
      expect(response).toContain('Welcome!')
      expect(response).toContain('How can I help you?')
    })

    it('should include relevant context in system message', async () => {
      const agent = createAgent()
      const message = 'Tell me about your projects'
      
      const mockDocs = [
        { type: 'project', content: 'Project A details' },
        { type: 'blog', content: 'Blog post about Project A' }
      ]
      ;(searchDocuments as jest.Mock).mockResolvedValue(mockDocs)
      ;(processQuery as jest.Mock).mockResolvedValue('Here are the details')

      await agent.processMessage(message, mockContext)
      
      const openai = require('openai').OpenAI.mock.instances[0]
      const createCall = openai.chat.completions.create.mock.calls[0][0]
      expect(createCall.messages[0].content).toContain('Project A details')
      expect(createCall.messages[0].content).toContain('Blog post about Project A')
    })

    it('should process tool calls in response', async () => {
      const agent = createAgent()
      const message = 'Show me your GitHub stats'
      
      ;(processQuery as jest.Mock).mockResolvedValue('Here are your stats')

      const response = await agent.processMessage(message, mockContext)
      expect(processQuery).toHaveBeenCalled()
      expect(response).toBe('Here are your stats')
    })
  })

  describe('updateConfig', () => {
    it('should update agent configuration', () => {
      const agent = createAgent()
      const newConfig = {
        temperature: 0.9,
        maxTokens: 500
      }

      agent.updateConfig(newConfig)
      expect(agent).toBeDefined()
    })
  })
}) 