import fs from 'fs'
import path from 'path'
import {
  validatePostFilename,
  getPostSlug,
  getPostDate,
  validatePostMetadata,
  getPostMetadata,
  getAllPostMetadata,
  getPostsByTag,
  getAllTags,
  createPost,
  calculateReadingTime,
  PostMetadata
} from './directory'

// Mock fs and path modules
jest.mock('fs')
jest.mock('path')

describe('Blog Post Directory Utilities', () => {
  const mockPost = {
    title: 'Test Post',
    date: '2024-03-15',
    description: 'Test description',
    tags: ['test', 'mdx'],
    author: 'John Doe',
    image: '/images/test-post.jpg',
    category: 'Technology',
    series: 'Getting Started'
  }

  const mockContent = '# Test Post\n\nThis is a test post with some content.'

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fs.readdirSync as jest.Mock).mockReturnValue(['2024-03-15-test-post.mdx'])
    ;(fs.readFileSync as jest.Mock).mockReturnValue(
      `---\ntitle: ${mockPost.title}\ndate: ${mockPost.date}\ndescription: ${mockPost.description}\ntags: ${JSON.stringify(mockPost.tags)}\nauthor: ${mockPost.author}\nimage: ${mockPost.image}\ncategory: ${mockPost.category}\nseries: ${mockPost.series}\n---\n\n${mockContent}`
    )
    ;(fs.statSync as jest.Mock).mockReturnValue({
      mtime: new Date('2024-03-15T12:00:00Z')
    })
    ;(path.join as jest.Mock).mockImplementation((...args) => args.join('/'))
  })

  describe('validatePostFilename', () => {
    it('validates correct filename format', () => {
      expect(validatePostFilename('2024-03-15-test-post.mdx')).toBe(true)
      expect(validatePostFilename('2024-03-15-test-post.md')).toBe(false)
      expect(validatePostFilename('test-post.mdx')).toBe(false)
      expect(validatePostFilename('2024-3-15-test-post.mdx')).toBe(false)
    })
  })

  describe('getPostSlug', () => {
    it('extracts slug from filename', () => {
      expect(getPostSlug('2024-03-15-test-post.mdx')).toBe('test-post')
    })
  })

  describe('getPostDate', () => {
    it('extracts date from filename', () => {
      expect(getPostDate('2024-03-15-test-post.mdx')).toBe('2024-03-15')
    })
  })

  describe('calculateReadingTime', () => {
    it('calculates reading time based on word count', () => {
      const content = 'This is a test post with some content.'
      expect(calculateReadingTime(content)).toBe(1)
    })

    it('handles empty content', () => {
      expect(calculateReadingTime('')).toBe(0)
    })
  })

  describe('validatePostMetadata', () => {
    it('validates correct metadata', () => {
      expect(validatePostMetadata(mockPost)).toBe(true)
    })

    it('rejects invalid metadata', () => {
      expect(validatePostMetadata({ ...mockPost, title: 123 })).toBe(false)
      expect(validatePostMetadata({ ...mockPost, tags: 'test' })).toBe(false)
      expect(validatePostMetadata({ ...mockPost, author: 123 })).toBe(false)
      expect(validatePostMetadata({ ...mockPost, readingTime: '5' })).toBe(false)
    })

    it('validates optional fields', () => {
      const minimalPost = {
        title: 'Test',
        date: '2024-03-15',
        description: 'Test',
        tags: ['test']
      }
      expect(validatePostMetadata(minimalPost)).toBe(true)
    })
  })

  describe('getPostMetadata', () => {
    it('returns metadata for valid post', () => {
      const metadata = getPostMetadata('2024-03-15-test-post.mdx')
      expect(metadata).toEqual({
        slug: 'test-post',
        ...mockPost,
        draft: false,
        readingTime: 1,
        lastModified: '2024-03-15'
      })
    })

    it('returns null for invalid post', () => {
      ;(fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found')
      })

      const metadata = getPostMetadata('non-existent.mdx')
      expect(metadata).toBeNull()
    })
  })

  describe('getAllPostMetadata', () => {
    it('returns all post metadata sorted by date', () => {
      const posts = getAllPostMetadata()
      expect(posts).toHaveLength(1)
      expect(posts[0]).toEqual({
        slug: 'test-post',
        ...mockPost,
        draft: false,
        readingTime: 1,
        lastModified: '2024-03-15'
      })
    })

    it('handles empty directory', () => {
      ;(fs.readdirSync as jest.Mock).mockReturnValue([])
      const posts = getAllPostMetadata()
      expect(posts).toEqual([])
    })
  })

  describe('getPostsByTag', () => {
    it('returns posts with matching tag', () => {
      const posts = getPostsByTag('test')
      expect(posts).toHaveLength(1)
      expect(posts[0].tags).toContain('test')
    })

    it('returns empty array for non-existent tag', () => {
      const posts = getPostsByTag('non-existent')
      expect(posts).toEqual([])
    })
  })

  describe('getAllTags', () => {
    it('returns unique tags from all posts', () => {
      const tags = getAllTags()
      expect(tags).toEqual(['mdx', 'test'])
    })

    it('handles empty posts directory', () => {
      ;(fs.readdirSync as jest.Mock).mockReturnValue([])
      const tags = getAllTags()
      expect(tags).toEqual([])
    })
  })

  describe('createPost', () => {
    it('creates new post with correct format', () => {
      const filename = createPost(
        'New Post',
        'New description',
        ['new', 'test'],
        'New content',
        true,
        {
          author: 'Jane Doe',
          image: '/images/new-post.jpg',
          category: 'Development'
        }
      )

      expect(filename).toMatch(/^\d{4}-\d{2}-\d{2}-new-post\.mdx$/)
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(filename),
        expect.stringContaining('New Post')
      )
    })
  })
}) 