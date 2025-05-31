import { useEffect, useRef, useState } from "react"

// Performance monitoring
export function measurePerformance(metricName: string, value: number) {
  if (typeof window !== "undefined" && "performance" in window) {
    window.performance.mark(`${metricName}-start`)
    window.performance.mark(`${metricName}-end`)
    window.performance.measure(metricName, `${metricName}-start`, `${metricName}-end`)
  }
}

export function reportWebVitals(metric: any) {
  if (metric.label === "web-vital") {
    measurePerformance(metric.name, metric.value)
  }
}

// Image optimization
export function getOptimizedImageUrl(
  src: string,
  width: number,
  quality: number = 75
): string {
  // Use Next.js Image Optimization API
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`
}

// Lazy loading
export function useLazyLoad<T extends HTMLElement>(
  options: IntersectionObserverInit = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
  }
) {
  const elementRef = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    }, options)

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [options])

  return { elementRef, isVisible }
}

// Resource hints
export function addResourceHint(
  url: string,
  type: "preconnect" | "prefetch" | "preload" = "preconnect"
) {
  const link = document.createElement("link")
  link.rel = type
  link.href = url
  document.head.appendChild(link)
}

// Script loading
export function loadScript(
  src: string,
  options: {
    async?: boolean
    defer?: boolean
    onLoad?: () => void
    onError?: (error: Error) => void
  } = {}
) {
  const { async = true, defer = true, onLoad, onError } = options
  const script = document.createElement("script")
  script.src = src
  script.async = async
  script.defer = defer

  if (onLoad) {
    script.onload = onLoad
  }

  if (onError) {
    script.onerror = (error) => onError(error instanceof Error ? error : new Error(String(error)))
  }

  document.head.appendChild(script)
}

// Performance budget monitoring
export function checkPerformanceBudget(
  metrics: {
    fcp?: number
    lcp?: number
    fid?: number
    cls?: number
    ttfb?: number
  },
  budget: {
    fcp?: number
    lcp?: number
    fid?: number
    cls?: number
    ttfb?: number
  }
): { passed: boolean; violations: string[] } {
  const violations: string[] = []

  Object.entries(metrics).forEach(([metric, value]) => {
    const budgetValue = budget[metric as keyof typeof budget]
    if (budgetValue && value > budgetValue) {
      violations.push(`${metric}: ${value}ms (budget: ${budgetValue}ms)`)
    }
  })

  return {
    passed: violations.length === 0,
    violations,
  }
}

// Cache control
export function setCacheControl(
  response: Response,
  options: {
    maxAge?: number
    staleWhileRevalidate?: number
    public?: boolean
  } = {}
) {
  const { maxAge = 60, staleWhileRevalidate = 600, public: isPublic = true } = options
  const directives = [
    isPublic ? "public" : "private",
    `max-age=${maxAge}`,
    `stale-while-revalidate=${staleWhileRevalidate}`,
  ]

  response.headers.set("Cache-Control", directives.join(", "))
  return response
}

// Bundle analysis
export function analyzeBundleSize(bundle: any): {
  totalSize: number
  modules: { name: string; size: number }[]
} {
  const modules = Object.entries(bundle).map(([name, size]) => ({
    name,
    size: size as number,
  }))

  const totalSize = modules.reduce((sum, module) => sum + module.size, 0)

  return {
    totalSize,
    modules: modules.sort((a, b) => b.size - a.size),
  }
}

// Memory management
export function cleanupResources() {
  // Clear any cached data
  if (typeof window !== "undefined") {
    // Clear image cache
    const images = document.querySelectorAll("img")
    images.forEach((img) => {
      img.src = ""
    })

    // Clear any stored data
    localStorage.clear()
    sessionStorage.clear()

    // Clear any pending timeouts/intervals
    const highestTimeoutId = setTimeout(() => {}, 0)
    for (let i = 0; i < Number(highestTimeoutId); i++) {
      clearTimeout(i)
      clearInterval(i)
    }
  }
}

// Performance monitoring hook
export function usePerformanceMonitor(
  metrics: string[],
  callback: (metrics: { [key: string]: number }) => void
) {
  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const measurements: { [key: string]: number } = {}

      entries.forEach((entry) => {
        if (metrics.includes(entry.name)) {
          measurements[entry.name] = entry.duration
        }
      })

      callback(measurements)
    })

    observer.observe({ entryTypes: metrics })

    return () => {
      observer.disconnect()
    }
  }, [metrics, callback])
} 