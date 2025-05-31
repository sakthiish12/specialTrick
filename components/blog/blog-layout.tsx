'use client'

import { cn } from '@/lib/utils'

interface BlogLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
}

export function BlogLayout({ children, sidebar, className }: BlogLayoutProps) {
  return (
    <div className={cn('container mx-auto px-4 py-8', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2 min-w-0">{children}</main>
        {sidebar && (
          <aside className="lg:col-span-1 space-y-8">
            <div className="sticky top-8">{sidebar}</div>
          </aside>
        )}
      </div>
    </div>
  )
} 