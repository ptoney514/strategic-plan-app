import { useState } from 'react';
import { Outlet, Link, useParams } from 'react-router-dom';
import { useDistrict } from '../hooks/useDistricts';
import { useGoals } from '../hooks/useGoals';
import { Sidebar } from '../components/public/Sidebar';
import { MobileHeader } from '../components/public/MobileHeader';
import { PublicFooter } from '../components/public/PublicFooter';
import type { Goal } from '../lib/types';

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
  const slug = districtSlug || params.slug;
  const { data: district, isLoading: districtLoading } = useDistrict(slug!);
  const { data: goals, isLoading: goalsLoading } = useGoals(district?.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        district={district}
        objectives={objectives}
        goals={allGoals}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isLoading={goalsLoading}
      />

      {/* Main content area */}
      <main className="flex-1 min-w-0 pb-10">
        {/* Mobile header */}
        <MobileHeader
          district={district}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        {/* Content */}
        <div className="lg:px-10 lg:py-6 max-w-6xl mx-auto px-4 pt-6">
          <Outlet context={{ district, objectives, goals: allGoals }} />

          {/* Footer */}
          <PublicFooter district={district} />
        </div>
      </main>
    </div>
  );
}
