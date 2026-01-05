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
    const devSubdomain = urlParams.get('subdomain');

    if (devSubdomain === 'admin') {
      return { type: 'admin', slug: null, hostname };
    }
    if (devSubdomain) {
      return { type: 'district', slug: devSubdomain, hostname };
    }
    return { type: 'root', slug: null, hostname };
  }

  // Handle lvh.me for local subdomain testing (resolves to 127.0.0.1)
  if (hostname.endsWith('.lvh.me') || hostname === 'lvh.me') {
    const subdomain = hostname.replace('.lvh.me', '');

    if (subdomain === 'admin') {
      return { type: 'admin', slug: null, hostname };
    }
    if (subdomain && subdomain !== 'lvh') {
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

  // Production URLs
  if (type === 'admin') return 'https://admin.stratadash.org';
  if (type === 'district' && slug) return `https://${slug}.stratadash.org`;
  return 'https://stratadash.org';
}

/**
 * Build a path that works for both subdomain and path-based routing.
 *
 * On subdomain (westside.stratadash.org): returns "/objective/123"
 * On root domain (stratadash.org/westside): returns "/westside/objective/123"
 */
export function buildDistrictPath(basePath: string, slug: string, isSubdomain: boolean): string {
  // On subdomain, paths don't need slug prefix
  if (isSubdomain) {
    return basePath;
  }
  // On root domain, include slug in path
  return `/${slug}${basePath}`;
}
