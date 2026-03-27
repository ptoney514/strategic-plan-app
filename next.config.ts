import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {},
  // Custom pageExtensions: App Router files use `.next.tsx`/`.next.ts` convention,
  // which prevents src/pages/*.tsx component files and *.test.tsx test files from
  // being accidentally treated as Pages Router routes.
  // In Phase 3, when src/pages/ is removed, this can be reverted to standard extensions.
  pageExtensions: ['next.tsx', 'next.ts', 'next.jsx', 'next.js'],
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
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.userjot.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self' data:; connect-src 'self' https://*.neon.tech https://*.sentry.io https://o*.ingest.sentry.io https://*.workers.dev https://cdn.userjot.com wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
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
