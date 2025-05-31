"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Play, Code, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LiveDemoPanelProps {
  className?: string
  project: {
    name: string
    description: string
    demoUrl: string
    githubUrl: string
    technologies: string[]
  }
}

export function LiveDemoPanel({ className, project }: LiveDemoPanelProps) {
  const [selectedTab, setSelectedTab] = useState('demo')
  const [isLoading, setIsLoading] = useState(false)

  const handleRunDemo = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement actual demo running logic
      await new Promise(resolve => setTimeout(resolve, 1000))
      window.open(project.demoUrl, '_blank')
    } catch (error) {
      console.error('Error running demo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Try {project.name} Live
        </CardTitle>
        <CardDescription>
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="code">Source Code</TabsTrigger>
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="demo" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Technologies Used</h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 text-xs bg-muted rounded-md"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <Button
              onClick={handleRunDemo}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading Demo...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Live Demo
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Project Structure</h4>
              <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                {`${project.name}/
├── src/
│   ├── components/
│   ├── pages/
│   └── utils/
├── public/
├── package.json
└── README.md`}
              </pre>
            </div>
            <Button
              onClick={() => window.open(project.githubUrl, '_blank')}
              variant="outline"
              className="w-full"
            >
              <Code className="w-4 h-4 mr-2" />
              View on GitHub
            </Button>
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick Start</h4>
              <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                {`# Clone the repository
git clone ${project.githubUrl}

# Install dependencies
npm install

# Start development server
npm run dev`}
              </pre>
            </div>
            <Button
              onClick={() => window.open(project.githubUrl, '_blank')}
              variant="outline"
              className="w-full"
            >
              <Terminal className="w-4 h-4 mr-2" />
              View Setup Guide
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 