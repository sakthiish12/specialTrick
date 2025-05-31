import { NextRequest, NextResponse } from 'next/server';
import { query, getMany } from '@/lib/db/neon';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

type Comment = {
  id: string;
  post_slug: string;
  user_id: string;
  user_name: string;
  user_email: string | null;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
};

// Helper to get or set a unique user ID in cookies
async function getUserId() {
  const cookieStore = await cookies();
  let userId = cookieStore.get('blog_user_id')?.value;
  
  if (!userId) {
    userId = uuidv4();
    // Note: In a real app, you'd set this cookie in the client
  }
  
  return userId;
}

export async function POST(request: NextRequest) {
  try {
    const { slug, name, email, content, parentId } = await request.json();
    
    if (!slug || !name || !content) {
      return NextResponse.json(
        { error: 'Slug, name, and content are required' }, 
        { status: 400 }
      );
    }

    const userId = await getUserId();

    // Add new comment
    const result = await query<Comment>(
      `INSERT INTO blog_comments 
        (post_slug, user_id, user_name, user_email, content, parent_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *`,
      [slug, userId, name, email || null, content, parentId || null]
    );

    if (!result.rows[0]) {
      throw new Error('Failed to add comment');
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Get all comments for this post
    const result = await query<Comment>(
      'SELECT * FROM blog_comments WHERE post_slug = $1 ORDER BY created_at ASC',
      [slug]
    );

    // Organize comments into threads (parent comments and their replies)
    const commentThreads = result.rows.filter(comment => !comment.parent_id);
    const replies = result.rows.filter(comment => comment.parent_id);
    
    // Add replies to their parent comments
    const commentThreadsWithReplies = commentThreads.map(thread => ({
      ...thread,
      replies: replies.filter(reply => reply.parent_id === thread.id)
    }));

    return NextResponse.json({ comments: commentThreadsWithReplies });
  } catch (error) {
    console.error('Error getting comments:', error);
    return NextResponse.json(
      { error: 'Failed to get comments' },
      { status: 500 }
    );
  }
}
