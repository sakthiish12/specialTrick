import {
  availableFunctions,
  callFunction,
  getFunctionDefinitions,
  shouldCallFunction,
  extractFunctionCall
} from './function-calling'
import { getGitHubStats, createIssue } from '@/lib/github/api'
import { searchBlog } from '@/lib/blog/search'

// Mock the imported functions
jest.mock('@/lib/github/api')
jest.mock('@/lib/blog/search')

describe('Function Calling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('availableFunctions', () => {
    it('defines all required functions', () => {
      expect(availableFunctions).toHaveProperty('getGitHubStats')
      expect(availableFunctions).toHaveProperty('searchBlog')
      expect(availableFunctions).toHaveProperty('createIssue')
    })

    it('has correct function definitions', () => {
      const getGitHubStatsDef = availableFunctions.getGitHubStats
      expect(getGitHubStatsDef.name).toBe('getGitHubStats')
      expect(getGitHubStatsDef.description).toBe('Get GitHub statistics for the user')
      expect(getGitHubStatsDef.parameters.required).toHaveLength(0)

      const searchBlogDef = availableFunctions.searchBlog
      expect(searchBlogDef.name).toBe('searchBlog')
      expect(searchBlogDef.parameters.required).toContain('tag')

      const createIssueDef = availableFunctions.createIssue
      expect(createIssueDef.name).toBe('createIssue')
      expect(createIssueDef.parameters.required).toContain('repo')
      expect(createIssueDef.parameters.required).toContain('title')
      expect(createIssueDef.parameters.required).toContain('body')
    })
  })

  describe('callFunction', () => {
    it('calls getGitHubStats correctly', async () => {
      const mockStats = { totalCommits: 100 }
      ;(getGitHubStats as jest.Mock).mockResolvedValue(mockStats)

      const result = await callFunction('getGitHubStats', {})
      expect(result).toEqual(mockStats)
      expect(getGitHubStats).toHaveBeenCalled()
    })

    it('calls searchBlog correctly', async () => {
      const mockPosts = [{ title: 'Test Post' }]
      ;(searchBlog as jest.Mock).mockResolvedValue(mockPosts)

      const result = await callFunction('searchBlog', { tag: 'typescript' })
      expect(result).toEqual(mockPosts)
      expect(searchBlog).toHaveBeenCalledWith('typescript')
    })

    it('calls createIssue correctly', async () => {
      const mockIssue = { number: 1 }
      ;(createIssue as jest.Mock).mockResolvedValue(mockIssue)

      const result = await callFunction('createIssue', {
        repo: 'test-repo',
        title: 'Test Issue',
        body: 'Test Body'
      })
      expect(result).toEqual(mockIssue)
      expect(createIssue).toHaveBeenCalledWith('test-repo', 'Test Issue', 'Test Body')
    })

    it('throws error for unknown function', async () => {
      await expect(callFunction('unknownFunction', {})).rejects.toThrow(
        'Unknown function: unknownFunction'
      )
    })
  })

  describe('getFunctionDefinitions', () => {
    it('returns all function definitions', () => {
      const definitions = getFunctionDefinitions()
      expect(definitions).toHaveLength(3)
      expect(definitions.map(d => d.name)).toEqual([
        'getGitHubStats',
        'searchBlog',
        'createIssue'
      ])
    })
  })

  describe('shouldCallFunction', () => {
    it('returns true for message with function call', () => {
      const message = {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'getGitHubStats',
          arguments: '{}'
        }
      }
      expect(shouldCallFunction([message])).toBe(true)
    })

    it('returns false for message without function call', () => {
      const message = {
        role: 'assistant',
        content: 'Hello, how can I help you?'
      }
      expect(shouldCallFunction([message])).toBe(false)
    })

    it('returns false for non-assistant message', () => {
      const message = {
        role: 'user',
        content: 'Hello'
      }
      expect(shouldCallFunction([message])).toBe(false)
    })
  })

  describe('extractFunctionCall', () => {
    it('extracts function call details correctly', () => {
      const message = {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'searchBlog',
          arguments: '{"tag":"typescript"}'
        }
      }
      const result = extractFunctionCall(message)
      expect(result).toEqual({
        name: 'searchBlog',
        arguments: { tag: 'typescript' }
      })
    })

    it('returns null for message without function call', () => {
      const message = {
        role: 'assistant',
        content: 'Hello'
      }
      expect(extractFunctionCall(message)).toBeNull()
    })

    it('returns null for invalid function arguments', () => {
      const message = {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'searchBlog',
          arguments: 'invalid-json'
        }
      }
      expect(extractFunctionCall(message)).toBeNull()
    })
  })
}) 