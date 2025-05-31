import { useState, useMemo } from 'react'
import { GitHubRepo } from '@/lib/github/api'
import { SearchIcon } from './icons'

interface ProjectSearchProps {
  repos: GitHubRepo[]
  onSearch: (filteredRepos: GitHubRepo[]) => void
}

export function ProjectSearch({ repos, onSearch }: ProjectSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchField, setSearchField] = useState<'all' | 'name' | 'description' | 'topics'>('all')

  // Memoize search results to prevent unnecessary re-renders
  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) {
      return repos
    }

    const query = searchQuery.toLowerCase().trim()
    return repos.filter(repo => {
      switch (searchField) {
        case 'name':
          return repo.name.toLowerCase().includes(query)
        case 'description':
          return repo.description?.toLowerCase().includes(query) ?? false
        case 'topics':
          return repo.topics.some(topic => topic.toLowerCase().includes(query))
        case 'all':
        default:
          return (
            repo.name.toLowerCase().includes(query) ||
            repo.description?.toLowerCase().includes(query) ||
            repo.topics.some(topic => topic.toLowerCase().includes(query))
          )
      }
    })
  }, [repos, searchQuery, searchField])

  // Update parent component with filtered results
  useMemo(() => {
    onSearch(filteredRepos)
  }, [filteredRepos, onSearch])

  // Highlight matching text
  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text

    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 dark:bg-yellow-800">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search projects..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSearchField('all')}
          className={`px-3 py-1 rounded-full text-sm ${
            searchField === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSearchField('name')}
          className={`px-3 py-1 rounded-full text-sm ${
            searchField === 'name'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Name
        </button>
        <button
          onClick={() => setSearchField('description')}
          className={`px-3 py-1 rounded-full text-sm ${
            searchField === 'description'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setSearchField('topics')}
          className={`px-3 py-1 rounded-full text-sm ${
            searchField === 'topics'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Topics
        </button>
      </div>

      {searchQuery && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Found {filteredRepos.length} project{filteredRepos.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
} 