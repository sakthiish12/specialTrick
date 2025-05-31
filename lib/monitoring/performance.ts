import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals'
import { captureMessage } from './error-tracking'

type MetricType = 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB'

interface PerformanceMetric {
  name: MetricType
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

const RATING_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  LCP: { good: 2500, poor: 4000 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
}

const getRating = (metric: MetricType, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds = RATING_THRESHOLDS[metric]
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

const reportMetric = (metric: PerformanceMetric) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Performance Metric - ${metric.name}:`, metric)
  }

  // Report to monitoring service
  captureMessage(`Performance Metric - ${metric.name}`, {
    extra: {
      value: metric.value,
      rating: metric.rating,
    },
  })
}

export const initPerformanceMonitoring = () => {
  // Core Web Vitals
  onCLS((metric) => {
    reportMetric({
      name: 'CLS',
      value: metric.value,
      rating: getRating('CLS', metric.value),
    })
  })

  onFID((metric) => {
    reportMetric({
      name: 'FID',
      value: metric.value,
      rating: getRating('FID', metric.value),
    })
  })

  onLCP((metric) => {
    reportMetric({
      name: 'LCP',
      value: metric.value,
      rating: getRating('LCP', metric.value),
    })
  })

  onFCP((metric) => {
    reportMetric({
      name: 'FCP',
      value: metric.value,
      rating: getRating('FCP', metric.value),
    })
  })

  onTTFB((metric) => {
    reportMetric({
      name: 'TTFB',
      value: metric.value,
      rating: getRating('TTFB', metric.value),
    })
  })
}

export const trackCustomMetric = (name: string, value: number) => {
  reportMetric({
    name: name as MetricType,
    value,
    rating: 'good', // Custom metrics don't have predefined thresholds
  })
}

export const measurePerformance = async (name: string, fn: () => Promise<any>) => {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    trackCustomMetric(name, duration)
    return result
  } catch (error) {
    const duration = performance.now() - start
    trackCustomMetric(`${name}_error`, duration)
    throw error
  }
} 