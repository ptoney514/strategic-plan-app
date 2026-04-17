'use client'
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSubdomain, useDistrictLink } from '@/contexts/SubdomainContext';
import { useDistrict } from '@/hooks/useDistricts';
import { usePlansBySlug } from '@/hooks/v2/usePlans';
import { useGoalsByPlan } from '@/hooks/v2/useGoals';
import { useTheme } from '@/contexts/ThemeContext';
import { PublicSidebarProvider, usePublicSidebar } from './PublicSidebarContext';
import { PublicSidebarTree } from './PublicSidebarTree';
import { PublicFooter } from '@/components/v2/public/PublicFooter';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';
import type { HierarchicalGoal } from '@/lib/types';

interface NavItem {
  icon: string;
  label: string;
  href: string;
  isActive: boolean;
}

function DistrictMark({
  districtName,
  logoUrl,
  primaryColor,
  size = 'h-10 w-10',
}: {
  districtName?: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  size?: string;
}) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${districtName || 'District'} logo`}
        className={`${size} rounded-xl object-cover`}
      />
    );
  }

  const initials = districtName
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'DP';

  return (
    <div
      className={`${size} rounded-xl flex items-center justify-center text-white text-sm font-bold`}
      style={{ backgroundColor: primaryColor || '#702ae1' }}
    >
      {initials}
    </div>
  );
}

function SidebarContent({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const link = useDistrictLink();
  const homeHref = link('/');
  const { data: plans } = usePlansBySlug(slug || '');
  const activePlan = plans?.find((p) => p.is_active && p.is_public);
  const { data: goals } = useGoalsByPlan(activePlan?.id || '');
  const { mobileOpen, closeMobile } = usePublicSidebar();
  const { resolvedTheme, toggle } = useTheme();
  const [currentHash, setCurrentHash] = useState('');

  const objectives = useMemo(
    () => (goals?.filter((g) => g.level === 0) || []) as HierarchicalGoal[],
    [goals],
  );

  const planCycle = activePlan
    ? `${activePlan.start_date?.slice(0, 4) || ''}-${activePlan.end_date?.slice(0, 4) || ''} Strategic Cycle`
    : 'Strategic Cycle';

  const lastUpdated = activePlan?.updated_at
    ? new Date(activePlan.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncHash = () => setCurrentHash(window.location.hash);
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  const navItems: NavItem[] = [
    {
      icon: 'domain',
      label: 'District overview',
      href: `${homeHref}#district-identity`,
      isActive: pathname === homeHref && currentHash !== '#plan-health',
    },
    {
      icon: 'analytics',
      label: 'Plan health',
      href: `${homeHref}#plan-health`,
      isActive: pathname === homeHref && currentHash === '#plan-health',
    },
    {
      icon: 'account_tree',
      label: 'Objectives',
      href: link('/objectives'),
      isActive: pathname.includes('/objectives') || pathname.includes('/goals/'),
    },
  ];

  const headerPadding = mobile ? 'px-1 pb-6' : 'px-2 pb-8';

  const navLabel = mobile ? 'Public plan navigation' : 'Public plan sidebar';

  return (
    <div className={`flex h-full flex-col ${mobile ? 'px-4 pb-6 pt-5' : 'px-4 py-6'}`}>
      <div className={`mb-8 ${headerPadding}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <DistrictMark
              districtName={district?.name}
              logoUrl={district?.logo_url}
              primaryColor={district?.primary_color}
            />
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900 leading-tight sm:text-lg">
                {district?.name || 'District Plan Explorer'}
              </h1>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                {planCycle}
              </p>
              {lastUpdated && (
                <p className="mt-3 inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm ring-1 ring-slate-200/80">
                  Updated {lastUpdated}
                </p>
              )}
            </div>
          </div>

          {mobile && mobileOpen && (
            <button
              type="button"
              onClick={closeMobile}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
              aria-label="Close navigation menu"
            >
              <MaterialIcon icon="close" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto" aria-label={navLabel}>
        {navItems.map((item) => {
          const isObjectivesTree = item.icon === 'account_tree';
          const itemClasses = `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
            item.isActive
              ? 'bg-white text-violet-700 font-semibold shadow-sm ring-1 ring-violet-100'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`;

          return (
            <div key={item.icon}>
              <Link href={item.href} className={itemClasses} onClick={closeMobile}>
                <MaterialIcon icon={item.icon} size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>

              {isObjectivesTree && objectives.length > 0 && (mobile || item.isActive) && (
                <div className="ml-4 mt-3 space-y-3 border-l border-slate-200 pl-4">
                  <div className="flex items-center justify-between gap-3 pr-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                      Objective tree
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {objectives.length} total
                    </span>
                  </div>
                  <PublicSidebarTree objectives={objectives} />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={toggle}
          className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
        >
          <span className="flex items-center gap-3">
            <MaterialIcon icon={resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'} size={18} />
            <span>{resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {resolvedTheme}
          </span>
        </button>

        <div className="mt-2 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
          <span className="inline-flex items-center gap-2">
            <MaterialIcon icon="bolt" size={14} className="text-violet-500" />
            Powered by StrataDash
          </span>
        </div>
      </div>
    </div>
  );
}

function MobileTopBar() {
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const { mobileOpen, toggleMobile } = usePublicSidebar();

  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl lg:hidden"
      data-testid="public-mobile-topbar"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleMobile}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
            aria-label="Open navigation menu"
            aria-controls="public-mobile-sidebar"
            aria-expanded={mobileOpen}
            data-testid="public-mobile-menu-button"
          >
            <MaterialIcon icon="menu" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {district?.name || 'District Plan Explorer'}
            </p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Strategic plan explorer
            </p>
          </div>
        </div>

        <DistrictMark
          districtName={district?.name}
          logoUrl={district?.logo_url}
          primaryColor={district?.primary_color}
          size="h-9 w-9"
        />
      </div>
    </header>
  );
}

function PublicSidebarShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { mobileOpen, closeMobile } = usePublicSidebar();

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = '';
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobile();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileOpen, closeMobile]);

  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-md3-surface font-sans text-md3-on-surface antialiased">
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-80 border-r border-slate-200 bg-slate-50 lg:block"
        data-testid="public-desktop-sidebar"
      >
        <SidebarContent />
      </aside>

      <MobileTopBar />

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px] lg:hidden"
            onClick={closeMobile}
            aria-hidden="true"
            data-testid="public-mobile-overlay"
          />
          <aside
            id="public-mobile-sidebar"
            className="fixed inset-y-0 left-0 z-50 w-[min(20rem,86vw)] overflow-y-auto border-r border-slate-200 bg-slate-50 shadow-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Public navigation menu"
            data-testid="public-mobile-sidebar"
          >
            <SidebarContent mobile />
          </aside>
        </>
      )}

      <main className="min-h-[100dvh] lg:ml-80" data-testid="public-main-content">
        <div className="flex min-h-[100dvh] flex-col">
          <div className="flex-1">{children}</div>
          <PublicFooter />
        </div>
      </main>
    </div>
  );
}

export function PublicSidebarLayout({ children }: { children: ReactNode }) {
  return (
    <PublicSidebarProvider>
      <PublicSidebarShell>{children}</PublicSidebarShell>
    </PublicSidebarProvider>
  );
}
