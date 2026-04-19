import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'maintenance_bypass'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

// Return the registrable domain to scope the cookie across subdomains.
// "www.stratadash.org" → ".stratadash.org", "westside.lvh.me" → ".lvh.me".
// For localhost / vercel preview hosts, return undefined so the browser
// scopes the cookie to the exact host.
function resolveCookieDomain(host: string): string | undefined {
  const bare = host.split(':')[0]
  if (bare === 'localhost' || bare === '127.0.0.1') return undefined
  if (bare.endsWith('.vercel.app') || bare === 'vercel.app') return undefined

  const parts = bare.split('.')
  if (parts.length < 2) return undefined
  return `.${parts.slice(-2).join('.')}`
}

export function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  const expected = process.env.MAINTENANCE_BYPASS_KEY

  if (!expected || key !== expected) {
    return new NextResponse('Not found', { status: 404 })
  }

  const host = request.headers.get('host') ?? ''
  const domain = resolveCookieDomain(host)

  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.set(COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    domain,
  })
  return response
}
