/** @type {import('next').NextConfig} */
const isGhPages = process.env.GITHUB_ACTIONS === 'true' || process.env.BUILD_TARGET === 'gh-pages'

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  ...(isGhPages
    ? {
        output: 'export',
        basePath: '/ozelhaber',
        trailingSlash: true,
      }
    : {}),
}

export default nextConfig
