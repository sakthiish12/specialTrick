import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectSearch } from './project-search'
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

describe('ProjectSearch', () => {
  const mockOnSearch = jest.fn()

  beforeEach(() => {
    mockOnSearch.mockClear()
  })

  it('renders search input and filter buttons', () => {
    render(<ProjectSearch repos={mockRepos} onSearch={mockOnSearch} />)

    expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Topics')).toBeInTheDocument()
  })

  it('filters repositories by name', () => {
    render(<ProjectSearch repos={mockRepos} onSearch={mockOnSearch} />)

    const searchInput = screen.getByPlaceholderText('Search projects...')
    fireEvent.click(screen.getByText('Name'))
    fireEvent.change(searchInput, { target: { value: 'react' } })

    expect(mockOnSearch).toHaveBeenCalledWith([mockRepos[0]])
  })

  it('filters repositories by description', () => {
    render(<ProjectSearch repos={mockRepos} onSearch={mockOnSearch} />)

    const searchInput = screen.getByPlaceholderText('Search projects...')
    fireEvent.click(screen.getByText('Description'))
    fireEvent.change(searchInput, { target: { value: 'REST API' } })

    expect(mockOnSearch).toHaveBeenCalledWith([mockRepos[1]])
  })

  it('filters repositories by topics', () => {
    render(<ProjectSearch repos={mockRepos} onSearch={mockOnSearch} />)

    const searchInput = screen.getByPlaceholderText('Search projects...')
    fireEvent.click(screen.getByText('Topics'))
    fireEvent.change(searchInput, { target: { value: 'typescript' } })

    expect(mockOnSearch).toHaveBeenCalledWith([mockRepos[0]])
  })

  it('filters repositories across all fields', () => {
    render(<ProjectSearch repos={mockRepos} onSearch={mockOnSearch} />)

    const searchInput = screen.getByPlaceholderText('Search projects...')
    fireEvent.click(screen.getByText('All'))
    fireEvent.change(searchInput, { target: { value: 'javascript' } })

    expect(mockOnSearch).toHaveBeenCalledWith([mockRepos[1]])
  })

  it('shows result count when searching', () => {
    render(<ProjectSearch repos={mockRepos} onSearch={mockOnSearch} />)

    const searchInput = screen.getByPlaceholderText('Search projects...')
    fireEvent.change(searchInput, { target: { value: 'react' } })

    expect(screen.getByText('Found 1 project')).toBeInTheDocument()
  })

  it('returns all repositories when search is empty', () => {
    render(<ProjectSearch repos={mockRepos} onSearch={mockOnSearch} />)

    const searchInput = screen.getByPlaceholderText('Search projects...')
    fireEvent.change(searchInput, { target: { value: '' } })

    expect(mockOnSearch).toHaveBeenCalledWith(mockRepos)
  })

  it('handles case-insensitive search', () => {
    render(<ProjectSearch repos={mockRepos} onSearch={mockOnSearch} />)

    const searchInput = screen.getByPlaceholderText('Search projects...')
    fireEvent.change(searchInput, { target: { value: 'REACT' } })

    expect(mockOnSearch).toHaveBeenCalledWith([mockRepos[0]])
  })
}) 