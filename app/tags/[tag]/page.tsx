import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostsByTag, getAllTags } from '@/lib/blog/directory'
import { BlogPostList } from '@/components/blog/blog-post-list'
import { BlogFilters } from '@/components/blog/blog-filters'

interface TagPageProps {
  params: {
    tag: string
  }
}

export async function generateMetadata({
  params
}: TagPageProps): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag)
  return {
    title: `Posts tagged with "${tag}" | Blog`,
    description: `Browse all blog posts tagged with "${tag}".`
  }
}

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map((tag) => ({
    tag: encodeURIComponent(tag)
  }))
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag)
  const posts = getPostsByTag(tag)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Posts tagged with &quot;{tag}&quot;
        </h1>
        <p className="text-lg text-muted-foreground">
          {posts.length} post{posts.length === 1 ? '' : 's'} found
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <BlogPostList posts={posts} />
        </div>
        <div className="space-y-6">
          <BlogFilters posts={posts} />
        </div>
      </div>
    </div>
  )
} 