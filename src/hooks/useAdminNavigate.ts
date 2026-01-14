import { useCallback } from 'react';
import { useNavigate, useLocation, type NavigateOptions } from 'react-router-dom';

/**
 * Custom hook that wraps navigate() to preserve query params.
 *
 * This is essential for localhost development where the subdomain context
 * is passed via `?subdomain=westside` query param. On production, subdomains
 * are handled via the hostname (e.g., westside.stratadash.org) so
 * location.search is empty and this has no effect.
 *
 * @example
 * const adminNavigate = useAdminNavigate();
 * adminNavigate('/admin/objectives'); // Preserves ?subdomain=xxx on localhost
 */
export function useAdminNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (path: string, options?: NavigateOptions) => {
      // Preserve query params (for localhost ?subdomain=xxx)
      // On production, location.search is empty, so this is a no-op
      const fullPath = path + location.search;
      navigate(fullPath, options);
    },
    [navigate, location.search]
  );
}

/**
 * Hook to build a path with preserved query params.
 * Use this for Link components when you need to preserve subdomain context.
 *
 * @example
 * const objectivesPath = useAdminPath('/admin/objectives');
 * <Link to={objectivesPath}>All objectives</Link>
 */
export function useAdminPath(basePath: string): string {
  const location = useLocation();
  return basePath + location.search;
}

/**
 * Hook to get the current query string.
 * Useful when you need to append query params inline in JSX.
 *
 * @example
 * const queryString = useQueryString();
 * <Link to={`/admin/objectives${queryString}`}>All objectives</Link>
 */
export function useQueryString(): string {
  const location = useLocation();
  return location.search;
}
