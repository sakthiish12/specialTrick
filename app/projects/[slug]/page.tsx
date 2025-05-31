import { notFound } from 'next/navigation'
import { getProjectBySlug } from '@/lib/github/api'
import { LiveDemoPanel } from '@/components/projects/live-demo-panel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Github, Star } from 'lucide-react'

interface ProjectPageProps {
  params: {
    slug: string
  }
}

export const revalidate = 3600 // Revalidate every hour

export async function generateMetadata({ params }: ProjectPageProps) {
  try {
    const project = await getProjectBySlug(params.slug)
    return {
      title: `${project.name} | Projects`,
      description: project.description || `View details about ${project.name}`,
      openGraph: {
        title: project.name,
        description: project.description,
        url: project.html_url,
        type: 'website'
      }
    }
  } catch (error) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.'
    }
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProjectBySlug(params.slug)
  
  if (!project) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.topics.map((topic) => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {project.stargazers_count}
                </div>
                <div className="flex items-center gap-1">
                  <Github className="w-4 h-4" />
                  {project.language}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(project.updated_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                {/* TODO: Add project overview content */}
                <p>Project overview content will be added here.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <LiveDemoPanel
            project={{
              name: project.name,
              description: project.description,
              demoUrl: project.homepage || project.html_url,
              githubUrl: project.html_url,
              technologies: [project.language, ...project.topics]
            }}
          />
        </div>
      </div>
    </div>
  )
} 