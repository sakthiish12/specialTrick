import { motion } from 'framer-motion'
import { GitHubRepo } from '@/lib/github/api'
import { StarIcon, ForkIcon, LanguageIcon } from './icons'

interface ProjectHeaderProps {
  repo: GitHubRepo
}

export function ProjectHeader({ repo }: ProjectHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {repo.name}
          </h1>
          {repo.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {repo.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <StarIcon className="w-5 h-5 text-yellow-500" />
          <span className="text-gray-700 dark:text-gray-300">
            {repo.stargazers_count.toLocaleString()} stars
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ForkIcon className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700 dark:text-gray-300">
            {repo.forks_count.toLocaleString()} forks
          </span>
        </div>

        {repo.language && (
          <div className="flex items-center gap-2">
            <LanguageIcon className="w-5 h-5 text-blue-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {repo.language}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
} 