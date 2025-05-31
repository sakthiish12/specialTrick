import {
  getDocumentMetadata,
  processDocument,
  getDocumentType,
  getRelevantTags,
  type DocumentType
} from './document-processor'

describe('Document Processor', () => {
  describe('getDocumentMetadata', () => {
    it('extracts metadata from blog post with frontmatter', () => {
      const content = `---
title: Test Blog Post
tags: [typescript, nextjs]
---

This is a test blog post.`
      const source = 'posts/2024-03-20-test-post.mdx'
      const type: DocumentType = 'blog'

      const metadata = getDocumentMetadata(content, source, type)

      expect(metadata).toEqual({
        type: 'blog',
        tags: ['typescript', 'nextjs'],
        source: 'posts/2024-03-20-test-post.mdx',
        path: 'posts/2024-03-20-test-post.mdx',
        title: 'Test Blog Post',
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('handles content without frontmatter', () => {
      const content = 'This is a test file without frontmatter.'
      const source = 'src/components/Button.tsx'
      const type: DocumentType = 'project'

      const metadata = getDocumentMetadata(content, source, type)

      expect(metadata).toEqual({
        type: 'project',
        tags: [],
        source: 'src/components/Button.tsx',
        path: 'src/components/Button.tsx',
        title: 'src/components/Button.tsx',
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })
  })

  describe('processDocument', () => {
    it('chunks content and adds metadata', () => {
      const content = 'This is a test file that will be chunked into multiple pieces.'
      const source = 'test.txt'
      const type: DocumentType = 'documentation'

      const chunks = processDocument(content, source, type)

      expect(chunks).toHaveLength(1)
      expect(chunks[0]).toEqual({
        content: 'This is a test file that will be chunked into multiple pieces.',
        metadata: {
          type: 'documentation',
          tags: [],
          source: 'test.txt',
          path: 'test.txt',
          title: 'test.txt',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          chunk_index: 0,
          total_chunks: 1
        }
      })
    })
  })

  describe('getDocumentType', () => {
    it('identifies blog posts', () => {
      expect(getDocumentType('posts/2024-03-20-test.md')).toBe('blog')
    })

    it('identifies documentation', () => {
      expect(getDocumentType('README.md')).toBe('documentation')
    })

    it('identifies tutorials', () => {
      expect(getDocumentType('tutorials/getting-started.md')).toBe('tutorial')
    })

    it('defaults to project for other files', () => {
      expect(getDocumentType('src/components/Button.tsx')).toBe('project')
    })
  })

  describe('getRelevantTags', () => {
    it('adds type-specific tags', () => {
      const tags = getRelevantTags('blog', '')
      expect(tags).toContain('blog')
    })

    it('adds language-specific tags', () => {
      const tags = getRelevantTags('project', 'Button.tsx')
      expect(tags).toContain('typescript')
    })

    it('adds framework-specific tags', () => {
      const tags = getRelevantTags('project', 'next.config.js')
      expect(tags).toContain('nextjs')
    })
  })
}) 