"use client"

import { Suspense, useEffect, useState } from 'react'
import { getRepositories } from '@/lib/github/api'
import { ProjectsGrid } from '@/components/projects/projects-grid'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export default function ProjectsPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const data = await getRepositories('sakthiish12');
        setRepos(data);
        setLoading(false);
      } catch (err: any) {
        setError(err?.message || 'Failed to load projects');
        setLoading(false);
      }
    }
    
    fetchRepos();
  }, []);

  if (loading) {
    return <LoadingState text="Loading projects..." />;
  }

  if (error) {
    return <div className="text-red-500">Error loading projects: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Projects
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Explore my open source projects and contributions. These projects showcase my skills in web development,
          machine learning, and more.
        </p>
      </div>

      <ErrorBoundary>
        <Suspense fallback={<LoadingState text="Loading projects..." />}>
          <ProjectsGrid repos={repos} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
