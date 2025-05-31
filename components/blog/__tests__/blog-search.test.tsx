import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BlogSearch } from '../blog-search'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

describe('BlogSearch', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
  })

  it('renders search input', () => {
    render(<BlogSearch />)
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const customClass = 'custom-class'
    render(<BlogSearch className={customClass} />)
    const container = screen.getByRole('searchbox').parentElement
    expect(container).toHaveClass(customClass)
  })

  it('updates URL with search query', async () => {
    render(<BlogSearch />)
    const searchInput = screen.getByRole('searchbox')
    
    await userEvent.type(searchInput, 'test query')
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining('q=test+query')
      )
    })
  })

  it('clears search when input is empty', async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('q=test')
    )

    render(<BlogSearch />)
    const searchInput = screen.getByRole('searchbox')
    
    await userEvent.clear(searchInput)
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.not.stringContaining('q=')
      )
    })
  })

  it('debounces search input', async () => {
    jest.useFakeTimers()
    render(<BlogSearch />)
    const searchInput = screen.getByRole('searchbox')
    
    await userEvent.type(searchInput, 'test')
    expect(mockRouter.replace).not.toHaveBeenCalled()
    
    jest.advanceTimersByTime(300)
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalled()
    })
    
    jest.useRealTimers()
  })

  it('initializes with search param value', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('q=initial')
    )

    render(<BlogSearch />)
    const searchInput = screen.getByRole('searchbox')
    expect(searchInput).toHaveValue('initial')
  })

  it('handles keyboard navigation', async () => {
    render(<BlogSearch />)
    const searchInput = screen.getByRole('searchbox')
    
    await userEvent.type(searchInput, 'test')
    await userEvent.keyboard('{Enter}')
    
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining('q=test')
    )
  })
}) 