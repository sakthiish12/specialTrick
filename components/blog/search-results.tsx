'use client'

import { BlogPost } from '@/lib/blog/mdx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface SearchResultsProps {
  posts: BlogPost[]
  query: string
}

export function SearchResults({ posts, query }: SearchResultsProps) {
  if (!query) {
    return null
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-muted-foreground">
          No posts found matching &quot;{query}&quot;
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.slug} className="hover:bg-primary/10 transition-colors">
          <Link href={`/blog/${post.slug}`}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-primary">{post.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>•</span>
                <span>{post.readingTime} min read</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{post.description}</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="hover:bg-primary hover:text-white transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  )
} 