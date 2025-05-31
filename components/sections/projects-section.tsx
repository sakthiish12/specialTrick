"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Github, FileText } from "lucide-react"
import { projects } from "@/lib/data"
import { motion } from "framer-motion"

export default function ProjectsSection() {
  return (
    <section id="projects" className="section-padding">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="heading-responsive font-bold text-center mb-12"
        >
          Live Projects
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center mb-3">
                    {project.icon && (
                      <div className="mr-3">
                        {(() => {
                          const Icon = project.icon;
                          return <Icon className="h-8 w-8 text-primary" />;
                        })()}
                      </div>
                    )}
                    <CardTitle className="text-xl font-semibold">{project.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground min-h-[60px] leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pb-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Tech Used:</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {project.tech.map((tech) => (
                        <Badge 
                          key={tech} 
                          variant="secondary"
                          className="px-2.5 py-1 text-xs font-medium"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap justify-start gap-2 border-t pt-4">
                  {project.liveDemo && (
                    <Button variant="outline" size="sm" className="h-9" asChild>
                      <a href={project.liveDemo} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1.5 h-4 w-4" /> Live Demo
                      </a>
                    </Button>
                  )}
                  {project.codeLink && (
                    <Button variant="outline" size="sm" className="h-9" asChild>
                      <a href={project.codeLink} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-1.5 h-4 w-4" /> Code
                      </a>
                    </Button>
                  )}
                  {project.caseStudy && (
                    <Button variant="ghost" size="sm" className="h-9" asChild>
                      <a href={project.caseStudy} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-1.5 h-4 w-4" /> Case Study
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
