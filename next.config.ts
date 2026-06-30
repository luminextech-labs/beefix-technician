import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: { root: import.meta.dirname },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}

export default nextConfig
