import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

interface ContributionDay {
  date: string
  contributionCount: number
  color: string
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface ContributionCalendar {
  totalContributions: number
  weeks: ContributionWeek[]
}

interface RepositoryContributions {
  name: string
  contributions: {
    totalCount: number
  }
}

interface UserContributions {
  contributionsCollection: {
    totalCommitContributions: number
    totalPullRequestContributions: number
    totalIssueContributions: number
    totalRepositoryContributions: number
    contributionCalendar: ContributionCalendar
    commitContributionsByRepository: RepositoryContributions[]
  }
}

const CONTRIBUTION_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalRepositoryContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
        commitContributionsByRepository(maxRepositories: 10) {
          repository {
            name
          }
          contributions {
            totalCount
          }
        }
      }
    }
  }
`

export async function getContributionStats(username: string, from: Date, to: Date): Promise<UserContributions> {
  try {
    const response = await octokit.graphql<{ user: UserContributions }>(CONTRIBUTION_QUERY, {
      username,
      from: from.toISOString(),
      to: to.toISOString()
    })

    return response.user
  } catch (error) {
    console.error('Error fetching contribution stats:', error)
    throw new Error('Failed to fetch contribution statistics')
  }
}

export async function getRepositoryContributions(username: string, repoName: string): Promise<number> {
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

export async function getContributionStreak(username: string): Promise<number> {
  try {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const stats = await getContributionStats(username, thirtyDaysAgo, today)
    const calendar = stats.contributionsCollection.contributionCalendar

    let currentStreak = 0
    let maxStreak = 0
    let lastDate = new Date()

    // Process weeks in reverse order to get most recent contributions first
    for (const week of [...calendar.weeks].reverse()) {
      for (const day of [...week.contributionDays].reverse()) {
        const date = new Date(day.date)
        if (day.contributionCount > 0) {
          const dayDiff = Math.floor((lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
          
          if (dayDiff <= 1) {
            currentStreak++
            maxStreak = Math.max(maxStreak, currentStreak)
          } else {
            currentStreak = 1
          }
          
          lastDate = date
        }
      }
    }

    return maxStreak
  } catch (error) {
    console.error('Error calculating contribution streak:', error)
    return 0
  }
}

export async function getTopLanguages(username: string): Promise<Map<string, number>> {
  try {
    const response = await octokit.graphql(`
      query($username: String!) {
        user(login: $username) {
          repositories(first: 100, isFork: false) {
            nodes {
              languages(first: 10) {
                edges {
                  size
                  node {
                    name
                  }
                }
              }
            }
          }
        }
      }
    `, {
      username
    })

    const languageStats = new Map<string, number>()
    const repos = (response as any).user.repositories.nodes

    for (const repo of repos) {
      for (const lang of repo.languages.edges) {
        const languageName = lang.node.name
        const currentSize = languageStats.get(languageName) || 0
        languageStats.set(languageName, currentSize + lang.size)
      }
    }

    return languageStats
  } catch (error) {
    console.error('Error fetching language statistics:', error)
    return new Map()
  }
} 