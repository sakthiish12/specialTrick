import { useState, useEffect } from 'react';

interface BlogInteractions {
  viewCount: number;
  likeCount: number;
  liked: boolean;
  comments: any[];
  isLoading: {
    views: boolean;
    likes: boolean;
    comments: boolean;
  };
  error: {
    views: string | null;
    likes: string | null;
    comments: string | null;
  };
  incrementView: () => Promise<void>;
  toggleLike: () => Promise<void>;
  addComment: (comment: { name: string; email?: string; content: string; parentId?: string }) => Promise<void>;
  refreshComments: () => Promise<void>;
}

export function useBlogInteractions(slug: string): BlogInteractions {
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState({
    views: true,
    likes: true,
    comments: true,
  });
  const [error, setError] = useState({
    views: null,
    likes: null,
    comments: null,
  });

  // Fetch initial data
  useEffect(() => {
    if (!slug) return;
    
    fetchViewCount();
    fetchLikeStatus();
    fetchComments();
  }, [slug]);

  // Increment view count when page loads
  useEffect(() => {
    if (!slug) return;
    
    incrementView();
  }, [slug]);

  // Fetch view count
  const fetchViewCount = async () => {
    try {
      setIsLoading(prev => ({ ...prev, views: true }));
      const response = await fetch(`/api/blog/views?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch view count');
      }
      
      setViewCount(data.viewCount);
      setError(prev => ({ ...prev, views: null }));
    } catch (err: any) {
      console.error('Error fetching view count:', err);
      setError(prev => ({ ...prev, views: err.message }));
    } finally {
      setIsLoading(prev => ({ ...prev, views: false }));
    }
  };

  // Increment view count
  const incrementView = async () => {
    try {
      const response = await fetch('/api/blog/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to increment view count');
      }
      
      setViewCount(data.viewCount);
      setError(prev => ({ ...prev, views: null }));
    } catch (err: any) {
      console.error('Error incrementing view count:', err);
      setError(prev => ({ ...prev, views: err.message }));
    }
  };

  // Fetch like status and count
  const fetchLikeStatus = async () => {
    try {
      setIsLoading(prev => ({ ...prev, likes: true }));
      const response = await fetch(`/api/blog/likes?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch like status');
      }
      
      setLiked(data.liked);
      setLikeCount(data.likeCount);
      setError(prev => ({ ...prev, likes: null }));
    } catch (err: any) {
      console.error('Error fetching like status:', err);
      setError(prev => ({ ...prev, likes: err.message }));
    } finally {
      setIsLoading(prev => ({ ...prev, likes: false }));
    }
  };

  // Toggle like status
  const toggleLike = async () => {
    try {
      setIsLoading(prev => ({ ...prev, likes: true }));
      const response = await fetch('/api/blog/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle like');
      }
      
      setLiked(data.liked);
      setLikeCount(data.likeCount);
      setError(prev => ({ ...prev, likes: null }));
    } catch (err: any) {
      console.error('Error toggling like:', err);
      setError(prev => ({ ...prev, likes: err.message }));
    } finally {
      setIsLoading(prev => ({ ...prev, likes: false }));
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    try {
      setIsLoading(prev => ({ ...prev, comments: true }));
      const response = await fetch(`/api/blog/comments?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comments');
      }
      
      setComments(data.comments || []);
      setError(prev => ({ ...prev, comments: null }));
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError(prev => ({ ...prev, comments: err.message }));
    } finally {
      setIsLoading(prev => ({ ...prev, comments: false }));
    }
  };

  // Add a comment
  const addComment = async (comment: { name: string; email?: string; content: string; parentId?: string }) => {
    try {
      setIsLoading(prev => ({ ...prev, comments: true }));
      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: comment.name,
          email: comment.email,
          content: comment.content,
          parentId: comment.parentId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add comment');
      }
      
      // Refresh comments after adding a new one
      await fetchComments();
      setError(prev => ({ ...prev, comments: null }));
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError(prev => ({ ...prev, comments: err.message }));
    } finally {
      setIsLoading(prev => ({ ...prev, comments: false }));
    }
  };

  return {
    viewCount,
    likeCount,
    liked,
    comments,
    isLoading,
    error,
    incrementView,
    toggleLike,
    addComment,
    refreshComments: fetchComments,
  };
}
