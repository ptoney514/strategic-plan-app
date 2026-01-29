import { useParams } from 'react-router-dom';
import { PublicLayout } from './PublicLayout';

/**
 * PublicDistrictLayout - Wrapper for path-based public district routes
 *
 * Used for URLs like: stratadash.org/district/:slug
 * Extracts the district slug from URL params and passes it to PublicLayout.
 *
 * This enables public access to district strategic plans without needing subdomains,
 * which is useful for:
 * - Sharing links that work without DNS configuration
 * - SEO-friendly paths
 * - Fallback when subdomains aren't available
 */
export function PublicDistrictLayout() {
  const { slug } = useParams<{ slug: string }>();

  // PublicLayout handles the case when slug is undefined (shows "District not found")
  return <PublicLayout districtSlug={slug} />;
}
