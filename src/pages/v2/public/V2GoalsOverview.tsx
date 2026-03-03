import { useNavigate } from 'react-router-dom';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { usePlansBySlug } from '../../../hooks/v2/usePlans';
import { useGoalsByPlan } from '../../../hooks/v2/useGoals';
import { ObjectiveCard, Breadcrumb } from '../../../components/v2/public';

export function V2GoalsOverview() {
  const navigate = useNavigate();
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const { data: plans, isLoading: plansLoading } = usePlansBySlug(slug || '');

  const activePlan = plans?.find((p) => p.is_active && p.is_public);

  const { data: goals, isLoading: goalsLoading } = useGoalsByPlan(activePlan?.id || '');

  const isLoading = plansLoading || goalsLoading;
  const objectives = goals?.filter((g) => g.level === 0) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: 'var(--editorial-accent-primary)' }}
        />
      </div>
    );
  }

  if (!plans?.length || !activePlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-lg font-medium" style={{ color: 'var(--editorial-text-secondary)' }}>
          No public plan available
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: activePlan.name }, { label: 'All Objectives' }]} />

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--editorial-text-primary)' }}>
          Strategic Objectives
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--editorial-text-secondary)' }}>
          {objectives.length} {objectives.length === 1 ? 'objective' : 'objectives'} total
        </p>
      </div>

      {objectives.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm" style={{ color: 'var(--editorial-text-secondary)' }}>
            No objectives have been defined yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {objectives.map((goal) => (
            <ObjectiveCard
              key={goal.id}
              goalNumber={goal.goal_number}
              title={goal.title}
              childCount={goal.children?.length || 0}
              status={goal.status_detail}
              primaryColor={district?.primary_color}
              description={goal.description}
              overallProgress={goal.overall_progress}
              progressDisplayMode={goal.overall_progress_display_mode}
              onClick={() => navigate('/v2/goals/' + goal.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
