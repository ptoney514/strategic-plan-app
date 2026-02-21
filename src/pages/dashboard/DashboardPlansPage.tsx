import { useState, useMemo } from 'react';
import { FileText, Search, Globe, Lock, Plus, Eye } from 'lucide-react';
import { useUserPlansWithCounts } from '../../hooks/useUserPlans';
import { useUserDistricts } from '../../hooks/useUserDistricts';
import { buildSubdomainUrlWithPath } from '../../lib/subdomain';
import type { PlanWithSummary, District } from '../../lib/types';

/**
 * DashboardPlansPage - Cross-district plans list for root domain (/dashboard/plans)
 *
 * Lists all plans the user has access to across all their districts.
 * Each plan links to its district admin detail page via subdomain URL.
 */
export function DashboardPlansPage() {
  const { data: plans = [], isLoading: plansLoading } = useUserPlansWithCounts();
  const { data: districts = [], isLoading: districtsLoading } = useUserDistricts();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const isLoading = plansLoading || districtsLoading;

  // Build district lookup by ID for badges and navigation
  const districtMap = useMemo(() => {
    const map = new Map<string, District>();
    for (const d of districts) {
      map.set(d.id, d);
    }
    return map;
  }, [districts]);

  // Filter plans based on search and type
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (plan.type_label?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || plan.type_label?.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [plans, searchQuery, filterType]);

  // Get unique type labels for filter dropdown
  const typeLabels = useMemo(() => {
    return [...new Set(plans.map(p => p.type_label).filter(Boolean))];
  }, [plans]);

  // Build link to district admin plan detail page
  const getPlanDetailUrl = (plan: PlanWithSummary) => {
    const district = districtMap.get(plan.district_id || '');
    if (district) {
      return buildSubdomainUrlWithPath('district', `/admin/plans/${plan.id}`, district.slug);
    }
    return `/dashboard/plans/${plan.id}`;
  };

  // Build link to district admin create page
  const getCreatePlanUrl = () => {
    if (districts.length === 1) {
      return buildSubdomainUrlWithPath('district', '/admin/plans/create', districts[0].slug);
    }
    // For multi-district users, link to first district (they can switch)
    if (districts.length > 0) {
      return buildSubdomainUrlWithPath('district', '/admin/plans/create', districts[0].slug);
    }
    return '/dashboard/plans';
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-[1100px]">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--editorial-border)' }} />
          <div className="h-4 w-64 rounded mt-2" style={{ backgroundColor: 'var(--editorial-border-light)' }} />
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-lg" style={{ backgroundColor: 'var(--editorial-border-light)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl sm:text-[28px] font-medium tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
          >
            Strategic Plans
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
            View and manage all your strategic plans across districts
          </p>
        </div>
        <a
          href={getCreatePlanUrl()}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors font-semibold text-sm"
          style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary)'; }}
        >
          <Plus size={18} />
          New plan
        </a>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--editorial-text-muted)' }} />
          <input
            type="text"
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none"
            style={{
              border: '1px solid var(--editorial-border)',
              backgroundColor: 'var(--editorial-surface)',
              color: 'var(--editorial-text-primary)',
            }}
          />
        </div>
        {typeLabels.length > 0 && (
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-lg text-sm focus:outline-none"
            style={{
              border: '1px solid var(--editorial-border)',
              backgroundColor: 'var(--editorial-surface)',
              color: 'var(--editorial-text-primary)',
            }}
          >
            <option value="all">All plans</option>
            {typeLabels.map(label => (
              <option key={label} value={label?.toLowerCase()}>{label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Plans Table */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
        <table className="w-full">
          <thead style={{ backgroundColor: 'var(--editorial-surface-alt)', borderBottom: '1px solid var(--editorial-border)' }}>
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>
                Plan
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>
                District
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>
                Type
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>
                Objectives
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--editorial-border)' }} />
                  <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--editorial-text-primary)' }}>
                    {searchQuery || filterType !== 'all' ? 'No plans match your filters' : 'No plans yet'}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--editorial-text-muted)' }}>
                    {searchQuery || filterType !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Create your first strategic plan to organize objectives'}
                  </p>
                  {!searchQuery && filterType === 'all' && (
                    <a
                      href={getCreatePlanUrl()}
                      className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors font-medium text-sm"
                      style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
                    >
                      <Plus size={16} />
                      Create your first plan
                    </a>
                  )}
                </td>
              </tr>
            ) : (
              filteredPlans.map((plan) => {
                const district = districtMap.get(plan.district_id || '');
                return (
                  <tr
                    key={plan.id}
                    className="group"
                    style={{ borderBottom: '1px solid var(--editorial-border-light)' }}
                  >
                    <td className="py-3 px-4">
                      <a
                        href={getPlanDetailUrl(plan)}
                        className="flex items-center gap-3 text-left transition-colors"
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: 'var(--editorial-surface-alt)', color: 'var(--editorial-text-muted)' }}
                        >
                          <FileText size={18} />
                        </div>
                        <div>
                          <span className="font-medium" style={{ color: 'var(--editorial-text-primary)' }}>
                            {plan.name}
                          </span>
                          {plan.description && (
                            <p className="text-xs line-clamp-1 max-w-sm" style={{ color: 'var(--editorial-text-muted)' }}>
                              {plan.description}
                            </p>
                          )}
                        </div>
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      {district ? (
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: district.primary_color ? `${district.primary_color}20` : 'var(--editorial-surface-alt)',
                            color: district.primary_color || 'var(--editorial-text-secondary)',
                          }}
                        >
                          {district.name}
                        </span>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {plan.type_label ? (
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: 'var(--editorial-surface-alt)', color: 'var(--editorial-text-secondary)' }}
                        >
                          {plan.type_label}
                        </span>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--editorial-text-secondary)' }}>
                        <Eye size={14} style={{ color: 'var(--editorial-text-muted)' }} />
                        {plan.objectiveCount ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={plan.is_public
                          ? { backgroundColor: 'rgba(107, 143, 113, 0.15)', color: 'var(--editorial-accent-success)' }
                          : { backgroundColor: 'var(--editorial-surface-alt)', color: 'var(--editorial-text-secondary)' }
                        }
                      >
                        {plan.is_public ? (
                          <>
                            <Globe size={12} />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock size={12} />
                            Private
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {filteredPlans.length > 0 && (
        <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
          Showing {filteredPlans.length} of {plans.length} plans
        </p>
      )}
    </div>
  );
}
