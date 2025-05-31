"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitHubRepo } from '@/lib/github/api'
import { ProjectCard } from './project-card'
import { ProjectSearch } from './project-search'
import { ProjectFilters } from './project-filters'

interface ProjectsGridProps {
  repos: GitHubRepo[]
}

export function ProjectsGrid({ repos }: ProjectsGridProps) {
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>(repos)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading state for initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSearch = (results: GitHubRepo[]) => {
    setFilteredRepos(results)
  }

  const handleFilter = (results: GitHubRepo[]) => {
    setFilteredRepos(results)
  }

  // Grid container variants for animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  // Grid item variants for animation
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4" />
            <div className="flex gap-4 mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="space-y-4">
        <ProjectSearch repos={repos} onSearch={handleSearch} />
        <ProjectFilters repos={repos} onFilter={handleFilter} />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredRepos.length} of {repos.length} projects
      </div>

      {/* Projects Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence>
          {filteredRepos.map(repo => (
            <motion.div
              key={repo.id}
              variants={itemVariants}
              layout
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <ProjectCard repo={repo} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredRepos.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No projects found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  )
} 