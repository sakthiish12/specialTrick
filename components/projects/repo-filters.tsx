import { useState, useMemo } from 'react'
import { GitHubRepo } from '@/lib/github/api'

interface RepoFiltersProps {
  repos: GitHubRepo[]
  onFilterChange: (filteredRepos: GitHubRepo[]) => void
}

type SortOption = 'stars' | 'updated' | 'name'
type SortDirection = 'asc' | 'desc'

export function RepoFilters({ repos, onFilterChange }: RepoFiltersProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('stars')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchQuery, setSearchQuery] = useState('')

  // Extract unique topics and languages from repos
  const { topics, languages } = useMemo(() => {
    const topicSet = new Set<string>()
    const languageSet = new Set<string>()

    repos.forEach(repo => {
      repo.topics?.forEach(topic => topicSet.add(topic))
      if (repo.language) languageSet.add(repo.language)
    })

    return {
      topics: Array.from(topicSet).sort(),
      languages: Array.from(languageSet).sort()
    }
  }, [repos])

  // Apply filters and sorting
  useMemo(() => {
    let filteredRepos = [...repos]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredRepos = filteredRepos.filter(
        repo =>
          repo.name.toLowerCase().includes(query) ||
          repo.description?.toLowerCase().includes(query) ||
          repo.topics?.some(topic => topic.toLowerCase().includes(query))
      )
    }

    // Apply topic filter
    if (selectedTopics.length > 0) {
      filteredRepos = filteredRepos.filter(repo =>
        selectedTopics.every(topic => repo.topics?.includes(topic))
      )
    }

    // Apply language filter
    if (selectedLanguages.length > 0) {
      filteredRepos = filteredRepos.filter(
        repo => repo.language && selectedLanguages.includes(repo.language)
      )
    }

    // Apply sorting
    filteredRepos.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'stars':
          comparison = (a.stargazers_count || 0) - (b.stargazers_count || 0)
          break
        case 'updated':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    onFilterChange(filteredRepos)
  }, [repos, selectedTopics, selectedLanguages, sortBy, sortDirection, searchQuery, onFilterChange])

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Search Input */}
      <div>
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Topic Filter */}
      <div>
        <h3 className="text-sm font-medium mb-2">Topics</h3>
        <div className="flex flex-wrap gap-2">
          {topics.map(topic => (
            <button
              key={topic}
              onClick={() =>
                setSelectedTopics(prev =>
                  prev.includes(topic)
                    ? prev.filter(t => t !== topic)
                    : [...prev, topic]
                )
              }
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTopics.includes(topic)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Language Filter */}
      <div>
        <h3 className="text-sm font-medium mb-2">Languages</h3>
        <div className="flex flex-wrap gap-2">
          {languages.map(language => (
            <button
              key={language}
              onClick={() =>
                setSelectedLanguages(prev =>
                  prev.includes(language)
                    ? prev.filter(l => l !== language)
                    : [...prev, language]
                )
              }
              className={`px-3 py-1 rounded-full text-sm ${
                selectedLanguages.includes(language)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              {language}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-4">
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortOption)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="stars">Stars</option>
          <option value="updated">Last Updated</option>
          <option value="name">Name</option>
        </select>

        <button
          onClick={() =>
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
          }
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
  )
} 