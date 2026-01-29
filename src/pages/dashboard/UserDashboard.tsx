import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { WelcomeBanner, StrategicPlansSection, PlansTreeView, DistrictCards } from '../../components/dashboard';
import { useUserPlansWithCounts } from '../../hooks/useUserPlans';
import { usePlanGoals } from '../../hooks/useGoals';
import { useUserDistricts } from '../../hooks/useUserDistricts';
import { buildGoalHierarchy, type HierarchicalGoal } from '../../lib/types';

export function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Detect if we're in district admin context
  const isDistrictAdmin = location.pathname.startsWith('/admin');
  const basePath = isDistrictAdmin ? '/admin' : '/dashboard';

  // Fetch user's districts for showing DistrictCards on root dashboard
  const { data: districts } = useUserDistricts();
  const hasMultipleDistricts = (districts?.length ?? 0) > 1;

  // Fetch plans
  const { data: plans = [], isLoading: plansLoading } = useUserPlansWithCounts();

  // Fetch goals for each plan
  // We'll create a composite query that fetches goals for all plans
  const planIds = plans.map((p) => p.id);

  // For simplicity, we'll fetch goals for the first few plans
  // In production, you might want to batch this or use a different approach
  const { data: goalsData } = usePlanGoals(planIds[0] || '');

  // Build goals by plan map
  const goalsByPlan = useMemo(() => {
    const map: Record<string, HierarchicalGoal[]> = {};

    // For now, we only have goals for the first plan
    // This can be enhanced to fetch goals for all plans
    if (planIds[0] && goalsData) {
      map[planIds[0]] = buildGoalHierarchy(goalsData);
    }

    return map;
  }, [planIds, goalsData]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    // Navigate to the plan detail
    navigate(`${basePath}/plans/${planId}`);
  };

  const handleCreatePlan = () => {
    // Navigate to create plan page
    navigate(`${basePath}/plans/create`);
  };

  const handleAddObjective = (_planId: string) => {
    // Navigate to create objective page
    // Note: planId could be used to pre-select the plan when creating objective
    navigate(`${basePath}/objectives/create`);
  };

  return (
    <>
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* District Cards - shown on root dashboard for users with multiple districts */}
      {!isDistrictAdmin && hasMultipleDistricts && (
        <div className="mt-8">
          <DistrictCards />
        </div>
      )}

      {/* Strategic Plans Section */}
      <StrategicPlansSection
        plans={plans}
        selectedPlanId={selectedPlanId}
        onPlanSelect={handlePlanSelect}
        onCreatePlan={handleCreatePlan}
        isLoading={plansLoading}
      />

      {/* Plans Tree View */}
      <PlansTreeView
        plans={plans}
        goalsByPlan={goalsByPlan}
        onAddObjective={handleAddObjective}
        isLoading={plansLoading}
      />
    </>
  );
}
