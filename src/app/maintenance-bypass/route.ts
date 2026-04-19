import { NextRequest, NextResponse } from 'next/server'
import { getCookieDomain } from '@/lib/cookie-domain'
import { MAINTENANCE_COOKIE_NAME } from '@/lib/maintenance'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  const expected = process.env.MAINTENANCE_BYPASS_KEY

  if (!expected || key !== expected) {
    return new NextResponse('Not found', { status: 404 })
  }

  const host = request.headers.get('host') ?? ''
  const domain = getCookieDomain(host)

  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.set(MAINTENANCE_COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    domain,
  })
  return response
}
