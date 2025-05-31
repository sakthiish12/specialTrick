import {
  measurePerformance,
  reportWebVitals,
  getOptimizedImageUrl,
  useLazyLoad,
  addResourceHint,
  loadScript,
  checkPerformanceBudget,
  setCacheControl,
  analyzeBundleSize,
  cleanupResources,
  usePerformanceMonitor,
} from "../performance-utils"

describe("Performance Utilities", () => {
  describe("measurePerformance", () => {
    it("measures performance metrics", () => {
      measurePerformance("test-metric", 100)
      const entries = performance.getEntriesByName("test-metric")
      expect(entries).toHaveLength(1)
    })
  })

  describe("reportWebVitals", () => {
    it("reports web vitals metrics", () => {
      const metric = {
        name: "FCP",
        value: 100,
        label: "web-vital",
      }
      reportWebVitals(metric)
      const entries = performance.getEntriesByName("FCP")
      expect(entries).toHaveLength(1)
    })
  })

  describe("getOptimizedImageUrl", () => {
    it("generates optimized image URL", () => {
      const url = getOptimizedImageUrl("/test.jpg", 800, 75)
      expect(url).toBe("/_next/image?url=%2Ftest.jpg&w=800&q=75")
    })
  })

  describe("useLazyLoad", () => {
    it("handles lazy loading", () => {
      const { result } = renderHook(() => useLazyLoad())
      expect(result.current.isVisible).toBe(false)
    })
  })

  describe("addResourceHint", () => {
    it("adds resource hint to document head", () => {
      addResourceHint("https://example.com", "preconnect")
      const link = document.querySelector('link[rel="preconnect"]')
      expect(link).toHaveAttribute("href", "https://example.com")
    })
  })

  describe("loadScript", () => {
    it("loads script with options", () => {
      const onLoad = jest.fn()
      loadScript("test.js", { onLoad })
      const script = document.querySelector('script[src="test.js"]')
      expect(script).toHaveAttribute("async")
      expect(script).toHaveAttribute("defer")
    })
  })

  describe("checkPerformanceBudget", () => {
    it("checks performance metrics against budget", () => {
      const metrics = {
        fcp: 2000,
        lcp: 3000,
        fid: 100,
      }
      const budget = {
        fcp: 1800,
        lcp: 2500,
        fid: 100,
      }
      const result = checkPerformanceBudget(metrics, budget)
      expect(result.passed).toBe(false)
      expect(result.violations).toContain("fcp: 2000ms (budget: 1800ms)")
      expect(result.violations).toContain("lcp: 3000ms (budget: 2500ms)")
    })
  })

  describe("setCacheControl", () => {
    it("sets cache control headers", () => {
      const response = new Response()
      setCacheControl(response, { maxAge: 300, staleWhileRevalidate: 600 })
      expect(response.headers.get("Cache-Control")).toBe(
        "public, max-age=300, stale-while-revalidate=600"
      )
    })
  })

  describe("analyzeBundleSize", () => {
    it("analyzes bundle size", () => {
      const bundle = {
        "module1.js": 1000,
        "module2.js": 2000,
        "module3.js": 3000,
      }
      const result = analyzeBundleSize(bundle)
      expect(result.totalSize).toBe(6000)
      expect(result.modules).toHaveLength(3)
      expect(result.modules[0].name).toBe("module3.js")
    })
  })

  describe("cleanupResources", () => {
    it("cleans up resources", () => {
      // Add some test data
      localStorage.setItem("test", "data")
      sessionStorage.setItem("test", "data")
      const img = document.createElement("img")
      img.src = "test.jpg"
      document.body.appendChild(img)

      cleanupResources()

      expect(localStorage.length).toBe(0)
      expect(sessionStorage.length).toBe(0)
      expect(img.src).toBe("")
    })
  })

  describe("usePerformanceMonitor", () => {
    it("monitors performance metrics", () => {
      const callback = jest.fn()
      renderHook(() => usePerformanceMonitor(["FCP", "LCP"], callback))
      // Simulate performance entry
      const entry = new PerformanceEntry("FCP", "measure", 100, 0)
      performance.emit("measure", entry)
      expect(callback).toHaveBeenCalled()
    })
  })
}) 