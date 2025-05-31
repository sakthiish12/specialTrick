import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GitHubRepo } from '@/lib/github/api'
import { StarIcon, ForkIcon, CalendarIcon, CodeIcon } from './icons'

interface ProjectCardProps {
  repo: GitHubRepo
  readmeExcerpt?: string
}

export function ProjectCard({ repo, readmeExcerpt }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Format date to relative time (e.g., "2 days ago")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  // Truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              <Link
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 transition-colors"
              >
                {repo.name}
              </Link>
            </h3>
            {repo.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {truncateText(repo.description, 120)}
              </p>
            )}
          </div>
          {repo.language && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CodeIcon className="w-4 h-4 mr-1" />
              {repo.language}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <StarIcon className="w-4 h-4 mr-1" />
            {repo.stargazers_count.toLocaleString()}
          </div>
          <div className="flex items-center">
            <ForkIcon className="w-4 h-4 mr-1" />
            {repo.forks_count?.toLocaleString() || '0'}
          </div>
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-1" />
            {formatDate(repo.updated_at)}
          </div>
        </div>

        {/* Topics */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {repo.topics.map(topic => (
              <span
                key={topic}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* README Excerpt */}
        {readmeExcerpt && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium mb-2">README Excerpt</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {truncateText(readmeExcerpt, 150)}
            </p>
          </div>
        )}

        {/* View Details Link */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={`/projects/${repo.name}`}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium inline-flex items-center"
          >
            View Details
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  )
} 