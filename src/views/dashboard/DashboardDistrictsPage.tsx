import { useState, useMemo } from 'react';
import { Building2, Search, Users, FileText, Target, ExternalLink, Settings } from 'lucide-react';
import { useUserDistrictsWithStats } from '../../hooks/useUserDistricts';
import { buildSubdomainUrlWithPath } from '../../lib/subdomain';
import type { UserDistrictWithStats } from '../../lib/services/userDashboard.service';

/**
 * DashboardDistrictsPage - Full districts listing at /dashboard/districts
 *
 * Lists all districts the user has access to with stats and actions.
 */
export function DashboardDistrictsPage() {
  const { data: districts = [], isLoading } = useUserDistrictsWithStats();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDistricts = useMemo(() => {
    if (!searchQuery) return districts;
    const q = searchQuery.toLowerCase();
    return districts.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.slug.toLowerCase().includes(q) ||
        (d.tagline?.toLowerCase() || '').includes(q),
    );
  }, [districts, searchQuery]);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-[1100px]">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--editorial-border)' }} />
          <div className="h-4 w-64 rounded mt-2" style={{ backgroundColor: 'var(--editorial-border-light)' }} />
        </div>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-xl" style={{ backgroundColor: 'var(--editorial-border-light)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1100px]">
      {/* Header */}
      <div>
        <h1
          className="text-2xl sm:text-[28px] font-medium tracking-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
        >
          Districts
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
          Manage your districts and access their admin panels
        </p>
      </div>

      {/* Search */}
      {districts.length > 1 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--editorial-text-muted)' }} />
          <input
            type="text"
            placeholder="Search districts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-hidden"
            style={{
              border: '1px solid var(--editorial-border)',
              backgroundColor: 'var(--editorial-surface)',
              color: 'var(--editorial-text-primary)',
            }}
          />
        </div>
      )}

      {/* District Cards */}
      {filteredDistricts.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--editorial-surface-alt)' }}
          >
            <Building2 className="h-6 w-6" style={{ color: 'var(--editorial-text-muted)' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--editorial-text-primary)' }}>
            {searchQuery ? 'No districts match your search' : 'No districts yet'}
          </h3>
          <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
            {searchQuery
              ? 'Try adjusting your search criteria'
              : 'You don\'t have access to any districts yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDistricts.map((district) => (
            <DistrictCard key={district.id} district={district} />
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredDistricts.length > 0 && searchQuery && (
        <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
          Showing {filteredDistricts.length} of {districts.length} districts
        </p>
      )}
    </div>
  );
}

function DistrictCard({ district }: { district: UserDistrictWithStats }) {
  const adminUrl = buildSubdomainUrlWithPath('district', '/admin', district.slug);
  const publicUrl = buildSubdomainUrlWithPath('district', '/', district.slug);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
    >
      {/* Color accent strip */}
      <div className="h-1.5" style={{ backgroundColor: district.primary_color || '#6B8F71' }} />

      <div className="p-5">
        {/* District info */}
        <div className="flex items-start gap-4 mb-4">
          <DistrictAvatar district={district} />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--editorial-text-primary)' }}>
              {district.name}
            </h3>
            {district.tagline && (
              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--editorial-text-muted)' }}>
                {district.tagline}
              </p>
            )}
            <span
              className="inline-flex items-center mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={
                district.is_public
                  ? { backgroundColor: 'rgba(107, 143, 113, 0.15)', color: 'var(--editorial-accent-success)' }
                  : { backgroundColor: 'var(--editorial-surface-alt)', color: 'var(--editorial-text-muted)' }
              }
            >
              {district.is_public ? 'Public' : 'Private'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <MiniStat icon={<FileText size={14} />} label="Plans" value={district.plan_count} />
          <MiniStat icon={<Target size={14} />} label="Objectives" value={district.objective_count} />
          <MiniStat icon={<Users size={14} />} label="Users" value={district.user_count} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={adminUrl}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-white rounded-lg transition-colors font-medium text-sm"
            style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary)'; }}
          >
            <Settings size={14} />
            Open Admin
          </a>
          <a
            href={publicUrl}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-colors font-medium text-sm"
            style={{
              border: '1px solid var(--editorial-border)',
              color: 'var(--editorial-text-secondary)',
              backgroundColor: 'var(--editorial-surface)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-surface-alt)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-surface)'; }}
          >
            <ExternalLink size={14} />
            View Public
          </a>
        </div>
      </div>
    </div>
  );
}

function DistrictAvatar({ district }: { district: UserDistrictWithStats }) {
  if (district.logo_url) {
    return (
      <img
        src={district.logo_url}
        alt=""
        className="w-10 h-10 rounded-lg object-cover shrink-0"
      />
    );
  }

  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
      style={{ backgroundColor: district.primary_color || '#D97706' }}
    >
      {district.name.substring(0, 2).toUpperCase()}
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div
      className="rounded-lg px-3 py-2 text-center"
      style={{ backgroundColor: 'var(--editorial-surface-alt)' }}
    >
      <div className="flex items-center justify-center gap-1 mb-0.5" style={{ color: 'var(--editorial-text-muted)' }}>
        {icon}
      </div>
      <div className="text-lg font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>
        {value}
      </div>
      <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>
        {label}
      </div>
    </div>
  );
}
