/**
 * Subdomain detection utility for stratadash.org
 *
 * Detects which subdomain the app is running on:
 * - root: stratadash.org (marketing page)
 * - admin: admin.stratadash.org (system admin)
 * - district: westside.stratadash.org (district public view)
 */

export type SubdomainType = 'root' | 'admin' | 'district';

export interface SubdomainInfo {
  type: SubdomainType;
  slug: string | null;
  hostname: string;
}

const ROOT_DOMAINS = [
  'stratadash.org',
  'www.stratadash.org',
  'strategic-plan-app.vercel.app',
];

const ADMIN_SUBDOMAINS = ['admin'];

/**
 * Get subdomain information from the current hostname
 */
export function getSubdomainInfo(): SubdomainInfo {
  const hostname = window.location.hostname;

  // Handle localhost development with query param fallback
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const urlParams = new URLSearchParams(window.location.search);
    // Normalize: trim whitespace and trailing slashes
    const devSubdomain = urlParams.get('subdomain')?.trim().replace(/\/+$/, '') || null;

    if (devSubdomain === 'admin') {
      return { type: 'admin', slug: null, hostname };
    }
    if (devSubdomain) {
      return { type: 'district', slug: devSubdomain, hostname };
    }
    return { type: 'root', slug: null, hostname };
  }

  // Handle lvh.me for local subdomain testing (resolves to 127.0.0.1)
  if (hostname === 'lvh.me') {
    // Exact match for root domain - no subdomain
    return { type: 'root', slug: null, hostname };
  }
  if (hostname.endsWith('.lvh.me')) {
    // Extract subdomain: westside.lvh.me -> westside
    const subdomain = hostname.replace('.lvh.me', '');

    if (subdomain === 'admin') {
      return { type: 'admin', slug: null, hostname };
    }
    if (subdomain) {
      return { type: 'district', slug: subdomain, hostname };
    }
    return { type: 'root', slug: null, hostname };
  }

  // Production: stratadash.org and subdomains
  // Also handle Vercel preview URLs

  // Check for root domains first
  if (ROOT_DOMAINS.includes(hostname)) {
    return { type: 'root', slug: null, hostname };
  }

  // Vercel preview URLs - use query params like localhost
  // e.g., "strategic-plan-xyz123-pernells-projects.vercel.app?subdomain=admin"
  if (hostname.endsWith('.vercel.app') && !ROOT_DOMAINS.includes(hostname)) {
    const urlParams = new URLSearchParams(window.location.search);
    const previewSubdomain = urlParams.get('subdomain')?.trim().replace(/\/+$/, '') || null;

    if (previewSubdomain === 'admin') {
      return { type: 'admin', slug: null, hostname };
    }
    if (previewSubdomain) {
      return { type: 'district', slug: previewSubdomain, hostname };
    }
    return { type: 'root', slug: null, hostname };
  }

  // Extract subdomain from hostname
  // e.g., "westside.stratadash.org" -> subdomain = "westside"
  const parts = hostname.split('.');

  // Two parts means root domain (stratadash.org)
  if (parts.length <= 2) {
    return { type: 'root', slug: null, hostname };
  }

  // Three+ parts means subdomain exists
  const subdomain = parts[0];

  // Check if it's the admin subdomain
  if (ADMIN_SUBDOMAINS.includes(subdomain)) {
    return { type: 'admin', slug: null, hostname };
  }

  // Otherwise, treat as district subdomain
  return { type: 'district', slug: subdomain, hostname };
}

/**
 * Check if running in local development
 */
export function isLocalDev(): boolean {
  const hostname = window.location.hostname;
  return hostname === 'localhost' ||
         hostname === '127.0.0.1' ||
         hostname.includes('lvh.me');
}

/**
 * Check if running on a Vercel preview deployment
 */
export function isVercelPreview(): boolean {
  const hostname = window.location.hostname;
  return hostname.includes('vercel.app') && !hostname.includes('strategic-plan-app.vercel.app');
}

/**
 * Get the base URL for a given subdomain type
 */
export function getSubdomainUrl(type: SubdomainType, slug?: string): string {
  if (isLocalDev()) {
    const port = window.location.port ? `:${window.location.port}` : '';
    const protocol = window.location.protocol;

    // For lvh.me
    if (window.location.hostname.includes('lvh.me')) {
      if (type === 'admin') return `${protocol}//admin.lvh.me${port}`;
      if (type === 'district' && slug) return `${protocol}//${slug}.lvh.me${port}`;
      return `${protocol}//lvh.me${port}`;
    }

    // For localhost, use query param
    if (type === 'admin') return `${protocol}//localhost${port}?subdomain=admin`;
    if (type === 'district' && slug) return `${protocol}//localhost${port}?subdomain=${slug}`;
    return `${protocol}//localhost${port}`;
  }

  // Vercel preview deployments - use query params like localhost
  if (isVercelPreview()) {
    const origin = window.location.origin;
    if (type === 'admin') return `${origin}?subdomain=admin`;
    if (type === 'district' && slug) return `${origin}?subdomain=${slug}`;
    return origin;
  }

  // Production URLs
  if (type === 'admin') return 'https://admin.stratadash.org';
  if (type === 'district' && slug) return `https://${slug}.stratadash.org`;
  return 'https://stratadash.org';
}

