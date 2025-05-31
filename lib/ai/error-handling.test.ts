import { AIError, ERROR_CODES, handleAIError, createErrorMessage, isRetryableError, getRetryDelay } from './error-handling'

describe('Error Handling', () => {
  describe('AIError', () => {
    it('creates an error with the correct properties', () => {
      const error = new AIError('Test error', ERROR_CODES.API_ERROR, 'Test fallback')
      expect(error.message).toBe('Test error')
      expect(error.code).toBe(ERROR_CODES.API_ERROR)
      expect(error.fallbackResponse).toBe('Test fallback')
      expect(error.name).toBe('AIError')
    })
  })

  describe('handleAIError', () => {
    it('returns the same error if it is already an AIError', () => {
      const originalError = new AIError('Test', ERROR_CODES.API_ERROR, 'Test fallback')
      const result = handleAIError(originalError)
      expect(result).toBe(originalError)
    })

    it('handles rate limit errors', () => {
      const error = { status: 429 }
      const result = handleAIError(error)
      expect(result.code).toBe(ERROR_CODES.RATE_LIMIT)
      expect(result.fallbackResponse).toBeTruthy()
    })

    it('handles invalid request errors', () => {
      const error = { status: 400 }
      const result = handleAIError(error)
      expect(result.code).toBe(ERROR_CODES.INVALID_REQUEST)
      expect(result.fallbackResponse).toBeTruthy()
    })

    it('handles context too long errors', () => {
      const error = { status: 413 }
      const result = handleAIError(error)
      expect(result.code).toBe(ERROR_CODES.CONTEXT_TOO_LONG)
      expect(result.fallbackResponse).toBeTruthy()
    })

    it('handles network errors', () => {
      const error = new TypeError('Failed to fetch')
      const result = handleAIError(error)
      expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR)
      expect(result.fallbackResponse).toBeTruthy()
    })

    it('handles unknown errors', () => {
      const error = new Error('Unknown error')
      const result = handleAIError(error)
      expect(result.code).toBe(ERROR_CODES.UNKNOWN_ERROR)
      expect(result.fallbackResponse).toBeTruthy()
    })
  })

  describe('createErrorMessage', () => {
    it('creates a message with the error fallback response', () => {
      const error = new AIError('Test', ERROR_CODES.API_ERROR, 'Test fallback')
      const message = createErrorMessage(error)
      expect(message.role).toBe('assistant')
      expect(message.content).toBe('Test fallback')
      expect(message.refusal).toBeNull()
    })
  })

  describe('isRetryableError', () => {
    it('returns true for retryable errors', () => {
      const retryableErrors = [
        new AIError('Test', ERROR_CODES.API_ERROR, 'Test'),
        new AIError('Test', ERROR_CODES.RATE_LIMIT, 'Test'),
        new AIError('Test', ERROR_CODES.NETWORK_ERROR, 'Test')
      ]
      retryableErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(true)
      })
    })

    it('returns false for non-retryable errors', () => {
      const nonRetryableErrors = [
        new AIError('Test', ERROR_CODES.INVALID_REQUEST, 'Test'),
        new AIError('Test', ERROR_CODES.CONTEXT_TOO_LONG, 'Test'),
        new AIError('Test', ERROR_CODES.FUNCTION_CALL_FAILED, 'Test'),
        new AIError('Test', ERROR_CODES.SESSION_ERROR, 'Test'),
        new AIError('Test', ERROR_CODES.EMBEDDING_ERROR, 'Test'),
        new AIError('Test', ERROR_CODES.UNKNOWN_ERROR, 'Test')
      ]
      nonRetryableErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(false)
      })
    })
  })

  describe('getRetryDelay', () => {
    it('returns correct delay for rate limit errors', () => {
      const error = new AIError('Test', ERROR_CODES.RATE_LIMIT, 'Test')
      expect(getRetryDelay(error)).toBe(5000)
    })

    it('returns correct delay for network errors', () => {
      const error = new AIError('Test', ERROR_CODES.NETWORK_ERROR, 'Test')
      expect(getRetryDelay(error)).toBe(2000)
    })

    it('returns default delay for other errors', () => {
      const error = new AIError('Test', ERROR_CODES.API_ERROR, 'Test')
      expect(getRetryDelay(error)).toBe(1000)
    })
  })
}) 