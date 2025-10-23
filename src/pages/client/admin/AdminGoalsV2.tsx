import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGoals, useDistrict } from '../../../hooks';
import { Plus, ChevronLeft, Eye, Info, ArrowLeft } from 'lucide-react';
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

  // useGoals already returns hierarchical goals from GoalsService.getByDistrict()
  // They already have children attached, no need to rebuild hierarchy
  const hierarchicalGoals = goals || [];

  // Find selected goal by traversing the hierarchy
  const findGoalById = (goals: Goal[], id: string): Goal | null => {
    for (const goal of goals) {
      if (goal.id === id) return goal;
      if (goal.children) {
        const found = findGoalById(goal.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedGoal = selectedGoalId ? findGoalById(hierarchicalGoals, selectedGoalId) : null;

  const handleGoBack = () => {
    navigate(`/${slug}/admin`);
  };

  const handleBackToManageGoals = () => {
    navigate(`/${slug}/admin/goals`);
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
                  Reorder Strategic Objectives
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Drag and drop to reorder objectives and goals
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToManageGoals}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Manage Goals
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Use this page to reorder objectives and goals. To edit content or add measures, go to{' '}
            <Link
              to={`/${slug}/admin/goals`}
              className="font-semibold underline hover:text-blue-900"
            >
              Manage Goals
            </Link>
          </p>
        </div>
      </div>

      {/* Split View Content */}
      <div className="flex h-[calc(100vh-190px)]">
        {/* Left Panel - Goals Tree */}
        <GoalsTreePanel
          goals={hierarchicalGoals}
          selectedGoalId={selectedGoalId}
          onSelectGoal={setSelectedGoalId}
          searchQuery=""
          districtId={district?.id}
          enableReordering={true}
          onRefresh={refetch}
        />

        {/* Right Panel - Goal Details */}
        <GoalDetailPanel
          goal={selectedGoal}
          districtSlug={slug || ''}
          onRefresh={refetch}
          mode="simple"
        />
      </div>
    </div>
  );
}
