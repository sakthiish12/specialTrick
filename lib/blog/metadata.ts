import { Metadata } from 'next'
import { getAllPosts } from './mdx'
import type { BlogPost } from './mdx'

export interface BlogMetadata extends Metadata {
  title: string
  description: string
  openGraph?: {
    title: string
    description: string
    type: 'article'
    publishedTime: string
    authors: string[]
    tags: string[]
  }
  twitter?: {
    card: 'summary_large_image'
    title: string
    description: string
  }
}

export async function generateBlogMetadata(post: BlogPost): Promise<BlogMetadata> {
  const { title, description, date, tags, author = 'Your Name' } = post

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: date,
      authors: [author],
      tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export async function generateBlogListMetadata(): Promise<BlogMetadata> {
  const posts = await getAllPosts()
  const postCount = posts.length

  return {
    title: 'Blog',
    description: `Read ${postCount} articles about software development, design, and more.`,
    openGraph: {
      title: 'Blog',
      description: `Read ${postCount} articles about software development, design, and more.`,
      type: 'article',
      publishedTime: new Date().toISOString(),
      authors: ['Your Name'],
      tags: ['blog', 'software development', 'design'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog',
      description: `Read ${postCount} articles about software development, design, and more.`,
    },
  }
}

export async function generateTagMetadata(tag: string): Promise<BlogMetadata> {
  const posts = await getAllPosts()
  const tagPosts = posts.filter((post) => post.tags.includes(tag))
  const postCount = tagPosts.length

  return {
    title: `${tag} - Blog Posts`,
    description: `Read ${postCount} articles about ${tag}.`,
    openGraph: {
      title: `${tag} - Blog Posts`,
      description: `Read ${postCount} articles about ${tag}.`,
      type: 'article',
      publishedTime: new Date().toISOString(),
      authors: ['Your Name'],
      tags: [tag, 'blog'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tag} - Blog Posts`,
      description: `Read ${postCount} articles about ${tag}.`,
    },
  }
} 