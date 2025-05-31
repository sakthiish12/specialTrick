import type { MDXRemoteSerializeResult } from 'next-mdx-remote'

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  readingTime: number
  content: MDXRemoteSerializeResult
}

export interface BlogMetadata {
  title: string
  description: string
  openGraph?: {
    title: string
    description: string
    type: string
    url: string
    images: Array<{
      url: string
      width: number
      height: number
      alt: string
    }>
  }
  twitter?: {
    card: string
    title: string
    description: string
    images: string[]
  }
}

export interface TagStats {
  name: string
  count: number
}

export interface SearchResult {
  slug: string
  title: string
  description: string
  score: number
} 