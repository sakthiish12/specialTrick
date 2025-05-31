"use client"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  variant?: "default" | "overlay" | "inline"
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingState({
  variant = "default",
  size = "md",
  className,
  text,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const variants = {
    default: "flex items-center justify-center p-8",
    overlay: "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50",
    inline: "inline-flex items-center gap-2",
  }

  return (
    <div className={cn(variants[variant], className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground ml-2">{text}</span>}
    </div>
  )
} 