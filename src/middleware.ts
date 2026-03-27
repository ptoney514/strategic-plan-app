import { NextRequest, NextResponse } from 'next/server'

const ROOT_DOMAINS = [
  'stratadash.org',
  'www.stratadash.org',
  'strategic-plan-app.vercel.app',
]

/**
 * Subdomain-based multi-tenant routing middleware.
 *
 * Detects the current subdomain from the Host header and rewrites:
 *   - admin.stratadash.org      → /(admin)/ route group
 *   - westside.stratadash.org   → /(district)/[slug]/ route group
 *   - stratadash.org            → /(root)/ route group
 *
 * For localhost/Vercel preview, falls back to ?subdomain= query param.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') ?? ''
  // Strip port for comparison
  const host = hostname.split(':')[0]

  // Skip Next.js internals and static assets
  const pathname = url.pathname
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // --- Determine subdomain type ---
  let subdomainType: 'root' | 'admin' | 'district' = 'root'
  let districtSlug: string | null = null

  if (host === 'localhost' || host === '127.0.0.1') {
    // Localhost: use ?subdomain= query param
    const devSubdomain = url.searchParams.get('subdomain')?.trim().replace(/\/+$/, '') ?? null
    if (devSubdomain === 'admin') {
      subdomainType = 'admin'
    } else if (devSubdomain) {
      subdomainType = 'district'
      districtSlug = devSubdomain
    }
  } else if (host === 'lvh.me') {
    subdomainType = 'root'
  } else if (host.endsWith('.lvh.me')) {
    const sub = host.replace('.lvh.me', '')
    if (sub === 'admin') {
      subdomainType = 'admin'
    } else if (sub) {
      subdomainType = 'district'
      districtSlug = sub
    }
  } else if (ROOT_DOMAINS.includes(host)) {
    subdomainType = 'root'
  } else if (host.endsWith('.vercel.app')) {
    // Vercel preview: use ?subdomain= query param
    const previewSubdomain = url.searchParams.get('subdomain')?.trim().replace(/\/+$/, '') ?? null
    if (previewSubdomain === 'admin') {
      subdomainType = 'admin'
    } else if (previewSubdomain) {
      subdomainType = 'district'
      districtSlug = previewSubdomain
    }
  } else {
    // Production subdomain (e.g., westside.stratadash.org)
    const parts = host.split('.')
    if (parts.length > 2) {
      const sub = parts[0]
      if (sub === 'admin') {
        subdomainType = 'admin'
      } else {
        subdomainType = 'district'
        districtSlug = sub
      }
    }
  }

  // --- Rewrite to internal route group ---
  if (subdomainType === 'admin') {
    // admin.stratadash.org/districts → internal /admin/districts
    url.pathname = `/admin${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  if (subdomainType === 'district' && districtSlug) {
    // westside.stratadash.org/admin → internal /district/westside/admin
    url.pathname = `/district/${districtSlug}${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  // Root domain: pass through as-is
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
