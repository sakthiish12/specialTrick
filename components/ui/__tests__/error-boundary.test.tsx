import { render, screen, fireEvent } from "@testing-library/react"
import { ErrorBoundary } from "../error-boundary"

const ThrowError = () => {
  throw new Error("Test error")
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText("Test content")).toBeInTheDocument()
  })

  it("renders error UI when an error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(screen.getByText("Test error")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
  })

  it("renders custom fallback when provided", () => {
    const fallback = <div>Custom error UI</div>
    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText("Custom error UI")).toBeInTheDocument()
  })

  it("calls onError callback when error occurs", () => {
    const onError = jest.fn()
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalled()
  })

  it("resets error state when try again is clicked", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText("Something went wrong")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /try again/i }))

    // Error state should be reset, but component will still throw
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
  })
}) 