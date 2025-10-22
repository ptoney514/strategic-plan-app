import { Outlet, Link, useParams } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
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

      {/* Footer */}
      <footer className="border-t border-neutral-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="text-sm text-neutral-600">
              © {new Date().getFullYear()} {district.name}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <a href="#" className="hover:text-neutral-900">Privacy</a>
            <a href="#" className="hover:text-neutral-900">Terms</a>
            <a href="#" className="hover:text-neutral-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
