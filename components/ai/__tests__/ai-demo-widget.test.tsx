import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AIDemoWidget } from '../ai-demo-widget'
import userEvent from '@testing-library/user-event'

describe('AIDemoWidget', () => {
  it('renders the widget with all tabs', () => {
    render(<AIDemoWidget />)
    
    expect(screen.getByText('AI Assistant Demo')).toBeInTheDocument()
    expect(screen.getByText('Try out the AI assistant with these example prompts')).toBeInTheDocument()
    
    // Check tab triggers
    expect(screen.getByRole('tab', { name: 'Code Analysis' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Documentation' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Debugging' })).toBeInTheDocument()
  })

  it('switches between tabs', async () => {
    render(<AIDemoWidget />)
    
    // Check initial tab content
    expect(screen.getByText('Example Code')).toBeInTheDocument()
    
    // Switch to Documentation tab
    await userEvent.click(screen.getByRole('tab', { name: 'Documentation' }))
    expect(screen.getByText('Example Function')).toBeInTheDocument()
    
    // Switch to Debugging tab
    await userEvent.click(screen.getByRole('tab', { name: 'Debugging' }))
    expect(screen.getByText('Example Error')).toBeInTheDocument()
  })

  it('shows loading state when analyzing code', async () => {
    render(<AIDemoWidget />)
    
    const analyzeButton = screen.getByRole('button', { name: /analyze code/i })
    await userEvent.click(analyzeButton)
    
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows AI response after analysis', async () => {
    render(<AIDemoWidget />)
    
    const analyzeButton = screen.getByRole('button', { name: /analyze code/i })
    await userEvent.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('AI Response')).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    const customClass = 'custom-class'
    render(<AIDemoWidget className={customClass} />)
    const container = screen.getByRole('article')
    expect(container).toHaveClass(customClass)
  })

  it('handles error state', async () => {
    // Mock console.error to prevent error output in tests
    const originalConsoleError = console.error
    console.error = jest.fn()
    
    // Mock the setTimeout to throw an error
    jest.useFakeTimers()
    const mockError = new Error('API Error')
    jest.spyOn(global, 'setTimeout').mockImplementationOnce(() => {
      throw mockError
    })
    
    render(<AIDemoWidget />)
    const analyzeButton = screen.getByRole('button', { name: /analyze code/i })
    await userEvent.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText(/sorry, there was an error/i)).toBeInTheDocument()
    })
    
    // Cleanup
    console.error = originalConsoleError
    jest.useRealTimers()
  })
}) 