import { initializeSearch, search, searchByTag } from '../search'
import { getAllPosts } from '../mdx'

describe('Search Utilities', () => {
  beforeAll(async () => {
    await initializeSearch()
  })

  describe('search', () => {
    it('should return search results for a valid query', async () => {
      const posts = await getAllPosts()
      if (posts.length > 0) {
        const query = posts[0].title.split(' ')[0]
        const results = await search(query)
        expect(Array.isArray(results)).toBe(true)
        expect(results.length).toBeGreaterThan(0)
      }
    })

    it('should return results with required properties', async () => {
      const posts = await getAllPosts()
      if (posts.length > 0) {
        const query = posts[0].title.split(' ')[0]
        const results = await search(query)
        const result = results[0]

        expect(result).toHaveProperty('slug')
        expect(result).toHaveProperty('title')
        expect(result).toHaveProperty('description')
        expect(result).toHaveProperty('score')
      }
    })

    it('should return empty array for no matches', async () => {
      const results = await search('nonexistentquery123')
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(0)
    })

    it('should return results sorted by relevance score', async () => {
      const posts = await getAllPosts()
      if (posts.length > 0) {
        const query = posts[0].title.split(' ')[0]
        const results = await search(query)
        const scores = results.map((result) => result.score)
        const sortedScores = [...scores].sort((a, b) => b - a)
        expect(scores).toEqual(sortedScores)
      }
    })
  })

  describe('searchByTag', () => {
    it('should return posts for a valid tag', async () => {
      const posts = await getAllPosts()
      if (posts.length > 0 && posts[0].tags.length > 0) {
        const tag = posts[0].tags[0]
        const results = await searchByTag(tag)
        expect(Array.isArray(results)).toBe(true)
        expect(results.length).toBeGreaterThan(0)
      }
    })

    it('should return posts that contain the specified tag', async () => {
      const posts = await getAllPosts()
      if (posts.length > 0 && posts[0].tags.length > 0) {
        const tag = posts[0].tags[0]
        const results = await searchByTag(tag)
        results.forEach((post) => {
          expect(post.tags).toContain(tag)
        })
      }
    })

    it('should return empty array for non-existent tag', async () => {
      const results = await searchByTag('nonexistenttag123')
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(0)
    })
  })
}) 