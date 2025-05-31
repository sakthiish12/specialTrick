// Use dynamic import for ES Modules
const remarkGfm = import('remark-gfm');
const rehypeSlug = import('rehype-slug');
const rehypeAutolinkHeadings = import('rehype-autolink-headings');
const remarkPrism = require('remark-prism');
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      [() => (tree) => {
        return remarkGfm.then(mod => mod.default()(tree));
      }],
      remarkPrism
    ],
    rehypePlugins: [
      [() => (tree) => {
        return rehypeSlug.then(mod => mod.default()(tree));
      }],
      [() => (tree) => {
        return rehypeAutolinkHeadings.then(mod => mod.default()(tree));
      }]
    ]
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com']
  },
  // Environment variables that should be available to the client
  env: {
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  // Webpack configuration to handle environment variables
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `pg` module
    if (!isServer) {
      // Exclude node-only modules from client-side bundles
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      };
    }
    return config;
  },
  // Enable experimental features
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
  // TypeScript and ESLint configurations
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false, // Consider setting to false for production
  },
  eslint: {
    // Allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false, // Consider setting to false for production
  },
  // Enable source maps in production for better error tracking
  productionBrowserSourceMaps: true,
  // Configure logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

// Apply MDX configuration
module.exports = withMDX(nextConfig); 