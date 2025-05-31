"use client"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useState } from "react"

interface SkillBadgeProps {
  skill: string
  index: number
  variant?: "default" | "secondary" | "outline" | "destructive"
  className?: string
}

export default function SkillBadge({ skill, index, variant = "secondary", className = "" }: SkillBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Badge variant={variant} className={`${className} transition-all duration-300 ${isHovered ? "shadow-md" : ""}`}>
        {skill}
      </Badge>
    </motion.div>
  )
}
