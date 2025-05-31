"use client"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function HeroSection() {
  const [scrollIndicator, setScrollIndicator] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollIndicator(window.scrollY <= 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
      </div>
      
      <div className="container relative z-10 px-4 py-16 md:py-24 lg:py-32 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block px-3 py-1.5 mb-4 md:mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary"
        >
          Welcome to my digital space
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-4 md:mb-6 leading-tight"
        >
          Building Solutions at
          <br className="hidden xs:block sm:hidden" /> the{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
            Edge of Technology
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-10 max-w-2xl mx-auto px-1"
        >
          I&apos;m Sakthiish Prince, a technologist specializing in Cybersecurity, Identity Management, and AI.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-10 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="#projects" className="group">
              View My Work
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
            <Link 
              href="/blog" 
              className="group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <BookOpen className={`mr-2 h-5 w-5 ${isHovered ? 'animate-bounce' : ''}`} />
              Read My Blog
            </Link>
          </Button>
        </motion.div>

        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs md:text-sm font-medium">Latest Article: AI Fine-Tuning for SMEs</span>
          </div>
        </motion.div>
      </div>

      {scrollIndicator && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
        >
          <span className="text-sm text-muted-foreground mb-2">Scroll to explore</span>
          <ChevronDown className="h-6 w-6 animate-bounce text-muted-foreground" />
        </motion.div>
      )}
    </section>
  )
}
