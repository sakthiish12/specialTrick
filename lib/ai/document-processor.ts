import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'
import { generateEmbedding, storeDocument, batchStoreDocuments } from './embeddings'
import { type DocumentMetadata } from './types'

// Constants
const MAX_CHUNK_SIZE = 1000 // Max characters per chunk for embedding
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.md'] // Supported file types
const CHUNK_SIZE = 1000; // Characters per chunk
const CHUNK_OVERLAP = 200; // Characters of overlap between chunks

// Define DocumentChunk interface here since we removed the import
interface DocumentChunk {
  content: string;
  metadata?: Record<string, any>;
}

// Implementation of chunkText function that was previously imported
function chunkText(text: string, size: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): DocumentChunk[] {
  if (!text || text.length === 0) {
    return [];
  }
  
  const chunks: DocumentChunk[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push({
      content: text.slice(start, end),
    });
    start = end - overlap;
    if (start >= text.length) break;
  }
  
  return chunks;
}

export type DocumentType = DocumentMetadata['type']

export interface ProcessedDocument {
  content: string
  metadata: DocumentMetadata
}

/**
 * Extracts metadata from a file path and repository name.
 * @param relativeFilePath Path to the file relative to the repository root.
 * @param repositoryName Name of the repository (used as project identifier).
 * @param fileContent (Optional) Content of the file, can be used for more advanced metadata extraction.
 * @returns DocumentMetadata object.
 */
