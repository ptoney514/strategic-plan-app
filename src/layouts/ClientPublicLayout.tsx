import { Outlet, Link, useParams } from 'react-router-dom';
import { useDistrict } from '../hooks/useDistricts';
import { HomepageHeader } from '../components/homepage/HomepageHeader';

/**
 * ClientPublicLayout - Layout for public client pages (/:slug)
 * Accessible to everyone, displays public strategic plan information
 */
export function ClientPublicLayout() {
  const { slug } = useParams<{ slug: string }>();
  const { data: district, isLoading } = useDistrict(slug!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">District not found</p>
          <Link to="/" className="mt-4 inline-flex items-center text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Use the same header as the landing page */}
      <HomepageHeader
        districtName={district.name}
        districtSlug={slug!}
        primaryColor={district.primary_color || '#C03537'}
        tagline={district.tagline || 'Community. Innovation. Excellence.'}
        logoUrl={district.logo_url}
      />

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
