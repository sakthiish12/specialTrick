// Mock environment variables
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
process.env.GITHUB_TOKEN = 'test-github-token';

// Mock fetch
global.fetch = jest.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true
  })
);

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '',
  notFound: jest.fn(),
}));

// Mock empty test files
jest.mock('./lib/blog/mdx', () => ({
  getPostBySlug: jest.fn().mockResolvedValue({
    title: 'Test Post',
    slug: 'test-post',
    date: '2024-03-15',
    content: 'Test content goes here',
    summary: 'This is a test post',
    tags: ['test', 'blog'],
    readingTime: 1
  }),
  getAllPosts: jest.fn().mockResolvedValue([
    {
      title: 'Test Post',
      slug: 'test-post',
      date: '2024-03-15',
      content: 'Test content goes here',
      summary: 'This is a test post',
      tags: ['test', 'blog'],
      readingTime: 1
    }
  ])
}));
