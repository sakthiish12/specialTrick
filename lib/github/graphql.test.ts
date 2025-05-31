import { Octokit } from '@octokit/rest'
import {
  getContributionStats,
  getRepositoryContributions,
  getContributionStreak,
  getTopLanguages
} from './graphql'

// Mock Octokit
jest.mock('@octokit/rest')

describe('GitHub GraphQL Client', () => {
  const mockOctokit = {
    graphql: jest.fn(),
    repos: {
      getContributorsStats: jest.fn()
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(Octokit as unknown as jest.Mock).mockImplementation(() => mockOctokit)
  })

  describe('getContributionStats', () => {
    const mockContributionData = {
      user: {
        contributionsCollection: {
          totalCommitContributions: 100,
          totalPullRequestContributions: 50,
          totalIssueContributions: 25,
          totalRepositoryContributions: 10,
          contributionCalendar: {
            totalContributions: 185,
            weeks: [
              {
                contributionDays: [
                  { date: '2024-01-01', contributionCount: 5, color: '#216e39' },
                  { date: '2024-01-02', contributionCount: 3, color: '#216e39' }
                ]
              }
            ]
          },
          commitContributionsByRepository: [
            {
              repository: { name: 'test-repo' },
              contributions: { totalCount: 50 }
            }
          ]
        }
      }
    }

    it('should fetch contribution statistics', async () => {
      mockOctokit.graphql.mockResolvedValueOnce(mockContributionData)

      const from = new Date('2024-01-01')
      const to = new Date('2024-01-02')
      const result = await getContributionStats('testuser', from, to)

      expect(result).toEqual(mockContributionData.user)
      expect(mockOctokit.graphql).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          username: 'testuser',
          from: from.toISOString(),
          to: to.toISOString()
        })
      )
    })

    it('should handle errors gracefully', async () => {
      mockOctokit.graphql.mockRejectedValueOnce(new Error('API Error'))

      await expect(
        getContributionStats('testuser', new Date(), new Date())
      ).rejects.toThrow('Failed to fetch contribution statistics')
    })
  })

  describe('getRepositoryContributions', () => {
    const mockContributorStats = {
      data: [
        {
          author: { login: 'testuser' },
          total: 100
        }
      ]
    }

    it('should fetch repository contributions', async () => {
      mockOctokit.repos.getContributorsStats.mockResolvedValueOnce(mockContributorStats)

      const result = await getRepositoryContributions('testuser', 'test-repo')

      expect(result).toBe(100)
      expect(mockOctokit.repos.getContributorsStats).toHaveBeenCalledWith({
        owner: 'testuser',
        repo: 'test-repo'
      })
    })

    it('should return 0 when user has no contributions', async () => {
      mockOctokit.repos.getContributorsStats.mockResolvedValueOnce({
        data: [
          {
            author: { login: 'otheruser' },
            total: 50
          }
        ]
      })

      const result = await getRepositoryContributions('testuser', 'test-repo')

      expect(result).toBe(0)
    })

    it('should handle errors gracefully', async () => {
      mockOctokit.repos.getContributorsStats.mockRejectedValueOnce(new Error('API Error'))

      const result = await getRepositoryContributions('testuser', 'test-repo')

      expect(result).toBe(0)
    })
  })

  describe('getContributionStreak', () => {
    const mockContributionData = {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            weeks: [
              {
                contributionDays: [
                  { date: '2024-01-01', contributionCount: 5 },
                  { date: '2024-01-02', contributionCount: 3 },
                  { date: '2024-01-03', contributionCount: 0 },
                  { date: '2024-01-04', contributionCount: 2 }
                ]
              }
            ]
          }
        }
      }
    }

    it('should calculate contribution streak', async () => {
      mockOctokit.graphql.mockResolvedValueOnce(mockContributionData)

      const result = await getContributionStreak('testuser')

      expect(result).toBe(2) // Two consecutive days with contributions
    })

    it('should handle errors gracefully', async () => {
      mockOctokit.graphql.mockRejectedValueOnce(new Error('API Error'))

      const result = await getContributionStreak('testuser')

      expect(result).toBe(0)
    })
  })

  describe('getTopLanguages', () => {
    const mockLanguageData = {
      user: {
        repositories: {
          nodes: [
            {
              languages: {
                edges: [
                  { size: 1000, node: { name: 'TypeScript' } },
                  { size: 500, node: { name: 'JavaScript' } }
                ]
              }
            },
            {
              languages: {
                edges: [
                  { size: 2000, node: { name: 'TypeScript' } },
                  { size: 1000, node: { name: 'Python' } }
                ]
              }
            }
          ]
        }
      }
    }

    it('should calculate language statistics', async () => {
      mockOctokit.graphql.mockResolvedValueOnce(mockLanguageData)

      const result = await getTopLanguages('testuser')

      expect(result.get('TypeScript')).toBe(3000)
      expect(result.get('JavaScript')).toBe(500)
      expect(result.get('Python')).toBe(1000)
    })

    it('should handle errors gracefully', async () => {
      mockOctokit.graphql.mockRejectedValueOnce(new Error('API Error'))

      const result = await getTopLanguages('testuser')

      expect(result).toBeInstanceOf(Map)
      expect(result.size).toBe(0)
    })
  })
}) 