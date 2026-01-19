import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Globe, Lock, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { usePlansWithCounts, useDeletePlan, useUpdatePlan } from '../../../hooks/usePlans';

/**
 * PlansList - View and manage strategic plans for a district
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
    if (window.confirm('Are you sure you want to delete this plan? All objectives within it will also be deleted.')) {
      try {
        await deletePlan.mutateAsync(planId);
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
    setOpenMenuId(null);
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
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-64 bg-slate-100 rounded mt-2" />
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Strategic Plans</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize your objectives into strategic plans
          </p>
        </div>
        <button
          onClick={handleCreatePlan}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
        >
          <Plus size={18} />
          New plan
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search a plan"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        >
          <option value="all">All plans</option>
          {typeLabels.map(label => (
            <option key={label} value={label?.toLowerCase()}>{label}</option>
          ))}
        </select>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Objectives
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Public View
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPlans.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-slate-900 mb-1">
                    {searchQuery || filterType !== 'all' ? 'No plans match your filters' : 'No plans yet'}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {searchQuery || filterType !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Create your first strategic plan to organize objectives'}
                  </p>
                  {!searchQuery && filterType === 'all' && (
                    <button
                      onClick={handleCreatePlan}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm"
                    >
                      <Plus size={16} />
                      Create your first plan
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50 group">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleViewPlan(plan.id)}
                      className="flex items-center gap-3 text-left hover:text-amber-600 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <FileText size={18} />
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 group-hover:text-amber-600">
                          {plan.name}
                        </span>
                        {plan.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-sm">
                            {plan.description}
                          </p>
                        )}
                      </div>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    {plan.type_label ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {plan.type_label}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <Eye size={14} className="text-slate-400" />
                      {plan.objectiveCount || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleTogglePublic(plan.id, plan.is_public)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        plan.is_public
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
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
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
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
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                            <button
                              onClick={() => handleViewPlan(plan.id)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Eye size={16} />
                              View Details
                            </button>
                            <button
                              onClick={() => handleEditPlan(plan.id)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Pencil size={16} />
                              Edit Plan
                            </button>
                            <hr className="my-1 border-slate-100" />
                            <button
                              onClick={() => handleDeletePlan(plan.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
        <p className="text-sm text-slate-500">
          Showing {filteredPlans.length} of {plans?.length || 0} plans
        </p>
      )}
    </div>
  );
}
