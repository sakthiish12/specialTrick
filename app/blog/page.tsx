import { getAllPosts } from '@/lib/blog/mdx'
import { getPopularTags } from '@/lib/blog/tags'
import { BlogPostList } from '@/components/blog/blog-post-list'
import { TagCloud } from '@/components/blog/tag-cloud'
import { BlogSearch } from '@/components/blog/blog-search'
import { SearchResults } from '@/components/blog/search-results'
import { TagFilter } from '@/components/blog/tag-filter'
import { PreviewBanner } from '@/components/blog/preview-banner'
import { BlogLayout } from '@/components/blog/blog-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateBlogListMetadata } from '@/lib/blog/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = generateBlogListMetadata

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string; pr?: string }
}) {
  const posts = await getAllPosts()
  const popularTags = await getPopularTags(10)
  const query = searchParams.q
  const selectedTag = searchParams.tag
  const prNumber = searchParams.pr

  let filteredPosts = posts

  if (selectedTag) {
    filteredPosts = filteredPosts.filter((post) =>
      post.tags.includes(selectedTag)
    )
  }

  if (query) {
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    )
  }

  const sidebar = (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary">Popular Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <TagCloud tags={popularTags} className="mt-4" />
      </CardContent>
    </Card>
  )

  return (
    <BlogLayout sidebar={sidebar}>
      {prNumber && (
        <PreviewBanner
          prNumber={parseInt(prNumber)}
          prTitle="Blog Post Preview"
        />
      )}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          Blog
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Read my thoughts on software development, design, and more.
        </p>
        <div className="space-y-4">
          <BlogSearch className="max-w-md" />
          <TagFilter tags={popularTags} />
        </div>
      </div>

      {query ? (
        <SearchResults posts={filteredPosts} query={query} />
      ) : (
        <BlogPostList posts={filteredPosts} />
      )}
    </BlogLayout>
  )
} 