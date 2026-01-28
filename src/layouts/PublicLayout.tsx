import { useState, useMemo } from 'react';
import { Outlet, Link, useParams } from 'react-router-dom';
import { useDistrict } from '../hooks/useDistricts';
import { useGoals } from '../hooks/useGoals';
import { Sidebar } from '../components/public/Sidebar';
import { MobileHeader } from '../components/public/MobileHeader';
import { PublicFooter } from '../components/public/PublicFooter';
import { getMergedConfig } from '../components/public/templates/TemplateRegistry';
import type { Goal, DashboardConfig } from '../lib/types';

/**
 * Flatten hierarchical goals into a single array
 * The useGoals hook returns a hierarchical structure where children are nested
 * in goal.children. This function flattens it for easier filtering by parent_id.
 */
function flattenGoals(hierarchicalGoals: Goal[]): Goal[] {
  const flat: Goal[] = [];
  const processGoal = (goal: Goal) => {
    flat.push(goal);
    if (goal.children) {
      goal.children.forEach(processGoal);
    }
  };
  hierarchicalGoals.forEach(processGoal);
  return flat;
}

interface PublicLayoutProps {
  /** Optional: For subdomain-based routing, pass the slug directly */
  districtSlug?: string;
}

/**
 * PublicLayout - New sidebar-based layout for public district pages
 * Features responsive sidebar navigation with collapsible objectives
 */
export function PublicLayout({ districtSlug }: PublicLayoutProps = {}) {
  const params = useParams<{ slug: string }>();
  // Use prop if provided (subdomain routing), otherwise use URL param (path routing)
  const slug = districtSlug || params.slug || '';
  const { data: district, isLoading: districtLoading } = useDistrict(slug);
  const { data: goals, isLoading: goalsLoading } = useGoals(district?.id || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get merged template configuration - must be before early returns for React hooks rules
  const templateConfig: DashboardConfig = useMemo(() => {
    const template = district?.dashboard_template || 'hierarchical';
    return getMergedConfig(template, district?.dashboard_config);
  }, [district?.dashboard_template, district?.dashboard_config]);

  // Determine if sidebar should be shown based on template config
  const showSidebar = templateConfig.showSidebar !== false;

  if (districtLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-district-red mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-slate-400 font-sans">Loading...</p>
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-500 dark:text-slate-400 font-sans">District not found</p>
          <Link to="/" className="mt-4 inline-flex items-center text-district-red hover:underline font-sans">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Flatten hierarchical goals into a single array for easier filtering
  const allGoals = goals ? flattenGoals(goals) : [];

  // Get Level 0 goals (objectives) for sidebar navigation
  const objectives = allGoals.filter(g => g.level === 0);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-sans">
      {/* Mobile backdrop overlay - only show when sidebar is enabled */}
      {showSidebar && sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - conditionally rendered based on template config */}
      {showSidebar && (
        <Sidebar
          district={district}
          objectives={objectives}
          goals={allGoals}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isLoading={goalsLoading}
        />
      )}

      {/* Main content area */}
      <main className="flex-1 min-w-0 pb-10">
        {/* Mobile header - only show menu toggle when sidebar is enabled */}
        <MobileHeader
          district={district}
          onMenuToggle={showSidebar ? () => setSidebarOpen(true) : undefined}
        />

        {/* Content - wider when no sidebar */}
        <div className={`${showSidebar ? 'lg:px-10' : 'lg:px-16'} lg:py-6 ${showSidebar ? 'max-w-6xl' : 'max-w-7xl'} mx-auto px-4 pt-6`}>
          <Outlet context={{ district, objectives, goals: allGoals, templateConfig }} />

          {/* Footer */}
          <PublicFooter district={district} />
        </div>
      </main>
    </div>
  );
}
