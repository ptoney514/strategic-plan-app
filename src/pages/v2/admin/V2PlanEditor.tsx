import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { usePlansBySlug } from '../../../hooks/v2/usePlans';
import { useGoalsByPlan } from '../../../hooks/v2/useGoals';
import { GoalTreeView } from '../../../components/v2/tree/GoalTreeView';
import { AddGoalInline } from '../../../components/v2/tree/AddGoalInline';

export function V2PlanEditor() {
  const { slug } = useSubdomain();
  const { data: district, isLoading: districtLoading } = useDistrict(slug || '');
  const { data: plans, isLoading: plansLoading } = usePlansBySlug(slug || '');
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddRoot, setShowAddRoot] = useState(false);

  const planIdParam = searchParams.get('planId');

  const selectedPlanId = useMemo(() => {
    if (planIdParam && plans?.some((p) => p.id === planIdParam)) return planIdParam;
    return plans?.[0]?.id || '';
  }, [planIdParam, plans]);

  const selectedPlan = plans?.find((p) => p.id === selectedPlanId);

  const { data: goals, isLoading: goalsLoading } = useGoalsByPlan(selectedPlanId);

  function handlePlanChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSearchParams({ planId: e.target.value });
  }

  if (districtLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: 'var(--editorial-accent-primary)' }}
        />
      </div>
    );
  }

  if (!district) {
    return (
      <div className="p-8 text-center">
        <p style={{ color: 'var(--editorial-text-secondary)' }}>District not found.</p>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--editorial-text-secondary)' }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--editorial-text-primary)' }}>
            No Plans Yet
          </h2>
          <p className="text-sm" style={{ color: 'var(--editorial-text-secondary)' }}>
            Create a plan to start building your strategic goals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold" style={{ color: 'var(--editorial-text-primary)' }}>
            Plans & Goals
          </h1>

          {/* Plan selector */}
          {plans.length > 1 && (
            <select
              value={selectedPlanId}
              onChange={handlePlanChange}
              className="text-sm rounded-md px-3 py-1.5 outline-hidden cursor-pointer"
              style={{
                backgroundColor: 'var(--editorial-surface)',
                border: '1px solid var(--editorial-border)',
                color: 'var(--editorial-text-primary)',
              }}
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={() => setShowAddRoot(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Objective
        </button>
      </div>

      {/* Current plan name (when only one plan) */}
      {plans.length === 1 && selectedPlan && (
        <p className="text-sm mb-4" style={{ color: 'var(--editorial-text-secondary)' }}>
          {selectedPlan.name}
        </p>
      )}

      {/* Add root goal inline */}
      {showAddRoot && district && (
        <div className="mb-4">
          <AddGoalInline
            planId={selectedPlanId}
            districtId={district.id}
            parentId={null}
            level={0}
            onCancel={() => setShowAddRoot(false)}
          />
        </div>
      )}

      {/* Goal tree */}
      {goalsLoading ? (
        <div className="flex items-center justify-center py-16">
          <div
            className="animate-spin rounded-full h-6 w-6 border-b-2"
            style={{ borderColor: 'var(--editorial-accent-primary)' }}
          />
        </div>
      ) : (
        <GoalTreeView
          goals={goals || []}
          planId={selectedPlanId}
          districtId={district.id}
        />
      )}
    </div>
  );
}
