"use client";

import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewCountProps {
  count: number;
  className?: string;
}

export function ViewCount({ count, className }: ViewCountProps) {
  return (
    <div className={cn("flex items-center text-muted-foreground", className)}>
      <Eye className="h-4 w-4 mr-1" />
      <span>{count} {count === 1 ? 'view' : 'views'}</span>
    </div>
  );
}
