import { OpenAI } from 'openai'
import { getRepositoryDetails } from '@/lib/github/api'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface ProjectOverview {
  summary: string
  keyFeatures: string[]
  technologies: string[]
  architecture: string
  setupInstructions: string
}

export async function generateProjectOverview(
  username: string,
  repoName: string
): Promise<ProjectOverview | null> {
  try {
    // Fetch repository details including README and code
    const repo = await getRepositoryDetails(username, repoName)
    if (!repo) return null

    // Extract code comments from main files
    const codeComments = await extractCodeComments(repo)
    
    // Prepare context for AI
    const context = `
      Repository: ${repo.name}
      Description: ${repo.description || 'No description provided'}
      README: ${repo.readme}
      Code Comments: ${codeComments.join('\n')}
      Languages: ${Object.keys(repo.languages).join(', ')}
      Topics: ${repo.topics.join(', ')}
    `

    // Generate overview using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert software developer. Analyze the following repository information and generate a comprehensive project overview. Focus on:
            1. A concise summary of the project's purpose and main functionality
            2. Key features and capabilities
            3. Technologies and frameworks used
            4. High-level architecture overview
            5. Setup and installation instructions
            
            Format the response as a JSON object with the following structure:
            {
              "summary": "Brief project summary",
              "keyFeatures": ["Feature 1", "Feature 2", ...],
              "technologies": ["Tech 1", "Tech 2", ...],
              "architecture": "Architecture overview",
              "setupInstructions": "Setup steps"
            }`
        },
        {
          role: 'user',
          content: context
        }
      ],
      response_format: { type: 'json_object' }
    })

    const overview = JSON.parse(completion.choices[0].message.content) as ProjectOverview
    return overview
  } catch (error) {
    console.error('Error generating project overview:', error)
    return null
  }
}

async function extractCodeComments(repo: any): Promise<string[]> {
  const comments: string[] = []
  
  // Extract comments from README
  if (repo.readme && typeof repo.readme === 'string') {
    const readmeComments = repo.readme
      .split('\n')
      .filter((line: string) => line.startsWith('//') || line.startsWith('/*') || line.startsWith('#'))
    comments.push(...readmeComments)
  }

  // TODO: Add code comment extraction from main source files
  // This would require fetching and parsing the actual source code files
  // For now, we'll rely on README and repository metadata

  return comments
}

export async function updateProjectOverview(
  username: string,
  repoName: string
): Promise<void> {
  try {
    const overview = await generateProjectOverview(username, repoName)
    if (!overview) return

    // TODO: Store the generated overview in the database
    // This would be implemented when we add database integration
    console.log('Generated project overview:', overview)
  } catch (error) {
    console.error('Error updating project overview:', error)
  }
} 