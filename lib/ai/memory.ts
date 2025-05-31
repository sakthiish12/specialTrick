import { supabaseAdmin } from '../supabase/server'
import type { Database } from '../supabase/types'

export interface UserPreferences {
  interests: string[]
  preferredTopics: string[]
  language: string
  lastInteraction: string
  conversationStyle: 'technical' | 'casual' | 'detailed'
}

export interface ConversationMemory {
  sessionId: string
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: string
  }>
  context: Array<{
    type: 'blog' | 'project' | 'tutorial'
    path: string
    relevance: number
  }>
}

const DEFAULT_PREFERENCES: UserPreferences = {
  interests: [],
  preferredTopics: [],
  language: 'en',
  lastInteraction: new Date().toISOString(),
  conversationStyle: 'technical'
}

/**
 * Get or create user preferences
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const { data, error } = await supabaseAdmin
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    // Create default preferences if none exist
    const { error: insertError } = await supabaseAdmin
      .from('user_preferences')
      .insert({
        user_id: userId,
        preferences: DEFAULT_PREFERENCES
      })

    if (insertError) {
      throw new Error(`Failed to create user preferences: ${insertError.message}`)
    }

    return DEFAULT_PREFERENCES
  }

  return data.preferences as UserPreferences
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  updates: Partial<UserPreferences>
): Promise<UserPreferences> {
  const currentPrefs = await getUserPreferences(userId)
  const updatedPrefs = {
    ...currentPrefs,
    ...updates,
    lastInteraction: new Date().toISOString()
  }

  const { error } = await supabaseAdmin
    .from('user_preferences')
    .update({ preferences: updatedPrefs })
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to update user preferences: ${error.message}`)
  }

  return updatedPrefs
}

/**
 * Get conversation memory for a session
 */
export async function getConversationMemory(
  sessionId: string
): Promise<ConversationMemory | null> {
  const { data, error } = await supabaseAdmin
    .from('conversation_memory')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (error || !data) {
    return null
  }

  return data.memory as ConversationMemory
}

/**
 * Update conversation memory
 */
export async function updateConversationMemory(
  sessionId: string,
  updates: Partial<ConversationMemory>
): Promise<ConversationMemory> {
  const currentMemory = await getConversationMemory(sessionId)
  const updatedMemory = currentMemory
    ? {
        ...currentMemory,
        ...updates,
        messages: [
          ...currentMemory.messages,
          ...(updates.messages || [])
        ],
        context: [
          ...currentMemory.context,
          ...(updates.context || [])
        ]
      }
    : {
        sessionId,
        messages: updates.messages || [],
        context: updates.context || []
      }

  const { error } = await supabaseAdmin
    .from('conversation_memory')
    .upsert({
      session_id: sessionId,
      memory: updatedMemory,
      updated_at: new Date().toISOString()
    })

  if (error) {
    throw new Error(`Failed to update conversation memory: ${error.message}`)
  }

  return updatedMemory
}

/**
 * Add a message to conversation memory
 */
export async function addMessageToMemory(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<void> {
  const message = {
    role,
    content,
    timestamp: new Date().toISOString()
  }

  await updateConversationMemory(sessionId, {
    messages: [message]
  })
}

/**
 * Add context to conversation memory
 */
export async function addContextToMemory(
  sessionId: string,
  type: 'blog' | 'project' | 'tutorial',
  path: string,
  relevance: number
): Promise<void> {
  const context = {
    type,
    path,
    relevance
  }

  await updateConversationMemory(sessionId, {
    context: [context]
  })
}

/**
 * Get personalized greeting based on user preferences
 */
export function getPersonalizedGreeting(preferences: UserPreferences): string {
  const timeOfDay = new Date().getHours()
  let greeting = ''

  if (timeOfDay < 12) {
    greeting = 'Good morning'
  } else if (timeOfDay < 18) {
    greeting = 'Good afternoon'
  } else {
    greeting = 'Good evening'
  }

  const style = preferences.conversationStyle
  const interests = preferences.interests.length > 0
    ? ` I see you're interested in ${preferences.interests.join(', ')}.`
    : ''

  switch (style) {
    case 'technical':
      return `${greeting}. How can I assist you with your technical needs today?${interests}`
    case 'casual':
      return `${greeting}! What can I help you with?${interests}`
    case 'detailed':
      return `${greeting}. I'm here to provide detailed assistance.${interests} What would you like to explore?`
    default:
      return `${greeting}. How can I help you today?${interests}`
  }
} 