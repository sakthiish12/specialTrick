import { Octokit } from '@octokit/rest'
import { Redis } from '@upstash/redis'
import {
  getRepositories,
  getRepositoryDetails,
  getRepoStats,
  getRepoReadme,
  getRepoContributions,
  checkRateLimit,
  waitForRateLimit
} from './api'

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        listForUser: jest.fn(),
        get: jest.fn(),
        getReadme: jest.fn(),
        getContributors: jest.fn()
      }
    }
  }))
}))

// Mock Redis
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn()
  }))
}))

describe('GitHub API Utilities', () => {
  let octokit: jest.Mocked<Octokit>
  let redis: jest.Mocked<Redis>

  beforeEach(() => {
    jest.clearAllMocks()
    octokit = new Octokit() as jest.Mocked<Octokit>
    redis = new Redis() as jest.Mocked<Redis>
  })

  describe('getRepositories', () => {
    const mockRepos = [
      {
        id: 1,
        name: 'test-repo',
        description: 'Test repository',
        html_url: 'https://github.com/test/test-repo',
        stargazers_count: 100,
        language: 'TypeScript',
        topics: ['test', 'typescript'],
        updated_at: '2024-03-15T00:00:00Z',
        visibility: 'public',
        fork: false,
        archived: false,
        default_branch: 'main',
        forks_count: 25
      }
    ]

    it('fetches repositories successfully', async () => {
      ;(octokit.rest.repos.listForUser as jest.Mock).mockResolvedValue({
        data: mockRepos
      })

      const result = await getRepositories('test-user')
      expect(result).toEqual(mockRepos)
      expect(octokit.rest.repos.listForUser).toHaveBeenCalledWith({
        username: 'test-user',
        sort: 'updated',
        direction: 'desc',
        per_page: 100
      })
    })

    it('handles rate limiting', async () => {
      ;(octokit.rest.repos.listForUser as jest.Mock)
        .mockRejectedValueOnce({ status: 403, message: 'Rate limit exceeded' })
        .mockResolvedValueOnce({ data: mockRepos })

      const result = await getRepositories('test-user')
      expect(result).toEqual(mockRepos)
      expect(octokit.rest.repos.listForUser).toHaveBeenCalledTimes(2)
    })

    it('handles API errors', async () => {
      ;(octokit.rest.repos.listForUser as jest.Mock).mockRejectedValue(
        new Error('API error')
      )

      await expect(getRepositories('test-user')).rejects.toThrow('API error')
    })
  })

  describe('getRepositoryDetails', () => {
    const mockRepo = {
      id: 1,
      name: 'test-repo',
      description: 'Test repository',
      html_url: 'https://github.com/test/test-repo',
      stargazers_count: 100,
      language: 'TypeScript',
      topics: ['test', 'typescript'],
      updated_at: '2024-03-15T00:00:00Z',
      visibility: 'public',
      fork: false,
      archived: false,
      default_branch: 'main',
      forks_count: 25
    }

    it('fetches repository details successfully', async () => {
      ;(octokit.rest.repos.get as jest.Mock).mockResolvedValue({
        data: mockRepo
      })

      const result = await getRepositoryDetails('test-user', 'test-repo')
      expect(result).toEqual(mockRepo)
      expect(octokit.rest.repos.get).toHaveBeenCalledWith({
        owner: 'test-user',
        repo: 'test-repo'
      })
    })

    it('handles repository not found', async () => {
      ;(octokit.rest.repos.get as jest.Mock).mockRejectedValue({
        status: 404,
        message: 'Not Found'
      })

      await expect(
        getRepositoryDetails('test-user', 'non-existent-repo')
      ).rejects.toThrow('Not Found')
    })
  })

  describe('getRepoStats', () => {
    const mockRepos = [
      {
        id: 1,
        name: 'repo1',
        language: 'TypeScript',
        stargazers_count: 100,
        topics: ['test', 'typescript']
      },
      {
        id: 2,
        name: 'repo2',
        language: 'JavaScript',
        stargazers_count: 50,
        topics: ['test', 'javascript']
      }
    ]

    it('calculates repository statistics correctly', async () => {
      const stats = await getRepoStats(mockRepos)

      expect(stats).toEqual({
        totalRepos: 2,
        totalStars: 150,
        topLanguages: ['TypeScript', 'JavaScript'],
        topics: ['test', 'typescript', 'javascript']
      })
    })

    it('handles empty repository list', async () => {
      const stats = await getRepoStats([])

      expect(stats).toEqual({
        totalRepos: 0,
        totalStars: 0,
        topLanguages: [],
        topics: []
      })
    })
  })

  describe('getRepoReadme', () => {
    const mockReadme = {
      content: Buffer.from('Test README content').toString('base64'),
      encoding: 'base64'
    }

    it('fetches and decodes README content', async () => {
      ;(octokit.rest.repos.getReadme as jest.Mock).mockResolvedValue({
        data: mockReadme
      })

      const result = await getRepoReadme('test-user', 'test-repo')
      expect(result).toBe('Test README content')
      expect(octokit.rest.repos.getReadme).toHaveBeenCalledWith({
        owner: 'test-user',
        repo: 'test-repo'
      })
    })

    it('handles missing README', async () => {
      ;(octokit.rest.repos.getReadme as jest.Mock).mockRejectedValue({
        status: 404,
        message: 'Not Found'
      })

      const result = await getRepoReadme('test-user', 'test-repo')
      expect(result).toBeNull()
    })
  })

  describe('getRepoContributions', () => {
    const mockContributors = [
      {
        login: 'test-user',
        contributions: 50
      }
    ]

    it('fetches user contributions', async () => {
      ;(octokit.rest.repos.getContributors as jest.Mock).mockResolvedValue({
        data: mockContributors
      })

      const result = await getRepoContributions('test-user', 'test-repo')
      expect(result).toBe(50)
      expect(octokit.rest.repos.getContributors).toHaveBeenCalledWith({
        owner: 'test-user',
        repo: 'test-repo'
      })
    })

    it('handles user with no contributions', async () => {
      ;(octokit.rest.repos.getContributors as jest.Mock).mockResolvedValue({
        data: []
      })

      const result = await getRepoContributions('test-user', 'test-repo')
      expect(result).toBe(0)
    })
  })

  describe('Rate Limiting', () => {
    describe('checkRateLimit', () => {
      it('returns true when under rate limit', async () => {
        ;(redis.get as jest.Mock).mockResolvedValue('10')
        const result = await checkRateLimit()
        expect(result).toBe(true)
      })

      it('returns false when over rate limit', async () => {
        ;(redis.get as jest.Mock).mockResolvedValue('60')
        const result = await checkRateLimit()
        expect(result).toBe(false)
      })
    })

    describe('waitForRateLimit', () => {
      beforeEach(() => {
        jest.useFakeTimers()
      })

      afterEach(() => {
        jest.useRealTimers()
      })

      it('waits for rate limit reset', async () => {
        ;(redis.get as jest.Mock)
          .mockResolvedValueOnce('60')
          .mockResolvedValueOnce('10')

        const waitPromise = waitForRateLimit()
        jest.advanceTimersByTime(60000)
        await waitPromise

        expect(redis.get).toHaveBeenCalledTimes(2)
      })
    })
  })
})

