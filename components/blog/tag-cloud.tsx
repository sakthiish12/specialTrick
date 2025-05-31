import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TagCloudProps {
  tags: Array<{
    name: string
    count: number
  }>
  className?: string
}

export function TagCloud({ tags, className }: TagCloudProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tag) => (
        <Link
          key={tag.name}
          href={`/tags/${encodeURIComponent(tag.name)}`}
        >
          <Badge
            variant="secondary"
            className="hover:bg-secondary/80 transition-colors"
          >
            {tag.name}
            <span className="ml-1 text-muted-foreground">
              ({tag.count})
            </span>
          </Badge>
        </Link>
      ))}
    </div>
  )
} 