export function getDocumentMetadata(
  content: string,
  source: string,
  type: DocumentType
): DocumentMetadata {
  // Extract frontmatter if present (for blog posts)
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : ''
  
  // Extract tags from frontmatter or default to empty array
  const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/)
  const tags = tagsMatch 
    ? tagsMatch[1].split(',').map(tag => tag.trim())
    : []

  // Extract title from frontmatter or use source
  const titleMatch = frontmatter.match(/title:\s*(.*)/)
  const title = titleMatch ? titleMatch[1].trim() : source

  return {
    type,
    tags,
    source,
    path: source,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Reads and processes a single file for embedding.
export function getDocumentMetadata(relativeFilePath: string, repositoryName: string, fileContent?: string): DocumentMetadata {
  const extension = path.extname(relativeFilePath).toLowerCase()
  const fileName = path.basename(relativeFilePath)

  let documentType: DocumentMetadata['type'] = 'code' // Default to code
  if (relativeFilePath.replace(/\\/g, '/').startsWith('posts/')) {
    documentType = 'blog'
  } else if (fileName.toLowerCase().includes('readme')) {
    documentType = 'readme'
  } else if (relativeFilePath.toLowerCase().includes('docs/') || relativeFilePath.toLowerCase().includes('documentation/')) {
    documentType = 'documentation'
  } else if (extension === '.md') {
    documentType = 'documentation'
  }

  // Extract tags from frontmatter for blog posts
  let tags: string[] | undefined
  if (documentType === 'blog' && fileContent) {
    const fmMatch = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (fmMatch) {
      const frontmatter = fmMatch[1]
      const tagLineMatch = frontmatter.match(/^tags:\s*\[([^\]]+)\]/m)
      if (tagLineMatch) {
        try {
          tags = tagLineMatch[1]
            .split(',')
            .map(tag => tag.trim().replace(/^['"]|['"]$/g, ''))
        } catch {
          // ignore parse errors
        }
      }
    }
  }

  return {
    type: documentType,
    project: repositoryName,
    file_path: relativeFilePath,
    title: fileName,
    tags,
    language: extension.substring(1) || undefined,
  } as DocumentMetadata
}

/**
 * Reads and processes a single file for embedding.
 * @param filePath Absolute path to the file.
 * @param project (Optional) Project identifier.
 * @returns Promise<void>
 */
export async function processFileForEmbeddings(filePath: string, project?: string): Promise<void> {
  try {
    console.log(`Processing file: ${filePath}`)
    const content = await fs.readFile(filePath, 'utf-8')
    const extension = path.extname(filePath).toLowerCase()
    const fileName = path.basename(filePath)

    let documentType: DocumentMetadata['type'] = 'documentation' // Default to documentation
    if (fileName.toLowerCase().includes('readme')) {
      documentType = 'documentation'
    }
    // Add more sophisticated type detection if needed (e.g., for tutorials)

    const chunks = chunkText(content)

    const documentsToStore = chunks.map((chunk, index) => ({
      content: chunk.content,
      metadata: {
        type: documentType,
        tags: [],
        source: filePath,
        path: filePath,
        title: `${fileName} (chunk ${index + 1})`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as DocumentMetadata,
    }))

    await batchStoreDocuments(documentsToStore)
    console.log(`Successfully processed and stored ${chunks.length} chunks for ${fileName}`)
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error)
    // Decide on error handling: skip file, retry, etc.
  }
}

/**
 * Processes all supported files in a directory for embeddings.
 * @param directoryPath Absolute path to the directory.
 * @param project (Optional) Project identifier.
 * @returns Promise<void>
 */
export async function processDirectoryForEmbeddings(directoryPath: string, project?: string): Promise<void> {
  console.log(`Starting to process directory: ${directoryPath}`)
  try {
    const files = await glob(`**/*{${CODE_EXTENSIONS.join(',')}}`, {
      cwd: directoryPath,
      nodir: true,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**'], // Paths to ignore
      absolute: true,
    })

    console.log(`Found ${files.length} files to process.`)

    for (const file of files) {
      await processFileForEmbeddings(file, project)
    }
    console.log(`Finished processing directory: ${directoryPath}`)
  } catch (error) {
    console.error(`Error processing directory ${directoryPath}:`, error)
  }
}

/**
 * Splits a large paragraph into manageable chunks based on sentence boundaries if possible.
 * @param paragraph The large paragraph to split.
 * @param maxSize The maximum size for each chunk.
 * @returns Array of text chunks.
 */
function splitLargeParagraph(paragraph: string, maxSize: number): string[] {
    const chunks: string[] = [];
    // Try splitting by sentences first
    const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [];
    let currentChunk = '';

    if (sentences.length > 1) { // If there are multiple sentences
        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > maxSize) {
                if (currentChunk.length > 0) chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += sentence;
            }
        }
        if (currentChunk.length > 0) chunks.push(currentChunk.trim());
    } else {
        // If it's one long sentence or sentence splitting isn't effective, split by character count
        for (let i = 0; i < paragraph.length; i += maxSize) {
            chunks.push(paragraph.substring(i, i + maxSize));
        }
    }
    return chunks.filter(chunk => chunk.length > 0);
}

export function processDocument(
  content: string,
  source: string,
  type: DocumentType
): ProcessedDocument[] {
  const metadata = getDocumentMetadata(content, source, type)
  const chunks = chunkText(content)

  return chunks.map(chunk => ({
    content: chunk.content,
    metadata
  }))
}

export function getDocumentType(source: string): DocumentType {
  if (source.startsWith('posts/')) return 'blog'
  if (source.includes('README.md')) return 'documentation'
  if (source.includes('tutorial')) return 'tutorial'
  return 'project'
}

export function getRelevantTags(type: DocumentType, content: string): string[] {
  const tags = new Set<string>()

  // Add type-specific tags
  tags.add(type)

  // Add language-specific tags based on file extension
  if (content.includes('.ts') || content.includes('.tsx')) {
    tags.add('typescript')
  }
  if (content.includes('.js') || content.includes('.jsx')) {
    tags.add('javascript')
  }
  if (content.includes('.mdx')) {
    tags.add('mdx')
  }

  // Add framework-specific tags
  if (content.includes('next.config')) {
    tags.add('nextjs')
  }
  if (content.includes('package.json')) {
    tags.add('nodejs')
  }

  return Array.from(tags)
}

// Example usage (for a script or CLI tool)
/*
async function main() {
  // Ensure OPENAI_API_KEY and Supabase env vars are set
  if (!process.env.OPENAI_API_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Missing required environment variables for OpenAI or Supabase.')
    process.exit(1)
  }
  // Example: Process a specific project directory
  const projectPath = path.resolve(__dirname, '../../../../some-project-path') // Adjust path as needed
  await processDirectoryForEmbeddings(projectPath, 'MyProjectName')

  // Example: Process a single file
  // const filePath = path.resolve(__dirname, '../../../../some-project-path/file.md');
  // await processFileForEmbeddings(filePath, 'MyProjectName');
}

if (require.main === module) {
  main().catch(console.error)
}
*/ 