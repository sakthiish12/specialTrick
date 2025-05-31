import { motion } from 'framer-motion'
import { GitHubRepo } from '@/lib/github/api'
import { CalendarIcon, CodeIcon, BranchIcon } from './icons'

interface ProjectSidebarProps {
  repo: GitHubRepo
}

export function ProjectSidebar({ repo }: ProjectSidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Project Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Project Info
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Last updated: {new Date(repo.updated_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CodeIcon className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Default branch: {repo.default_branch}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <BranchIcon className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {repo.fork ? 'Forked repository' : 'Original repository'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Links
        </h2>
        <div className="space-y-2">
          <a
            href={`${repo.html_url}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-600 dark:text-blue-400 hover:underline"
          >
            Issues
          </a>
          <a
            href={`${repo.html_url}/pulls`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-600 dark:text-blue-400 hover:underline"
          >
            Pull Requests
          </a>
          <a
            href={`${repo.html_url}/network`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-600 dark:text-blue-400 hover:underline"
          >
            Network
          </a>
          <a
            href={`${repo.html_url}/graphs`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-600 dark:text-blue-400 hover:underline"
          >
            Insights
          </a>
        </div>
      </div>
    </motion.div>
  )
} 