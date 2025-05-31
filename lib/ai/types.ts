export interface DocumentMetadata {
  type: 'blog' | 'project' | 'tutorial' | 'documentation'
  tags: string[]
  source: string
  path: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface DocumentChunk {
  content: string
  metadata: DocumentMetadata & {
    chunk_index: number
    total_chunks: number
  }
}

export interface SearchResult {
  content: string
  metadata: DocumentMetadata
  score: number
} 