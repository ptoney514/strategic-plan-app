import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { isLocalDev, isVercelPreview, getSubdomainUrl } from '../lib/subdomain';
import { Loader2 } from 'lucide-react';

/**
 * Redirects legacy district paths (e.g., stratadash.org/westside)
 * to the new subdomain format (e.g., westside.stratadash.org)
 */
export function DistrictRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();

  useEffect(() => {
    if (!slug) return;

    // Preserve the path after the slug
    const remainingPath = location.pathname.replace(`/${slug}`, '') || '/';

    let newUrl: string;

    if (isLocalDev()) {
      // For localhost, build URL with path BEFORE query param
      // This avoids malformed URLs like ?subdomain=westside/admin
      const port = window.location.port ? `:${window.location.port}` : '';
      newUrl = `${window.location.protocol}//localhost${port}${remainingPath}?subdomain=${slug}${location.hash}`;
    } else if (isVercelPreview()) {
      // For Vercel preview, use query params like localhost
      newUrl = `${window.location.origin}${remainingPath}?subdomain=${slug}${location.hash}`;
    } else {
      // For production subdomains, use standard URL construction
      const baseUrl = getSubdomainUrl('district', slug);
      newUrl = `${baseUrl}${remainingPath}${location.hash}`;
    }

    // Redirect
    window.location.href = newUrl;
  }, [slug, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-slate-600">
          Redirecting to {isLocalDev() || isVercelPreview() ? `?subdomain=${slug}` : `${slug}.stratadash.org`}...
        </p>
      </div>
    </div>
  );
}
