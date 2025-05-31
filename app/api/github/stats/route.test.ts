import { NextRequest } from 'next/server'
import { GET } from './route'
import { kv } from '@vercel/kv'
import {
  getContributionStats,
  getRepositoryContributions,
  getContributionStreak,
  getTopLanguages
} from '@/lib/github/graphql'

// Mock dependencies
jest.mock('@vercel/kv')
jest.mock('@/lib/github/graphql')

describe('GitHub Stats API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createRequest = (params: Record<string, string>) => {
    const url = new URL('http://localhost/api/github/stats')
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
    return new NextRequest(url)
  }

  describe('GET /api/github/stats', () => {
    it('should return 400 if username is missing', async () => {
      const req = createRequest({ type: 'contributions' })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        success: false,
        error: 'Username is required'
      })
    })

    it('should return 400 if type is missing', async () => {
      const req = createRequest({ username: 'testuser' })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        success: false,
        error: 'Type is required'
      })
    })

    it('should return cached data if available', async () => {
      const mockData = { total: 100 }
      ;(kv.get as jest.Mock).mockResolvedValueOnce(mockData)

      const req = createRequest({
        username: 'testuser',
        type: 'contributions'
      })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        data: mockData,
        cached: true
      })
      expect(kv.get).toHaveBeenCalledWith('github:stats:testuser:contributions')
    })

    it('should fetch and cache contribution stats', async () => {
      const mockData = {
        contributionsCollection: {
          totalCommitContributions: 100
        }
      }
      ;(kv.get as jest.Mock).mockResolvedValueOnce(null)
      ;(getContributionStats as jest.Mock).mockResolvedValueOnce(mockData)
      ;(kv.set as jest.Mock).mockResolvedValueOnce(undefined)

      const req = createRequest({
        username: 'testuser',
        type: 'contributions'
      })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        data: mockData,
        cached: false
      })
      expect(kv.set).toHaveBeenCalledWith(
        'github:stats:testuser:contributions',
        mockData,
        { ex: 3600 }
      )
    })

    it('should fetch and cache streak data', async () => {
      const mockData = 5
      ;(kv.get as jest.Mock).mockResolvedValueOnce(null)
      ;(getContributionStreak as jest.Mock).mockResolvedValueOnce(mockData)
      ;(kv.set as jest.Mock).mockResolvedValueOnce(undefined)

      const req = createRequest({
        username: 'testuser',
        type: 'streak'
      })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        data: mockData,
        cached: false
      })
    })

    it('should fetch and cache language stats', async () => {
      const mockLanguages = new Map([
        ['TypeScript', 1000],
        ['JavaScript', 500]
      ])
      ;(kv.get as jest.Mock).mockResolvedValueOnce(null)
      ;(getTopLanguages as jest.Mock).mockResolvedValueOnce(mockLanguages)
      ;(kv.set as jest.Mock).mockResolvedValueOnce(undefined)

      const req = createRequest({
        username: 'testuser',
        type: 'languages'
      })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        data: {
          TypeScript: 1000,
          JavaScript: 500
        },
        cached: false
      })
    })

    it('should fetch and cache repository contributions', async () => {
      const mockData = 50
      ;(kv.get as jest.Mock).mockResolvedValueOnce(null)
      ;(getRepositoryContributions as jest.Mock).mockResolvedValueOnce(mockData)
      ;(kv.set as jest.Mock).mockResolvedValueOnce(undefined)

      const req = createRequest({
        username: 'testuser',
        type: 'repo',
        repo: 'test-repo'
      })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        data: mockData,
        cached: false
      })
    })

    it('should return 400 for invalid type', async () => {
      const req = createRequest({
        username: 'testuser',
        type: 'invalid'
      })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        success: false,
        error: 'Invalid type parameter'
      })
    })

    it('should handle errors gracefully', async () => {
      ;(kv.get as jest.Mock).mockResolvedValueOnce(null)
      ;(getContributionStats as jest.Mock).mockRejectedValueOnce(
        new Error('API Error')
      )

      const req = createRequest({
        username: 'testuser',
        type: 'contributions'
      })
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        success: false,
        error: 'API Error'
      })
    })
  })
}) 