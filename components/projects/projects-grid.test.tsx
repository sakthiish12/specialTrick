import '@testing-library/jest-dom'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { ProjectsGrid } from './projects-grid'
import { GitHubRepo } from '@/lib/github/api'

const mockRepos: GitHubRepo[] = [
  {
    id: 1,
    name: 'react-app',
    description: 'A React application with TypeScript',
    html_url: 'https://github.com/test/react-app',
    stargazers_count: 100,
    language: 'TypeScript',
    topics: ['react', 'typescript', 'web'],
    updated_at: '2024-03-15T00:00:00Z',
    visibility: 'public',
    fork: false,
    archived: false,
    default_branch: 'main',
    forks_count: 25
  },
  {
    id: 2,
    name: 'node-api',
    description: 'REST API built with Node.js',
    html_url: 'https://github.com/test/node-api',
    stargazers_count: 50,
    language: 'JavaScript',
    topics: ['node', 'api', 'javascript'],
    updated_at: '2024-03-14T00:00:00Z',
    visibility: 'public',
    fork: false,
    archived: false,
    default_branch: 'main',
    forks_count: 10
  }
]

// Mock the child components
jest.mock('./project-search', () => ({
  ProjectSearch: ({ repos, onSearch }: any) => (
    <div data-testid="project-search">
      <button onClick={() => onSearch([repos[0]])}>Search</button>
    </div>
  )
}))

jest.mock('./project-filters', () => ({
  ProjectFilters: ({ repos, onFilter }: any) => (
    <div data-testid="project-filters">
      <button onClick={() => onFilter([repos[1]])}>Filter</button>
    </div>
  )
}))

jest.mock('./project-card', () => ({
  ProjectCard: ({ repo }: any) => (
    <div data-testid="project-card">
      <h3>{repo.name}</h3>
    </div>
  )
}))

describe('ProjectsGrid', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows loading state initially', () => {
    render(<ProjectsGrid repos={mockRepos} />)
    expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(6)
  })

  it('renders projects after loading', async () => {
    render(<ProjectsGrid repos={mockRepos} />)

    // Fast-forward timers to skip loading state
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(screen.getByText('Showing 2 of 2 projects')).toBeInTheDocument()
    expect(screen.getAllByTestId('project-card')).toHaveLength(2)
  })

  it('updates when search is performed', async () => {
    render(<ProjectsGrid repos={mockRepos} />)

    // Fast-forward timers to skip loading state
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Trigger search
    fireEvent.click(screen.getByText('Search'))

    expect(screen.getByText('Showing 1 of 2 projects')).toBeInTheDocument()
    expect(screen.getAllByTestId('project-card')).toHaveLength(1)
  })

  it('updates when filters are applied', async () => {
    render(<ProjectsGrid repos={mockRepos} />)

    // Fast-forward timers to skip loading state
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Trigger filter
    fireEvent.click(screen.getByText('Filter'))

    expect(screen.getByText('Showing 1 of 2 projects')).toBeInTheDocument()
    expect(screen.getAllByTestId('project-card')).toHaveLength(1)
  })

  it('shows empty state when no projects match', async () => {
    render(<ProjectsGrid repos={[]} />)

    // Fast-forward timers to skip loading state
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(screen.getByText('No projects found')).toBeInTheDocument()
    expect(screen.getByText(/Try adjusting your search/)).toBeInTheDocument()
  })

  it('maintains grid layout across different screen sizes', async () => {
    render(<ProjectsGrid repos={mockRepos} />)

    // Fast-forward timers to skip loading state
    act(() => {
      jest.advanceTimersByTime(500)
    })

    const grid = screen.getByRole('grid')
    expect(grid).toHaveClass('grid-cols-1 md:grid-cols-2 lg:grid-cols-3')
  })
}) 