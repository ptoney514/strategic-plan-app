import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
    resolveAlias: {
      '@api': path.resolve(__dirname, '_api'),
      // Map .js imports within api/lib/ to their .ts counterparts
      // (Turbopack doesn't support extensionAlias, so we map explicitly)
      [path.resolve(__dirname, 'api/lib/auth.js')]: path.resolve(__dirname, 'api/lib/auth.ts'),
      [path.resolve(__dirname, 'api/lib/db.js')]: path.resolve(__dirname, 'api/lib/db.ts'),
      [path.resolve(__dirname, 'api/lib/response.js')]: path.resolve(__dirname, 'api/lib/response.ts'),
      [path.resolve(__dirname, 'api/lib/rateLimit.js')]: path.resolve(__dirname, 'api/lib/rateLimit.ts'),
      [path.resolve(__dirname, 'api/lib/sentry.js')]: path.resolve(__dirname, 'api/lib/sentry.ts'),
      [path.resolve(__dirname, 'api/lib/url.js')]: path.resolve(__dirname, 'api/lib/url.ts'),
      [path.resolve(__dirname, 'api/lib/email.js')]: path.resolve(__dirname, 'api/lib/email.ts'),
      [path.resolve(__dirname, 'api/lib/email-templates.js')]: path.resolve(__dirname, 'api/lib/email-templates.ts'),
      [path.resolve(__dirname, 'api/lib/schema/index.js')]: path.resolve(__dirname, 'api/lib/schema/index.ts'),
      [path.resolve(__dirname, 'api/lib/schema/auth.js')]: path.resolve(__dirname, 'api/lib/schema/auth.ts'),
      [path.resolve(__dirname, 'api/lib/schema/contact.js')]: path.resolve(__dirname, 'api/lib/schema/contact.ts'),
      [path.resolve(__dirname, 'api/lib/schema/goals.js')]: path.resolve(__dirname, 'api/lib/schema/goals.ts'),
      [path.resolve(__dirname, 'api/lib/schema/imports.js')]: path.resolve(__dirname, 'api/lib/schema/imports.ts'),
      [path.resolve(__dirname, 'api/lib/schema/organizations.js')]: path.resolve(__dirname, 'api/lib/schema/organizations.ts'),
      [path.resolve(__dirname, 'api/lib/schema/plans.js')]: path.resolve(__dirname, 'api/lib/schema/plans.ts'),
      [path.resolve(__dirname, 'api/lib/schema/widgets.js')]: path.resolve(__dirname, 'api/lib/schema/widgets.ts'),
      [path.resolve(__dirname, 'api/lib/middleware/auth.js')]: path.resolve(__dirname, 'api/lib/middleware/auth.ts'),
      [path.resolve(__dirname, 'api/lib/middleware/index.js')]: path.resolve(__dirname, 'api/lib/middleware/index.ts'),
      [path.resolve(__dirname, 'api/lib/middleware/roles.js')]: path.resolve(__dirname, 'api/lib/middleware/roles.ts'),
      [path.resolve(__dirname, 'api/lib/helpers/org-lookup.js')]: path.resolve(__dirname, 'api/lib/helpers/org-lookup.ts'),
      [path.resolve(__dirname, 'api/lib/helpers/number.js')]: path.resolve(__dirname, 'api/lib/helpers/number.ts'),
    },
  },
  experimental: {
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    },
  },
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
