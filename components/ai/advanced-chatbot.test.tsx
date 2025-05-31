import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdvancedChatbot } from './advanced-chatbot'
import { useSession } from 'next-auth/react'
import { SessionManager } from '@/lib/ai/session'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}))

// Mock fetch
global.fetch = jest.fn()

describe('AdvancedChatbot', () => {
  const mockSession = {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com'
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue({ data: mockSession })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: 'Test response' })
    })
  })

  it('renders the chatbot interface', () => {
    render(<AdvancedChatbot />)
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('displays a personalized greeting for new users', async () => {
    render(<AdvancedChatbot />)
    await waitFor(() => {
      expect(screen.getByText(/Hello/)).toBeInTheDocument()
    })
  })

  it('handles user message submission', async () => {
    render(<AdvancedChatbot />)
    const input = screen.getByPlaceholderText('Type your message...')
    const submitButton = screen.getByRole('button')

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })
  })

  it('displays loading state while processing', async () => {
    render(<AdvancedChatbot />)
    const input = screen.getByPlaceholderText('Type your message...')
    const submitButton = screen.getByRole('button')

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)

    expect(screen.getByRole('button')).toBeDisabled()
    await waitFor(() => {
      expect(screen.getByText('Test response')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))
    render(<AdvancedChatbot />)
    const input = screen.getByPlaceholderText('Type your message...')
    const submitButton = screen.getByRole('button')

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/I'm having trouble connecting to my brain right now/)).toBeInTheDocument()
    })
  })

  it('handles function calls', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: 'Test response',
          functionCall: {
            name: 'getGitHubStats',
            arguments: {}
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: 'Function result' })
      })

    render(<AdvancedChatbot />)
    const input = screen.getByPlaceholderText('Type your message...')
    const submitButton = screen.getByRole('button')

    fireEvent.change(input, { target: { value: 'Get GitHub stats' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Function result: {"result":"Function result"}')).toBeInTheDocument()
    })
  })

  it('maintains session state between messages', async () => {
    render(<AdvancedChatbot />)
    const input = screen.getByPlaceholderText('Type your message...')
    const submitButton = screen.getByRole('button')

    // Send first message
    fireEvent.change(input, { target: { value: 'First message' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument()
    })

    // Send second message
    fireEvent.change(input, { target: { value: 'Second message' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Second message')).toBeInTheDocument()
    })
  })

  it('disables input while processing', async () => {
    render(<AdvancedChatbot />)
    const input = screen.getByPlaceholderText('Type your message...')
    const submitButton = screen.getByRole('button')

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)

    expect(input).toBeDisabled()
    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(input).not.toBeDisabled()
      expect(submitButton).not.toBeDisabled()
    })
  })
}) 