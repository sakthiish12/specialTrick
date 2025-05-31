import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { cache } from 'react'

export interface BlogPost {
  slug: string
  title: string
  date: string | Date
  tags: string[]
  summary: string
  content: string
  readingTime: number
}

const POSTS_DIR = path.join(process.cwd(), 'posts')

/**
 * Get all blog posts with caching
 */
export const getAllPosts = cache(async (): Promise<BlogPost[]> => {
  const files = fs.readdirSync(POSTS_DIR)
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith('.md'))
      .map(async (file) => {
        const filePath = path.join(POSTS_DIR, file)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const { data, content } = matter(fileContent)
        const slug = file.replace(/\.md$/, '')

        // Calculate reading time (assuming 200 words per minute)
        const wordCount = content.split(/\s+/).length
        const readingTime = Math.ceil(wordCount / 200)

        return {
          slug,
          title: data.title,
          date: data.date,
          tags: data.tags || [],
          summary: data.summary,
          content,
          readingTime
        }
      })
  )

  // Sort posts by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

/**
 * Get a single blog post by slug
 */
export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const posts = await getAllPosts()
  return posts.find((post) => post.slug === slug) || null
})

/**
 * Get all unique tags from blog posts
 */
export const getAllTags = cache(async (): Promise<string[]> => {
  const posts = await getAllPosts()
  const tags = new Set<string>()
  
  posts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag))
  })

  return Array.from(tags).sort()
})

/**
 * Get posts by tag
 */
export const getPostsByTag = cache(async (tag: string): Promise<BlogPost[]> => {
  const posts = await getAllPosts()
  return posts.filter((post) => post.tags.includes(tag))
})

/**
 * Search posts by query
 */
export const searchPosts = cache(async (query: string): Promise<BlogPost[]> => {
  const posts = await getAllPosts()
  const searchTerms = query.toLowerCase().split(' ')

  return posts.filter((post) => {
    const searchableText = `${post.title} ${post.summary} ${post.content}`.toLowerCase()
    return searchTerms.every((term) => searchableText.includes(term))
  })
}) 