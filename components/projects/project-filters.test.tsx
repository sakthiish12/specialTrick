import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectFilters } from './project-filters'
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

describe('ProjectFilters', () => {
  const mockOnFilter = jest.fn()

  beforeEach(() => {
    mockOnFilter.mockClear()
  })

  it('renders language and topic filter buttons', () => {
    render(<ProjectFilters repos={mockRepos} onFilter={mockOnFilter} />)

    expect(screen.getByText('All Languages')).toBeInTheDocument()
    expect(screen.getByText('All Topics')).toBeInTheDocument()
  })

  it('filters repositories by language', () => {
    render(<ProjectFilters repos={mockRepos} onFilter={mockOnFilter} />)

    // Open language dropdown
    fireEvent.click(screen.getByText('All Languages'))
    
    // Select TypeScript
    fireEvent.click(screen.getByText('TypeScript'))

    expect(mockOnFilter).toHaveBeenCalledWith([mockRepos[0]])
  })

  it('filters repositories by multiple topics', () => {
    render(<ProjectFilters repos={mockRepos} onFilter={mockOnFilter} />)

    // Open topics dropdown
    fireEvent.click(screen.getByText('All Topics'))
    
    // Select 'react' and 'typescript' topics
    fireEvent.click(screen.getByText('react'))
    fireEvent.click(screen.getByText('typescript'))

    expect(mockOnFilter).toHaveBeenCalledWith([mockRepos[0]])
  })

  it('shows active filters', () => {
    render(<ProjectFilters repos={mockRepos} onFilter={mockOnFilter} />)

    // Select a language
    fireEvent.click(screen.getByText('All Languages'))
    fireEvent.click(screen.getByText('TypeScript'))

    // Select a topic
    fireEvent.click(screen.getByText('All Topics'))
    fireEvent.click(screen.getByText('react'))

    // Check if active filters are displayed
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('react')).toBeInTheDocument()
  })

  it('removes active filters when clicking remove button', () => {
    render(<ProjectFilters repos={mockRepos} onFilter={mockOnFilter} />)

    // Select a language
    fireEvent.click(screen.getByText('All Languages'))
    fireEvent.click(screen.getByText('TypeScript'))

    // Remove the language filter
    const removeButton = screen.getByText('TypeScript').nextElementSibling
    fireEvent.click(removeButton!)

    expect(mockOnFilter).toHaveBeenCalledWith(mockRepos)
  })

  it('combines language and topic filters', () => {
    render(<ProjectFilters repos={mockRepos} onFilter={mockOnFilter} />)

    // Select JavaScript language
    fireEvent.click(screen.getByText('All Languages'))
    fireEvent.click(screen.getByText('JavaScript'))

    // Select 'api' topic
    fireEvent.click(screen.getByText('All Topics'))
    fireEvent.click(screen.getByText('api'))

    expect(mockOnFilter).toHaveBeenCalledWith([mockRepos[1]])
  })

  it('shows correct count of selected topics', () => {
    render(<ProjectFilters repos={mockRepos} onFilter={mockOnFilter} />)

    // Select multiple topics
    fireEvent.click(screen.getByText('All Topics'))
    fireEvent.click(screen.getByText('react'))
    fireEvent.click(screen.getByText('typescript'))

    expect(screen.getByText('2 Topics Selected')).toBeInTheDocument()
  })
}) 