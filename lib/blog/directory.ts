import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const POSTS_DIR = path.join(process.cwd(), 'posts')

export interface PostMetadata {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  draft?: boolean
  author?: string
  image?: string
  readingTime?: number
  lastModified?: string
  category?: string
  series?: string
}

export function validatePostFilename(filename: string): boolean {
  // Format: YYYY-MM-DD-title.mdx
  const pattern = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.mdx$/
  return pattern.test(filename)
}

export function getPostSlug(filename: string): string {
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.mdx$/, '')
}

export function getPostDate(filename: string): string {
  return filename.substring(0, 10) // YYYY-MM-DD
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export function validatePostMetadata(metadata: any): metadata is PostMetadata {
  const requiredFields = {
    title: 'string',
    date: 'string',
    description: 'string',
    tags: 'array'
  }

  // Check required fields
  for (const [field, type] of Object.entries(requiredFields)) {
    if (type === 'array') {
      if (!Array.isArray(metadata[field]) || !metadata[field].every((item: any) => typeof item === 'string')) {
        return false
      }
    } else if (typeof metadata[field] !== type) {
      return false
    }
  }

  // Validate optional fields if present
  if (metadata.author !== undefined && typeof metadata.author !== 'string') return false
  if (metadata.image !== undefined && typeof metadata.image !== 'string') return false
  if (metadata.readingTime !== undefined && typeof metadata.readingTime !== 'number') return false
  if (metadata.lastModified !== undefined && typeof metadata.lastModified !== 'string') return false
  if (metadata.category !== undefined && typeof metadata.category !== 'string') return false
  if (metadata.series !== undefined && typeof metadata.series !== 'string') return false
  if (metadata.draft !== undefined && typeof metadata.draft !== 'boolean') return false

  return true
}

export function getPostMetadata(filename: string): PostMetadata | null {
  try {
    const fullPath = path.join(POSTS_DIR, filename)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    if (!validatePostMetadata(data)) {
      console.error(`Invalid metadata in ${filename}`)
      return null
    }

    // Get file stats for last modified date
    const stats = fs.statSync(fullPath)
    const lastModified = stats.mtime.toISOString().split('T')[0]

    return {
      slug: getPostSlug(filename),
      title: data.title,
      date: data.date,
      description: data.description,
      tags: data.tags,
      draft: data.draft || false,
      author: data.author,
      image: data.image,
      readingTime: data.readingTime || calculateReadingTime(content),
      lastModified: data.lastModified || lastModified,
      category: data.category,
      series: data.series
    }
  } catch (error) {
    console.error(`Error reading metadata from ${filename}:`, error)
    return null
  }
}

export function getAllPostMetadata(): PostMetadata[] {
  try {
    const files = fs.readdirSync(POSTS_DIR)
    const posts = files
      .filter(file => file.endsWith('.mdx') && validatePostFilename(file))
      .map(file => getPostMetadata(file))
      .filter((post): post is PostMetadata => post !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return posts
  } catch (error) {
    console.error('Error reading posts directory:', error)
    return []
  }
}

export function getPostsByTag(tag: string): PostMetadata[] {
  return getAllPostMetadata().filter(post => post.tags.includes(tag))
}

export function getAllTags(): string[] {
  const posts = getAllPostMetadata()
  const tags = new Set<string>()
  posts.forEach(post => post.tags.forEach(tag => tags.add(tag)))
  return Array.from(tags).sort()
}

export function createPost(
  title: string,
  description: string,
  tags: string[],
  content: string,
  draft: boolean = false,
  metadata: Partial<PostMetadata> = {}
): string {
  const date = new Date().toISOString().split('T')[0]
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const filename = `${date}-${slug}.mdx`

  const frontMatter = {
    title,
    date,
    description,
    tags,
    draft,
    ...metadata
  }

  const fileContent = `---\n${Object.entries(frontMatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n')}\n---\n\n${content}`

  const fullPath = path.join(POSTS_DIR, filename)
  fs.writeFileSync(fullPath, fileContent)

  return filename
} 