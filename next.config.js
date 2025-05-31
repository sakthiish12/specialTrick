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
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com']
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  }
}
//test

module.exports = withMDX(nextConfig) 