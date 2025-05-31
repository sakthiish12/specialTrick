import HeroSection from "@/components/sections/hero-section"
import AboutSection from "@/components/sections/about-section"
import ProjectsSection from "@/components/sections/projects-section"
import ResumeSection from "@/components/sections/resume-section"
import SkillsSection from "@/components/sections/skills-section"
import WritingSection from "@/components/sections/writing-section"
import ContactSection from "@/components/sections/contact-section"
import ThemeToggleButton from "@/components/theme-toggle-button"
import AnimatedBackground from "@/components/animated-background"
import SimpleChatbot from "@/components/simple-chatbot"

export default function PortfolioPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative">
      <AnimatedBackground />

      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <a href="#" className="font-bold text-lg">
            Sakthiish Prince
          </a>
          <ThemeToggleButton />
        </div>
      </header>

      <main className="flex-grow section-spacing">
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ResumeSection />
        <SkillsSection />
        <WritingSection />
      </main>

      <ContactSection />
      <SimpleChatbot />
    </div>
  )
}
