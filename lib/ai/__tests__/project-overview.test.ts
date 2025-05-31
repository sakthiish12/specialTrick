import { generateProjectOverview, updateProjectOverview } from '../project-overview'
import { getRepositoryDetails } from '@/lib/github/api'

// Mock the GitHub API
jest.mock('@/lib/github/api', () => ({
  getRepositoryDetails: jest.fn()
}))

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }))
}))

describe('Project Overview Generation', () => {
  const mockRepo = {
    name: 'test-repo',
    description: 'A test repository',
    readme: '# Test Repository\n\nThis is a test repository with some comments.\n// This is a code comment\n/* Another comment */',
    languages: { TypeScript: 1000, JavaScript: 500 },
    topics: ['test', 'demo']
  }

  const mockOverview = {
    summary: 'A test repository for demonstration purposes',
    keyFeatures: ['Feature 1', 'Feature 2'],
    technologies: ['TypeScript', 'JavaScript'],
    architecture: 'Simple architecture overview',
    setupInstructions: 'npm install && npm start'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getRepositoryDetails as jest.Mock).mockResolvedValue(mockRepo)
    ;(require('openai').OpenAI as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: JSON.stringify(mockOverview) } }]
          })
        }
      }
    }))
  })

  describe('generateProjectOverview', () => {
    it('should generate a project overview from repository details', async () => {
      const overview = await generateProjectOverview('test-user', 'test-repo')
      
      expect(overview).toEqual(mockOverview)
      expect(getRepositoryDetails).toHaveBeenCalledWith('test-user', 'test-repo')
    })

    it('should return null if repository details cannot be fetched', async () => {
      ;(getRepositoryDetails as jest.Mock).mockResolvedValue(null)
      
      const overview = await generateProjectOverview('test-user', 'test-repo')
      
      expect(overview).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      ;(getRepositoryDetails as jest.Mock).mockRejectedValue(new Error('API Error'))
      
      const overview = await generateProjectOverview('test-user', 'test-repo')
      
      expect(overview).toBeNull()
    })
  })

  describe('updateProjectOverview', () => {
    it('should update project overview successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'log')
      
      await updateProjectOverview('test-user', 'test-repo')
      
      expect(consoleSpy).toHaveBeenCalledWith('Generated project overview:', mockOverview)
    })

    it('should handle errors during update', async () => {
      const consoleSpy = jest.spyOn(console, 'error')
      ;(getRepositoryDetails as jest.Mock).mockRejectedValue(new Error('API Error'))
      
      await updateProjectOverview('test-user', 'test-repo')
      
      expect(consoleSpy).toHaveBeenCalledWith('Error updating project overview:', expect.any(Error))
    })
  })
}) 