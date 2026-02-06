import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Globe, Lock, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { usePlansWithCounts, useDeletePlan, useUpdatePlan } from '../../../hooks/usePlans';

/**
 * PlansList - View and manage strategic plans for a district
 * Restyled with editorial warm paper aesthetic
 */
export function PlansList() {
  const navigate = useNavigate();
  const { slug } = useSubdomain();
  const { data: district, isLoading: districtLoading } = useDistrict(slug || '');
  const { data: plans, isLoading: plansLoading } = usePlansWithCounts(district?.id || '');
  const deletePlan = useDeletePlan();
  const updatePlan = useUpdatePlan();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const isLoading = districtLoading || plansLoading;

  // Filter plans based on search and type
  const filteredPlans = (plans || []).filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (plan.type_label?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || plan.type_label?.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  // Get unique type labels for filter dropdown
  const typeLabels = [...new Set((plans || []).map(p => p.type_label).filter(Boolean))];

  const handleCreatePlan = () => {
    navigate('/admin/plans/create');
  };

  const handleEditPlan = (planId: string) => {
    navigate(`/admin/plans/${planId}/edit`);
    setOpenMenuId(null);
  };

  const handleViewPlan = (planId: string) => {
    navigate(`/admin/plans/${planId}`);
    setOpenMenuId(null);
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deletePlan.mutateAsync(planId);
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
    setDeleteConfirm(null);
  };

  const handleTogglePublic = async (planId: string, currentlyPublic: boolean) => {
    try {
      await updatePlan.mutateAsync({
        id: planId,
        updates: { is_public: !currentlyPublic },
      });
    } catch (error) {
      console.error('Error updating plan visibility:', error);
    }
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
            Organize your objectives into strategic plans
          </p>
        </div>
        <button
          onClick={handleCreatePlan}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors font-semibold text-sm"
          style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary)'; }}
        >
          <Plus size={18} />
          New plan
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--editorial-text-muted)' }} />
          <input
            type="text"
            placeholder="Search a plan"
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
                Type
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>
                Objectives
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>
                Public View
              </th>
              <th className="w-12"></th>
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
                    <button
                      onClick={handleCreatePlan}
                      className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors font-medium text-sm"
                      style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
                    >
                      <Plus size={16} />
                      Create your first plan
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredPlans.map((plan) => (
                <tr
                  key={plan.id}
                  className="group"
                  style={{ borderBottom: '1px solid var(--editorial-border-light)' }}
                >
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleViewPlan(plan.id)}
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
                    </button>
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
                      {plan.objectiveCount || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleTogglePublic(plan.id, plan.is_public)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                      style={plan.is_public
                        ? { backgroundColor: 'rgba(107, 143, 113, 0.15)', color: 'var(--editorial-accent-success)' }
                        : { backgroundColor: 'var(--editorial-surface-alt)', color: 'var(--editorial-text-secondary)' }
                      }
                    >
                      {plan.is_public ? (
                        <>
                          <Globe size={12} />
                          Enabled
                        </>
                      ) : (
                        <>
                          <Lock size={12} />
                          Private
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === plan.id ? null : plan.id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--editorial-text-muted)' }}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openMenuId === plan.id && (
                        <>
                          {/* Backdrop */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />

                          {/* Dropdown Menu */}
                          <div
                            className="absolute right-0 mt-1 w-48 rounded-lg shadow-lg py-1 z-20"
                            style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
                          >
                            <button
                              onClick={() => handleViewPlan(plan.id)}
                              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                              style={{ color: 'var(--editorial-text-secondary)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-surface-alt)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <Eye size={16} />
                              View Details
                            </button>
                            <button
                              onClick={() => handleEditPlan(plan.id)}
                              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                              style={{ color: 'var(--editorial-text-secondary)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-surface-alt)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <Pencil size={16} />
                              Edit Plan
                            </button>
                            <hr style={{ borderColor: 'var(--editorial-border-light)' }} className="my-1" />
                            <button
                              onClick={() => {
                                setDeleteConfirm({ id: plan.id, name: plan.name });
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 flex items-center gap-2 transition-colors"
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <Trash2 size={16} />
                              Delete Plan
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {filteredPlans.length > 0 && (
        <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
          Showing {filteredPlans.length} of {plans?.length || 0} plans
        </p>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div
            className="relative rounded-xl w-full max-w-md mx-4 p-6"
            style={{ backgroundColor: 'var(--editorial-surface)' }}
          >
            <h2
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--editorial-text-primary)' }}
            >
              Delete Plan
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--editorial-text-secondary)' }}>
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? All objectives within it will also be deleted. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--editorial-surface-alt)', color: 'var(--editorial-text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePlan(deleteConfirm.id)}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
