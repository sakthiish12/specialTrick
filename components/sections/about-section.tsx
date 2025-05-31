"use client"
import { motion } from "framer-motion"
import { Briefcase, Users, Rocket, Award } from "lucide-react"

const stats = [
  { icon: <Briefcase className="h-8 w-8 text-primary" />, label: "6+ Years Experience" },
  { icon: <Rocket className="h-8 w-8 text-primary" />, label: "3 Startups Involved" },
  { icon: <Users className="h-8 w-8 text-primary" />, label: "Fortune 500 Enterprise Exp." },
  { icon: <Award className="h-8 w-8 text-primary" />, label: "AI SaaS Founder" },
]

export default function AboutSection() {
  return (
    <section id="about" className="section-padding bg-secondary/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="heading-responsive font-bold text-center mb-8">About Me</h2>
          <p className="text-responsive text-center text-muted-foreground max-w-3xl mx-auto mb-12">
            I'm currently in Deloitte, ex-startup founder, and building TUNE — a fine-tuning & AI deployment platform
            for SMEs. I work at the intersection of identity, automation, and secure AI.
          </p>
          <div className="grid-responsive text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="p-6 bg-background rounded-lg shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex justify-center mb-3">{stat.icon}</div>
                <p className="font-semibold text-md">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
