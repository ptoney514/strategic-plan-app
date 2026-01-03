import { Menu } from 'lucide-react';
import { Link, useParams, useLocation } from 'react-router-dom';
import type { District } from '../../lib/types';

// Local logo mapping for districts (can be moved to R2/CDN later)
const districtLogos: Record<string, string> = {
  westside: '/assets/districts/westside-logo.png',
};

// Get logo URL - prefers local file, falls back to database logo_url
function getLogoUrl(district: District, slug: string): string | null {
  if (slug && districtLogos[slug]) {
    return districtLogos[slug];
  }
  return district.logo_url || null;
}

interface MobileHeaderProps {
  district: District;
  onMenuToggle: () => void;
}

export function MobileHeader({ district, onMenuToggle }: MobileHeaderProps) {
  const { slug } = useParams();
  const location = useLocation();

  // Determine context indicator based on route
  const getContextLabel = () => {
    if (location.pathname.includes('/goal/')) {
      return 'Goal Detail';
    }
    return 'Overview';
  };

  return (
    <header className="sticky top-0 z-30 lg:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 h-14 px-4 flex items-center justify-between">
      <div className="flex items-center">
        {/* Hamburger Menu */}
        <button
          onClick={onMenuToggle}
          className="mr-3 text-gray-500 hover:text-gray-900 p-1 -ml-1"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link to={`/${slug}`} className="flex items-center gap-2">
          {(() => {
            const logoUrl = getLogoUrl(district, slug || '');
            return logoUrl ? (
              <img src={logoUrl} alt={district.name} className="w-6 h-6 object-contain" />
            ) : (
              <div className="w-6 h-6 rounded bg-district-red flex items-center justify-center text-white font-display font-semibold text-xs">
                {district.name.charAt(0)}
              </div>
            );
          })()}
          <span className="font-display font-semibold text-sm text-gray-900">
            {district.name.split(' ')[0]}
          </span>
        </Link>
      </div>

      {/* Context Indicator */}
      <div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {getContextLabel()}
        </span>
      </div>
    </header>
  );
}
