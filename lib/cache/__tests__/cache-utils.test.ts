import { CacheManager, cacheUtils } from "../cache-utils"
import { Redis } from "@upstash/redis"

// Mock Redis
jest.mock("@upstash/redis")

describe("CacheManager", () => {
  let cacheManager: CacheManager
  let mockRedis: jest.Mocked<Redis>

  beforeEach(() => {
    jest.clearAllMocks()
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      pipeline: jest.fn().mockReturnValue({
        sadd: jest.fn().mockReturnThis(),
        smembers: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }),
    } as unknown as jest.Mocked<Redis>

    ;(Redis as unknown as jest.Mock).mockImplementation(() => mockRedis)
    cacheManager = CacheManager.getInstance()
  })

  describe("get", () => {
    it("should return cached data when available", async () => {
      const mockData = { test: "data" }
      mockRedis.get.mockResolvedValue(mockData)

      const result = await cacheManager.get("test-key")
      expect(result).toEqual(mockData)
      expect(mockRedis.get).toHaveBeenCalledWith("test-key")
    })

    it("should return null when cache miss", async () => {
      mockRedis.get.mockResolvedValue(null)

      const result = await cacheManager.get("test-key")
      expect(result).toBeNull()
    })

    it("should handle errors gracefully", async () => {
      mockRedis.get.mockRejectedValue(new Error("Redis error"))

      const result = await cacheManager.get("test-key")
      expect(result).toBeNull()
    })
  })

  describe("set", () => {
    it("should set data with default TTL", async () => {
      const data = { test: "data" }
      await cacheManager.set("test-key", data)

      expect(mockRedis.set).toHaveBeenCalledWith(
        "test-key",
        data,
        expect.objectContaining({ ex: expect.any(Number) })
      )
    })

    it("should set data with custom TTL", async () => {
      const data = { test: "data" }
      const ttl = 3600
      await cacheManager.set("test-key", data, { ttl })

      expect(mockRedis.set).toHaveBeenCalledWith(
        "test-key",
        data,
        expect.objectContaining({ ex: ttl })
      )
    })

    it("should add tags when provided", async () => {
      const data = { test: "data" }
      const tags = ["tag1", "tag2"]
      await cacheManager.set("test-key", data, { tags })

      expect(mockRedis.pipeline).toHaveBeenCalled()
    })
  })

  describe("delete", () => {
    it("should delete cached data", async () => {
      await cacheManager.delete("test-key")
      expect(mockRedis.del).toHaveBeenCalledWith("test-key")
    })
  })

  describe("deleteByTags", () => {
    it("should delete all keys with specified tags", async () => {
      const mockKeys = ["key1", "key2"]
      const mockPipeline = {
        sadd: jest.fn().mockReturnThis(),
        smembers: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockKeys]),
      }
      mockRedis.pipeline.mockReturnValue(mockPipeline)

      await cacheManager.deleteByTags(["tag1"])
      expect(mockRedis.del).toHaveBeenCalledWith(...mockKeys)
    })
  })
})

describe("cacheUtils", () => {
  let mockCacheManager: jest.SpyInstance

  beforeEach(() => {
    mockCacheManager = jest.spyOn(CacheManager, "getInstance")
  })

  afterEach(() => {
    mockCacheManager.mockRestore()
  })

  it("should cache GitHub data with short TTL", async () => {
    const mockSet = jest.fn()
    mockCacheManager.mockReturnValue({ set: mockSet })

    const data = { repo: "test" }
    await cacheUtils.cacheGitHubData("repos", data)

    expect(mockSet).toHaveBeenCalledWith(
      "github:repos",
      data,
      expect.objectContaining({ ttl: expect.any(Number) })
    )
  })

  it("should cache blog post with long TTL", async () => {
    const mockSet = jest.fn()
    mockCacheManager.mockReturnValue({ set: mockSet })

    const data = { title: "Test Post" }
    await cacheUtils.cacheBlogPost("test-post", data)

    expect(mockSet).toHaveBeenCalledWith(
      "blog:test-post",
      data,
      expect.objectContaining({ ttl: expect.any(Number) })
    )
  })

  it("should cache AI content with medium TTL", async () => {
    const mockSet = jest.fn()
    mockCacheManager.mockReturnValue({ set: mockSet })

    const data = { response: "AI generated content" }
    await cacheUtils.cacheAIContent("test-key", data)

    expect(mockSet).toHaveBeenCalledWith(
      "ai:test-key",
      data,
      expect.objectContaining({ ttl: expect.any(Number) })
    )
  })

  it("should cache project data with static TTL", async () => {
    const mockSet = jest.fn()
    mockCacheManager.mockReturnValue({ set: mockSet })

    const data = { name: "Test Project" }
    await cacheUtils.cacheProjectData("test-project", data)

    expect(mockSet).toHaveBeenCalledWith(
      "project:test-project",
      data,
      expect.objectContaining({ ttl: expect.any(Number) })
    )
  })

  it("should cache stats with medium TTL", async () => {
    const mockSet = jest.fn()
    mockCacheManager.mockReturnValue({ set: mockSet })

    const data = { views: 100 }
    await cacheUtils.cacheStats("page-views", data)

    expect(mockSet).toHaveBeenCalledWith(
      "stats:page-views",
      data,
      expect.objectContaining({ ttl: expect.any(Number) })
    )
  })
}) 