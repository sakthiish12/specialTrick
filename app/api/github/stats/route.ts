import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import {
  getContributionStats,
  getRepositoryContributions,
  getContributionStreak,
  getTopLanguages
} from '@/lib/github/graphql'

export const runtime = 'edge'

const CACHE_TTL = 3600 // 1 hour in seconds

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const username = searchParams.get('username')
    const type = searchParams.get('type')

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      )
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Type is required' },
        { status: 400 }
      )
    }

    const cacheKey = `github:stats:${username}:${type}`

    // Try cache first
    const cached = await kv.get(cacheKey)
    if (cached) {
      return NextResponse.json({ success: true, data: cached, cached: true })
    }

    let data: any

    switch (type) {
      case 'contributions': {
        const from = new Date()
        from.setDate(from.getDate() - 30)
        const to = new Date()
        data = await getContributionStats(username, from, to)
        break
      }
      case 'streak': {
        data = await getContributionStreak(username)
        break
      }
      case 'languages': {
        const languages = await getTopLanguages(username)
        data = Object.fromEntries(languages)
        break
      }
      case 'repo': {
        const repoName = searchParams.get('repo')
        if (!repoName) {
          return NextResponse.json(
            { success: false, error: 'Repository name is required for repo stats' },
            { status: 400 }
          )
        }
        data = await getRepositoryContributions(username, repoName)
        break
      }
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type parameter' },
          { status: 400 }
        )
    }

    // Cache the result
    await kv.set(cacheKey, data, { ex: CACHE_TTL })

    return NextResponse.json({ success: true, data, cached: false })
  } catch (error) {
    console.error('Error fetching GitHub stats:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
} 