/**
 * Check if subdomain is simulated via query param (localhost or Vercel preview)
 */
export function isQueryParamSubdomain(): boolean {
  const hostname = window.location.hostname;
  // localhost/127.0.0.1 (not lvh.me which uses real subdomains)
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && !hostname.includes('lvh.me')) {
    return true;
  }
  // Vercel preview (not production vercel app)
  if (isVercelPreview()) {
    return true;
  }
  return false;
}

/**
 * Build a path that works for both subdomain and path-based routing.
 *
 * On subdomain (westside.stratadash.org): returns "/objective/123"
 * On root domain (stratadash.org/westside): returns "/westside/objective/123"
 *
 * Note: This does NOT preserve query params for localhost/Vercel preview.
 * For components using React Router <Link>, use the useDistrictLink hook instead.
 */
export function buildDistrictPath(basePath: string, slug: string, isSubdomain: boolean): string {
  // On subdomain, paths don't need slug prefix
  if (isSubdomain) {
    return basePath;
  }
  // On root domain, include slug in path
  return `/${slug}${basePath}`;
}

/**
 * Build a path that works for both subdomain and path-based routing,
 * preserving ?subdomain= query param on localhost/Vercel preview.
 *
 * On real subdomain (westside.stratadash.org): returns "/goals"
 * On localhost with ?subdomain=westside: returns "/goals?subdomain=westside"
 * On Vercel preview with ?subdomain=westside: returns "/goals?subdomain=westside"
 * On path-based (stratadash.org/westside): returns "/westside/goals"
 */
export function buildDistrictPathWithQueryParam(
  basePath: string,
  slug: string,
  isSubdomain: boolean
): string {
  // On subdomain routing
  if (isSubdomain) {
    // If using query param simulation (localhost/Vercel preview), preserve it
    if (isQueryParamSubdomain()) {
      return `${basePath}?subdomain=${slug}`;
    }
    // Real subdomain (westside.stratadash.org) - no query param needed
    return basePath;
  }
  // On root domain, include slug in path
  return `/${slug}${basePath}`;
}

/**
 * Build a full URL for a subdomain with an optional path.
 * Handles localhost query params correctly (path before query param).
 *
 * Examples:
 * - buildSubdomainUrlWithPath('admin', '/districts') =>
 *   - localhost: http://localhost:5174/districts?subdomain=admin
 *   - production: https://admin.stratadash.org/districts
 */
export function buildSubdomainUrlWithPath(type: SubdomainType, path: string = '', slug?: string): string {
  // Ensure path starts with /
  const normalizedPath = path && !path.startsWith('/') ? `/${path}` : path;

  if (isLocalDev()) {
    const port = window.location.port ? `:${window.location.port}` : '';
    const protocol = window.location.protocol;

    // For lvh.me - subdomains work naturally
    if (window.location.hostname.includes('lvh.me')) {
      if (type === 'admin') return `${protocol}//admin.lvh.me${port}${normalizedPath}`;
      if (type === 'district' && slug) return `${protocol}//${slug}.lvh.me${port}${normalizedPath}`;
      return `${protocol}//lvh.me${port}${normalizedPath}`;
    }

    // For localhost - path must come BEFORE query param
    if (type === 'admin') return `${protocol}//localhost${port}${normalizedPath}?subdomain=admin`;
    if (type === 'district' && slug) return `${protocol}//localhost${port}${normalizedPath}?subdomain=${slug}`;
    return `${protocol}//localhost${port}${normalizedPath}`;
  }

  // Vercel preview deployments - use query params like localhost (path before query)
  if (isVercelPreview()) {
    const origin = window.location.origin;
    if (type === 'admin') return `${origin}${normalizedPath}?subdomain=admin`;
    if (type === 'district' && slug) return `${origin}${normalizedPath}?subdomain=${slug}`;
    return `${origin}${normalizedPath}`;
  }

  // Production URLs - simple concatenation works
  if (type === 'admin') return `https://admin.stratadash.org${normalizedPath}`;
  if (type === 'district' && slug) return `https://${slug}.stratadash.org${normalizedPath}`;
  return `https://stratadash.org${normalizedPath}`;
}
