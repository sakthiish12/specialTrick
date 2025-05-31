import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { PostMetadata } from '@/lib/blog/directory'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User, Calendar } from 'lucide-react'

interface BlogPostListProps {
  posts: PostMetadata[]
}

export function BlogPostList({ posts }: BlogPostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">No posts found</h2>
        <p className="text-muted-foreground">
          Check back later for new content.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
          <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {post.image && (
                <div className="relative h-60 md:h-full">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className={`${post.image ? 'md:col-span-2' : 'md:col-span-3'} p-6`}>
                <h3 className="text-2xl font-bold mb-2 text-foreground hover:text-primary transition-colors">
                  {post.title}
                </h3>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-primary mr-1.5" />
                    <time dateTime={post.date}>
                      {format(new Date(post.date), 'MMMM d, yyyy')}
                    </time>
                  </div>
                  
                  {post.author && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-primary mr-1.5" />
                      <span>{post.author}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-primary mr-1.5" />
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-5 line-clamp-3">
                  {post.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-auto">
                  {post.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="hover:bg-primary/20 transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}