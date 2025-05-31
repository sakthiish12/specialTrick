import { create } from '@lunrjs/lunr'
import { getAllPosts } from './mdx'
import type { BlogPost } from './mdx'

export interface SearchResult {
  slug: string
  title: string
  description: string
  tags: string[]
  date: string
  score: number
}

let searchIndex: ReturnType<typeof create> | null = null
let searchDocuments: BlogPost[] = []

export async function initializeSearch() {
  if (searchIndex) return

  const posts = await getAllPosts()
  searchDocuments = posts

  searchIndex = create({
    fields: ['title', 'description', 'content', 'tags'],
    storeFields: ['slug', 'title', 'description', 'tags', 'date']
  })

  posts.forEach((post) => {
    searchIndex?.add({
      ...post,
      content: post.content.toString()
    })
  })
}

export async function search(query: string): Promise<SearchResult[]> {
  if (!searchIndex) {
    await initializeSearch()
  }

  if (!query.trim()) {
    return []
  }

  const results = searchIndex?.search(query) || []
  return results.map((result) => {
    const document = searchDocuments.find((doc) => doc.slug === result.ref)
    return {
      slug: result.ref,
      title: document?.title || '',
      description: document?.description || '',
      tags: document?.tags || [],
      date: document?.date || '',
      score: result.score
    }
  })
}

export async function searchByTag(tag: string): Promise<SearchResult[]> {
  if (!searchIndex) {
    await initializeSearch()
  }

  return searchDocuments
    .filter((post) => post.tags.includes(tag))
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      tags: post.tags,
      date: post.date,
      score: 1
    }))
} 