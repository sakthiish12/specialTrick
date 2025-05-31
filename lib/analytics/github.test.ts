import {
  getContributionData,
  getLanguageData,
  getCommitData,
  getSummaryStats,
  getStreakData,
  type ContributionData,
  type LanguageData,
  type CommitData
} from './github'
import { getUserStats } from '../github/api'
import type { Repository } from '../github/api'

// Mock GitHub API
jest.mock('../github/api')

describe('GitHub Analytics', () => {
  const mockStats = {
    totalCommits: 1000,
    totalIssues: 50,
    totalPRs: 100,
    totalRepos: 20,
    contributionCalendar: {
      totalContributions: 1500,
      weeks: [
        {
          contributionDays: [
            { date: '2024-03-15', contributionCount: 5 },
            { date: '2024-03-16', contributionCount: 3 },
            { date: '2024-03-17', contributionCount: 0 }
          ]
        },
        {
          contributionDays: [
            { date: '2024-03-18', contributionCount: 2 },
            { date: '2024-03-19', contributionCount: 4 },
            { date: '2024-03-20', contributionCount: 1 }
          ]
        }
      ]
    }
  }

  const mockRepos: Repository[] = [
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
    },
    {
      id: 2,
      name: 'repo2',
      description: 'JavaScript project',
      html_url: 'https://github.com/user/repo2',
      language: 'JavaScript',
      stargazers_count: 5,
      forks_count: 2,
      updated_at: '2024-03-19T00:00:00Z',
      topics: ['javascript', 'web'],
      default_branch: 'main'
    },
    {
      id: 3,
      name: 'repo3',
      description: 'TypeScript project',
      html_url: 'https://github.com/user/repo3',
      language: 'TypeScript',
      stargazers_count: 15,
      forks_count: 8,
      updated_at: '2024-03-18T00:00:00Z',
      topics: ['typescript', 'api'],
      default_branch: 'main'
    },
    {
      id: 4,
      name: 'repo4',
      description: 'Python project',
      html_url: 'https://github.com/user/repo4',
      language: 'Python',
      stargazers_count: 20,
      forks_count: 10,
      updated_at: '2024-03-17T00:00:00Z',
      topics: ['python', 'data'],
      default_branch: 'main'
    },
    {
      id: 5,
      name: 'repo5',
      description: 'No language project',
      html_url: 'https://github.com/user/repo5',
      language: null,
      stargazers_count: 0,
      forks_count: 0,
      updated_at: '2024-03-16T00:00:00Z',
      topics: [],
      default_branch: 'main'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getUserStats as jest.Mock).mockResolvedValue(mockStats)
  })

  describe('getContributionData', () => {
    it('should process contribution calendar data', async () => {
      const data = await getContributionData()
      expect(data).toHaveLength(6)
      expect(data[0]).toEqual({
        date: '2024-03-15',
        count: 5
      })
    })
  })

  describe('getLanguageData', () => {
    it('should process repository language data', async () => {
      const data = await getLanguageData(mockRepos)
      expect(data).toHaveLength(3)
      expect(data[0]).toEqual({
        name: 'TypeScript',
        value: 50,
        color: '#3178c6'
      })
    })

    it('should handle repositories with no language', async () => {
      const data = await getLanguageData(mockRepos)
      expect(data).toHaveLength(3)
      expect(data.find(d => d.name === 'null')).toBeUndefined()
    })
  })

  describe('getCommitData', () => {
    it('should process commit data', async () => {
      const data = await getCommitData()
      expect(data).toHaveLength(6)
      expect(data[0]).toEqual({
        date: '2024-03-15',
        commits: 5
      })
    })
  })

  describe('getSummaryStats', () => {
    it('should return summary statistics', async () => {
      const stats = await getSummaryStats()
      expect(stats).toEqual({
        totalCommits: 1000,
        totalIssues: 50,
        totalPRs: 100,
        totalRepos: 20,
        totalContributions: 1500
      })
    })
  })

  describe('getStreakData', () => {
    it('should calculate streak data', async () => {
      const streak = await getStreakData()
      expect(streak).toEqual({
        currentStreak: 1,
        longestStreak: 2,
        lastContribution: '2024-03-20'
      })
    })

    it('should handle no contributions', async () => {
      ;(getUserStats as jest.Mock).mockResolvedValueOnce({
        ...mockStats,
        contributionCalendar: {
          totalContributions: 0,
          weeks: [
            {
              contributionDays: [
                { date: '2024-03-15', contributionCount: 0 },
                { date: '2024-03-16', contributionCount: 0 }
              ]
            }
          ]
        }
      })

      const streak = await getStreakData()
      expect(streak).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        lastContribution: ''
      })
    })
  })
}) 