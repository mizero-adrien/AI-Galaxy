/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  env: {
    VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:8000',
  },
  compress: true,
  poweredByHeader: false,
  // Fix webpack/turbopack issues
  webpack: (config, { isServer, webpack }) => {
    // Handle undici for both server and client
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      undici: false, // Exclude undici completely
    }
    
    // Exclude undici from bundles (it's Node.js-only, not needed in browser)
    if (Array.isArray(config.externals)) {
      config.externals.push('undici')
    } else if (config.externals) {
      config.externals = [config.externals, 'undici']
    } else {
      config.externals = ['undici']
    }
    
    // Ignore undici package completely to avoid parsing errors
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^undici$/,
      })
    )
    
    // For server-side, also ignore undici
    if (isServer) {
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        config.externals.push('undici')
      }
    }
    
    return config
  },
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig


