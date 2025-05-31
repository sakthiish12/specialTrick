import { type ChatCompletionMessage } from 'openai/resources/chat'

export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public fallbackResponse: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export const ERROR_CODES = {
  API_ERROR: 'API_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  INVALID_REQUEST: 'INVALID_REQUEST',
  CONTEXT_TOO_LONG: 'CONTEXT_TOO_LONG',
  FUNCTION_CALL_FAILED: 'FUNCTION_CALL_FAILED',
  SESSION_ERROR: 'SESSION_ERROR',
  EMBEDDING_ERROR: 'EMBEDDING_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

export const FALLBACK_RESPONSES = {
  [ERROR_CODES.API_ERROR]: "I'm having trouble connecting to my brain right now. Please try again in a moment.",
  [ERROR_CODES.RATE_LIMIT]: "I'm getting a lot of requests right now. Please wait a moment before trying again.",
  [ERROR_CODES.INVALID_REQUEST]: "I didn't quite understand that. Could you rephrase your question?",
  [ERROR_CODES.CONTEXT_TOO_LONG]: "That's a bit too complex for me to process right now. Could you break it down into smaller parts?",
  [ERROR_CODES.FUNCTION_CALL_FAILED]: "I tried to perform that action but encountered an issue. Please try again or ask something else.",
  [ERROR_CODES.SESSION_ERROR]: "I lost track of our conversation. Let's start fresh!",
  [ERROR_CODES.EMBEDDING_ERROR]: "I'm having trouble understanding the context. Could you try asking that differently?",
  [ERROR_CODES.NETWORK_ERROR]: "I'm having trouble connecting to the internet. Please check your connection and try again.",
  [ERROR_CODES.UNKNOWN_ERROR]: "Something unexpected happened. Please try again or ask something else."
} as const

export function handleAIError(error: unknown): AIError {
  if (error instanceof AIError) {
    return error
  }

  // Handle OpenAI API errors
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status
    if (status === 429) {
      return new AIError(
        'Rate limit exceeded',
        ERROR_CODES.RATE_LIMIT,
        FALLBACK_RESPONSES[ERROR_CODES.RATE_LIMIT],
        error
      )
    }
    if (status === 400) {
      return new AIError(
        'Invalid request',
        ERROR_CODES.INVALID_REQUEST,
        FALLBACK_RESPONSES[ERROR_CODES.INVALID_REQUEST],
        error
      )
    }
    if (status === 413) {
      return new AIError(
        'Context too long',
        ERROR_CODES.CONTEXT_TOO_LONG,
        FALLBACK_RESPONSES[ERROR_CODES.CONTEXT_TOO_LONG],
        error
      )
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AIError(
      'Network error',
      ERROR_CODES.NETWORK_ERROR,
      FALLBACK_RESPONSES[ERROR_CODES.NETWORK_ERROR],
      error
    )
  }

  // Default to unknown error
  return new AIError(
    'Unknown error occurred',
    ERROR_CODES.UNKNOWN_ERROR,
    FALLBACK_RESPONSES[ERROR_CODES.UNKNOWN_ERROR],
    error
  )
}

export function createErrorMessage(error: AIError): ChatCompletionMessage {
  return {
    role: 'assistant',
    content: error.fallbackResponse,
    refusal: null
  }
}

export function isRetryableError(error: AIError): boolean {
  const retryableCodes = [
    ERROR_CODES.API_ERROR,
    ERROR_CODES.RATE_LIMIT,
    ERROR_CODES.NETWORK_ERROR
  ] as const
  return retryableCodes.includes(error.code as typeof retryableCodes[number])
}

export function getRetryDelay(error: AIError): number {
  switch (error.code) {
    case ERROR_CODES.RATE_LIMIT:
      return 5000 // 5 seconds
    case ERROR_CODES.NETWORK_ERROR:
      return 2000 // 2 seconds
    default:
      return 1000 // 1 second
  }
} 