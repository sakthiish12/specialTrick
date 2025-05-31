import { OpenAI } from 'openai'
import { comprehensiveSearch } from './similarity-search'
import type { SearchResult } from './similarity-search'
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-tests',
})

// Define available tools/functions
const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getGitHubStats',
      description: 'Get GitHub statistics for a repository',
      parameters: {
        type: 'object',
        properties: {
          repo: {
            type: 'string',
            description: 'The repository name (e.g., "portfolio-g8")'
          }
        },
        required: ['repo']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'searchBlog',
      description: 'Search blog posts by tag',
      parameters: {
        type: 'object',
        properties: {
          tag: {
            type: 'string',
            description: 'The tag to search for'
          }
        },
        required: ['tag']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'createIssue',
      description: 'Create a GitHub issue',
      parameters: {
        type: 'object',
        properties: {
          repo: {
            type: 'string',
            description: 'The repository name'
          },
          title: {
            type: 'string',
            description: 'The issue title'
          },
          body: {
            type: 'string',
            description: 'The issue body'
          }
        },
        required: ['repo', 'title', 'body']
      }
    }
  }
]

// Tool implementations
async function getGitHubStats(repo: string) {
  // TODO: Implement GitHub API call
  return {
    stars: 0,
    forks: 0,
    issues: 0,
    lastUpdated: new Date().toISOString()
  }
}

async function searchBlog(tag: string) {
  const results = await comprehensiveSearch(tag, { type: 'blog' })
  return results.blog
}

async function createIssue(repo: string, title: string, body: string) {
  // TODO: Implement GitHub API call
  return {
    number: 1,
    url: `https://github.com/sakthiish12/${repo}/issues/1`
  }
}

type ToolImplementation = {
  getGitHubStats: typeof getGitHubStats
  searchBlog: typeof searchBlog
  createIssue: typeof createIssue
}

// Map of tool names to their implementations
const toolImplementations: ToolImplementation = {
  getGitHubStats,
  searchBlog,
  createIssue
}

type ToolName = 'getGitHubStats' | 'searchBlog' | 'createIssue'
type ToolCall = {
  name: ToolName
  arguments: Record<string, any>
}

/**
 * Process a user query with smart prompting and tool calling
 */
export async function processQuery(
  query: string,
  context: SearchResult[] = []
): Promise<{
  response: string
  toolCalls: ToolCall[]
}> {
  // Prepare the conversation with context
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are an AI assistant with access to various tools. Use them when appropriate to help answer user queries.
Available tools:
${tools.map(tool => `- ${tool.function.name}: ${tool.function.description}`).join('\n')}`
    },
    ...context.map(result => ({
      role: 'system' as const,
      content: `Relevant context:\n${result.content}`
    })),
    {
      role: 'user',
      content: query
    }
  ]

  // Get AI response with potential tool calls
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    tools,
    tool_choice: 'auto'
  })

  const message = response.choices[0].message
  const toolCalls: ToolCall[] = []

  // Process tool calls if any
  if (message.tool_calls) {
    for (const toolCall of message.tool_calls) {
      const toolName = toolCall.function.name as ToolName
      const args = JSON.parse(toolCall.function.arguments)

      // Execute the tool
      let result
      switch (toolName) {
        case 'getGitHubStats':
          result = await toolImplementations.getGitHubStats(args.repo)
          break
        case 'searchBlog':
          result = await toolImplementations.searchBlog(args.tag)
          break
        case 'createIssue':
          result = await toolImplementations.createIssue(args.repo, args.title, args.body)
          break
      }

      // Add tool call to history
      toolCalls.push({
        name: toolName,
        arguments: args
      })

      // Add tool result to conversation
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result)
      })
    }

    // Get final response with tool results
    const finalResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: message.content || '',
          tool_calls: message.tool_calls
        }
      ]
    })

    return {
      response: finalResponse.choices[0].message.content || '',
      toolCalls
    }
  }

  return {
    response: message.content || '',
    toolCalls
  }
}

/**
 * Get a smart prompt based on user query and context
 */
export async function getSmartPrompt(
  query: string,
  context: SearchResult[] = []
): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: 'You are a prompt engineering expert. Generate an optimized prompt based on the user query and context.'
    },
    ...context.map(result => ({
      role: 'system' as const,
      content: `Context:\n${result.content}`
    })),
    {
      role: 'user',
      content: query
    }
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages
  })

  return response.choices[0].message.content || query
} 