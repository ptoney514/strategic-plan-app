import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGoals, useDistrict } from '../../../hooks';
import { Plus, ChevronLeft, Eye } from 'lucide-react';
import { GoalsTreePanel } from '../../../components/goals-v2/GoalsTreePanel';
import { GoalDetailPanel } from '../../../components/goals-v2/GoalDetailPanel';
import type { Goal } from '../../../lib/types';

export default function AdminGoalsV2() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: district, isLoading: isLoadingDistrict } = useDistrict(slug || '');
  const { data: goals, isLoading: isLoadingGoals, refetch } = useGoals(district?.id || '');

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const isLoading = isLoadingDistrict || isLoadingGoals;

  // Build hierarchical goal structure
  const buildGoalHierarchy = (goals: Goal[]): Goal[] => {
    console.log('[AdminGoalsV2] Building hierarchy from goals:', goals);
    const goalsMap = new Map<string, Goal>();
    const rootGoals: Goal[] = [];

    // First pass: create map of all goals
    goals.forEach(goal => {
      goalsMap.set(goal.id, { ...goal, children: [] });
    });

    // Second pass: build hierarchy
    goals.forEach(goal => {
      const goalWithChildren = goalsMap.get(goal.id);
      if (goalWithChildren) {
        if (goal.parent_id) {
          console.log(`[AdminGoalsV2] Goal ${goal.goal_number} has parent_id:`, goal.parent_id);
          const parent = goalsMap.get(goal.parent_id);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(goalWithChildren);
            console.log(`[AdminGoalsV2] Added ${goal.goal_number} as child of ${parent.goal_number}`);
          } else {
            console.warn(`[AdminGoalsV2] Parent not found for goal ${goal.goal_number}, parent_id:`, goal.parent_id);
          }
        } else {
          console.log(`[AdminGoalsV2] Goal ${goal.goal_number} is a root goal (no parent_id)`);
          rootGoals.push(goalWithChildren);
        }
      }
    });

    console.log('[AdminGoalsV2] Root goals:', rootGoals);
    console.log('[AdminGoalsV2] Root goals with children:', rootGoals.map(g => ({
      number: g.goal_number,
      children: g.children?.map(c => c.goal_number)
    })));

    // Sort root goals by order_position
    return rootGoals.sort((a, b) => a.order_position - b.order_position);
  };

  const hierarchicalGoals = goals ? buildGoalHierarchy(goals) : [];
  console.log('[AdminGoalsV2] Hierarchical goals:', hierarchicalGoals);
  const selectedGoal = goals?.find(g => g.id === selectedGoalId) || null;

  const handleGoBack = () => {
    navigate(`/${slug}/admin`);
  };

  const handleViewPublic = () => {
    navigate(`/${slug}/dashboard`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading strategic objectives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Strategic Objectives & Goals
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {district?.name || 'District'} - Admin View
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleViewPublic}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Public
              </button>
              <button
                onClick={() => {/* TODO: Create objective */}}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Strategic Objective
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Split View Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Panel - Goals Tree */}
        <GoalsTreePanel
          goals={hierarchicalGoals}
          selectedGoalId={selectedGoalId}
          onSelectGoal={setSelectedGoalId}
          searchQuery=""
        />

        {/* Right Panel - Goal Details */}
        <GoalDetailPanel
          goal={selectedGoal}
          districtSlug={slug || ''}
          onRefresh={refetch}
        />
      </div>
    </div>
  );
}
