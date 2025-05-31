import { getAllPosts } from './mdx'

export interface TagStats {
  name: string
  count: number
}

export async function getTagStats(): Promise<TagStats[]> {
  const posts = await getAllPosts()
  const tagCounts = new Map<string, number>()

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getPopularTags(limit = 10): Promise<TagStats[]> {
  const tags = await getTagStats()
  return tags.slice(0, limit)
}

export async function getRelatedTags(tag: string): Promise<TagStats[]> {
  const posts = await getAllPosts()
  const relatedTags = new Map<string, number>()

  posts
    .filter((post) => post.tags.includes(tag))
    .forEach((post) => {
      post.tags
        .filter((t) => t !== tag)
        .forEach((t) => {
          relatedTags.set(t, (relatedTags.get(t) || 0) + 1)
        })
    })

  return Array.from(relatedTags.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
} 