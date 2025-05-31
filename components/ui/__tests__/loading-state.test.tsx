import { render, screen } from "@testing-library/react"
import { LoadingState } from "../loading-state"

describe("LoadingState", () => {
  it("renders with default props", () => {
    render(<LoadingState />)
    const loader = screen.getByRole("status")
    expect(loader).toBeInTheDocument()
    expect(loader).toHaveClass("h-8 w-8") // Default size
  })

  it("renders with custom text", () => {
    render(<LoadingState text="Loading data..." />)
    expect(screen.getByText("Loading data...")).toBeInTheDocument()
  })

  it("renders with different sizes", () => {
    const { rerender } = render(<LoadingState size="sm" />)
    expect(screen.getByRole("status")).toHaveClass("h-4 w-4")

    rerender(<LoadingState size="lg" />)
    expect(screen.getByRole("status")).toHaveClass("h-12 w-12")
  })

  it("renders with different variants", () => {
    const { rerender } = render(<LoadingState variant="default" />)
    expect(screen.getByRole("status").parentElement).toHaveClass("flex items-center justify-center p-8")

    rerender(<LoadingState variant="overlay" />)
    expect(screen.getByRole("status").parentElement).toHaveClass(
      "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
    )

    rerender(<LoadingState variant="inline" />)
    expect(screen.getByRole("status").parentElement).toHaveClass("inline-flex items-center gap-2")
  })

  it("applies custom className", () => {
    render(<LoadingState className="custom-class" />)
    expect(screen.getByRole("status").parentElement).toHaveClass("custom-class")
  })
}) 