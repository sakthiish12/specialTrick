import { render, screen } from '@testing-library/react'
import { SearchResults } from '../search-results'
import type { BlogPost } from '@/lib/blog/types'
import { serialize } from 'next-mdx-remote/serialize'

const createMockPost = async (index: number): Promise<BlogPost> => ({
  slug: `test-post-${index}`,
  title: `Test Post ${index}`,
  description: `This is test post ${index}`,
  date: `2024-03-${20 + index}`,
  tags: ['test', index === 1 ? 'blog' : 'example'],
  readingTime: index === 1 ? 5 : 3,
  content: await serialize(`# Test Post ${index}\n\nThis is test post ${index} content.`)
})

describe('SearchResults', () => {
  let mockPosts: BlogPost[]

  beforeAll(async () => {
    mockPosts = [
      await createMockPost(1),
      await createMockPost(2)
    ]
  })

  it('renders search results', () => {
    render(<SearchResults posts={mockPosts} query="test" />)
    expect(screen.getByText('Search Results')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('displays all matching posts', () => {
    render(<SearchResults posts={mockPosts} query="test" />)
    mockPosts.forEach(post => {
      expect(screen.getByText(post.title)).toBeInTheDocument()
      expect(screen.getByText(post.description)).toBeInTheDocument()
    })
  })

  it('shows no results message when no posts match', () => {
    render(<SearchResults posts={[]} query="nonexistent" />)
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('renders post metadata correctly', () => {
    render(<SearchResults posts={[mockPosts[0]]} query="test" />)
    const post = mockPosts[0]
    
    expect(screen.getByText(post.date)).toBeInTheDocument()
    expect(screen.getByText(`${post.readingTime} min read`)).toBeInTheDocument()
  })

  it('renders post tags', () => {
    render(<SearchResults posts={[mockPosts[0]]} query="test" />)
    mockPosts[0].tags.forEach((tag: string) => {
      expect(screen.getByText(tag)).toBeInTheDocument()
    })
  })

  it('creates correct links to post pages', () => {
    render(<SearchResults posts={[mockPosts[0]]} query="test" />)
    const link = screen.getByRole('link', { name: mockPosts[0].title })
    expect(link).toHaveAttribute('href', `/blog/${mockPosts[0].slug}`)
  })

  it('highlights search query in results', () => {
    render(<SearchResults posts={[mockPosts[0]]} query="test" />)
    const highlightedElements = screen.getAllByText(/test/i)
    highlightedElements.forEach(element => {
      expect(element).toHaveClass('bg-yellow-200')
    })
  })

  it('handles empty query gracefully', () => {
    render(<SearchResults posts={mockPosts} query="" />)
    expect(screen.getByText('Search Results')).toBeInTheDocument()
    expect(screen.queryByText('No results found')).not.toBeInTheDocument()
  })
}) 