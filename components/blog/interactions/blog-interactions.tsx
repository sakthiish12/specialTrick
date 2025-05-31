"use client";

import { useBlogInteractions } from "@/hooks/use-blog-interactions";
import { ViewCount } from "./view-count";
import { LikeButton } from "./like-button";
import { CommentSection } from "./comment-section";
import { Separator } from "@/components/ui/separator";

interface BlogInteractionsProps {
  slug: string;
}

export function BlogInteractions({ slug }: BlogInteractionsProps) {
  const {
    viewCount,
    likeCount,
    liked,
    comments,
    isLoading,
    toggleLike,
    addComment,
  } = useBlogInteractions(slug);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <ViewCount count={viewCount} />
        <LikeButton 
          count={likeCount} 
          liked={liked} 
          onToggleLike={toggleLike} 
        />
      </div>
      
      <Separator className="my-8" />
      
      <CommentSection 
        comments={comments} 
        onAddComment={addComment} 
      />
    </div>
  );
}
