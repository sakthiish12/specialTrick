import { NextResponse } from 'next/server'
import path from 'path'
import { processDirectoryForEmbeddings, processFileForEmbeddings } from '@/lib/ai/document-processor'

export async function POST(request: Request) {
  try {
    const { type, targetPath, project } = await request.json()

    if (!type || !targetPath) {
      return NextResponse.json({ error: 'Missing type (directory/file) or targetPath' }, { status: 400 })
    }

    // Resolve the absolute path. Assuming the path provided is relative to the project root.
    const absoluteTargetPath = path.resolve(process.cwd(), targetPath)

    console.log(`API: Received request to process ${type}: ${absoluteTargetPath}`)

    if (type === 'directory') {
      await processDirectoryForEmbeddings(absoluteTargetPath, project)
      return NextResponse.json({ message: `Successfully started processing directory: ${targetPath}` }, { status: 200 })
    } else if (type === 'file') {
      await processFileForEmbeddings(absoluteTargetPath, project)
      return NextResponse.json({ message: `Successfully processed file: ${targetPath}` }, { status: 200 })
    } else {
      return NextResponse.json({ error: 'Invalid type. Must be \'directory\' or \'file\'.' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('API Error processing documents:', error)
    return NextResponse.json({ error: 'Failed to process documents', details: error.message }, { status: 500 })
  }
}

// Optional: GET handler for testing or manual trigger via URL if secured properly
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const target = searchParams.get('targetPath')
    const type = searchParams.get('type') as 'directory' | 'file' | null
    const project = searchParams.get('project') || undefined

    if (!target || !type) {
        return NextResponse.json({ error: 'Missing targetPath or type query parameters.' }, { status: 400 })
    }
    
    // THIS IS FOR DEMO/TESTING. IN PRODUCTION, SECURE THIS ENDPOINT!
    // For example, require an API key or admin authentication.
    // For now, allow GET for easier testing during development.
    try {
        const absoluteTargetPath = path.resolve(process.cwd(), target)
        if (type === 'directory') {
            await processDirectoryForEmbeddings(absoluteTargetPath, project)
            return NextResponse.json({ message: `GET: Successfully started processing directory: ${target}` }, { status: 200 })
        } else if (type === 'file') {
            await processFileForEmbeddings(absoluteTargetPath, project)
            return NextResponse.json({ message: `GET: Successfully processed file: ${target}` }, { status: 200 })
        }
        return NextResponse.json({ error: 'Invalid type for GET request.' }, { status: 400 })
    } catch (error: any) {
        console.error('API GET Error:', error)
        return NextResponse.json({ error: 'GET request failed', details: error.message }, { status: 500 })
    }
} 