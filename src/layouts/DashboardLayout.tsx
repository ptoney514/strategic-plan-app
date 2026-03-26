import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';

interface DashboardLayoutProps {
  basePath?: string; // e.g., '/' for root, '/admin' for district admin
}

/**
 * DashboardLayout - Layout for authenticated user dashboard
 * Features dark indigo sidebar and sticky header
 */
export function DashboardLayout({ basePath = '/' }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar - Fixed position */}
      <DashboardSidebar basePath={basePath} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 ml-[270px]">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Decoration gradient */}
          <div className="absolute top-[72px] inset-x-0 h-40 bg-linear-to-b from-white to-transparent pointer-events-none ml-[270px]" />

          {/* Content wrapper */}
          <div className="relative z-0 p-8 space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
