import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { storeDocument, deleteDocumentByPath } from '@/lib/ai/embeddings'
import { getDocumentMetadata } from '@/lib/ai/document-processor' // Assuming these helpers can be exposed
import type { DocumentMetadata } from '@/lib/supabase/types'
import path from 'path' // path is still useful for manipulations

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET
const GITHUB_TOKEN = process.env.GITHUB_TOKEN // For fetching file content

// Helper function to fetch file content from GitHub API
async function getFileContentFromGitHub(repoFullName: string, filePath: string, ref: string): Promise<string | null> {
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN not set. Cannot fetch file content from GitHub API.')
    return null
  }
  const url = `https://api.github.com/repos/${repoFullName}/contents/${filePath}?ref=${ref}`
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3.raw',
      },
    })
    if (!response.ok) {
      console.error(`Failed to fetch ${filePath} from ${repoFullName} (ref: ${ref}): ${response.status} ${response.statusText}`)
      return null
    }
    return await response.text()
  } catch (error) {
    console.error(`Error fetching file ${filePath} from ${repoFullName} (ref: ${ref}):`, error)
    return null
  }
}

async function processWebhookUpdates(filesToProcess: Set<string>, filesToRemove: Set<string>, repositoryFullName: string, ref: string, repositoryName: string) {
    // Process additions/modifications
    for (const relativeFilePath of filesToProcess) {
        console.log(`Fetching content for: ${repositoryFullName}/${relativeFilePath} at ref ${ref}`)
        const content = await getFileContentFromGitHub(repositoryFullName, relativeFilePath, ref)
        if (content) {
            try {
                console.log(`Processing for embedding: ${repositoryFullName}/${relativeFilePath}`)
                // Create simple chunks manually since chunkText is no longer available
                const chunks = content.match(/[^.!?]+[.!?]+/g) || [content]
                
                // Use helper from document-processor with correct parameter order
                const documentType = content.includes('# ') ? 'documentation' : 'project'
                const metadata = getDocumentMetadata(content, relativeFilePath, documentType)
                
                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i];
                    // We need to ensure metadata is correctly associated with each chunk
                    await storeDocument({
                        content: chunk,
                        metadata: {
                            ...metadata,
                            // Add chunk index to the title
                            title: metadata.title ? `${metadata.title} (chunk ${i+1})` : `Chunk ${i+1} of ${relativeFilePath}`
                        }
                    });
                }
                console.log(`Successfully processed and stored embeddings for ${repositoryFullName}/${relativeFilePath}`)
            } catch(e) {
                console.error(`Error processing or storing document ${repositoryFullName}/${relativeFilePath}:`, e)
            }
        } else {
            console.warn(`Could not fetch content for ${repositoryFullName}/${relativeFilePath}. Skipping embedding.`)
        }
    }

    // Process removals
    for (const relativeFilePath of filesToRemove) {
        try {
            console.log(`Attempting to delete embeddings for ${repositoryName}/${relativeFilePath}`)
            await deleteDocumentByPath(relativeFilePath)
            // deleteDocumentByPath already logs success/failure
        } catch (e) {
            console.error(`Error deleting document ${repositoryName}/${relativeFilePath} via webhook:`, e)
        }
    }
}

