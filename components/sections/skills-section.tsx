"use client"
import { skills } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SkillBadge from "@/components/skill-badge"
import { Code, Cpu, Wrench, Lightbulb, Brain } from "lucide-react"
import { motion } from "framer-motion"

const skillCategories = [
  { title: "Languages", icon: <Code className="h-6 w-6 text-primary" />, data: skills.languages },
  { title: "Frameworks & Platforms", icon: <Cpu className="h-6 w-6 text-primary" />, data: skills.frameworksPlatforms },
  { title: "AI/ML", icon: <Brain className="h-6 w-6 text-primary" />, data: skills.aiMl },
  { title: "Tools & Technologies", icon: <Wrench className="h-6 w-6 text-primary" />, data: skills.tools },
  { title: "Currently Learning", icon: <Lightbulb className="h-6 w-6 text-primary" />, data: skills.currentlyLearning },
]

export default function SkillsSection() {
  return (
    <section id="skills" className="section-padding">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="heading-responsive font-bold text-center mb-12"
        >
          Technical Stack & Skills
        </motion.h2>
        <div className="card-grid">
          {skillCategories.map((category, catIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: catIndex * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 backdrop-blur-sm bg-background/80">
                <CardHeader>
                  <div className="flex items-center">
                    {category.icon}
                    <CardTitle className="ml-3 text-xl font-semibold">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.data.map((skill, index) => (
                      <SkillBadge
                        key={skill}
                        skill={skill}
                        index={index}
                        variant={category.title === "Currently Learning" ? "default" : "secondary"}
                        className={
                          category.title === "Currently Learning" ? "bg-green-600 hover:bg-green-700 text-white" : ""
                        }
                      />
                    ))}
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
