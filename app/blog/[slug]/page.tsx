import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPosts } from '@/lib/blog/mdx'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, Clock, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { BlogLayout } from '@/components/blog/blog-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// Import BlogInteractions directly
import { BlogInteractions } from '@/components/blog/interactions/blog-interactions'

interface BlogPostPageProps {
  params: {
    slug: string
  }
  searchParams?: Record<string, string | string[] | undefined>
}

export async function generateMetadata({
  params
}: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description
  }
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug
  }))
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  // Create a simple related posts sidebar instead of TOC
  const sidebar = (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-primary">Related Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mt-2">
          {post.tags.map((tag) => (
            <Link href={`/blog?tag=${tag}`} key={tag}>
              <Badge 
                variant="secondary" 
                className="hover:bg-primary hover:text-white transition-colors cursor-pointer"
              >
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <BlogLayout sidebar={sidebar}>
      <div className="mb-6">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to all posts
        </Link>
      </div>
      
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-foreground">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-primary mr-2" />
              <time dateTime={post.date}>
                {formatDate(post.date)}
              </time>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-primary mr-2" />
              <span>{post.readingTime} min read</span>
            </div>
          </div>
          
          <Separator className="my-6" />
        </header>
        
        <div className="mdx-content">
          <MDXRemote 
            source={post.content} 
            components={{
              // Provide minimal components to avoid errors
              h1: (props) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
              h2: (props) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
              h3: (props) => <h3 className="text-xl font-bold mt-5 mb-2" {...props} />,
              p: (props) => <p className="my-4 leading-7" {...props} />,
              a: (props) => <a className="text-primary hover:underline" {...props} />,
              ul: (props) => <ul className="list-disc pl-6 my-4" {...props} />,
              ol: (props) => <ol className="list-decimal pl-6 my-4" {...props} />,
              li: (props) => <li className="mb-1" {...props} />,
              blockquote: (props) => <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />,
              code: (props) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props} />,
              pre: (props) => <pre className="bg-muted p-4 rounded-md overflow-x-auto my-4" {...props} />
            }} 
          />
        </div>
        
        <footer className="mt-12 pt-6 border-t not-prose">
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Link href={`/blog?tag=${tag}`} key={tag}>
                <Badge 
                  variant="secondary" 
                  className="hover:bg-primary hover:text-white transition-colors"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
          
          {/* Blog Interactions */}
          <div className="mt-8">
            <BlogInteractions slug={params.slug} />
          </div>
        </footer>
      </article>
    </BlogLayout>
  )
} 