export async function POST(request: Request) {
  if (!GITHUB_WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: GitHub webhook secret is not configured in production.')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }
  if (!GITHUB_TOKEN && process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: GITHUB_TOKEN not configured in production. Webhook cannot process files.');
    return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 })
  }
  
  if (!GITHUB_WEBHOOK_SECRET) {
    console.warn('GitHub webhook secret is not configured. Skipping signature verification (dev mode). ACTION REQUIRED FOR PRODUCTION.')
  }
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not configured. Webhook cannot process files (dev mode). ACTION REQUIRED FOR PRODUCTION.')
  }

  try {
    const signature = request.headers.get('x-hub-signature-256')
    const event = request.headers.get('x-github-event')
    const id = request.headers.get('x-github-delivery')

    const payloadText = await request.text()

    if (GITHUB_WEBHOOK_SECRET) {
        if (!signature) {
            console.warn('No signature found on request despite GITHUB_WEBHOOK_SECRET being set.')
            return NextResponse.json({ error: 'No signature found on request' }, { status: 401 })
        }
        const expectedSignature = `sha256=${crypto
            .createHmac('sha256', GITHUB_WEBHOOK_SECRET)
            .update(payloadText)
            .digest('hex')}`

        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            console.error('Invalid GitHub webhook signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }
    } else if (process.env.NODE_ENV !== 'development') {
        // If not in dev and secret is missing, it means it was not production check earlier because NODE_ENV was not 'production'
        console.warn('GitHub webhook secret is not configured. Skipping signature verification. ACTION REQUIRED FOR PRODUCTION.')
    }

    const payload = JSON.parse(payloadText)
    console.log(`GitHub Webhook Event: ${event}, Delivery ID: ${id}`)

    if (event === 'ping') {
      return NextResponse.json({ message: 'Pong! Webhook configured successfully.' }, { status: 200 })
    }

    if (event === 'push') {
      const branch = payload.ref?.split('/').pop()
      // Process pushes to main/master or any other branch you might configure, e.g. from env var
      const targetBranches = (process.env.GITHUB_WEBHOOK_BRANCHES || 'main,master').split(',')
      
      if (payload.ref && targetBranches.includes(branch)) {
        console.log(`Processing push event to branch: ${branch}`)

        const commits = payload.commits || []
        const filesToProcess: Set<string> = new Set()
        const filesToRemove: Set<string> = new Set()
        
        // Ensure repository and name are correctly extracted
        const repositoryFullName = payload.repository?.full_name 
        const repositoryName = payload.repository?.name
        const commitSha = payload.after // SHA of the latest commit in the push

        if (!repositoryFullName || !repositoryName) {
            console.error('Could not determine repository name from webhook payload.', payload.repository)
            return NextResponse.json({ error: 'Missing repository information in payload' }, { status: 400 })
        }
        if (!commitSha) {
            console.error('Could not determine commit SHA (payload.after) from webhook payload.')
            return NextResponse.json({ error: 'Missing commit SHA in payload' }, { status: 400 })
        }

        for (const commit of commits) {
          // Use commit.id as the ref for files in this specific commit if needed, 
          // but payload.after (the latest commit in the push) is usually what you want for the current state.
          (commit.added || []).forEach((file: string) => filesToProcess.add(file))
          ;(commit.modified || []).forEach((file: string) => filesToProcess.add(file))
          ;(commit.removed || []).forEach((file: string) => filesToRemove.add(file))
        }

        if (filesToProcess.size > 0 || filesToRemove.size > 0) {
            console.log(`Repository: ${repositoryFullName}, Ref: ${commitSha}`)
            if(filesToProcess.size > 0) console.log(`Files to process: ${Array.from(filesToProcess).join(', ')}`)
            if(filesToRemove.size > 0) console.log(`Files to remove: ${Array.from(filesToRemove).join(', ')}`)

            // Asynchronously process updates without blocking the response to GitHub.
            // IMPORTANT: Vercel serverless functions have a timeout (e.g., 10s or 60s for Hobby/Pro).
            // If processing takes longer, you'll need a background tasks solution (e.g., Vercel Cron Jobs triggering another function, or a queue like Upstash QStash).
            // For now, we run it and hope it finishes in time. It won't block the HTTP response.
            processWebhookUpdates(filesToProcess, filesToRemove, repositoryFullName, commitSha, repositoryName)
                .then(() => console.log(`Webhook processing finished for ${repositoryFullName} push to ${branch} (ref: ${commitSha}).`))
                .catch(e => console.error(`Webhook processing error for ${repositoryFullName} push to ${branch} (ref: ${commitSha}):`, e));

            return NextResponse.json({ message: 'Push event received, processing initiated.' }, { status: 202 })
        } else {
            console.log('Push event to target branch received, but no files were added, modified, or removed in the commits.')
            return NextResponse.json({ message: 'Push event received, no relevant file changes.' }, { status: 200 })
        }
      }
    }

    return NextResponse.json({ message: 'Event received, but no action taken.', event }, { status: 200 })
  } catch (error: any) {
    console.error('Error processing GitHub webhook:', error)
    // Avoid sending back detailed internal errors in production if possible
    const errorMessage = process.env.NODE_ENV === 'development' ? error.message : 'Failed to process webhook'
    return NextResponse.json({ error: 'Failed to process webhook', details: errorMessage }, { status: 500 })
  }
} 