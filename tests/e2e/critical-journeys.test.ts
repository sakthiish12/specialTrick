import { test, expect } from "@playwright/test"

test.describe("Critical User Journeys", () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page for each test
    await page.goto("/")
  })

  test("Homepage Navigation and Hero Section", async ({ page }) => {
    // Check if the page loads successfully
    await expect(page).toHaveTitle(/Portfolio/)
    
    // Verify hero section is visible
    const heroSection = page.locator("section").first()
    await expect(heroSection).toBeVisible()
    
    // Check if CTA buttons are working
    const ctaButton = page.getByRole("button", { name: /Get in Touch/i })
    await expect(ctaButton).toBeVisible()
    await ctaButton.click()
    await expect(page).toHaveURL(/.*contact/)
  })

  test("Project Showcase Navigation", async ({ page }) => {
    // Navigate to projects page
    await page.getByRole("link", { name: /Projects/i }).click()
    await expect(page).toHaveURL(/.*projects/)
    
    // Verify project grid is loaded
    const projectGrid = page.locator("[data-testid='project-grid']")
    await expect(projectGrid).toBeVisible()
    
    // Test project filtering
    const filterButton = page.getByRole("button", { name: /Filter/i })
    await filterButton.click()
    const languageFilter = page.getByRole("checkbox", { name: /JavaScript/i })
    await languageFilter.check()
    await expect(projectGrid).toContainText(/JavaScript/)
    
    // Test project search
    const searchInput = page.getByPlaceholder(/Search projects/i)
    await searchInput.fill("React")
    await expect(projectGrid).toContainText(/React/)
  })

  test("Blog Post Reading Experience", async ({ page }) => {
    // Navigate to blog page
    await page.getByRole("link", { name: /Blog/i }).click()
    await expect(page).toHaveURL(/.*blog/)
    
    // Verify blog post list is loaded
    const blogList = page.locator("[data-testid='blog-list']")
    await expect(blogList).toBeVisible()
    
    // Click on a blog post
    const firstPost = page.locator("[data-testid='blog-post-card']").first()
    const postTitle = await firstPost.locator("h2").textContent()
    await firstPost.click()
    
    // Verify blog post content
    await expect(page).toHaveTitle(postTitle!)
    const article = page.locator("article")
    await expect(article).toBeVisible()
    
    // Test social sharing
    const shareButton = page.getByRole("button", { name: /Share/i })
    await shareButton.click()
    const shareMenu = page.locator("[data-testid='share-menu']")
    await expect(shareMenu).toBeVisible()
  })

  test("Contact Form Submission", async ({ page }) => {
    // Navigate to contact page
    await page.getByRole("link", { name: /Contact/i }).click()
    await expect(page).toHaveURL(/.*contact/)
    
    // Fill out contact form
    await page.getByLabel(/Name/i).fill("Test User")
    await page.getByLabel(/Email/i).fill("test@example.com")
    await page.getByLabel(/Message/i).fill("This is a test message")
    
    // Submit form
    const submitButton = page.getByRole("button", { name: /Send Message/i })
    await submitButton.click()
    
    // Verify success message
    const successMessage = page.getByText(/Message sent successfully/i)
    await expect(successMessage).toBeVisible()
  })

  test("AI Assistant Interaction", async ({ page }) => {
    // Open AI assistant
    const assistantButton = page.getByRole("button", { name: /AI Assistant/i })
    await assistantButton.click()
    
    // Verify chat interface
    const chatInterface = page.locator("[data-testid='chat-interface']")
    await expect(chatInterface).toBeVisible()
    
    // Send a message
    const messageInput = page.getByPlaceholder(/Type your message/i)
    await messageInput.fill("Tell me about your projects")
    await page.getByRole("button", { name: /Send/i }).click()
    
    // Verify response
    const response = page.locator("[data-testid='chat-message']").last()
    await expect(response).toBeVisible()
    await expect(response).toContainText(/projects/i)
  })

  test("Theme Switching and Responsive Design", async ({ page }) => {
    // Test theme switching
    const themeButton = page.getByRole("button", { name: /Toggle theme/i })
    await themeButton.click()
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
    
    // Test responsive navigation
    await page.setViewportSize({ width: 768, height: 1024 })
    const mobileMenuButton = page.getByRole("button", { name: /Menu/i })
    await mobileMenuButton.click()
    const mobileMenu = page.locator("[data-testid='mobile-menu']")
    await expect(mobileMenu).toBeVisible()
    
    // Verify mobile navigation
    await page.getByRole("link", { name: /About/i }).click()
    await expect(page).toHaveURL(/.*about/)
  })

  test("Performance and Loading States", async ({ page }) => {
    // Test loading states
    await page.getByRole("link", { name: /Projects/i }).click()
    const loadingState = page.locator("[data-testid='loading-state']")
    await expect(loadingState).toBeVisible()
    
    // Verify content loads
    const projectGrid = page.locator("[data-testid='project-grid']")
    await expect(projectGrid).toBeVisible()
    await expect(loadingState).not.toBeVisible()
    
    // Test image lazy loading
    const images = page.locator("img[loading='lazy']")
    await expect(images).toHaveCount(expect.any(Number))
  })

  test("Error Handling and Recovery", async ({ page }) => {
    // Test 404 page
    await page.goto("/non-existent-page")
    await expect(page).toHaveTitle(/404/)
    const errorMessage = page.getByText(/Page not found/i)
    await expect(errorMessage).toBeVisible()
    
    // Test error boundary
    await page.goto("/projects")
    await page.route("**/api/projects", (route) => route.abort())
    const errorBoundary = page.locator("[data-testid='error-boundary']")
    await expect(errorBoundary).toBeVisible()
    
    // Test recovery
    await page.getByRole("button", { name: /Try again/i }).click()
    await expect(errorBoundary).not.toBeVisible()
  })
}) 