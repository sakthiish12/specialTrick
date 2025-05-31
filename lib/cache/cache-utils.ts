import { kv } from "@vercel/kv"
import { Redis } from "@upstash/redis"

// Cache configuration
const CACHE_TTL = {
  SHORT: 60 * 5, // 5 minutes
  MEDIUM: 60 * 60, // 1 hour
  LONG: 60 * 60 * 24, // 24 hours
  STATIC: 60 * 60 * 24 * 7, // 7 days
}

// Cache key prefixes for different types of data
const CACHE_KEYS = {
  GITHUB: "github:",
  BLOG: "blog:",
  AI: "ai:",
  PROJECT: "project:",
  STATS: "stats:",
}

interface CacheOptions {
  ttl?: number
  staleWhileRevalidate?: boolean
  tags?: string[]
}

export class CacheManager {
  private static instance: CacheManager
  private redis: Redis

  private constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  /**
   * Get cached data with optional stale-while-revalidate pattern
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const cachedData = await this.redis.get<T>(key)
      
      if (cachedData && options.staleWhileRevalidate) {
        // Trigger background revalidation
        this.revalidate(key, options).catch(console.error)
      }
      
      return cachedData
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error)
      return null
    }
  }

  /**
   * Set data in cache with TTL
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || CACHE_TTL.MEDIUM
      await this.redis.set(key, data, { ex: ttl })
      
      if (options.tags) {
        await this.addTagsToKey(key, options.tags)
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error)
    }
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error)
    }
  }

  /**
   * Delete all cached data with specific tags
   */
  async deleteByTags(tags: string[]): Promise<void> {
    try {
      const keys = await this.getKeysByTags(tags)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error(`Cache delete by tags error:`, error)
    }
  }

  /**
   * Add tags to a cache key
   */
  private async addTagsToKey(key: string, tags: string[]): Promise<void> {
    try {
      const pipeline = this.redis.pipeline()
      tags.forEach(tag => {
        pipeline.sadd(`tag:${tag}`, key)
      })
      await pipeline.exec()
    } catch (error) {
      console.error(`Error adding tags to key ${key}:`, error)
    }
  }

  /**
   * Get all keys associated with specific tags
   */
  private async getKeysByTags(tags: string[]): Promise<string[]> {
    try {
      const pipeline = this.redis.pipeline()
      tags.forEach(tag => {
        pipeline.smembers(`tag:${tag}`)
      })
      const results = await pipeline.exec()
      return results.flat().filter(Boolean) as string[]
    } catch (error) {
      console.error(`Error getting keys by tags:`, error)
      return []
    }
  }

  /**
   * Background revalidation of cached data
   */
  private async revalidate(key: string, options: CacheOptions): Promise<void> {
    // Implement revalidation logic here
    // This could involve calling the original data source
    // and updating the cache with fresh data
  }
}

// Helper functions for common cache operations
export const cacheUtils = {
  /**
   * Cache GitHub API responses
   */
  async cacheGitHubData<T>(endpoint: string, data: T, options: CacheOptions = {}): Promise<void> {
    const cache = CacheManager.getInstance()
    const key = `${CACHE_KEYS.GITHUB}${endpoint}`
    await cache.set(key, data, { ...options, ttl: options.ttl || CACHE_TTL.SHORT })
  },

  /**
   * Cache blog post data
   */
  async cacheBlogPost<T>(slug: string, data: T, options: CacheOptions = {}): Promise<void> {
    const cache = CacheManager.getInstance()
    const key = `${CACHE_KEYS.BLOG}${slug}`
    await cache.set(key, data, { ...options, ttl: options.ttl || CACHE_TTL.LONG })
  },

  /**
   * Cache AI-generated content
   */
  async cacheAIContent<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const cache = CacheManager.getInstance()
    const cacheKey = `${CACHE_KEYS.AI}${key}`
    await cache.set(cacheKey, data, { ...options, ttl: options.ttl || CACHE_TTL.MEDIUM })
  },

  /**
   * Cache project data
   */
  async cacheProjectData<T>(slug: string, data: T, options: CacheOptions = {}): Promise<void> {
    const cache = CacheManager.getInstance()
    const key = `${CACHE_KEYS.PROJECT}${slug}`
    await cache.set(key, data, { ...options, ttl: options.ttl || CACHE_TTL.STATIC })
  },

  /**
   * Cache statistics data
   */
  async cacheStats<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const cache = CacheManager.getInstance()
    const cacheKey = `${CACHE_KEYS.STATS}${key}`
    await cache.set(cacheKey, data, { ...options, ttl: options.ttl || CACHE_TTL.MEDIUM })
  },
} 