/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  // Optimize for memory usage
  productionBrowserSourceMaps: false,
  // Allow dev origins for cross-origin requests
  allowedDevOrigins: ['http://localhost:3000', 'http://localhost:3001'],
}

export default nextConfig
