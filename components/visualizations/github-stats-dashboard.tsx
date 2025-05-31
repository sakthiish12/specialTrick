import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, GitCommit, GitPullRequest, GitBranch, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getUserStats } from '@/lib/github/api'

interface GitHubStats {
  totalCommits: number
  totalIssues: number
  totalPRs: number
  totalRepos: number
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

interface GitHubStatsDashboardProps {
  className?: string
}

export function GitHubStatsDashboard({ className }: GitHubStatsDashboardProps) {
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getUserStats()
        setStats(data as GitHubStats)
        setError(null)
      } catch (err) {
        setError('Failed to load GitHub statistics')
        console.error('Error fetching GitHub stats:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center h-48 text-destructive">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>GitHub Statistics</CardTitle>
        <CardDescription>Real-time contribution statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
            <TabsTrigger value="repositories">Repositories</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <GitCommit className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Commits</p>
                      <p className="text-2xl font-bold">{stats.totalCommits}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Pull Requests</p>
                      <p className="text-2xl font-bold">{stats.totalPRs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Repositories</p>
                      <p className="text-2xl font-bold">{stats.totalRepos}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Total Contributions</p>
                      <p className="text-2xl font-bold">{stats.contributionCalendar.totalContributions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contributions" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Contribution Calendar</h4>
              <div className="grid grid-cols-7 gap-1">
                {stats.contributionCalendar.weeks.slice(-7).map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.contributionDays.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={cn(
                          'w-3 h-3 rounded-sm',
                          day.contributionCount === 0 && 'bg-muted',
                          day.contributionCount > 0 && day.contributionCount <= 3 && 'bg-green-400',
                          day.contributionCount > 3 && day.contributionCount <= 6 && 'bg-green-500',
                          day.contributionCount > 6 && 'bg-green-600'
                        )}
                        title={`${day.date}: ${day.contributionCount} contributions`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="repositories" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Repository Statistics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium">Total Issues</p>
                    <p className="text-2xl font-bold">{stats.totalIssues}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium">Total Pull Requests</p>
                    <p className="text-2xl font-bold">{stats.totalPRs}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 