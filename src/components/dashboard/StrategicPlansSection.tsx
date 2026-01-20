import { Plus, Search, ChevronDown } from 'lucide-react';
import type { PlanWithSummary } from '../../lib/types';

interface StrategicPlansSectionProps {
  plans: PlanWithSummary[];
  selectedPlanId: string | null;
  onPlanSelect: (planId: string) => void;
  onCreatePlan: () => void;
  isLoading?: boolean;
}

export function StrategicPlansSection({
  plans,
  selectedPlanId,
  onPlanSelect,
  onCreatePlan,
  isLoading,
}: StrategicPlansSectionProps) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
      <div className="flex flex-col gap-6 max-w-4xl">
        {/* Header */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight">My Strategic Plans</h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
            Strategic Plans help organize and align all your objectives and initiatives. Select or
            create a plan to add top-level strategic objectives.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Create button */}
          <button
            onClick={onCreatePlan}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm shadow-indigo-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm font-medium border border-transparent"
          >
            <Plus size={18} />
            <span>Create New Plan</span>
          </button>

          {/* Plan selector */}
          <div className="relative w-full sm:w-72 group">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"
            />
            <select
              value={selectedPlanId || ''}
              onChange={(e) => onPlanSelect(e.target.value)}
              disabled={isLoading || plans.length === 0}
              className="w-full appearance-none pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none cursor-pointer hover:border-slate-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                {isLoading ? 'Loading plans...' : 'Select a strategic plan'}
              </option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
