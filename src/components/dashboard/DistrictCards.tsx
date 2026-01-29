import { ExternalLink, Settings } from 'lucide-react';
import { useUserDistricts } from '../../hooks/useUserDistricts';
import { buildSubdomainUrlWithPath } from '../../lib/subdomain';
import type { District } from '../../lib/types';

/**
 * DistrictCards - Grid display of user's accessible districts
 *
 * Shows all districts the current user has admin access to,
 * with quick links to manage (admin) and view (public) each district.
 */
export function DistrictCards() {
  const { data: districts, isLoading, error } = useUserDistricts();

  if (isLoading) {
    return <DistrictCardsLoading />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        Failed to load districts. Please try again.
      </div>
    );
  }

  if (!districts || districts.length === 0) {
    return <DistrictCardsEmpty />;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Your Districts
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {districts.map((district) => (
          <DistrictCard key={district.id} district={district} />
        ))}
      </div>
    </section>
  );
}

/**
 * Individual district card
 */
function DistrictCard({ district }: { district: District }) {
  const adminUrl = buildSubdomainUrlWithPath('district', '/admin', district.slug);
  const publicUrl = buildSubdomainUrlWithPath('district', '/', district.slug);

  return (
    <div
      className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      data-testid="district-card"
    >
      {/* Color header bar */}
      <div
        className="h-2"
        style={{ backgroundColor: district.primary_color || '#D97706' }}
      />

      <div className="p-5">
        {/* District info */}
        <div className="flex items-start gap-4 mb-4">
          <DistrictAvatar district={district} />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {district.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {district.slug}.stratadash.org
            </p>
          </div>
        </div>

        {/* Tagline if present */}
        {district.tagline && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
            {district.tagline}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <a
            href={adminUrl}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-teal hover:bg-brand-teal/90 rounded-lg transition-colors"
          >
            <Settings size={16} />
            Manage
          </a>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ExternalLink size={16} />
            View
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * District avatar component
 */
function DistrictAvatar({ district }: { district: District }) {
  if (district.logo_url) {
    return (
      <img
        src={district.logo_url}
        alt=""
        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
      />
    );
  }

  return (
    <div
      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
      style={{ backgroundColor: district.primary_color || '#D97706' }}
    >
      {district.name.substring(0, 2).toUpperCase()}
    </div>
  );
}

/**
 * Loading skeleton for district cards
 */
function DistrictCardsLoading() {
  return (
    <section>
      <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="h-2 bg-slate-200 dark:bg-slate-700" />
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="w-20 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Empty state when user has no districts
 */
function DistrictCardsEmpty() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Your Districts
      </h2>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          No Districts Yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          You don't have admin access to any districts yet. Contact your system administrator
          to get access to a district.
        </p>
      </div>
    </section>
  );
}
