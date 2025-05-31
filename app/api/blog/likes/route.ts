import { NextRequest, NextResponse } from 'next/server';
import { query, getOne } from '@/lib/db/neon';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

type Like = {
  id: string;
  post_slug: string;
  user_id: string;
  created_at: string;
};

// Helper to get or set a unique user ID in cookies
async function getUserId() {
  const cookieStore = await cookies();
  let userId = cookieStore.get('blog_user_id')?.value;
  
  if (!userId) {
    userId = uuidv4();
    // Note: In a real app, you'd set this cookie in the client
    // This is just for demonstration
  }
  
  return userId;
}

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const userId = await getUserId();

    // Check if user already liked this post
    const existingLike = await getOne<Like>(
      'SELECT * FROM blog_likes WHERE post_slug = $1 AND user_id = $2',
      [slug, userId]
    );

    if (existingLike) {
      // User already liked this post, so unlike it
      await query(
        'DELETE FROM blog_likes WHERE id = $1',
        [existingLike.id]
      );

      // Get updated like count
      const countResult = await query<{ count: string }>(
        'SELECT COUNT(*) FROM blog_likes WHERE post_slug = $1',
        [slug]
      );
      const likeCount = parseInt(countResult.rows[0]?.count || '0', 10);

      return NextResponse.json({ 
        liked: false, 
        likeCount
      });
    } else {
      // Add new like
      await query(
        'INSERT INTO blog_likes (post_slug, user_id, created_at) VALUES ($1, $2, NOW())',
        [slug, userId]
      );

      // Get updated like count
      const countResult = await query<{ count: string }>(
        'SELECT COUNT(*) FROM blog_likes WHERE post_slug = $1',
        [slug]
      );
      const likeCount = parseInt(countResult.rows[0]?.count || '0', 10);

      return NextResponse.json({ 
        liked: true, 
        likeCount
      });
    }
  } catch (error) {
    console.error('Error handling like:', error);
    return NextResponse.json(
      { error: 'Failed to process like' },
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

    const userId = await getUserId();

    // Check if user liked this post
    const userLike = await getOne<Like>(
      'SELECT * FROM blog_likes WHERE post_slug = $1 AND user_id = $2',
      [slug, userId]
    );

    // Get total like count
    const countResult = await query<{ count: string }>(
      'SELECT COUNT(*) FROM blog_likes WHERE post_slug = $1',
      [slug]
    );
    const likeCount = parseInt(countResult.rows[0]?.count || '0', 10);

    return NextResponse.json({ 
      liked: !!userLike, 
      likeCount
    });
  } catch (error) {
    console.error('Error getting like status:', error);
    return NextResponse.json(
      { error: 'Failed to get like status' },
      { status: 500 }
    );
  }
}
