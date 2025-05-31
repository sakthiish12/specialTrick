import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { searchDocuments } from "@/lib/ai/embeddings"
import { Message } from "ai"

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json()

  // Get the last user message for context search
  const lastUserMessage = messages.findLast(msg => msg.role === "user")
  let contextText = ""

  if (lastUserMessage && lastUserMessage.content) {
    try {
      const searchResults = await searchDocuments(lastUserMessage.content.toString(), 3)
      if (searchResults && searchResults.length > 0) {
        contextText = searchResults
          .map(result => `Context: ${result.content} (Source: ${result.metadata.title || result.metadata.file_path})`)
          .join("\n\n")
        console.log("Similarity search context:", contextText)
      }
    } catch (error) {
      console.error("Error during similarity search:", error)
      // Proceed without context if search fails
    }
  }

  // Construct the system prompt with or without context
  const systemPrompt = `You are Sakthiish Prince's AI assistant on his portfolio website. You help visitors learn about Sakthiish's background, skills, and projects.

Key information about Sakthiish:
- Currently working at Deloitte as a Risk Advisory Consultant
- 6+ years of experience in cybersecurity, identity management, and AI
- Ex-startup founder and currently building TUNE - an AI fine-tuning platform for SMEs
- Expertise in: SailPoint IIQ, enterprise IAM, AI/ML, full-stack development
- Technologies: Python, Java, JavaScript, Next.js, Flutter, Neo4j, Docker
- Certifications: PSM I, Microsoft Identity Engineer, Neo4j Professional
- Projects: TUNE platform, Calorie Tracker AI App, Debt Repayment App, SailPoint automation tools

${contextText ? `Relevant Information from Documents:\n${contextText}\n\n` : ""}Be helpful, professional, and enthusiastic about Sakthiish's work. If asked about specific technical details not provided in the context or key information, suggest they contact Sakthiish directly or search his blog. Keep responses concise but informative. Prioritize information from the 'Relevant Information from Documents' section if available and relevant to the query.`

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
  })

  return result.toDataStreamResponse()
}
