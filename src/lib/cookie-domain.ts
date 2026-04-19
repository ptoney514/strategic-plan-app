/**
 * Determines the cookie domain for cross-subdomain authentication.
 * - Production: .stratadash.org (allows cookies to be shared across all subdomains)
 * - Local dev: .lvh.me (resolves to 127.0.0.1, enables local subdomain testing)
 * - Localhost / Vercel preview: undefined (cookies scoped to current host only)
 *
 * Pass a hostname explicitly when called from the server (middleware, route
 * handlers). With no argument, reads `window.location.hostname` on the client.
 */
export function getCookieDomain(hostname?: string): string | undefined {
  const host = hostname ?? (typeof window === 'undefined' ? undefined : window.location.hostname);
  if (!host) return undefined;

  const bare = host.split(':')[0];

  if (bare.endsWith('stratadash.org')) {
    return '.stratadash.org';
  }

  if (bare.endsWith('.lvh.me') || bare === 'lvh.me') {
    return '.lvh.me';
  }

  return undefined;
}
