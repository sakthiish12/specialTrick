# Vector Database Setup

This document explains the setup and usage of the vector database for the AI-powered portfolio platform.

## Overview

The platform uses Supabase with the pgvector extension to store and search document embeddings. This enables semantic search capabilities for the AI assistant to understand and reference code, blog posts, and documentation.

## Database Schema

The main table is `documents` with the following structure:

- `id`: UUID primary key
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update
- `content`: The actual text content
- `metadata`: JSON object containing additional information
- `embedding`: Vector(1536) storing the OpenAI embedding
- `path`: File path or identifier
- `type`: Document type ('blog', 'project', or 'tutorial')

## Setup Instructions

1. Create a Supabase project and enable the pgvector extension:
   ```sql
   create extension if not exists vector;
   ```

2. Run the migration script from `lib/supabase/migrations/001_vector_database.sql`

3. Set up environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. Test the connection:
   ```bash
   npx tsx scripts/test-db-connection.ts
   ```

## Usage

### Storing Documents

```typescript
const { data, error } = await supabaseAdmin
  .from('documents')
  .insert({
    content: 'Document content',
    metadata: { title: 'Document Title' },
    embedding: documentEmbedding,
    path: 'path/to/document',
    type: 'blog'
  });
```

### Searching Documents

```typescript
const { data, error } = await supabaseAdmin.rpc('match_documents', {
  query_embedding: searchEmbedding,
  match_count: 5,
  match_threshold: 0.7
});
```

## Performance Considerations

- The `documents_embedding_idx` index uses IVFFlat for approximate nearest neighbor search
- The index is configured with 100 lists for a good balance of speed and accuracy
- Similarity search uses cosine similarity (1 - distance)
- A match threshold of 0.7 is recommended for good quality matches

## Security

- Row Level Security (RLS) is enabled
- Public read access is allowed for all documents
- Only authenticated users can insert/update/delete documents
- Use the service role key only in secure server-side contexts 