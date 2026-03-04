import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Target, CheckCircle, Users, Plus } from 'lucide-react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { usePlansBySlug, useCreatePlan } from '../../../hooks/v2/usePlans';
import { useOrgMembers } from '../../../hooks/v2/useTeam';
import { GoalsService } from '../../../lib/services/goals.service';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import type { HierarchicalGoal } from '../../../lib/types';

function countGoals(goals: HierarchicalGoal[]): { total: number; completed: number } {
  let total = 0;
  let completed = 0;
  function walk(nodes: HierarchicalGoal[]) {
    for (const g of nodes) {
      total++;
      if (g.status === 'completed') completed++;
      if (g.children) walk(g.children);
    }
  }
  walk(goals);
  return { total, completed };
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <span className="text-sm font-medium" style={{ color: 'var(--editorial-text-secondary)' }}>{label}</span>
      </div>
      <div className="text-3xl font-bold" style={{ color: 'var(--editorial-text-primary)' }}>{value}</div>
    </div>
  );
}

export function V2AdminDashboard() {
  const navigate = useNavigate();
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const { data: plans, isLoading: plansLoading } = usePlansBySlug(slug || '');
  const { data: members, isLoading: membersLoading } = useOrgMembers(slug || '');
  const createPlan = useCreatePlan();

  const { data: goals } = useQuery({
    queryKey: ['goals', 'district', district?.id],
    queryFn: () => GoalsService.getByDistrict(district!.id),
    enabled: !!district?.id,
  });

  const { total: totalGoals, completed: completedGoals } = countGoals(goals || []);
  const isLoading = plansLoading || membersLoading;

  async function handleCreatePlan() {
    if (!district) return;
    const newPlan = await createPlan.mutateAsync({
      name: 'New Strategic Plan',
      district_id: district.id,
      is_active: false,
      is_public: false,
      order_position: (plans?.length || 0) + 1,
    });
    navigate(`/admin/plans?planId=${newPlan.id}`);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--editorial-accent-primary)' }} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--editorial-text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--editorial-text-secondary)' }}>
            Overview of your strategic plans and progress
          </p>
        </div>
        <Button onClick={handleCreatePlan} disabled={createPlan.isPending} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          {createPlan.isPending ? 'Creating...' : 'New Plan'}
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Plans" value={plans?.length || 0} color="#6366f1" />
        <StatCard icon={Target} label="Total Goals" value={totalGoals} color="#f59e0b" />
        <StatCard icon={CheckCircle} label="Completed" value={completedGoals} color="#22c55e" />
        <StatCard icon={Users} label="Team Members" value={members?.length || 0} color="#3b82f6" />
      </div>

      {/* Plans List */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--editorial-text-primary)' }}>Strategic Plans</h2>

        {!plans?.length ? (
          <div
            className="rounded-xl p-10 text-center"
            style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
          >
            <FileText className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--editorial-text-secondary)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--editorial-text-primary)' }}>No plans yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--editorial-text-secondary)' }}>
              Create your first strategic plan to get started.
            </p>
            <Button onClick={handleCreatePlan} disabled={createPlan.isPending} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Create Plan
            </Button>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--editorial-border)' }}>
                  <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--editorial-text-secondary)' }}>Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--editorial-text-secondary)' }}>Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--editorial-text-secondary)' }}>Created</th>
                  <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--editorial-text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--editorial-border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--editorial-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    onClick={() => navigate(`/admin/plans?planId=${plan.id}`)}
                  >
                    <td className="px-5 py-4">
                      <span className="font-medium text-sm" style={{ color: 'var(--editorial-text-primary)' }}>{plan.name}</span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <Badge variant={plan.is_active ? 'success' : 'secondary'}>
                        {plan.is_active ? 'Active' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm hidden md:table-cell" style={{ color: 'var(--editorial-text-secondary)' }}>
                      {new Date(plan.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/plans?planId=${plan.id}`); }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
