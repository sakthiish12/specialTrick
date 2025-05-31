import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { RepoFilters } from './repo-filters'
import { GitHubRepo } from '@/lib/github/api'

const mockRepos: GitHubRepo[] = [
  {
    id: 1,
    name: 'repo1',
    description: 'First repository',
    html_url: 'https://github.com/user/repo1',
    stargazers_count: 100,
    language: 'TypeScript',
    topics: ['web', 'react'],
    updated_at: '2024-03-15T00:00:00Z',
    visibility: 'public',
    fork: false,
    archived: false,
    default_branch: 'main'
  },
  {
    id: 2,
    name: 'repo2',
    description: 'Second repository',
    html_url: 'https://github.com/user/repo2',
    stargazers_count: 50,
    language: 'JavaScript',
    topics: ['web', 'node'],
    updated_at: '2024-03-14T00:00:00Z',
    visibility: 'public',
    fork: false,
    archived: false,
    default_branch: 'main'
  },
  {
    id: 3,
    name: 'repo3',
    description: 'Third repository',
    html_url: 'https://github.com/user/repo3',
    stargazers_count: 75,
    language: 'Python',
    topics: ['data', 'ml'],
    updated_at: '2024-03-13T00:00:00Z',
    visibility: 'public',
    fork: false,
    archived: false,
    default_branch: 'main'
  }
]

describe('RepoFilters', () => {
  const mockOnFilterChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all filter controls', () => {
    render(<RepoFilters repos={mockRepos} onFilterChange={mockOnFilterChange} />)

    // Check search input
    expect(screen.getByPlaceholderText('Search repositories...')).toBeInTheDocument()

    // Check topic filters
    expect(screen.getByText('Topics')).toBeInTheDocument()
    expect(screen.getByText('web')).toBeInTheDocument()
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('node')).toBeInTheDocument()
    expect(screen.getByText('data')).toBeInTheDocument()
    expect(screen.getByText('ml')).toBeInTheDocument()

    // Check language filters
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()

    // Check sort controls
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('↑')).toBeInTheDocument()
  })

  it('filters repositories by search query', () => {
    render(<RepoFilters repos={mockRepos} onFilterChange={mockOnFilterChange} />)

    const searchInput = screen.getByPlaceholderText('Search repositories...')
    fireEvent.change(searchInput, { target: { value: 'First' } })

    expect(mockOnFilterChange).toHaveBeenCalledWith([mockRepos[0]])
  })

  it('filters repositories by topic', () => {
    render(<RepoFilters repos={mockRepos} onFilterChange={mockOnFilterChange} />)

    const webTopic = screen.getByText('web')
    fireEvent.click(webTopic)

    expect(mockOnFilterChange).toHaveBeenCalledWith([mockRepos[0], mockRepos[1]])
  })

  it('filters repositories by language', () => {
    render(<RepoFilters repos={mockRepos} onFilterChange={mockOnFilterChange} />)

    const typescriptLang = screen.getByText('TypeScript')
    fireEvent.click(typescriptLang)

    expect(mockOnFilterChange).toHaveBeenCalledWith([mockRepos[0]])
  })

  it('sorts repositories by stars', () => {
    render(<RepoFilters repos={mockRepos} onFilterChange={mockOnFilterChange} />)

    const sortSelect = screen.getByRole('combobox')
    fireEvent.change(sortSelect, { target: { value: 'stars' } })

    expect(mockOnFilterChange).toHaveBeenCalledWith([
      mockRepos[0], // 100 stars
      mockRepos[2], // 75 stars
      mockRepos[1]  // 50 stars
    ])
  })

  it('sorts repositories by name', () => {
    render(<RepoFilters repos={mockRepos} onFilterChange={mockOnFilterChange} />)

    const sortSelect = screen.getByRole('combobox')
    fireEvent.change(sortSelect, { target: { value: 'name' } })

    expect(mockOnFilterChange).toHaveBeenCalledWith([
      mockRepos[0], // repo1
      mockRepos[1], // repo2
      mockRepos[2]  // repo3
    ])
  })

  it('toggles sort direction', () => {
    render(<RepoFilters repos={mockRepos} onFilterChange={mockOnFilterChange} />)

    const sortDirectionButton = screen.getByText('↓')
    fireEvent.click(sortDirectionButton)

    expect(screen.getByText('↑')).toBeInTheDocument()
  })

  it('combines multiple filters', () => {
    render(<RepoFilters repos={mockRepos} onFilterChange={mockOnFilterChange} />)

    // Apply search filter
    const searchInput = screen.getByPlaceholderText('Search repositories...')
    fireEvent.change(searchInput, { target: { value: 'First' } })

    // Apply language filter
    const typescriptLang = screen.getByText('TypeScript')
    fireEvent.click(typescriptLang)

    expect(mockOnFilterChange).toHaveBeenCalledWith([mockRepos[0]])
  })
}) 