import { render, screen, fireEvent } from '@testing-library/react'
import ProjectsPage from './page'
import { getRepositories } from '@/lib/github/api'

// Mock the GitHub API client
jest.mock('@/lib/github/api', () => ({
  getRepositories: jest.fn()
}))

// Mock the ProjectsGrid component
jest.mock('@/components/projects/projects-grid', () => ({
  ProjectsGrid: ({ repos }: any) => (
    <div data-testid="projects-grid">
      {repos.map((repo: any) => (
        <div key={repo.id}>{repo.name}</div>
      ))}
    </div>
  )
}))

// Mock the LoadingState component
jest.mock('@/components/ui/loading-state', () => ({
  LoadingState: ({ message }: any) => <div data-testid="loading-state">{message}</div>
}))

// Mock the ErrorBoundary component
jest.mock('@/components/ui/error-boundary', () => ({
  ErrorBoundary: ({ children }: any) => <div data-testid="error-boundary">{children}</div>
}))

const mockRepos = [
  {
    id: 1,
    name: 'test-repo-1',
    description: 'Test repository 1',
    html_url: 'https://github.com/test/test-repo-1',
    stargazers_count: 100,
    language: 'TypeScript',
    topics: ['test', 'typescript'],
    updated_at: '2024-03-15T00:00:00Z',
    visibility: 'public',
    fork: false,
    archived: false,
    default_branch: 'main',
    forks_count: 25
  },
  {
    id: 2,
    name: 'test-repo-2',
    description: 'Test repository 2',
    html_url: 'https://github.com/test/test-repo-2',
    stargazers_count: 50,
    language: 'JavaScript',
    topics: ['test', 'javascript'],
    updated_at: '2024-03-14T00:00:00Z',
    visibility: 'public',
    fork: false,
    archived: false,
    default_branch: 'main',
    forks_count: 10
  }
]

describe('ProjectsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders projects page with repository list', async () => {
    ;(getRepositories as jest.Mock).mockResolvedValue(mockRepos)

    const { container } = render(await ProjectsPage())

    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Explore my open source projects and contributions.')).toBeInTheDocument()
    expect(screen.getByTestId('projects-grid')).toBeInTheDocument()
    expect(screen.getByText('test-repo-1')).toBeInTheDocument()
    expect(screen.getByText('test-repo-2')).toBeInTheDocument()
  })

  it('handles empty repository list', async () => {
    ;(getRepositories as jest.Mock).mockResolvedValue([])

    const { container } = render(await ProjectsPage())

    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByTestId('projects-grid')).toBeInTheDocument()
  })

  it('handles API error', async () => {
    const errorMessage = 'Failed to fetch repositories'
    ;(getRepositories as jest.Mock).mockRejectedValue(new Error(errorMessage))

    const { container } = render(await ProjectsPage())

    expect(screen.getByText('Failed to load projects')).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
  })

  it('handles unexpected error', async () => {
    ;(getRepositories as jest.Mock).mockRejectedValue('Unexpected error')

    const { container } = render(await ProjectsPage())

    expect(screen.getByText('Failed to load projects')).toBeInTheDocument()
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
  })

  it('generates correct metadata', async () => {
    const metadata = await ProjectsPage.generateMetadata()

    expect(metadata).toEqual({
      title: 'Projects | Portfolio',
      description: 'Explore my open source projects and contributions.',
      openGraph: {
        title: 'Projects | Portfolio',
        description: 'Explore my open source projects and contributions.',
        type: 'website'
      }
    })
  })
}) 