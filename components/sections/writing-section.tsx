"use client"
import { articles } from "@/lib/data"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

// Add category based on the icon for demonstration
const getCategoryFromIcon = (icon: any) => {
  if (icon.name === 'Brain') return 'AI & ML'
  if (icon.name === 'Sailboat') return 'DevOps'
  if (icon.name === 'Bot') return 'AI'
  return 'Article'
}

export default function WritingSection() {
  const featuredArticles = articles.slice(0, 3) // Show only 3 featured articles

  if (!featuredArticles || featuredArticles.length === 0) {
    return null // Don't render if no articles
  }

  return (
    <section id="blog" className="py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80"
          >
            Latest Articles
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Thoughts, tutorials, and insights on web development, design, and technology.
          </motion.p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredArticles.map((article, index) => (
            <motion.div
              key={article.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-3">
                    {article.icon && (
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {(() => {
                          const Icon = article.icon;
                          return <Icon className="h-5 w-5" />;
                        })()}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full">
                        {getCategoryFromIcon(article.icon)}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                  {article.description && (
                    <CardDescription className="text-muted-foreground line-clamp-3">
                      {article.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-grow pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Read more</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
