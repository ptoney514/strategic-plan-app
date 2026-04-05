'use client'
import { useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSubdomain } from '@/contexts/SubdomainContext';
import { useDistrict } from '@/hooks/useDistricts';
import { usePlansBySlug } from '@/hooks/v2/usePlans';
import { useGoalsByPlan } from '@/hooks/v2/useGoals';
import { PublicSidebarProvider, usePublicSidebar } from './PublicSidebarContext';
import { PublicSidebarTree } from './PublicSidebarTree';
import { PublicFooter } from '@/components/v2/public/PublicFooter';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';
import type { HierarchicalGoal } from '@/lib/types';

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

function SidebarContent() {
  const pathname = usePathname();
  const { slug } = useSubdomain();
  const basePath = `/district/${slug}`;
  const { data: plans } = usePlansBySlug(slug || '');
  const activePlan = plans?.find((p) => p.is_active && p.is_public);
  const { data: goals } = useGoalsByPlan(activePlan?.id || '');
  const { mobileOpen, closeMobile } = usePublicSidebar();

  const objectives = useMemo(
    () => (goals?.filter((g) => g.level === 0) || []) as HierarchicalGoal[],
    [goals],
  );

  const planCycle = activePlan
    ? `${activePlan.start_date?.slice(0, 4) || ''}-${activePlan.end_date?.slice(0, 4) || ''} Strategic Cycle`
    : 'Strategic Cycle';

  const navItems: NavItem[] = [
    { icon: 'domain', label: 'District Identity', href: basePath },
    { icon: 'analytics', label: 'Plan Health', href: basePath },
    { icon: 'account_tree', label: 'Objectives Tree', href: `${basePath}/objectives` },
    { icon: 'settings', label: 'Settings', href: '#' },
  ];

  const sidebarClasses = `h-screen w-80 fixed left-0 top-0 flex flex-col bg-slate-50 border-r border-slate-200 z-50 overflow-y-auto transition-transform duration-200 ${
    mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
  }`;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full py-6 px-4">
          {/* Header */}
          <div className="mb-8 px-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-md3-primary flex items-center justify-center text-white">
                <MaterialIcon icon="domain" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  District Plan Explorer
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {planCycle}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isObjectivesTree = item.icon === 'account_tree';
              const isActive = isObjectivesTree
                ? pathname.includes('/objectives') || pathname.includes('/goals/')
                : pathname === item.href;
              const isDisabled = item.href === '#';
              const itemClasses = `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-violet-700 font-semibold border-l-4 border-violet-700 bg-violet-50/50'
                  : isDisabled
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`;

              return (
                <div key={item.icon}>
                  {isDisabled ? (
                    <div
                      aria-disabled="true"
                      className={itemClasses}
                    >
                      <MaterialIcon icon={item.icon} size={20} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  ) : (
                    <Link href={item.href} className={itemClasses}>
                      <MaterialIcon icon={item.icon} size={20} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )}

                  {/* Objectives Tree nested items */}
                  {isObjectivesTree && isActive && objectives.length > 0 && (
                    <div className="ml-4 mt-2 pl-4 border-l border-slate-200">
                      <PublicSidebarTree objectives={objectives} />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto pt-6 border-t border-slate-200 flex flex-col gap-1">
            <button className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-colors text-sm">
              <MaterialIcon icon="dark_mode" size={18} />
              <span>Dark Mode</span>
            </button>
            <div className="px-3 py-2 text-slate-400 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <MaterialIcon icon="bolt" size={14} className="text-violet-500" />
              Powered by StrataDash
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function MobileTopBar() {
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const { toggleMobile } = usePublicSidebar();

  return (
    <header className="flex md:hidden justify-between items-center w-full px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100">
      <button onClick={toggleMobile} className="p-1">
        <MaterialIcon icon="menu" />
      </button>
      <span className="text-lg font-bold text-slate-900 tracking-tight">
        {district?.name || 'StrataDash'}
      </span>
      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
        {district?.logo_url ? (
          <img src={district.logo_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: district?.primary_color || '#702ae1' }}
          >
            {district?.name?.substring(0, 2).toUpperCase() || 'SD'}
          </div>
        )}
      </div>
    </header>
  );
}

export function PublicSidebarLayout({ children }: { children: ReactNode }) {
  return (
    <PublicSidebarProvider>
      <div className="min-h-screen bg-md3-surface font-sans text-md3-on-surface antialiased">
        <SidebarContent />
        <MobileTopBar />
        <main className="md:ml-80 min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>
          <PublicFooter />
        </main>
      </div>
    </PublicSidebarProvider>
  );
}
