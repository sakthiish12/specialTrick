import { Octokit } from '@octokit/rest'
import { Redis } from '@upstash/redis'
import { kv } from '@vercel/kv'
import type { RestEndpointMethodTypes } from '@octokit/rest'

// Initialize Redis client for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

// Initialize Octokit client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  timeZone: 'UTC'
})

const CACHE_TTL = 600 // 10 minutes in seconds
const USERNAME = 'sakthiish12'

// Rate limiting configuration
const RATE_LIMIT_KEY = 'github:rate_limit'
const RATE_LIMIT_WINDOW = 60 // 1 minute in seconds
const MAX_REQUESTS_PER_WINDOW = 30 // GitHub's rate limit is 60 per hour for unauthenticated requests

export interface Repository {
  id: number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  topics: string[]
  updated_at: string
  default_branch: string
}

export interface RepositoryDetails extends Repository {
  readme: string
  languages: Record<string, number>
  contributors: Array<{
    login: string
    contributions: number
  }>
}

export interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  topics: string[]
  updated_at: string
  visibility: string
  fork: boolean
  archived: boolean
  default_branch: string
  forks_count: number
}

export interface RepoStats {
  totalRepos: number
  totalStars: number
  topLanguages: string[]
  topics: string[]
}

type GitHubContributor = RestEndpointMethodTypes['repos']['listContributors']['response']['data'][0]

interface GraphQLResponse {
  user: {
    contributionsCollection: {
      totalCommitContributions: number
    }
  }
}

export interface GitHubProject {
  name: string
  description: string
  html_url: string
  homepage: string
  language: string
  topics: string[]
  stargazers_count: number
  updated_at: string
}

class GitHubAPI {
  private async checkRateLimit(): Promise<boolean> {
    const currentRequests = await redis.incr(RATE_LIMIT_KEY)
    if (currentRequests === 1) {
      await redis.expire(RATE_LIMIT_KEY, RATE_LIMIT_WINDOW)
    }
    return currentRequests <= MAX_REQUESTS_PER_WINDOW
  }

  private async waitForRateLimit(): Promise<void> {
    const ttl = await redis.ttl(RATE_LIMIT_KEY)
    if (ttl > 0) {
      await new Promise(resolve => setTimeout(resolve, ttl * 1000))
    }
  }

  private mapToGitHubRepo(repo: any): GitHubRepo {
    return {
      id: repo.id,
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
      stargazers_count: repo.stargazers_count || 0,
      language: repo.language,
      topics: repo.topics || [],
      updated_at: repo.updated_at,
      visibility: repo.visibility,
      fork: repo.fork,
      archived: repo.archived,
      default_branch: repo.default_branch,
      forks_count: repo.forks_count || 0
    }
  }

  async getUserRepos(username: string): Promise<GitHubRepo[]> {
    await this.waitForRateLimit()
    const { data } = await octokit.repos.listForUser({
      username,
      sort: 'updated',
      direction: 'desc',
      per_page: 100
    })
    return data.map((repo: any): GitHubRepo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
      stargazers_count: repo.stargazers_count || 0,
      language: repo.language,
      topics: repo.topics || [],
      updated_at: repo.updated_at,
      visibility: repo.visibility,
      fork: repo.fork,
      archived: repo.archived,
      default_branch: repo.default_branch,
      forks_count: repo.forks_count || 0
    }))
  }

  async getRepoDetails(username: string, repoName: string): Promise<GitHubRepo> {
    await this.waitForRateLimit()
    const { data } = await octokit.repos.get({
      owner: username,
      repo: repoName
    })
    return this.mapToGitHubRepo(data)
  }

  async getRepoStats(username: string): Promise<RepoStats> {
    await this.waitForRateLimit()
    const repos = await this.getUserRepos(username)
    const stats: RepoStats = {
      totalRepos: repos.length,
      totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      topLanguages: Array.from(new Set(repos.map(repo => repo.language).filter(Boolean) as string[])),
      topics: Array.from(new Set(repos.flatMap(repo => repo.topics)))
    }

    return stats
  }

  async getRepoReadme(username: string, repoName: string): Promise<string | null> {
    await this.waitForRateLimit()
    try {
      const { data } = await octokit.repos.getReadme({
        owner: username,
        repo: repoName
      })
      return Buffer.from(data.content, 'base64').toString()
    } catch (error) {
      console.error('Error fetching README:', error)
      return null
    }
  }

  async getRepoContributions(username: string, repoName: string): Promise<number> {
    await this.waitForRateLimit()
    try {
      const response = await octokit.repos.getContributorsStats({
        owner: username,
        repo: repoName
      })

      const userContributions = response.data.find(
        contributor => contributor.author?.login === username
      )

      return userContributions?.total || 0
    } catch (error) {
      console.error('Error fetching repository contributions:', error)
      return 0
    }
  }
}

export const githubAPI = new GitHubAPI()

/**
 * Get list of repositories with caching
 */
