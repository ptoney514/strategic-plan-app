/**
 * Determines the cookie domain for cross-subdomain authentication.
 * - Production: .stratadash.org (allows cookies to be shared across all subdomains)
 * - Local dev: .lvh.me (resolves to 127.0.0.1, enables local subdomain testing)
 * - Localhost: undefined (cookies scoped to current domain only)
 */
export function getCookieDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const hostname = window.location.hostname;

  // Production: share cookies across all *.stratadash.org subdomains
  if (hostname.endsWith('stratadash.org')) {
    return '.stratadash.org';
  }

  // Local development with lvh.me (resolves to 127.0.0.1)
  if (hostname.endsWith('.lvh.me') || hostname === 'lvh.me') {
    return '.lvh.me';
  }

  // localhost or IP addresses: cannot share cookies across subdomains
  return undefined;
}
