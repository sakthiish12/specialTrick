import { processQuery, getSmartPrompt } from './tool-calling'
import { comprehensiveSearch } from './similarity-search'
import type { SearchResult } from './similarity-search'

// Mock OpenAI
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Test response',
                tool_calls: [
                  {
                    id: 'call_1',
                    function: {
                      name: 'searchBlog',
                      arguments: JSON.stringify({ tag: 'test' })
                    }
                  }
                ]
              }
            }
          ]
        })
      }
    }
  }))
}))

// Mock similarity search
jest.mock('./similarity-search', () => ({
  comprehensiveSearch: jest.fn().mockResolvedValue({
    blog: [
      {
        content: 'Test blog content',
        metadata: {
          type: 'blog',
          path: 'test.md'
        },
        similarity: 0.8
      }
    ]
  })
}))

describe('Tool Calling', () => {
  const mockContext: SearchResult[] = [
    {
      content: 'Test context',
      metadata: {
        type: 'blog',
        path: 'test.md'
      },
      similarity: 0.8
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('processQuery', () => {
    it('should process a query with tool calls', async () => {
      const result = await processQuery('test query', mockContext)
      expect(result.response).toBe('Test response')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].name).toBe('searchBlog')
    })

    it('should handle queries without tool calls', async () => {
      // Mock OpenAI to return response without tool calls
      const openai = require('openai').default()
      openai.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'Direct response'
            }
          }
        ]
      })

      const result = await processQuery('test query', mockContext)
      expect(result.response).toBe('Direct response')
      expect(result.toolCalls).toHaveLength(0)
    })
  })

  describe('getSmartPrompt', () => {
    it('should generate a smart prompt based on context', async () => {
      const prompt = await getSmartPrompt('test query', mockContext)
      expect(prompt).toBe('Test response')
    })

    it('should return original query if no better prompt is generated', async () => {
      // Mock OpenAI to return null content
      const openai = require('openai').default()
      openai.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: null
            }
          }
        ]
      })

      const prompt = await getSmartPrompt('test query', mockContext)
      expect(prompt).toBe('test query')
    })
  })
}) 