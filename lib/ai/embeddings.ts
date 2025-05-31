import { OpenAI } from 'openai'
import { supabaseAdmin } from '../supabase/server'
import { Database } from '../supabase/types'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-tests',
})

export interface DocumentChunk {
  content: string
  metadata: {
    type: 'blog' | 'project' | 'tutorial' | 'documentation'
    path: string
    [key: string]: any
  }
}

// Generate embeddings for text content
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return response.data[0].embedding
}

// Store document with embeddings in vector database
export async function storeDocument(chunk: DocumentChunk): Promise<void> {
  const embedding = await generateEmbedding(chunk.content)

  const { error } = await supabaseAdmin
    .from('documents')
    .insert({
      content: chunk.content,
      metadata: chunk.metadata,
      embedding,
      path: chunk.metadata.path,
      type: chunk.metadata.type,
    })

  if (error) {
    throw new Error(`Failed to store document: ${error.message}`)
  }
}

// Search for similar documents using vector similarity
export async function searchDocuments(
  query: string,
  options: {
    matchCount?: number
    matchThreshold?: number
    type?: 'blog' | 'project' | 'tutorial'
  } = {}
): Promise<Database['public']['Functions']['match_documents']['Returns']> {
  const { matchCount = 5, matchThreshold = 0.7, type } = options

  const queryEmbedding = await generateEmbedding(query)

  const { data, error } = await supabaseAdmin.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    match_threshold: matchThreshold,
  })

  if (error) {
    throw new Error(`Failed to search documents: ${error.message}`)
  }

  // Filter by type if specified
  if (type) {
    return data.filter((doc: { metadata: { type: string } }) => doc.metadata.type === type)
  }

  return data
}

// Update existing document embeddings
export async function updateDocumentEmbedding(
  path: string,
  content: string
): Promise<void> {
  const embedding = await generateEmbedding(content)

  const { error } = await supabaseAdmin
    .from('documents')
    .update({ embedding, content })
    .eq('path', path)

  if (error) {
    throw new Error(`Failed to update document embedding: ${error.message}`)
  }
}

// Delete document from vector database
export async function deleteDocumentByPath(path: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('documents')
    .delete()
    .eq('path', path)

  if (error) {
    throw new Error(`Failed to delete document: ${error.message}`)
  }
}

// Define a type for the return value of storeDocument
type VectorDocument = any; // Using 'any' as a temporary solution

// Import DocumentMetadata type from our own module to avoid circular dependencies
type DocumentMetadata = DocumentChunk['metadata'];

// Batch process multiple documents
export async function batchStoreDocuments(
  documents: Array<{ content: string; metadata: DocumentMetadata }>
): Promise<VectorDocument[]> {
  try {
    const results = await Promise.all(
      documents.map(doc => storeDocument({ content: doc.content, metadata: doc.metadata }))
    )

    return results
  } catch (error) {
    console.error('Error in batch storage:', error)
    throw new Error('Failed to batch store documents')
  }
} 