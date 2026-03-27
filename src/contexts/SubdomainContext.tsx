import { createContext, useContext, useMemo, useCallback, type ReactNode } from 'react';
import { getSubdomainInfo, buildDistrictPathWithQueryParam, type SubdomainInfo } from '../lib/subdomain';

const SubdomainContext = createContext<SubdomainInfo | null>(null);

interface SubdomainProviderProps {
  children: ReactNode;
}

/**
 * Allows a Next.js [slug] layout segment to override the subdomain slug
 * derived from hostname detection. Used when routing is path-based
 * (e.g., /district/westside/admin) rather than subdomain-based.
 */
export function SubdomainOverrideProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const value = useMemo<SubdomainInfo>(
    () => ({ slug, type: 'district', hostname: typeof window !== 'undefined' ? window.location.hostname : '' }),
    [slug],
  );
  return <SubdomainContext.Provider value={value}>{children}</SubdomainContext.Provider>;
}

/**
 * Provider that detects and provides subdomain information to the app.
 * Must be placed high in the component tree (before Router).
 */
export function SubdomainProvider({ children }: SubdomainProviderProps) {
  const subdomainInfo = useMemo(() => getSubdomainInfo(), []);

  return (
    <SubdomainContext.Provider value={subdomainInfo}>
      {children}
    </SubdomainContext.Provider>
  );
}

/**
 * Hook to access subdomain information.
 * Returns the subdomain type (root/admin/district) and slug if applicable.
 */
export function useSubdomain(): SubdomainInfo {
  const context = useContext(SubdomainContext);
  if (!context) {
    throw new Error('useSubdomain must be used within SubdomainProvider');
  }
  return context;
}

/**
 * Hook that returns a function to build district-aware paths.
 * Automatically handles:
 * - Real subdomains (westside.stratadash.org): /goals
 * - Query param subdomains (localhost?subdomain=westside): /goals?subdomain=westside
 * - Path-based routing (stratadash.org/westside): /westside/goals
 *
 * @param districtSlug - The district slug (can be passed or will use context)
 * @returns A function that takes a base path and returns the correct full path
 */
export function useDistrictLink(districtSlug?: string) {
  const { slug: contextSlug, type } = useSubdomain();
  const slug = districtSlug || contextSlug || '';
  const isSubdomain = type === 'district';

  return useCallback(
    (basePath: string) => buildDistrictPathWithQueryParam(basePath, slug, isSubdomain),
    [slug, isSubdomain]
  );
}
