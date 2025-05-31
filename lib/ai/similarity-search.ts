import { searchDocuments } from './embeddings'
import type { Database } from '../supabase/types'

export interface SearchResult {
  content: string
  metadata: {
    type: 'blog' | 'project' | 'tutorial'
    path: string
    [key: string]: any
  }
  similarity: number
}

export interface SearchOptions {
  matchCount?: number
  matchThreshold?: number
  type?: 'blog' | 'project' | 'tutorial'
  minSimilarity?: number
  maxResults?: number
}

/**
 * Performs a similarity search across documents with contextual understanding
 */
export async function searchSimilarDocuments(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    matchCount = 5,
    matchThreshold = 0.7,
    type,
    minSimilarity = 0.5,
    maxResults = 10
  } = options

  // Get initial search results
  const results = await searchDocuments(query, {
    matchCount: Math.max(matchCount, maxResults),
    matchThreshold,
    type
  })

  // Filter and format results
  return results
    .filter(result => result.similarity >= minSimilarity)
    .slice(0, maxResults)
    .map(result => ({
      content: result.content,
      metadata: result.metadata as SearchResult['metadata'],
      similarity: result.similarity
    }))
}

/**
 * Searches for code-related content with enhanced context
 */
export async function searchCodeContext(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  // Add code-specific context to the query
  const enhancedQuery = `Code context: ${query}`
  
  return searchSimilarDocuments(enhancedQuery, {
    ...options,
    type: 'project',
    minSimilarity: options.minSimilarity || 0.6 // Higher threshold for code
  })
}

/**
 * Searches for documentation with enhanced context
 */
export async function searchDocumentation(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  // Add documentation-specific context to the query
  const enhancedQuery = `Documentation: ${query}`
  
  return searchSimilarDocuments(enhancedQuery, {
    ...options,
    type: 'tutorial',
    minSimilarity: options.minSimilarity || 0.5
  })
}

/**
 * Searches for blog posts with enhanced context
 */
export async function searchBlogPosts(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  // Add blog-specific context to the query
  const enhancedQuery = `Blog post: ${query}`
  
  return searchSimilarDocuments(enhancedQuery, {
    ...options,
    type: 'blog',
    minSimilarity: options.minSimilarity || 0.5
  })
}

/**
 * Performs a comprehensive search across all content types
 */
export async function comprehensiveSearch(
  query: string,
  options: SearchOptions = {}
): Promise<{
  code: SearchResult[]
  documentation: SearchResult[]
  blog: SearchResult[]
}> {
  const [code, documentation, blog] = await Promise.all([
    searchCodeContext(query, options),
    searchDocumentation(query, options),
    searchBlogPosts(query, options)
  ])

  return {
    code,
    documentation,
    blog
  }
} 