import { NextResponse } from 'next/server';
import { checkDbConnection } from '@/lib/db';

export async function GET() {
  try {
    const isDbConnected = await checkDbConnection();
    
    if (!isDbConnected) {
      return NextResponse.json(
        { status: 'error', message: 'Database connection failed' },
        { status: 503 }
      );
    }
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
