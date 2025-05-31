'use client'

import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { initPerformanceMonitoring } from '@/lib/monitoring/performance'

export function PerformanceMonitor() {
  useEffect(() => {
    initPerformanceMonitoring()
  }, [])

  return <Analytics />
} 