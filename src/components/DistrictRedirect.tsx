import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { isLocalDev, getSubdomainUrl } from '../lib/subdomain';
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

    // Build the new URL
    const baseUrl = getSubdomainUrl('district', slug);

    // Preserve the path after the slug
    const remainingPath = location.pathname.replace(`/${slug}`, '') || '/';
    const newUrl = `${baseUrl}${remainingPath}${location.search}${location.hash}`;

    // Redirect
    window.location.href = newUrl;
  }, [slug, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-slate-600">
          Redirecting to {slug}.{isLocalDev() ? 'lvh.me' : 'stratadash.org'}...
        </p>
      </div>
    </div>
  );
}
