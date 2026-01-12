import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGoals, useDistrict } from '../../../hooks';
import { Plus, ChevronLeft, Eye, Info, ArrowLeft, X } from 'lucide-react';
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
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  Reorder Strategic Objectives
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 truncate">
                  Drag and drop to reorder objectives and goals
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleBackToManageGoals}
                className="px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Manage Goals</span>
                <span className="sm:hidden">Back</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 sm:px-6 py-3">
        <div className="flex items-start sm:items-center gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm text-blue-800">
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
      <div className="flex flex-col lg:flex-row h-[calc(100vh-190px)] lg:h-[calc(100vh-190px)]">
        {/* Left Panel - Goals Tree */}
        {/* On mobile: show when no goal selected, hidden when goal selected */}
        {/* On desktop: always show */}
        <div className={`${selectedGoalId ? 'hidden' : 'flex'} lg:flex lg:w-1/2 flex-col h-full lg:h-auto`}>
          <GoalsTreePanel
            goals={hierarchicalGoals}
            selectedGoalId={selectedGoalId}
            onSelectGoal={setSelectedGoalId}
            searchQuery=""
            districtId={district?.id}
            enableReordering={true}
            onRefresh={refetch}
          />
        </div>

        {/* Right Panel - Goal Details */}
        {/* On mobile: show when goal selected, hidden when no goal selected */}
        {/* On desktop: always show */}
        <div className={`${selectedGoalId ? 'flex' : 'hidden'} lg:flex lg:flex-1 flex-col h-full lg:h-auto`}>
          {/* Mobile Back Button */}
          {selectedGoalId && (
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
              <button
                onClick={() => setSelectedGoalId(null)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to objectives list
              </button>
            </div>
          )}
          <GoalDetailPanel
            goal={selectedGoal}
            districtSlug={slug || ''}
            onRefresh={refetch}
            mode="simple"
          />
        </div>
      </div>
    </div>
  );
}
