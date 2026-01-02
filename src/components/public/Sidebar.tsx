import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home, Calendar, X } from 'lucide-react';
import type { District, Goal } from '../../lib/types';

// Get status dot color based on progress
function getStatusDotColor(progress: number | null | undefined): string {
  if (progress === null || progress === undefined) return 'bg-gray-400';
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

// Get status label based on progress
function getStatusLabel(progress: number | null | undefined): string {
  if (progress === null || progress === undefined) return 'Not Started';
  if (progress >= 80) return 'On Target';
  if (progress >= 50) return 'Needs Attention';
  return 'Off Track';
}

// Get status text color based on progress
function getStatusTextColor(progress: number | null | undefined): string {
  if (progress === null || progress === undefined) return 'text-gray-500';
  if (progress >= 80) return 'text-green-600';
  if (progress >= 50) return 'text-amber-600';
  return 'text-red-600';
}

interface SidebarProps {
  district: District;
  objectives: Goal[];
  goals: Goal[];
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

// Color mapping for objective badges
const colorClasses = {
  red: {
    badge: 'bg-white text-district-red border-red-100',
    badgeActive: 'bg-white text-district-red border-red-100 shadow-sm',
    text: 'text-district-red',
    bg: 'bg-red-50',
  },
  blue: {
    badge: 'bg-white text-district-blue border-blue-100',
    badgeActive: 'bg-white text-district-blue border-blue-100 shadow-sm',
    text: 'text-district-blue',
    bg: 'bg-blue-50',
  },
  amber: {
    badge: 'bg-white text-district-amber border-amber-100',
    badgeActive: 'bg-white text-district-amber border-amber-100 shadow-sm',
    text: 'text-district-amber',
    bg: 'bg-amber-50',
  },
  green: {
    badge: 'bg-white text-district-green border-green-100',
    badgeActive: 'bg-white text-district-green border-green-100 shadow-sm',
    text: 'text-district-green',
    bg: 'bg-green-50',
  },
};

// Get color based on goal's color field or default by position
function getObjectiveColor(goal: Goal, index: number): keyof typeof colorClasses {
  if (goal.color && goal.color in colorClasses) {
    return goal.color as keyof typeof colorClasses;
  }
  const defaultColors: (keyof typeof colorClasses)[] = ['red', 'blue', 'amber', 'green'];
  return defaultColors[index % defaultColors.length];
}

export function Sidebar({ district, objectives, goals, isOpen, onClose, isLoading }: SidebarProps) {
  const { slug, goalId } = useParams();
  const location = useLocation();
  const [expandedObjective, setExpandedObjective] = useState<string | null>(null);

  // Determine which objective should be expanded based on current route
  const currentGoal = goals.find(g => g.id === goalId);
  const currentObjectiveId = currentGoal?.parent_id || currentGoal?.id;

  // Auto-expand objective when viewing a goal
  if (currentObjectiveId && expandedObjective !== currentObjectiveId) {
    // Find if current goal is an objective or child of objective
    const objective = objectives.find(o => o.id === currentObjectiveId || o.id === currentGoal?.parent_id);
    if (objective && expandedObjective !== objective.id) {
      setExpandedObjective(objective.id);
    }
  }

  const isOverviewActive = location.pathname === `/${slug}` || location.pathname === `/${slug}/overview`;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex-col">
        <SidebarContent
          district={district}
          objectives={objectives}
          goals={goals}
          expandedObjective={expandedObjective}
          setExpandedObjective={setExpandedObjective}
          isOverviewActive={isOverviewActive}
          currentGoalId={goalId}
          isLoading={isLoading}
        />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="font-display font-semibold text-gray-900">Menu</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <SidebarContent
          district={district}
          objectives={objectives}
          goals={goals}
          expandedObjective={expandedObjective}
          setExpandedObjective={setExpandedObjective}
          isOverviewActive={isOverviewActive}
          currentGoalId={goalId}
          onItemClick={onClose}
          isLoading={isLoading}
        />
      </aside>

      {/* Spacer for desktop sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0" />
    </>
  );
}

interface SidebarContentProps {
  district: District;
  objectives: Goal[];
  goals: Goal[];
  expandedObjective: string | null;
  setExpandedObjective: (id: string | null) => void;
  isOverviewActive: boolean;
  currentGoalId?: string;
  onItemClick?: () => void;
  isLoading?: boolean;
}

function SidebarContent({
  district,
  objectives,
  goals,
  expandedObjective,
  setExpandedObjective,
  isOverviewActive,
  currentGoalId,
  onItemClick,
  isLoading,
}: SidebarContentProps) {
  const { slug } = useParams();

  // Get child goals for an objective
  const getChildGoals = (objectiveId: string) => {
    return goals.filter(g => g.parent_id === objectiveId && g.level === 1);
  };

  return (
    <>
      {/* Logo Area */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 h-16 flex items-center">
        <Link to={`/${slug}`} className="flex items-center gap-3" onClick={onItemClick}>
          {district.logo_url ? (
            <img src={district.logo_url} alt={district.name} className="w-8 h-8 object-contain" />
          ) : (
            <div className="w-8 h-8 rounded bg-district-red flex items-center justify-center text-white font-display font-semibold text-sm">
              {district.name.charAt(0)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-display font-semibold text-sm tracking-tight text-gray-900 leading-none truncate max-w-[180px]">
              {district.name.split(' ')[0].toUpperCase()}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mt-0.5">
              Strategic Plan
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-6 px-3 pb-6 space-y-6 overflow-y-auto">
        {/* Overview Link */}
        <Link
          to={`/${slug}`}
          onClick={onItemClick}
          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isOverviewActive
              ? 'bg-red-50 text-district-red'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {isOverviewActive && (
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-district-red rounded-r" />
          )}
          <Home className="w-4 h-4" />
          <span>Overview</span>
        </Link>

        {/* Strategic Goals Section */}
        <div>
          <div className="px-3 mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Strategic Goals
            </h3>
            <div className="flex items-center shadow-sm border border-gray-200 rounded-md bg-white px-2 py-1">
              <Calendar className="w-3 h-3 text-gray-400 mr-1.5" />
              <span className="text-[10px] font-semibold text-gray-900">2021–2026</span>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2 px-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-10 bg-gray-100 rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {objectives.map((objective, index) => {
                const color = getObjectiveColor(objective, index);
                const colors = colorClasses[color];
                const isExpanded = expandedObjective === objective.id;
                const childGoals = getChildGoals(objective.id);
                const isActive = currentGoalId === objective.id;

                return (
                  <div key={objective.id} className="group">
                    {/* Objective Header */}
                    <button
                      onClick={() => setExpandedObjective(isExpanded ? null : objective.id)}
                      className={`relative w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                        isActive ? `${colors.bg} ${colors.text}` : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {isActive && (
                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-district-${color} rounded-r`} />
                      )}
                      <span
                        className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded text-[10px] font-semibold border flex-shrink-0 ${
                          isActive ? colors.badgeActive : colors.badge
                        }`}
                      >
                        {objective.goal_number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`truncate ${isActive ? colors.text : ''}`}>
                            {objective.title}
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 flex-shrink-0 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            } ${isActive ? `text-${color}-300` : 'text-gray-400'}`}
                          />
                        </div>
                        {/* Status indicator */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(objective.overall_progress)}`} />
                          <span className={`text-[10px] font-medium ${getStatusTextColor(objective.overall_progress)}`}>
                            {getStatusLabel(objective.overall_progress)}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Child Goals (Expanded) */}
                    {isExpanded && childGoals.length > 0 && (
                      <div className="pl-4 pr-1 mt-1 space-y-0.5">
                        <div className="relative">
                          <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
                          {childGoals.map(goal => {
                            const isGoalActive = currentGoalId === goal.id;
                            return (
                              <Link
                                key={goal.id}
                                to={`/${slug}/goal/${goal.id}`}
                                onClick={onItemClick}
                                className={`block pl-6 py-2 text-xs font-medium rounded-md transition-colors ${
                                  isGoalActive
                                    ? `${colors.text} ${colors.bg}/50`
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                {goal.goal_number} {goal.title}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Footer Link */}
      <div className="p-4 border-t border-gray-100">
        <a
          href={`https://www.${district.slug}.org`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Home className="w-4 h-4" />
          Return to District Home
        </a>
      </div>
    </>
  );
}
