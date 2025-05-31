import { generateEmbedding, storeDocument, searchDocuments, deleteDocumentByPath, updateDocumentEmbedding } from './embeddings';
import { processDocument } from './document-processor';

// Mock OpenAI
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [{ embedding: Array(1536).fill(0.1) }],
      }),
    },
  })),
}));

// Mock Supabase
jest.mock('../supabase/server', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null }),
    update: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockResolvedValue({ error: null }),
    eq: jest.fn().mockResolvedValue({ error: null }),
  },
}));

describe('Embeddings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateEmbedding', () => {
    it('should generate embeddings for text', async () => {
      const embedding = await generateEmbedding('test text');
      expect(embedding).toHaveLength(1536);
      expect(embedding.every(val => val === 0.1)).toBe(true);
    });
  });

  describe('storeDocument', () => {
    it('should store a document with embedding', async () => {
      const chunk = {
        content: 'test content',
        metadata: {
          type: 'blog' as const,
          path: 'test/path.md',
        },
      };

      await storeDocument(chunk);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('documents');
      expect(supabaseAdmin.insert).toHaveBeenCalled();
    });
  });

  describe('searchDocuments', () => {
    it('should search documents with default options', async () => {
      const mockResults = [
        { id: '1', content: 'test', metadata: { type: 'blog' }, similarity: 0.8 },
      ];
      (supabaseAdmin.rpc as jest.Mock).mockResolvedValueOnce({ data: mockResults, error: null });

      const results = await searchDocuments('test query');
      expect(results).toEqual(mockResults);
    });

    it('should filter results by type', async () => {
      const mockResults = [
        { id: '1', content: 'test', metadata: { type: 'blog' }, similarity: 0.8 },
        { id: '2', content: 'test', metadata: { type: 'project' }, similarity: 0.7 },
      ];
      (supabaseAdmin.rpc as jest.Mock).mockResolvedValueOnce({ data: mockResults, error: null });

      const results = await searchDocuments('test query', { type: 'blog' });
      expect(results).toHaveLength(1);
      expect(results[0].metadata.type).toBe('blog');
    });
  });

  describe('deleteDocumentByPath', () => {
    it('should delete a document by path', async () => {
      await deleteDocumentByPath('test/path.md');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('documents');
      expect(supabaseAdmin.delete).toHaveBeenCalled();
      expect(supabaseAdmin.eq).toHaveBeenCalledWith('path', 'test/path.md');
    });
  });

  describe('updateDocumentEmbedding', () => {
    it('should update a document embedding', async () => {
      await updateDocumentEmbedding('test/path.md', 'new content');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('documents');
      expect(supabaseAdmin.update).toHaveBeenCalled();
      expect(supabaseAdmin.eq).toHaveBeenCalledWith('path', 'test/path.md');
    });
  });
}); 