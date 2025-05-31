import { getUserStats, type Repository } from '../github/api'

export interface ContributionDay {
  date: string
  contributionCount: number
}

export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export interface ContributionCalendar {
  totalContributions: number
  weeks: ContributionWeek[]
}

export interface GitHubStats {
  totalCommits: number
  totalIssues: number
  totalPRs: number
  totalRepos: number
  contributionCalendar: ContributionCalendar
}

export interface ContributionData {
  date: string
  count: number
}

export interface LanguageData {
  name: string
  value: number
  color: string
}

export interface CommitData {
  date: string
  commits: number
}

export interface SummaryStats {
  totalCommits: number
  totalIssues: number
  totalPRs: number
  totalRepos: number
  totalContributions: number
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastContribution: string
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Java: '#007396',
  C: '#555555',
  'C++': '#f34b7d',
  Go: '#00add8',
  Rust: '#dea584',
  Ruby: '#cc342d',
  PHP: '#777bb4',
  Swift: '#ffac45',
  Kotlin: '#f18e33',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  'C#': '#178600',
  Scala: '#dc322f',
  R: '#198ce7',
  MATLAB: '#e16737',
  Dart: '#00b4ab'
}

/**
 * Process contribution calendar data for heatmap
 */
export async function getContributionData(): Promise<ContributionData[]> {
  const stats = await getUserStats() as GitHubStats
  const data: ContributionData[] = []

  stats.contributionCalendar.weeks.forEach((week: ContributionWeek) => {
    week.contributionDays.forEach((day: ContributionDay) => {
      data.push({
        date: day.date,
        count: day.contributionCount
      })
    })
  })

  return data
}

/**
 * Process repository language data for pie chart
 */
export async function getLanguageData(repos: Repository[]): Promise<LanguageData[]> {
  const languageCounts: Record<string, number> = {}
  let totalRepos = 0

  repos.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
      totalRepos++
    }
  })

  return Object.entries(languageCounts)
    .map(([name, count]) => ({
      name,
      value: Math.round((count / totalRepos) * 100),
      color: LANGUAGE_COLORS[name] || '#808080'
    }))
    .sort((a, b) => b.value - a.value)
}

/**
 * Process commit data for time series
 */
export async function getCommitData(): Promise<CommitData[]> {
  const stats = await getUserStats() as GitHubStats
  const data: CommitData[] = []

  stats.contributionCalendar.weeks.forEach((week: ContributionWeek) => {
    week.contributionDays.forEach((day: ContributionDay) => {
      data.push({
        date: day.date,
        commits: day.contributionCount
      })
    })
  })

  return data
}

/**
 * Get summary statistics
 */
export async function getSummaryStats(): Promise<SummaryStats> {
  const stats = await getUserStats() as GitHubStats
  return {
    totalCommits: stats.totalCommits,
    totalIssues: stats.totalIssues,
    totalPRs: stats.totalPRs,
    totalRepos: stats.totalRepos,
    totalContributions: stats.contributionCalendar.totalContributions
  }
}

/**
 * Get activity streak data
 */
export async function getStreakData(): Promise<StreakData> {
  const stats = await getUserStats() as GitHubStats
  const data = await getContributionData()
  
  if (data.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastContribution: ''
    }
  }

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let lastContribution = ''

  // Sort data by date in descending order
  data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Calculate streaks
  for (let i = 0; i < data.length; i++) {
    const { date, count } = data[i]
    
    if (count > 0) {
      if (i === 0) {
        currentStreak = 1
        tempStreak = 1
      } else {
        const prevDate = new Date(data[i - 1].date)
        const currDate = new Date(date)
        const dayDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

        if (dayDiff === 1) {
          tempStreak++
          if (i === 0) {
            currentStreak = tempStreak
          }
        } else {
          tempStreak = 1
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak)
      lastContribution = date
    } else {
      tempStreak = 0
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastContribution
  }
} 