import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { ProjectCard } from './project-card'
import { GitHubRepo } from '@/lib/github/api'

const mockRepo: GitHubRepo = {
  id: 1,
  name: 'test-repo',
  description: 'A test repository with a long description that should be truncated',
  html_url: 'https://github.com/testuser/test-repo',
  stargazers_count: 100,
  language: 'TypeScript',
  topics: ['web', 'react', 'typescript'],
  updated_at: '2024-03-15T00:00:00Z',
  visibility: 'public',
  fork: false,
  archived: false,
  default_branch: 'main',
  forks_count: 25
}

describe('ProjectCard', () => {
  it('renders repository information correctly', () => {
    render(<ProjectCard repo={mockRepo} />)

    // Check repository name and link
    const repoLink = screen.getByText('test-repo')
    expect(repoLink).toBeInTheDocument()
    expect(repoLink.closest('a')).toHaveAttribute('href', mockRepo.html_url)

    // Check description
    expect(screen.getByText(/A test repository/)).toBeInTheDocument()

    // Check language
    expect(screen.getByText('TypeScript')).toBeInTheDocument()

    // Check stats
    expect(screen.getByText('100')).toBeInTheDocument() // stars
    expect(screen.getByText('25')).toBeInTheDocument() // forks

    // Check topics
    expect(screen.getByText('web')).toBeInTheDocument()
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('typescript')).toBeInTheDocument()

    // Check "View Details" link
    const detailsLink = screen.getByText('View Details')
    expect(detailsLink).toBeInTheDocument()
    expect(detailsLink.closest('a')).toHaveAttribute('href', '/projects/test-repo')
  })

  it('renders README excerpt when provided', () => {
    const readmeExcerpt = 'This is a sample README excerpt that should be displayed in the card.'
    render(<ProjectCard repo={mockRepo} readmeExcerpt={readmeExcerpt} />)

    expect(screen.getByText('README Excerpt')).toBeInTheDocument()
    expect(screen.getByText(readmeExcerpt)).toBeInTheDocument()
  })

  it('handles missing description gracefully', () => {
    const repoWithoutDescription = { ...mockRepo, description: null }
    render(<ProjectCard repo={repoWithoutDescription} />)

    const descriptionElement = screen.queryByText(/A test repository/)
    expect(descriptionElement).not.toBeInTheDocument()
  })

  it('handles missing language gracefully', () => {
    const repoWithoutLanguage = { ...mockRepo, language: null }
    render(<ProjectCard repo={repoWithoutLanguage} />)

    const languageElement = screen.queryByText('TypeScript')
    expect(languageElement).not.toBeInTheDocument()
  })

  it('handles missing topics gracefully', () => {
    const repoWithoutTopics = { ...mockRepo, topics: [] }
    render(<ProjectCard repo={repoWithoutTopics} />)

    const topicElements = screen.queryAllByText(/web|react|typescript/)
    expect(topicElements).toHaveLength(0)
  })

  it('formats date correctly', () => {
    const today = new Date().toISOString()
    const repoWithTodayDate = { ...mockRepo, updated_at: today }
    render(<ProjectCard repo={repoWithTodayDate} />)

    expect(screen.getByText('Today')).toBeInTheDocument()
  })
}) 