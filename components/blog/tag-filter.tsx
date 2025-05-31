'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TagFilterProps {
  tags: { name: string; count: number }[]
  className?: string
}

export function TagFilter({ tags, className }: TagFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedTag = searchParams.get('tag')

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams)
    if (selectedTag === tag) {
      params.delete('tag')
    } else {
      params.set('tag', tag)
    }
    router.push(`/blog?${params.toString()}`)
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map(({ name, count }) => (
        <Badge
          key={name}
          variant={selectedTag === name ? 'default' : 'secondary'}
          className={cn(
            'cursor-pointer transition-colors',
            selectedTag === name
              ? 'hover:bg-primary/90'
              : 'hover:bg-secondary/80'
          )}
          onClick={() => handleTagClick(name)}
        >
          {name}
          <span className="ml-1 text-xs opacity-70">({count})</span>
        </Badge>
      ))}
    </div>
  )
} 