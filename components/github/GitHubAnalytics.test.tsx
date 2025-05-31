import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { GitHubAnalytics } from './GitHubAnalytics'
import * as githubApi from '@/lib/analytics/github'
import * as githubApiClient from '@/lib/github/api'

// Mock the GitHub API modules
jest.mock('@/lib/analytics/github')
jest.mock('@/lib/github/api')

describe('GitHubAnalytics', () => {
  const mockSummaryStats = {
    totalCommits: 1000,
    totalIssues: 50,
    totalPRs: 100,
    totalRepos: 20,
    totalContributions: 1500
  }

  const mockStreakData = {
    currentStreak: 5,
    longestStreak: 10,
    lastContribution: '2024-03-20'
  }

  const mockCommitData = [
    { date: '2024-03-15', commits: 5 },
    { date: '2024-03-16', commits: 3 }
  ]

  const mockLanguageData = [
    { name: 'TypeScript', value: 50, color: '#3178c6' },
    { name: 'JavaScript', value: 30, color: '#f7df1e' }
  ]

  const mockRepos = [
    {
      id: 1,
      name: 'repo1',
      description: 'TypeScript project',
      html_url: 'https://github.com/user/repo1',
      language: 'TypeScript',
      stargazers_count: 10,
      forks_count: 5,
      updated_at: '2024-03-20T00:00:00Z',
      topics: ['typescript', 'web'],
      default_branch: 'main'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(githubApi.getSummaryStats as jest.Mock).mockResolvedValue(mockSummaryStats)
    ;(githubApi.getStreakData as jest.Mock).mockResolvedValue(mockStreakData)
    ;(githubApi.getCommitData as jest.Mock).mockResolvedValue(mockCommitData)
    ;(githubApi.getLanguageData as jest.Mock).mockResolvedValue(mockLanguageData)
    ;(githubApiClient.getRepositories as jest.Mock).mockResolvedValue(mockRepos)
  })

  it('renders loading state initially', () => {
    render(<GitHubAnalytics />)
    expect(screen.getByText('Loading GitHub analytics...')).toBeInTheDocument()
  })

  it('renders summary stats after loading', async () => {
    render(<GitHubAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('Total Commits')).toBeInTheDocument()
      expect(screen.getByText('1000')).toBeInTheDocument()
      expect(screen.getByText('Total Issues')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
      expect(screen.getByText('Total PRs')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('Total Repos')).toBeInTheDocument()
      expect(screen.getByText('20')).toBeInTheDocument()
      expect(screen.getByText('Current Streak')).toBeInTheDocument()
      expect(screen.getByText('5 days')).toBeInTheDocument()
    })
  })

  it('renders commit activity chart', async () => {
    render(<GitHubAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('Commit Activity')).toBeInTheDocument()
    })
  })

  it('renders language distribution chart', async () => {
    render(<GitHubAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('Language Distribution')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(githubApi.getSummaryStats as jest.Mock).mockRejectedValue(new Error('API Error'))

    render(<GitHubAnalytics />)

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Error fetching GitHub analytics:',
        expect.any(Error)
      )
    })

    consoleError.mockRestore()
  })
}) 