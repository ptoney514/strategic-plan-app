import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.lvh.me', 'lvh.me'],
  turbopack: {
    root: path.resolve(__dirname),
    resolveAlias: {
      '@api': path.resolve(__dirname, '_api'),
    },
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  // Webpack parity: let ESM-style `.js` imports in _api/ resolve to their `.ts`
  // sources. Required by Better Auth (ESM-only) + Drizzle schema files that
  // import each other via `./goals.js` etc. Turbopack handles this via
  // `turbopack.resolveExtensions` above; webpack needs `extensionAlias`.
  webpack(config) {
    config.resolve = config.resolve || {}
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias || {}),
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return config
  },
  // Security headers (from current vercel.json)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development'
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.userjot.com https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https: data: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.neon.tech https://*.sentry.io https://*.ingest.sentry.io https://*.workers.dev https://cdn.userjot.com https://vercel.live wss: ws:; frame-src https://vercel.live; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
              : "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.userjot.com https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https: data: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.neon.tech https://*.sentry.io https://*.ingest.sentry.io https://*.workers.dev https://cdn.userjot.com https://vercel.live wss:; frame-src https://vercel.live; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
      {
        source: '/assets/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
