"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LikeButtonProps {
  count: number;
  liked: boolean;
  onToggleLike: () => Promise<void>;
  className?: string;
}

export function LikeButton({ count, liked, onToggleLike, className }: LikeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await onToggleLike();
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-1 text-muted-foreground hover:text-primary",
          liked && "text-primary"
        )}
        onClick={handleClick}
        disabled={isLoading}
      >
        <Heart
          className={cn(
            "h-4 w-4",
            liked && "fill-primary text-primary"
          )}
        />
        <span>{count}</span>
      </Button>
    </div>
  );
}
