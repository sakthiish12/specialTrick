import fs from 'fs'
import path from 'path'
import {
  getAllPosts,
  getPostBySlug,
  getAllTags,
  getPostsByTag,
  searchPosts,
  type BlogPost
} from './posts'

// Mock fs and path modules
jest.mock('fs')
jest.mock('path')

describe('Blog Posts', () => {
  const mockPost: BlogPost = {
    slug: 'test-post',
    title: 'Test Post',
    date: new Date('2024-03-15'),
    tags: ['test', 'blog'],
    summary: 'This is a test post',
    content: 'Test content goes here',
    readingTime: 1
  }

  const mockPost2: BlogPost = {
    slug: 'another-post',
    title: 'Another Post',
    date: new Date('2024-03-16'),
    tags: ['blog', 'tutorial'],
    summary: 'This is another test post',
    content: 'More test content',
    readingTime: 1
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock fs.readdirSync
    ;(fs.readdirSync as jest.Mock).mockReturnValue(['test-post.md', 'another-post.md'])
    
    // Mock fs.readFileSync
    ;(fs.readFileSync as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath.includes('test-post')) {
        return `---
title: Test Post
date: 2024-03-15
tags: [test, blog]
summary: This is a test post
---
Test content goes here`
      }
      return `---
title: Another Post
date: 2024-03-16
tags: [blog, tutorial]
summary: This is another test post
---
More test content`
    })
    
    // Mock path.join
    ;(path.join as jest.Mock).mockImplementation((...args) => args.join('/'))
  })

  describe('getAllPosts', () => {
    it('should return all posts sorted by date', async () => {
      const posts = await getAllPosts()
      expect(posts).toHaveLength(2)
      expect(posts[0].slug).toBe('another-post') // Newer post first
      expect(posts[1].slug).toBe('test-post')
    })

    it('should calculate reading time correctly', async () => {
      const posts = await getAllPosts()
      expect(posts[0].readingTime).toBe(1)
      expect(posts[1].readingTime).toBe(1)
    })
  })

  describe('getPostBySlug', () => {
    it('should return post by slug', async () => {
      const post = await getPostBySlug('test-post')
      expect(post).toEqual(mockPost)
    })

    it('should return null for non-existent slug', async () => {
      const post = await getPostBySlug('non-existent')
      expect(post).toBeNull()
    })
  })

  describe('getAllTags', () => {
    it('should return unique tags sorted alphabetically', async () => {
      const tags = await getAllTags()
      expect(tags).toEqual(['blog', 'test', 'tutorial'])
    })
  })

  describe('getPostsByTag', () => {
    it('should return posts with matching tag', async () => {
      const posts = await getPostsByTag('blog')
      expect(posts).toHaveLength(2)
      expect(posts[0].tags).toContain('blog')
      expect(posts[1].tags).toContain('blog')
    })

    it('should return empty array for non-existent tag', async () => {
      const posts = await getPostsByTag('non-existent')
      expect(posts).toHaveLength(0)
    })
  })

  describe('searchPosts', () => {
    it('should search posts by query', async () => {
      const posts = await searchPosts('test')
      // Both posts contain 'test' in their content or summary
      expect(posts.length).toBeGreaterThan(0)
      // Check if one of the posts has the expected slug
      expect(posts.some(post => post.slug === 'test-post')).toBe(true)
    })

    it('should search across title, summary, and content', async () => {
      const posts = await searchPosts('content')
      expect(posts).toHaveLength(2)
    })

    it('should return empty array for no matches', async () => {
      const posts = await searchPosts('non-existent')
      expect(posts).toHaveLength(0)
    })
  })
}) 