export async function getRepositories(username: string): Promise<GitHubRepo[]> {
  const cacheKey = `github:repos:${username}`
  
  // Try to get from cache first
  const cached = await kv.get<GitHubRepo[]>(cacheKey)
  if (cached) {
    return cached
  }

  // Fetch from GitHub API
  const { data } = await octokit.repos.listForUser({
    username,
    sort: 'updated',
    direction: 'desc',
    per_page: 100
  })

  const repos = data.map((repo: any): GitHubRepo => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    html_url: repo.html_url,
    stargazers_count: repo.stargazers_count || 0,
    language: repo.language,
    topics: repo.topics || [],
    updated_at: repo.updated_at,
    visibility: repo.visibility,
    fork: repo.fork,
    archived: repo.archived,
    default_branch: repo.default_branch,
    forks_count: repo.forks_count || 0
  }))

  // Cache the results
  await kv.set(cacheKey, repos, { ex: CACHE_TTL })
  
  return repos
}

/**
 * Get detailed repository information
 */
export async function getRepositoryDetails(username: string, repoName: string): Promise<RepositoryDetails> {
  const cacheKey = `github:repo:${username}:${repoName}`
  
  // Try to get from cache first
  const cached = await kv.get<RepositoryDetails>(cacheKey)
  if (cached) {
    return cached
  }

  // Fetch repository data
  const [repo, readme, languages, contributors] = await Promise.all([
    octokit.repos.get({ owner: username, repo: repoName }),
    octokit.repos.getReadme({ owner: username, repo: repoName })
      .then((res: { data: { content: string } }) => Buffer.from(res.data.content, 'base64').toString())
      .catch(() => ''),
    octokit.repos.listLanguages({ owner: username, repo: repoName }),
    octokit.repos.listContributors({ owner: username, repo: repoName })
  ])

  const details: RepositoryDetails = {
    id: repo.data.id,
    name: repo.data.name,
    description: repo.data.description,
    html_url: repo.data.html_url,
    stargazers_count: repo.data.stargazers_count || 0,
    forks_count: repo.data.forks_count || 0,
    language: repo.data.language,
    topics: repo.data.topics || [],
    updated_at: repo.data.updated_at,
    default_branch: repo.data.default_branch,
    readme,
    languages: languages.data,
    contributors: contributors.data.map((c: GitHubContributor) => ({
      login: c.login || '',
      contributions: c.contributions || 0
    }))
  }

  // Cache the results
  await kv.set(cacheKey, details, { ex: CACHE_TTL })
  
  return details
}

/**
 * Get user contribution statistics
 */
export async function getUserStats() {
  const cacheKey = `github:stats:${USERNAME}`
  
  // Try to get from cache first
  const cached = await kv.get(cacheKey)
  if (cached) {
    return cached
  }

  // Fetch contribution data
  const response = await octokit.graphql<{
    user: {
      contributionsCollection: {
        totalCommitContributions: number
        totalIssueContributions: number
        totalPullRequestContributions: number
        totalRepositoryContributions: number
        contributionCalendar: {
          totalContributions: number
          weeks: Array<{
            contributionDays: Array<{
              date: string
              contributionCount: number
            }>
          }>
        }
      }
    }
  }>(`
    query {
      user(login: "${USERNAME}") {
        contributionsCollection {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalRepositoryContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `)

  const stats = {
    totalCommits: response.user.contributionsCollection.totalCommitContributions,
    totalIssues: response.user.contributionsCollection.totalIssueContributions,
    totalPRs: response.user.contributionsCollection.totalPullRequestContributions,
    totalRepos: response.user.contributionsCollection.totalRepositoryContributions,
    contributionCalendar: response.user.contributionsCollection.contributionCalendar
  }

  // Cache the results
  await kv.set(cacheKey, stats, { ex: CACHE_TTL })
  
  return stats
}

/**
 * Clear cache for a specific repository
 */
export async function clearRepositoryCache(username: string, repoName: string) {
  const keys = [
    `github:repos:${username}`,
    `github:repo:${username}:${repoName}`
  ]
  await Promise.all(keys.map((key: string) => kv.del(key)))
}

/**
 * Clear all GitHub-related caches
 */
export async function clearAllCaches() {
  const keys = await kv.keys('github:*')
  await Promise.all(keys.map((key: string) => kv.del(key)))
}

export async function checkRateLimit(): Promise<boolean> {
  const count = await redis.get('github:rate_limit')
  return !count || parseInt(count as string) < 50
}

export async function waitForRateLimit(): Promise<void> {
  while (!(await checkRateLimit())) {
    await new Promise(resolve => setTimeout(resolve, 60000))
  }
}

export async function getProjectBySlug(slug: string): Promise<GitHubProject | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/sakthiish12/${slug}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      name: data.name,
      description: data.description || '',
      html_url: data.html_url,
      homepage: data.homepage || '',
      language: data.language || 'Unknown',
      topics: data.topics || [],
      stargazers_count: data.stargazers_count,
      updated_at: data.updated_at
    }
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

export async function getAllProjects(): Promise<GitHubProject[]> {
  try {
    const response = await fetch(
      'https://api.github.com/users/sakthiish12/repos?sort=updated&per_page=100',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.map((repo: any) => ({
      name: repo.name,
      description: repo.description || '',
      html_url: repo.html_url,
      homepage: repo.homepage || '',
      language: repo.language || 'Unknown',
      topics: repo.topics || [],
      stargazers_count: repo.stargazers_count,
      updated_at: repo.updated_at
    }))
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
} 