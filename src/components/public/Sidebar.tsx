import { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, Calendar, X } from 'lucide-react';
import type { District, Goal } from '../../lib/types';
import { useSubdomain } from '../../contexts/SubdomainContext';

// Local logo mapping for districts (can be moved to R2/CDN later)
const districtLogos: Record<string, string> = {
  westside: '/assets/districts/westside-logo.png',
};

// Get logo URL - prefers local file, falls back to database logo_url
function getLogoUrl(district: District, slug: string): string | null {
  // Check for local logo first
  if (slug && districtLogos[slug]) {
    return districtLogos[slug];
  }
  // Fall back to database logo_url
  return district.logo_url || null;
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
  const params = useParams<{ slug?: string; goalId?: string }>();
  const { slug: subdomainSlug } = useSubdomain();
  // Use URL param slug if available, otherwise use subdomain slug
  const slug = params.slug || subdomainSlug || district.slug;
  const goalId = params.goalId;
  const location = useLocation();
  const [expandedObjective, setExpandedObjective] = useState<string | null>(null);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  // Helper to get direct children of any goal
  const getChildGoals = (parentId: string) => {
    return goals.filter(g => g.parent_id === parentId);
  };

  // Auto-expand ancestors when viewing a goal (useEffect to prevent infinite re-renders)
  useEffect(() => {
    if (!goalId || goals.length === 0) return;

    // Find ancestry of current goal
    const findAncestry = (id: string): string[] => {
      const ancestry: string[] = [];
      let current = goals.find(g => g.id === id);
      while (current) {
        ancestry.unshift(current.id);
        current = goals.find(g => g.id === current?.parent_id);
      }
      return ancestry;
    };

    const ancestry = findAncestry(goalId);

    // Find the Level 0 ancestor (objective)
    const objectiveId = ancestry.find(id => {
      const goal = goals.find(g => g.id === id);
      return goal?.level === 0;
    });

    // Find Level 1 ancestor (goal)
    const level1Id = ancestry.find(id => {
      const goal = goals.find(g => g.id === id);
      return goal?.level === 1;
    });

    if (objectiveId) {
      setExpandedObjective(objectiveId);
    }
    if (level1Id) {
      setExpandedGoals(prev => new Set([...prev, level1Id]));
    }
  }, [goalId, goals]);

  const toggleGoalExpanded = (id: string) => {
    setExpandedGoals(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
          expandedGoals={expandedGoals}
          toggleGoalExpanded={toggleGoalExpanded}
          getChildGoals={getChildGoals}
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
          expandedGoals={expandedGoals}
          toggleGoalExpanded={toggleGoalExpanded}
          getChildGoals={getChildGoals}
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
  expandedGoals: Set<string>;
  toggleGoalExpanded: (goalId: string) => void;
  getChildGoals: (parentId: string) => Goal[];
  isOverviewActive: boolean;
  currentGoalId?: string;
  onItemClick?: () => void;
  isLoading?: boolean;
}

function SidebarContent({
  district,
  objectives,
  expandedObjective,
  setExpandedObjective,
  expandedGoals,
  toggleGoalExpanded,
  getChildGoals,
  isOverviewActive,
  currentGoalId,
  onItemClick,
  isLoading,
}: SidebarContentProps) {
  const params = useParams<{ slug?: string }>();
  const { slug: subdomainSlug } = useSubdomain();
  // Use URL param slug if available, otherwise use subdomain slug
  const slug = params.slug || subdomainSlug || district.slug;
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on an objective detail page
  const isOnObjectiveDetailPage = location.pathname.includes('/objective/');
  const currentObjectiveId = isOnObjectiveDetailPage
    ? location.pathname.split('/objective/')[1]?.split('/')[0]
    : null;

  // Smooth scroll to an element by ID with color-matched pulse glow
  const scrollToGoal = (goalId: string, color: keyof typeof colorClasses = 'red') => {
    const element = document.getElementById(`goal-${goalId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Remove any existing pulse animations
      const pulseClasses = ['goal-highlight-pulse-red', 'goal-highlight-pulse-blue', 'goal-highlight-pulse-amber', 'goal-highlight-pulse-green'];
      pulseClasses.forEach(cls => element.classList.remove(cls));
      void element.offsetWidth; // Trigger reflow to restart animation
      // Add color-specific pulse animation
      element.classList.add(`goal-highlight-pulse-${color}`);
      setTimeout(() => {
        element.classList.remove(`goal-highlight-pulse-${color}`);
      }, 2500);
    }
  };

  // Helper to get objective color by ID
  const getObjectiveColorById = (objectiveId: string): keyof typeof colorClasses => {
    const index = objectives.findIndex(o => o.id === objectiveId);
    if (index === -1) return 'red';
    const objective = objectives[index];
    return getObjectiveColor(objective, index);
  };

  // Handle objective click - navigate and expand
  const handleObjectiveClick = (objectiveId: string, isCurrentlyActive: boolean) => {
    // If clicking on already active objective, just toggle expand/collapse
    if (isCurrentlyActive) {
      setExpandedObjective(expandedObjective === objectiveId ? null : objectiveId);
    } else {
      // Navigate to the objective detail page and expand
      navigate(`/${slug}/objective/${objectiveId}`);
      setExpandedObjective(objectiveId);
      // Call onItemClick for mobile to close drawer
      onItemClick?.();
    }
  };

  // Check if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Handle Level 1 goal click - mobile opens carousel, desktop scrolls
  const handleGoalClick = (goalId: string, parentObjectiveId: string, isCurrentlyActive: boolean) => {
    const objectiveColor = getObjectiveColorById(parentObjectiveId);

    // If we're on the objective detail page that contains this goal
    if (isOnObjectiveDetailPage && currentObjectiveId === parentObjectiveId) {
      if (isMobile) {
        // On mobile: set hash to open carousel (ObjectiveDetail will detect this)
        window.history.replaceState(null, '', `#goal-${goalId}`);
        // Trigger a hashchange event for React to detect
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      } else {
        // On desktop: smooth scroll to the goal with color-matched glow
        scrollToGoal(goalId, objectiveColor);
      }
      onItemClick?.(); // Close mobile drawer
      return;
    }

    // If clicking on already active goal (on goal detail page), just toggle expand/collapse
    if (isCurrentlyActive) {
      toggleGoalExpanded(goalId);
    } else {
      // Navigate to the objective page with hash
      // On mobile: hash will trigger carousel; on desktop: will scroll
      navigate(`/${slug}/objective/${parentObjectiveId}#goal-${goalId}`);
      if (!isMobile) {
        setTimeout(() => scrollToGoal(goalId, objectiveColor), 100);
      }
      onItemClick?.();
    }
  };

  // Handle Level 2 initiative click - mobile opens carousel, desktop scrolls
  const handleInitiativeClick = (initiativeId: string, parentObjectiveId: string) => {
    const objectiveColor = getObjectiveColorById(parentObjectiveId);

    // If we're on the objective detail page that contains this initiative
    if (isOnObjectiveDetailPage && currentObjectiveId === parentObjectiveId) {
      if (isMobile) {
        // On mobile: set hash to open carousel
        window.history.replaceState(null, '', `#goal-${initiativeId}`);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      } else {
        // On desktop: smooth scroll with color-matched glow
        scrollToGoal(initiativeId, objectiveColor);
      }
      onItemClick?.();
      return;
    }
    // Navigate to objective page with hash
    navigate(`/${slug}/objective/${parentObjectiveId}#goal-${initiativeId}`);
    if (!isMobile) {
      setTimeout(() => scrollToGoal(initiativeId, objectiveColor), 100);
    }
    onItemClick?.();
  };

  return (
    <>
      {/* Logo Area */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 h-16 flex items-center">
        <Link to={`/${slug}`} className="flex items-center gap-3" onClick={onItemClick}>
          {(() => {
            const logoUrl = getLogoUrl(district, slug || '');
            return logoUrl ? (
              <img src={logoUrl} alt={district.name} className="w-8 h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 rounded bg-district-red flex items-center justify-center text-white font-display font-semibold text-sm">
                {district.name.charAt(0)}
              </div>
            );
          })()}
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
                      onClick={() => handleObjectiveClick(objective.id, isActive)}
                      data-testid={`objective-${objective.goal_number}`}
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
                          <span
                            className={`truncate ${isActive ? colors.text : ''}`}
                            title={objective.title}
                          >
                            {objective.title}
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 flex-shrink-0 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            } ${isActive ? `text-${color}-300` : 'text-gray-400'}`}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Child Goals - Level 1 (Expanded) */}
                    {isExpanded && childGoals.length > 0 && (
                      <div className="pl-4 pr-1 mt-1 space-y-0.5">
                        <div className="relative">
                          <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
                          {childGoals.map(goal => {
                            const isGoalActive = currentGoalId === goal.id;
                            const level2Children = getChildGoals(goal.id);
                            const hasChildren = level2Children.length > 0;
                            const isGoalExpanded = expandedGoals.has(goal.id);

                            return (
                              <div key={goal.id}>
                                {/* Level 1 goal row */}
                                {hasChildren ? (
                                  <button
                                    onClick={() => handleGoalClick(goal.id, objective.id, isGoalActive)}
                                    className={`w-full flex items-center justify-between pl-6 pr-2 py-2 text-xs font-medium rounded-md transition-colors text-left ${
                                      isGoalActive
                                        ? `${colors.text} ${colors.bg}/50`
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                    title={`${goal.goal_number} ${goal.title}`}
                                  >
                                    <span className="truncate">
                                      {goal.goal_number} {goal.title}
                                    </span>
                                    <ChevronRight
                                      className={`w-3 h-3 flex-shrink-0 ml-1 transition-transform ${
                                        isGoalExpanded ? 'rotate-90' : ''
                                      } text-gray-400`}
                                    />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleGoalClick(goal.id, objective.id, isGoalActive)}
                                    className={`w-full text-left block pl-6 py-2 text-xs font-medium rounded-md transition-colors ${
                                      isGoalActive
                                        ? `${colors.text} ${colors.bg}/50`
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                    title={`${goal.goal_number} ${goal.title}`}
                                  >
                                    <span className="truncate block">
                                      {goal.goal_number} {goal.title}
                                    </span>
                                  </button>
                                )}

                                {/* Level 2 initiatives (nested under Level 1) */}
                                {hasChildren && isGoalExpanded && (
                                  <div className="pl-4 mt-0.5 space-y-0.5">
                                    <div className="relative">
                                      <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-100" />
                                      {level2Children.map(initiative => {
                                        const isInitiativeActive = currentGoalId === initiative.id;
                                        return (
                                          <button
                                            key={initiative.id}
                                            onClick={() => handleInitiativeClick(initiative.id, objective.id)}
                                            className={`w-full text-left block pl-6 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
                                              isInitiativeActive
                                                ? `${colors.text} ${colors.bg}/30`
                                                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                            }`}
                                            title={`${initiative.goal_number} ${initiative.title}`}
                                          >
                                            <span className="truncate block">
                                              {initiative.goal_number} {initiative.title}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
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
