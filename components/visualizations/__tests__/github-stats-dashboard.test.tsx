import { render, screen, waitFor } from '@testing-library/react'
import { GitHubStatsDashboard } from '../github-stats-dashboard'
import { getUserStats } from '@/lib/github/api'

// Mock the GitHub API
jest.mock('@/lib/github/api', () => ({
  getUserStats: jest.fn()
}))

const mockStats = {
  totalCommits: 100,
  totalIssues: 20,
  totalPRs: 30,
  totalRepos: 15,
  contributionCalendar: {
    totalContributions: 150,
    weeks: [
      {
        contributionDays: [
          { date: '2024-03-01', contributionCount: 3 },
          { date: '2024-03-02', contributionCount: 0 },
          { date: '2024-03-03', contributionCount: 5 },
          { date: '2024-03-04', contributionCount: 2 },
          { date: '2024-03-05', contributionCount: 0 },
          { date: '2024-03-06', contributionCount: 4 },
          { date: '2024-03-07', contributionCount: 1 }
        ]
      }
    ]
  }
}

describe('GitHubStatsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getUserStats as jest.Mock).mockResolvedValue(mockStats)
  })

  it('renders loading state initially', () => {
    render(<GitHubStatsDashboard />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders error state when API call fails', async () => {
    ;(getUserStats as jest.Mock).mockRejectedValue(new Error('API Error'))
    render(<GitHubStatsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load GitHub statistics')).toBeInTheDocument()
    })
  })

  it('renders stats after successful API call', async () => {
    render(<GitHubStatsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('GitHub Statistics')).toBeInTheDocument()
    })

    // Check overview tab content
    expect(screen.getByText('Commits')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('Pull Requests')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('Repositories')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('Total Contributions')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('switches between tabs', async () => {
    render(<GitHubStatsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('GitHub Statistics')).toBeInTheDocument()
    })

    // Check initial tab content
    expect(screen.getByText('Commits')).toBeInTheDocument()
    
    // Switch to Contributions tab
    screen.getByRole('tab', { name: 'Contributions' }).click()
    expect(screen.getByText('Contribution Calendar')).toBeInTheDocument()
    
    // Switch to Repositories tab
    screen.getByRole('tab', { name: 'Repositories' }).click()
    expect(screen.getByText('Repository Statistics')).toBeInTheDocument()
    expect(screen.getByText('Total Issues')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('applies custom className', async () => {
    const customClass = 'custom-class'
    render(<GitHubStatsDashboard className={customClass} />)
    
    await waitFor(() => {
      expect(screen.getByText('GitHub Statistics')).toBeInTheDocument()
    })

    const container = screen.getByRole('article')
    expect(container).toHaveClass(customClass)
  })

  it('refreshes stats periodically', async () => {
    jest.useFakeTimers()
    render(<GitHubStatsDashboard />)
    
    await waitFor(() => {
      expect(getUserStats).toHaveBeenCalledTimes(1)
    })

    // Fast-forward 5 minutes
    jest.advanceTimersByTime(5 * 60 * 1000)
    
    await waitFor(() => {
      expect(getUserStats).toHaveBeenCalledTimes(2)
    })

    jest.useRealTimers()
  })
}) 