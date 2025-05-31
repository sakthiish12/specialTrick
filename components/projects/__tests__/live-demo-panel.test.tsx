import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LiveDemoPanel } from '../live-demo-panel'
import userEvent from '@testing-library/user-event'

const mockProject = {
  name: 'Test Project',
  description: 'A test project for demonstration',
  demoUrl: 'https://demo.example.com',
  githubUrl: 'https://github.com/example/test-project',
  technologies: ['React', 'TypeScript', 'Tailwind CSS']
}

describe('LiveDemoPanel', () => {
  it('renders the panel with project information', () => {
    render(<LiveDemoPanel project={mockProject} />)
    
    expect(screen.getByText('Try Test Project Live')).toBeInTheDocument()
    expect(screen.getByText('A test project for demonstration')).toBeInTheDocument()
    
    // Check tab triggers
    expect(screen.getByRole('tab', { name: 'Live Demo' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Source Code' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Setup Guide' })).toBeInTheDocument()
  })

  it('displays technologies in the demo tab', () => {
    render(<LiveDemoPanel project={mockProject} />)
    
    mockProject.technologies.forEach(tech => {
      expect(screen.getByText(tech)).toBeInTheDocument()
    })
  })

  it('switches between tabs', async () => {
    render(<LiveDemoPanel project={mockProject} />)
    
    // Check initial tab content
    expect(screen.getByText('Technologies Used')).toBeInTheDocument()
    
    // Switch to Source Code tab
    await userEvent.click(screen.getByRole('tab', { name: 'Source Code' }))
    expect(screen.getByText('Project Structure')).toBeInTheDocument()
    
    // Switch to Setup Guide tab
    await userEvent.click(screen.getByRole('tab', { name: 'Setup Guide' }))
    expect(screen.getByText('Quick Start')).toBeInTheDocument()
  })

  it('shows loading state when running demo', async () => {
    render(<LiveDemoPanel project={mockProject} />)
    
    const runButton = screen.getByRole('button', { name: /run live demo/i })
    await userEvent.click(runButton)
    
    expect(screen.getByText('Loading Demo...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('opens demo URL in new tab after loading', async () => {
    const originalOpen = window.open
    window.open = jest.fn()
    
    render(<LiveDemoPanel project={mockProject} />)
    const runButton = screen.getByRole('button', { name: /run live demo/i })
    await userEvent.click(runButton)
    
    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(mockProject.demoUrl, '_blank')
    })
    
    window.open = originalOpen
  })

  it('opens GitHub URL when clicking View on GitHub', async () => {
    const originalOpen = window.open
    window.open = jest.fn()
    
    render(<LiveDemoPanel project={mockProject} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Source Code' }))
    const githubButton = screen.getByRole('button', { name: /view on github/i })
    await userEvent.click(githubButton)
    
    expect(window.open).toHaveBeenCalledWith(mockProject.githubUrl, '_blank')
    
    window.open = originalOpen
  })

  it('applies custom className', () => {
    const customClass = 'custom-class'
    render(<LiveDemoPanel project={mockProject} className={customClass} />)
    const container = screen.getByRole('article')
    expect(container).toHaveClass(customClass)
  })

  it('handles error state when running demo', async () => {
    const originalConsoleError = console.error
    console.error = jest.fn()
    
    // Mock window.open to throw an error
    const originalOpen = window.open
    window.open = jest.fn().mockImplementationOnce(() => {
      throw new Error('Failed to open URL')
    })
    
    render(<LiveDemoPanel project={mockProject} />)
    const runButton = screen.getByRole('button', { name: /run live demo/i })
    await userEvent.click(runButton)
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled()
    })
    
    // Cleanup
    console.error = originalConsoleError
    window.open = originalOpen
  })
}) 