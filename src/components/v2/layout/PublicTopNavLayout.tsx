'use client'
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useSubdomain } from '@/contexts/SubdomainContext';
import { useDistrict } from '@/hooks/useDistricts';
import { PublicFooter } from '@/components/v2/public/PublicFooter';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';

export function PublicTopNavLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const basePath = `/district/${slug}`;

  const navItems = [
    { label: 'Plan', href: basePath },
    { label: 'Objectives', href: `${basePath}/objectives` },
    { label: 'Goals', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-md3-surface font-sans text-md3-on-surface antialiased flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200/60 flex justify-between items-center w-full px-6 py-3 h-16 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold tracking-tighter text-slate-900">StrataDash</span>
          <div className="hidden md:flex gap-6 items-center">
            {navItems.map((item) => {
              const isGoals = item.label === 'Goals';
              const isActive = isGoals
                ? pathname.includes('/goals/')
                : pathname === item.href;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-violet-700 font-semibold border-b-2 border-violet-700 pb-1'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
            <MaterialIcon icon="dark_mode" />
          </button>
          <div className="h-8 w-8 rounded-lg bg-md3-primary-container flex items-center justify-center text-md3-on-primary-container font-bold text-xs overflow-hidden">
            {district?.logo_url ? (
              <img src={district.logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              district?.name?.substring(0, 2).toUpperCase() || 'DS'
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
