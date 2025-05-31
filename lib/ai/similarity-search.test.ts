import {
  searchSimilarDocuments,
  searchCodeContext,
  searchDocumentation,
  searchBlogPosts,
  comprehensiveSearch,
  type SearchResult
} from './similarity-search'
import { searchDocuments } from './embeddings'

// Mock the embeddings module
jest.mock('./embeddings', () => ({
  searchDocuments: jest.fn()
}))

describe('Similarity Search', () => {
  const mockResults: SearchResult[] = [
    {
      content: 'Test content 1',
      metadata: {
        type: 'project',
        path: 'test/path1.ts',
        language: 'typescript'
      },
      similarity: 0.8
    },
    {
      content: 'Test content 2',
      metadata: {
        type: 'blog',
        path: 'test/path2.md',
        title: 'Test Blog'
      },
      similarity: 0.7
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(searchDocuments as jest.Mock).mockResolvedValue(mockResults)
  })

  describe('searchSimilarDocuments', () => {
    it('should perform basic similarity search', async () => {
      const results = await searchSimilarDocuments('test query')
      expect(searchDocuments).toHaveBeenCalledWith('test query', {
        matchCount: 10,
        matchThreshold: 0.7,
        type: undefined
      })
      expect(results).toHaveLength(2)
    })

    it('should filter by minimum similarity', async () => {
      const results = await searchSimilarDocuments('test query', { minSimilarity: 0.75 })
      expect(results).toHaveLength(1)
      expect(results[0].similarity).toBeGreaterThanOrEqual(0.75)
    })

    it('should limit results by maxResults', async () => {
      const results = await searchSimilarDocuments('test query', { maxResults: 1 })
      expect(results).toHaveLength(1)
    })
  })

  describe('searchCodeContext', () => {
    it('should search with code context', async () => {
      await searchCodeContext('test query')
      expect(searchDocuments).toHaveBeenCalledWith('Code context: test query', {
        matchCount: 10,
        matchThreshold: 0.7,
        type: 'project',
        minSimilarity: 0.6
      })
    })
  })

  describe('searchDocumentation', () => {
    it('should search with documentation context', async () => {
      await searchDocumentation('test query')
      expect(searchDocuments).toHaveBeenCalledWith('Documentation: test query', {
        matchCount: 10,
        matchThreshold: 0.7,
        type: 'tutorial',
        minSimilarity: 0.5
      })
    })
  })

  describe('searchBlogPosts', () => {
    it('should search with blog context', async () => {
      await searchBlogPosts('test query')
      expect(searchDocuments).toHaveBeenCalledWith('Blog post: test query', {
        matchCount: 10,
        matchThreshold: 0.7,
        type: 'blog',
        minSimilarity: 0.5
      })
    })
  })

  describe('comprehensiveSearch', () => {
    it('should search across all content types', async () => {
      const results = await comprehensiveSearch('test query')
      expect(results).toHaveProperty('code')
      expect(results).toHaveProperty('documentation')
      expect(results).toHaveProperty('blog')
      expect(searchDocuments).toHaveBeenCalledTimes(3)
    })
  })
}) 