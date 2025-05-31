import { NextRequest, NextResponse } from 'next/server';
import { query, getOne } from '@/lib/db/neon';

type BlogView = {
  id: number;
  post_slug: string;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Check if a view record exists for this post
    const existingView = await getOne<BlogView>(
      'SELECT * FROM blog_views WHERE post_slug = $1',
      [slug]
    );

    if (existingView) {
      // Increment view count
      const result = await query(
        `UPDATE blog_views 
         SET view_count = $1, updated_at = NOW() 
         WHERE post_slug = $2 
         RETURNING *`,
        [existingView.view_count + 1, slug]
      );

      if (!result.rows[0]) {
        throw new Error('Failed to update view count');
      }

      return NextResponse.json({ viewCount: result.rows[0].view_count });
    } else {
      // Create new view record
      const result = await query(
        `INSERT INTO blog_views (post_slug, view_count, created_at, updated_at)
         VALUES ($1, 1, NOW(), NOW())
         RETURNING *`,
        [slug]
      );

      if (!result.rows[0]) {
        throw new Error('Failed to create view record');
      }

      return NextResponse.json({ viewCount: result.rows[0].view_count });
    }
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
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

    const result = await getOne<{ view_count: number }>(
      'SELECT view_count FROM blog_views WHERE post_slug = $1',
      [slug]
    );

    return NextResponse.json({ viewCount: result?.view_count || 0 });
  } catch (error) {
    console.error('Error getting view count:', error);
    return NextResponse.json(
      { error: 'Failed to get view count' },
      { status: 500 }
    );
  }
}
