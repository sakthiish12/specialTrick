"use client"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Mail, Send } from "lucide-react" // Assuming Send for Telegram, or use a specific Telegram icon
import { motion } from "framer-motion"

const socialLinks = [
  { name: "Email", icon: <Mail className="h-5 w-5" />, href: "mailto:sakthiish.prince@example.com" }, // Update email
  { name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, href: "https://www.linkedin.com/in/sakthiish-vijayadass/" }, // Updated LinkedIn
  { name: "GitHub", icon: <Github className="h-5 w-5" />, href: "https://github.com/sakthiish12" }, // Updated GitHub
  { name: "Telegram", icon: <Send className="h-5 w-5" />, href: "https://t.me/sakthiishprince" }, // Update Telegram
]

export default function ContactSection() {
  return (
    <footer id="contact" className="section-padding border-t">
      <div className="container text-center">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="heading-responsive font-semibold mb-6"
        >
          Let&apos;s Connect
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-responsive text-muted-foreground mb-8 max-w-xl mx-auto"
        >
          Looking for collaborators, clients, or new opportunities. Feel free to reach out!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center gap-4 mb-8"
        >
          {socialLinks.map((link) => (
            <Button key={link.name} variant="outline" size="icon" asChild>
              <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
                {link.icon}
              </a>
            </Button>
          ))}
        </motion.div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Sakthiish Prince. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground mt-1">Built with Next.js, Tailwind CSS, and Vercel.</p>
      </div>
    </footer>
  )
}
