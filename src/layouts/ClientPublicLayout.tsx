import { useState } from 'react';
import { Outlet, Link, useParams } from 'react-router-dom';
import { Home, Target, GraduationCap, Menu, X } from 'lucide-react';
import { useDistrict } from '../hooks/useDistricts';

/**
 * ClientPublicLayout - Layout for public client pages (/:slug)
 * Accessible to everyone, displays public strategic plan information
 */
export function ClientPublicLayout() {
  const { slug } = useParams<{ slug: string }>();
  const { data: district, isLoading } = useDistrict(slug!);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* Public Header - Clean Design */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & District Name */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="text-lg font-semibold text-neutral-900">{district.name}</div>
                <div className="text-sm text-neutral-500">Strategic Plan</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to={`/${slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                to={`/${slug}/goals`}
                className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <Target className="h-4 w-4" />
                Goals
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden pb-4 pt-2 border-t border-neutral-200 space-y-2">
              <Link
                to={`/${slug}`}
                className="flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                to={`/${slug}/goals`}
                className="flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Target className="h-4 w-4" />
                Goals
              </Link>
            </nav>
          )}
        </div>
      </header>

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
